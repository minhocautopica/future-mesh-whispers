import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { supabase } from '@/integrations/supabase/client';
interface FERDB extends DBSchema {
  submissions: { key: number; value: any };
  outbox: { key: number; value: any };
  meta: { key: string; value: any };
  files: { key: string; value: { name: string; data: string; mime: string; type: 'text' | 'audio'; question?: number; createdAt: number } };
}

let dbPromise: Promise<IDBPDatabase<FERDB>> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<FERDB>('fer-db', 2, {
      upgrade(db, oldVersion) {
        if (oldVersion < 1) {
          db.createObjectStore('submissions', { keyPath: 'id', autoIncrement: true });
          db.createObjectStore('outbox', { keyPath: 'id', autoIncrement: true });
          db.createObjectStore('meta');
        }
        if (oldVersion < 2) {
          db.createObjectStore('files', { keyPath: 'name' });
        }
      },
    });
  }
  return dbPromise;
}

export async function addSubmission(data: any) {
  const db = await getDB();

  const tsSafe = (data.timestamp || new Date().toISOString()).replace(/[:.]/g, '-');
  const base = `${data.station_id || 'TOTEM-1'}_${tsSafe}`;

  const items: Array<{ name: string; data: string; mime: string; type: 'text' | 'audio'; question: number }> = [];
  const map: Array<{ key: keyof typeof data.responses; q: number }> = [
    { key: 'future_vision', q: 1 },
    { key: 'magic_wand', q: 2 },
    { key: 'what_is_missing', q: 3 },
  ];

  for (const { key, q } of map) {
    const resp = data.responses?.[key];
    if (!resp) continue;
    if (resp.text) {
      const name = `${base}_q${q}_text.txt`;
      const dataUrl = `data:text/plain;charset=utf-8;base64,${btoa(unescape(encodeURIComponent(resp.text)))}`;
      items.push({ name, data: dataUrl, mime: 'text/plain', type: 'text', question: q });
    }
    if (resp.audio) {
      const name = `${base}_q${q}_audio.webm`;
      items.push({ name, data: resp.audio, mime: 'audio/webm', type: 'audio', question: q });
    }
  }

  // persist files separately
  const txFiles = (await db).transaction('files', 'readwrite');
  for (const f of items) {
    await txFiles.store.put({ ...f, createdAt: Date.now() });
  }
  await txFiles.done;

  const id = await db.add('submissions', { ...data, attachments: items.map(({ data: _d, ...rest }) => rest), savedAt: new Date().toISOString() });
  await db.add('outbox', { submissionId: id, payload: { ...data, attachments: items }, synced: false, createdAt: Date.now() });
  await incrementTodayCount();
  return id;
}

function todayKey() {
  const d = new Date();
  const ymd = d.toISOString().slice(0, 10);
  return `count:${ymd}`;
}

export async function getTodayCount(): Promise<number> {
  const db = await getDB();
  const key = todayKey();
  const val = await db.get('meta', key);
  return typeof val === 'number' ? val : 0;
}

export async function incrementTodayCount() {
  const db = await getDB();
  const key = todayKey();
  const current = (await db.get('meta', key)) ?? 0;
  await db.put('meta', current + 1, key);
}

export async function resetCountsIfNewDay() {
  // No-op because we namespace by day via key
  return;
}

export async function syncOutbox(endpoint?: string) {
  if (!navigator.onLine) return;
  const db = await getDB();

  // Read all items first to avoid keeping an IndexedDB transaction open across awaits
  const items = await db.getAll('outbox');
  const unsynced = items.filter((i: any) => !i.synced);

  const qKeyMap: Record<number, 'future_vision' | 'magic_wand' | 'what_is_missing'> = {
    1: 'future_vision',
    2: 'magic_wand',
    3: 'what_is_missing',
  };

  for (const item of unsynced) {
    try {
      const p = item.payload || {};

      // 1) Create submission
      const mapGender: Record<string, any> = {
        'Masculino': 'male',
        'Feminino': 'female',
        'Não-binário': 'non_binary',
        'Prefiro não responder': 'prefer_not_to_say',
      };
      const mapAge: Record<string, any> = {
        'Até 18': 'under_18',
        '19-25': '19_25',
        '26-35': '26_35',
        '36-45': '36_45',
        '46-60': '46_60',
        '60+': '60_plus',
      };

      const { data: subData, error: subError } = await supabase
        .from('submissions')
        .insert([
          {
            station_id: p.station_id,
            timestamp: p.timestamp || new Date().toISOString(),
            gender: mapGender[p.demographics?.gender as string] ?? null,
            age: mapAge[p.demographics?.age as string] ?? null,
            resident: typeof p.demographics?.resident === 'boolean' ? p.demographics.resident : null,
          },
        ])
        .select('id')
        .single();

      if (subError || !subData) throw subError || new Error('Submission insert failed');

      // 2) Prepare and upload answers (text inline, audio to storage)
      const answers: any[] = [];
      const attachments: Array<{ name: string; data: string; mime: string; type: 'text' | 'audio'; question: number }> = p.attachments || [];

      for (const att of attachments) {
        const qn = att.question;
        const qkey = qKeyMap[qn as 1 | 2 | 3];
        if (!qkey) continue;

        if (att.type === 'text') {
          // Decode base64 text back to string (we encoded it earlier)
          let text = '';
          try {
            const b64 = (att.data || '').split(',')[1] ?? '';
            text = decodeURIComponent(escape(atob(b64)));
          } catch {}

          answers.push({
            submission_id: subData.id,
            question_number: qn,
            question_key: qkey,
            type: 'text',
            size_bytes: text.length,
            storage_path: `inline://q${qn}.txt`, // required non-null field
            mime_type: 'text/plain',
            text_content: text,
          });
        } else if (att.type === 'audio') {
          const path = `${p.station_id || 'TOTEM-1'}/${subData.id}/q${qn}.webm`;
          const b64 = (att.data || '').split(',')[1] ?? '';
          const binary = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
          const blob = new Blob([binary], { type: att.mime || 'audio/webm' });

          const { error: upErr } = await supabase.storage
            .from('survey')
            .upload(path, blob, { contentType: att.mime || 'audio/webm', upsert: true });
          if (upErr) throw upErr;

          answers.push({
            submission_id: subData.id,
            question_number: qn,
            question_key: qkey,
            type: 'audio',
            size_bytes: binary.byteLength,
            duration_seconds: null,
            storage_path: path,
            mime_type: att.mime || 'audio/webm',
            text_content: null,
          });
        }
      }

      if (answers.length > 0) {
        const { error: ansErr } = await supabase.from('answers').insert(answers);
        if (ansErr) throw ansErr;
      }

      // 3) Mark as synced in a separate write
      await db.put('outbox', { ...item, synced: true, syncedAt: Date.now() });
    } catch (e) {
      console.warn('Sync to Supabase failed, will retry later', e);
    }
  }
}
