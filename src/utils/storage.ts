import { NoteItem } from '../types';

const DB_NAME = 'NoteStorageDB';
const DB_VERSION = 2;
const NOTES_STORE = 'notes';
const ATTACHMENTS_STORE = 'attachments';

// Avoid rewriting unchanged notes when React state changes frequently.
const lastSavedUpdated = new Map<string, number>();

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(NOTES_STORE)) {
        db.createObjectStore(NOTES_STORE, { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains(ATTACHMENTS_STORE)) {
        db.createObjectStore(ATTACHMENTS_STORE, { keyPath: 'noteId' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

type StoredNote = Omit<NoteItem, 'pdfData' | 'fileDataUrl'>;

type StoredAttachment = {
  noteId: string;
  pdfData?: NoteItem['pdfData'];
  fileDataUrl?: string;
};

function splitNote(note: NoteItem): { metadata: StoredNote; attachment: StoredAttachment | null } {
  const { pdfData, fileDataUrl, ...metadata } = note;

  const hasAttachment = Boolean(pdfData || fileDataUrl);

  return {
    metadata,
    attachment: hasAttachment
      ? {
          noteId: note.id,
          pdfData,
          fileDataUrl,
        }
      : null,
  };
}

function saveToLocalFallback(notes: NoteItem[]) {
  try {
    // Keep only lightweight metadata in localStorage. Large PDF/image data stays out.
    const lightweight = notes.map((note) => splitNote(note).metadata);
    localStorage.setItem('ns_notes_meta', JSON.stringify(lightweight));
  } catch {
    // Browser storage may be full. IndexedDB remains the primary store.
  }
}

export async function saveNoteToStorage(note: NoteItem): Promise<void> {
  try {
    const db = await openDb();
    const { metadata, attachment } = splitNote(note);
    const tx = db.transaction([NOTES_STORE, ATTACHMENTS_STORE], 'readwrite');

    tx.objectStore(NOTES_STORE).put(metadata);

    if (attachment) {
      tx.objectStore(ATTACHMENTS_STORE).put(attachment);
    } else {
      tx.objectStore(ATTACHMENTS_STORE).delete(note.id);
    }

    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error || new Error('IndexedDB transaction aborted'));
    });

    lastSavedUpdated.set(note.id, note.updated);
  } catch (err) {
    console.warn('IndexedDB note write failed:', err);

    // Fallback contains metadata only to avoid duplicating large attachments.
    try {
      const saved = localStorage.getItem('ns_notes_meta');
      const existing: StoredNote[] = saved ? JSON.parse(saved) : [];
      const { metadata } = splitNote(note);
      const next = existing.filter((n) => n.id !== note.id);
      next.push(metadata);
      localStorage.setItem('ns_notes_meta', JSON.stringify(next));
    } catch {
      // Ignore quota errors.
    }
  }
}

export async function deleteNoteFromStorage(noteId: string): Promise<void> {
  try {
    const db = await openDb();
    const tx = db.transaction([NOTES_STORE, ATTACHMENTS_STORE], 'readwrite');
    tx.objectStore(NOTES_STORE).delete(noteId);
    tx.objectStore(ATTACHMENTS_STORE).delete(noteId);

    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error || new Error('IndexedDB transaction aborted'));
    });

    lastSavedUpdated.delete(noteId);
  } catch (err) {
    console.warn('IndexedDB note delete failed:', err);
  }
}

export async function loadNoteFromStorage(noteId: string): Promise<NoteItem | null> {
  try {
    const db = await openDb();
    const tx = db.transaction([NOTES_STORE, ATTACHMENTS_STORE], 'readonly');

    const metadata = await new Promise<StoredNote | undefined>((resolve, reject) => {
      const req = tx.objectStore(NOTES_STORE).get(noteId);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });

    if (!metadata) return null;

    const attachment = await new Promise<StoredAttachment | undefined>((resolve, reject) => {
      const req = tx.objectStore(ATTACHMENTS_STORE).get(noteId);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });

    return {
      ...metadata,
      ...(attachment?.pdfData ? { pdfData: attachment.pdfData } : {}),
      ...(attachment?.fileDataUrl ? { fileDataUrl: attachment.fileDataUrl } : {}),
    } as NoteItem;
  } catch (err) {
    console.warn('IndexedDB note read failed:', err);
    return null;
  }
}

/**
 * Loads only lightweight note records. Attachments are deliberately excluded.
 * Use loadNoteFromStorage(id) when the user actually opens a note.
 */
export async function loadNotesFromStorage(): Promise<NoteItem[] | null> {
  try {
    const db = await openDb();
    const tx = db.transaction(NOTES_STORE, 'readonly');
    const store = tx.objectStore(NOTES_STORE);

    const notes: StoredNote[] = await new Promise((resolve, reject) => {
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });

    if (notes.length > 0) {
      return notes as NoteItem[];
    }
  } catch (err) {
    console.warn('IndexedDB metadata read failed, checking localStorage:', err);
  }

  try {
    const saved = localStorage.getItem('ns_notes_meta');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed as NoteItem[];
      }
    }
  } catch {
    // Ignore malformed or unavailable fallback data.
  }

  return null;
}

/**
 * Compatibility helper used by the current React app.
 * It now performs incremental upserts instead of clearing and rewriting the database.
 */
export async function saveNotesToStorage(notes: NoteItem[]): Promise<void> {
  saveToLocalFallback(notes);

  const changedNotes = notes.filter(
    (note) => lastSavedUpdated.get(note.id) !== note.updated
  );

  // If this is the first save after an app restart, persist every note.
  const notesToSave = lastSavedUpdated.size === 0 ? notes : changedNotes;

  await Promise.all(notesToSave.map((note) => saveNoteToStorage(note)));

  // Remove records that no longer exist without clearing the whole database.
  try {
    const db = await openDb();
    const tx = db.transaction(NOTES_STORE, 'readwrite');
    const store = tx.objectStore(NOTES_STORE);
    const existingIds: string[] = await new Promise((resolve, reject) => {
      const req = store.getAllKeys();
      req.onsuccess = () => resolve((req.result || []) as string[]);
      req.onerror = () => reject(req.error);
    });

    const activeIds = new Set(notes.map((note) => note.id));
    for (const id of existingIds) {
      if (!activeIds.has(id)) {
        store.delete(id);
        tx.objectStore(ATTACHMENTS_STORE).delete(id);
        lastSavedUpdated.delete(id);
      }
    }

    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error || new Error('IndexedDB cleanup aborted'));
    });
  } catch (err) {
    console.warn('IndexedDB cleanup failed:', err);
  }
}
