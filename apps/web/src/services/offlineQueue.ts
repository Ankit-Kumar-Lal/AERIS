import { openDB, DBSchema } from 'idb';

interface AerisOfflineDB extends DBSchema {
  pending_reports: {
    key: number;
    value: {
      id?: number;
      payload: any;
      queuedAt: string;
      retryCount: number;
    };
    indexes: { 'by-date': string };
  };
}

const DB_NAME = 'aeris-offline-db';
const DB_VERSION = 1;

async function getDB() {
  return openDB<AerisOfflineDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('pending_reports')) {
        const store = db.createObjectStore('pending_reports', {
          keyPath: 'id',
          autoIncrement: true,
        });
        store.createIndex('by-date', 'queuedAt');
      }
    },
  });
}

export async function enqueueReport(payload: any): Promise<number> {
  const db = await getDB();
  const id = await db.add('pending_reports', {
    payload,
    queuedAt: new Date().toISOString(),
    retryCount: 0,
  });
  return id as number;
}

export async function getPendingReports() {
  const db = await getDB();
  return db.getAll('pending_reports');
}

export async function getPendingCount(): Promise<number> {
  const db = await getDB();
  return db.count('pending_reports');
}

export async function removePendingReport(id: number) {
  const db = await getDB();
  return db.delete('pending_reports', id);
}

export async function syncOfflineReports(submitFn: (payload: any) => Promise<any>): Promise<{ synced: number; failed: number }> {
  if (!navigator.onLine) {
    return { synced: 0, failed: 0 };
  }

  const reports = await getPendingReports();
  let synced = 0;
  let failed = 0;

  for (const item of reports) {
    try {
      await submitFn(item.payload);
      if (item.id !== undefined) {
        await removePendingReport(item.id);
      }
      synced++;
    } catch (err) {
      console.warn('Failed to sync queued report:', err);
      failed++;
    }
  }

  return { synced, failed };
}
