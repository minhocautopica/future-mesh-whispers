import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface FERDB extends DBSchema {
  submissions: { key: number; value: any };
  outbox: { key: number; value: any };
  meta: { key: string; value: any };
}

let dbPromise: Promise<IDBPDatabase<FERDB>> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<FERDB>('fer-db', 1, {
      upgrade(db) {
        db.createObjectStore('submissions', { keyPath: 'id', autoIncrement: true });
        db.createObjectStore('outbox', { keyPath: 'id', autoIncrement: true });
        db.createObjectStore('meta');
      },
    });
  }
  return dbPromise;
}

export async function addSubmission(data: any) {
  const db = await getDB();
  const id = await db.add('submissions', { ...data, savedAt: new Date().toISOString() });
  await db.add('outbox', { submissionId: id, payload: data, synced: false, createdAt: Date.now() });
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
