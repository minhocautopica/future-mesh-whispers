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
  console.log('[syncOutbox] Attempting to sync...');
  if (!navigator.onLine) {
    console.log('[syncOutbox] Offline. Sync aborted.');
    return;
  }
  console.log('[syncOutbox] Online. Proceeding with sync.');
  const db = await getDB();

  // Read all items first to avoid keeping an IndexedDB transaction open across awaits
  const items = await db.getAll('outbox');
  const unsynced = items.filter((i: any) => !i.synced);
  console.log(`[syncOutbox] Found ${unsynced.length} items to sync.`);

  if (unsynced.length === 0) {
    return;
  }

  const qKeyMap: Record<number, 'future_vision' | 'magic_wand' | 'what_is_missing'> = {
    1: 'future_vision',
    2: 'magic_wand',
    3: 'what_is_missing',
  };

  for (const item of unsynced) {
    console.log(`[syncOutbox] Processing item ID: ${item.id}`);
    try {
      const p = item.payload || {};

      // 1) Create submission via secure RPC call
      console.log(`[syncOutbox] Inserting submission for item ID: ${item.id} via RPC`);

      const { data: new_submission_id, error: subError } = await supabase
        .rpc('submit_survey', {
          station_id_arg: p.station_id,
          gender_arg: p.demographics?.gender ?? null,
          age_arg: p.demographics?.age ?? null,
          resident_arg: typeof p.demographics?.resident === 'boolean' ? p.demographics.resident : null,
        });

      if (subError || !new_submission_id) {
        console.error('RPC `submit_survey` failed:', subError);
        throw subError || new Error('Submission via RPC failed');
      }

      // Adapt the RPC response to the format the rest of the code expects
      const subData = { id: new_submission_id };
      console.log(`[syncOutbox] Submission created with ID: ${subData.id}`);

      // 2) Prepare and upload answers (text inline, audio to storage)
      const answers: any[] = [];
      const attachments: Array<{ name: string; data: string; mime:string; type: 'text' | 'audio'; question: number }> = p.attachments || [];
      console.log(`[syncOutbox] Processing ${attachments.length} attachments for submission ID: ${subData.id}`);

      for (const att of attachments) {
        const qn = att.question;
        const qkey = qKeyMap[qn as 1 | 2 | 3];
        if (!qkey) continue;

        if (att.type === 'text') {
          console.log(`[syncOutbox] Preparing text answer for question ${qn}`);
          // Decode base64 text back to string (we encoded it earlier)
          let text = '';
          try {
            const b64 = (att.data || '').split(',')[1] ?? '';
            text = decodeURIComponent(escape(atob(b64)));
          } catch {
            // b64 decoding can fail, default to empty string
          }

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
          console.log(`[syncOutbox] Uploading audio answer for question ${qn}`);
          const path = `${p.station_id || 'TOTEM-1'}/${subData.id}/q${qn}.webm`;
          const b64 = (att.data || '').split(',')[1] ?? '';
          const binary = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
          const blob = new Blob([binary], { type: att.mime || 'audio/webm' });

          const { error: upErr } = await supabase.storage
            .from('survey')
            .upload(path, blob, { contentType: att.mime || 'audio/webm', upsert: true });
          if (upErr) throw upErr;
          console.log(`[syncOutbox] Audio uploaded to: ${path}`);

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
        console.log(`[syncOutbox] Inserting ${answers.length} answers for submission ID: ${subData.id}`);
        const { error: ansErr } = await supabase.from('answers').insert(answers);
        if (ansErr) throw ansErr;
        console.log(`[syncOutbox] Answers inserted successfully.`);
      }

      // 3) Mark as synced in a separate write
      console.log(`[syncOutbox] Marking item ID ${item.id} as synced.`);
      await db.put('outbox', { ...item, synced: true, syncedAt: Date.now() });
      console.log(`[syncOutbox] Item ID ${item.id} successfully synced.`);
    } catch (e) {
      console.error(`[syncOutbox] Sync to Supabase failed for item ID: ${item.id}. Will retry later.`, { item, error: e });
    }
  }
}
