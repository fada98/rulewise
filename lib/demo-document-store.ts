import type { TextChunk } from "./rag/chunking";

const DATABASE_NAME = "rulewise-local-documents";
const STORE_NAME = "documents";
const DATABASE_VERSION = 1;

export type StoredDocument = {
  id: string;
  name: string;
  file: string;
  pages: number;
  chunks: number;
  uploaded: string;
  size: string;
  blob: Blob;
  textChunks: TextChunk[];
};

function openDatabase() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) {
        request.result.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function runRequest<T>(mode: IDBTransactionMode, operation: (store: IDBObjectStore) => IDBRequest<T>) {
  const database = await openDatabase();
  return new Promise<T>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, mode);
    const request = operation(transaction.objectStore(STORE_NAME));
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => database.close();
    transaction.onerror = () => reject(transaction.error);
  });
}

export function saveStoredDocument(document: StoredDocument) {
  return runRequest("readwrite", store => store.put(document));
}

export function listStoredDocuments() {
  return runRequest<StoredDocument[]>("readonly", store => store.getAll());
}

export function deleteStoredDocument(id: string) {
  return runRequest("readwrite", store => store.delete(id));
}
