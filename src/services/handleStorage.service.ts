/**
 * IndexedDB service for storing FileSystemDirectoryHandle
 * 
 * File System Access API handles can be serialized to IndexedDB,
 * allowing us to persist access across sessions. However, the user
 * may need to re-grant permission on each new session.
 */

const DB_NAME = 'goal-tracker-fs';
const DB_VERSION = 1;
const STORE_NAME = 'handles';
const HANDLE_KEY = 'goals-directory';
const METADATA_KEY = 'goals-directory-meta';

interface HandleMetadata {
  storedAt: number;
  name: string;
}

/**
 * Open the IndexedDB database
 */
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => {
      reject(new Error('Failed to open IndexedDB'));
    };
    
    request.onsuccess = () => {
      resolve(request.result);
    };
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
}

/**
 * Store a directory handle in IndexedDB
 */
export async function storeDirectoryHandle(handle: FileSystemDirectoryHandle): Promise<void> {
  const db = await openDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    // Store the handle
    const handleRequest = store.put(handle, HANDLE_KEY);
    
    // Store metadata
    const metadata: HandleMetadata = {
      storedAt: Date.now(),
      name: handle.name,
    };
    store.put(metadata, METADATA_KEY);
    
    handleRequest.onerror = () => {
      reject(new Error('Failed to store directory handle'));
    };
    
    transaction.oncomplete = () => {
      db.close();
      resolve();
    };
    
    transaction.onerror = () => {
      db.close();
      reject(new Error('Transaction failed'));
    };
  });
}

/**
 * Retrieve a stored directory handle from IndexedDB
 */
export async function getStoredDirectoryHandle(): Promise<FileSystemDirectoryHandle | null> {
  try {
    const db = await openDatabase();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(HANDLE_KEY);
      
      request.onerror = () => {
        db.close();
        reject(new Error('Failed to retrieve directory handle'));
      };
      
      request.onsuccess = () => {
        db.close();
        resolve(request.result || null);
      };
    });
  } catch {
    return null;
  }
}

/**
 * Get metadata about the stored handle
 */
export async function getStoredHandleMetadata(): Promise<HandleMetadata | null> {
  try {
    const db = await openDatabase();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(METADATA_KEY);
      
      request.onerror = () => {
        db.close();
        reject(new Error('Failed to retrieve handle metadata'));
      };
      
      request.onsuccess = () => {
        db.close();
        resolve(request.result || null);
      };
    });
  } catch {
    return null;
  }
}

/**
 * Clear the stored directory handle
 */
export async function clearStoredDirectoryHandle(): Promise<void> {
  const db = await openDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    store.delete(HANDLE_KEY);
    store.delete(METADATA_KEY);
    
    transaction.oncomplete = () => {
      db.close();
      resolve();
    };
    
    transaction.onerror = () => {
      db.close();
      reject(new Error('Failed to clear stored handle'));
    };
  });
}

/**
 * Check if a directory handle is stored
 */
export async function hasStoredDirectoryHandle(): Promise<boolean> {
  const handle = await getStoredDirectoryHandle();
  return handle !== null;
}
