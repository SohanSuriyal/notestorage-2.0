import { NoteItem, AppSettings } from '../types';

const DB_NAME = 'NoteStorageDB';
const DB_VERSION = 1;
const NOTES_STORE = 'notes';
const SETTINGS_STORE = 'settings';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(NOTES_STORE)) {
        db.createObjectStore(NOTES_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(SETTINGS_STORE)) {
        db.createObjectStore(SETTINGS_STORE, { keyPath: 'key' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveNotesToStorage(notes: NoteItem[]): Promise<void> {
  // First save lightweight metadata to localStorage as fallback
  try {
    const lightweight = notes.map((n) => {
      if (n.pdfData && n.pdfData.pages.length > 0) {
        // Exclude large page dataUrls from localStorage to avoid quota errors
        return {
          ...n,
          pdfData: {
            ...n.pdfData,
            pages: n.pdfData.pages.map((p) => ({ ...p, dataUrl: '' })),
          },
        };
      }
      return n;
    });
    localStorage.setItem('ns_notes_meta', JSON.stringify(lightweight));
  } catch {
    // localStorage may be full, proceed with IndexedDB
  }

  try {
    const db = await openDb();
    const tx = db.transaction(NOTES_STORE, 'readwrite');
    const store = tx.objectStore(NOTES_STORE);

    // Clear existing notes and re-insert to keep in sync
    await new Promise<void>((resolve, reject) => {
      const clearReq = store.clear();
      clearReq.onsuccess = () => resolve();
      clearReq.onerror = () => reject(clearReq.error);
    });

    for (const note of notes) {
      store.put(note);
    }

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('IndexedDB write failed, fallback to localStorage:', err);
    try {
      localStorage.setItem('ns_notes', JSON.stringify(notes));
    } catch {
      // Ignored
    }
  }
}

export async function loadNotesFromStorage(): Promise<NoteItem[] | null> {
  try {
    const db = await openDb();
    const tx = db.transaction(NOTES_STORE, 'readonly');
    const store = tx.objectStore(NOTES_STORE);

    const notes: NoteItem[] = await new Promise((resolve, reject) => {
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });

    if (notes && notes.length > 0) {
      return notes;
    }
  } catch (err) {
    console.warn('IndexedDB read failed, fallback to localStorage:', err);
  }

  // Fallback to localStorage
  try {
    const saved = localStorage.getItem('ns_notes');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // Ignored
  }

  return null;
}
