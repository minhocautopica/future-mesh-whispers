import { openDB, DBSchema, IDBPDatabase } from 'idb';

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
  const tx = db.transaction('outbox', 'readwrite');
  const store = tx.objectStore('outbox');

  let cursor = await store.openCursor();
  while (cursor) {
    const item = cursor.value;
    if (!item.synced) {
      try {
        if (endpoint) {
          await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item.payload),
          });
        } else {
          // No endpoint configured; simulate success
          await new Promise((r) => setTimeout(r, 50));
        }
        cursor.update({ ...item, synced: true, syncedAt: Date.now() });
      } catch (e) {
        // keep in outbox
        console.warn('Sync failed, will retry later', e);
      }
    }
    cursor = await cursor.continue();
  }
  await tx.done;
}
