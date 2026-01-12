/**
 * IndexedDB Storage Service for In-App Goal Storage
 * 
 * Provides a complete storage backend using IndexedDB for users who want to
 * store goals within the app rather than in an external folder.
 * 
 * Goals are stored as markdown strings to maintain compatibility with
 * the external folder format.
 */

import type { Goal } from '@/types';
import { parseFrontmatter, frontmatterToGoal, goalToMarkdown } from './fileSystem.service';

const DB_NAME = 'goal-tracker-goals';
const DB_VERSION = 1;
const GOALS_STORE = 'goals';
const CATEGORIES_STORE = 'categories';

interface StoredGoal {
  filePath: string;
  category: string;
  content: string; // Raw markdown content
  createdAt: number;
  updatedAt: number;
}

interface StoredCategory {
  name: string;
  icon?: string;
  color?: string;
  description?: string;
  order?: number;
  createdAt: number;
}

// Cached database instance
let dbInstance: IDBDatabase | null = null;

/**
 * Open the goals IndexedDB database
 */
async function openDatabase(): Promise<IDBDatabase> {
  if (dbInstance) {
    return dbInstance;
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error('Failed to open goals database'));
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create goals store with filePath as key
      if (!db.objectStoreNames.contains(GOALS_STORE)) {
        const goalsStore = db.createObjectStore(GOALS_STORE, { keyPath: 'filePath' });
        goalsStore.createIndex('category', 'category', { unique: false });
        goalsStore.createIndex('updatedAt', 'updatedAt', { unique: false });
      }

      // Create categories store
      if (!db.objectStoreNames.contains(CATEGORIES_STORE)) {
        db.createObjectStore(CATEGORIES_STORE, { keyPath: 'name' });
      }
    };
  });
}

/**
 * Initialize the goals database
 */
export async function initializeGoalsDB(): Promise<void> {
  await openDatabase();
}

/**
 * Generate a file path for a new goal
 */
export function generateGoalFilePath(title: string, category: string): string {
  const sanitizedTitle = title
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 50);
  
  const sanitizedCategory = category
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    .replace(/\s+/g, '_');

  return `${sanitizedCategory}/${sanitizedTitle}.md`;
}

/**
 * Load all goals from IndexedDB
 */
export async function loadGoalsFromIndexedDB(): Promise<Goal[]> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(GOALS_STORE, 'readonly');
    const store = transaction.objectStore(GOALS_STORE);
    const request = store.getAll();

    request.onerror = () => {
      reject(new Error('Failed to load goals from IndexedDB'));
    };

    request.onsuccess = () => {
      const storedGoals: StoredGoal[] = request.result;
      const goals: Goal[] = [];

      for (const stored of storedGoals) {
        try {
          const frontmatter = parseFrontmatter(stored.content);
          const goal = frontmatterToGoal(
            frontmatter,
            stored.content,
            stored.filePath,
            stored.category
          );
          goals.push(goal);
        } catch (error) {
          console.warn(`Failed to parse goal ${stored.filePath}:`, error);
        }
      }

      resolve(goals);
    };
  });
}

/**
 * Save a goal to IndexedDB
 */
export async function saveGoalToIndexedDB(goal: Goal): Promise<void> {
  const db = await openDatabase();
  
  // Generate markdown content from goal
  const content = goalToMarkdown(goal);

  const storedGoal: StoredGoal = {
    filePath: goal.filePath,
    category: goal.category,
    content,
    createdAt: Date.now(), // Will be overwritten if exists
    updatedAt: Date.now(),
  };

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(GOALS_STORE, 'readwrite');
    const store = transaction.objectStore(GOALS_STORE);

    // First, try to get existing goal to preserve createdAt
    const getRequest = store.get(goal.filePath);
    
    getRequest.onsuccess = () => {
      if (getRequest.result) {
        storedGoal.createdAt = getRequest.result.createdAt;
      }
      
      const putRequest = store.put(storedGoal);
      
      putRequest.onerror = () => {
        reject(new Error('Failed to save goal to IndexedDB'));
      };

      putRequest.onsuccess = () => {
        resolve();
      };
    };

    getRequest.onerror = () => {
      // If we can't get, just try to put anyway
      const putRequest = store.put(storedGoal);
      
      putRequest.onerror = () => {
        reject(new Error('Failed to save goal to IndexedDB'));
      };

      putRequest.onsuccess = () => {
        resolve();
      };
    };
  });
}

/**
 * Delete a goal from IndexedDB
 */
export async function deleteGoalFromIndexedDB(filePath: string): Promise<void> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(GOALS_STORE, 'readwrite');
    const store = transaction.objectStore(GOALS_STORE);
    const request = store.delete(filePath);

    request.onerror = () => {
      reject(new Error('Failed to delete goal from IndexedDB'));
    };

    request.onsuccess = () => {
      resolve();
    };
  });
}

/**
 * Get raw markdown content for a goal
 */
export async function getGoalContentFromIndexedDB(filePath: string): Promise<string | null> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(GOALS_STORE, 'readonly');
    const store = transaction.objectStore(GOALS_STORE);
    const request = store.get(filePath);

    request.onerror = () => {
      reject(new Error('Failed to get goal content from IndexedDB'));
    };

    request.onsuccess = () => {
      const stored: StoredGoal | undefined = request.result;
      resolve(stored?.content ?? null);
    };
  });
}

/**
 * Save raw markdown content for a goal
 */
export async function saveGoalContentToIndexedDB(
  filePath: string, 
  content: string,
  category: string
): Promise<void> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(GOALS_STORE, 'readwrite');
    const store = transaction.objectStore(GOALS_STORE);

    // Get existing or create new
    const getRequest = store.get(filePath);

    getRequest.onsuccess = () => {
      const existing: StoredGoal | undefined = getRequest.result;
      
      const storedGoal: StoredGoal = {
        filePath,
        category,
        content,
        createdAt: existing?.createdAt ?? Date.now(),
        updatedAt: Date.now(),
      };

      const putRequest = store.put(storedGoal);

      putRequest.onerror = () => {
        reject(new Error('Failed to save goal content to IndexedDB'));
      };

      putRequest.onsuccess = () => {
        resolve();
      };
    };

    getRequest.onerror = () => {
      reject(new Error('Failed to get existing goal from IndexedDB'));
    };
  });
}

/**
 * Get all categories from IndexedDB
 */
export async function getCategoriesFromIndexedDB(): Promise<StoredCategory[]> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(CATEGORIES_STORE, 'readonly');
    const store = transaction.objectStore(CATEGORIES_STORE);
    const request = store.getAll();

    request.onerror = () => {
      reject(new Error('Failed to load categories from IndexedDB'));
    };

    request.onsuccess = () => {
      resolve(request.result);
    };
  });
}

/**
 * Save a category to IndexedDB
 */
export async function saveCategoryToIndexedDB(category: Omit<StoredCategory, 'createdAt'>): Promise<void> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(CATEGORIES_STORE, 'readwrite');
    const store = transaction.objectStore(CATEGORIES_STORE);

    // Get existing to preserve createdAt
    const getRequest = store.get(category.name);

    getRequest.onsuccess = () => {
      const existing: StoredCategory | undefined = getRequest.result;
      
      const storedCategory: StoredCategory = {
        ...category,
        createdAt: existing?.createdAt ?? Date.now(),
      };

      const putRequest = store.put(storedCategory);

      putRequest.onerror = () => {
        reject(new Error('Failed to save category to IndexedDB'));
      };

      putRequest.onsuccess = () => {
        resolve();
      };
    };

    getRequest.onerror = () => {
      reject(new Error('Failed to get existing category from IndexedDB'));
    };
  });
}

/**
 * Get all unique categories from stored goals
 */
export async function getUniqueCategoriesFromGoals(): Promise<string[]> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(GOALS_STORE, 'readonly');
    const store = transaction.objectStore(GOALS_STORE);
    const index = store.index('category');
    const request = index.openKeyCursor(null, 'nextunique');

    const categories: string[] = [];

    request.onerror = () => {
      reject(new Error('Failed to get categories from IndexedDB'));
    };

    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest<IDBCursor | null>).result;
      if (cursor) {
        categories.push(cursor.key as string);
        cursor.continue();
      } else {
        resolve(categories);
      }
    };
  });
}

/**
 * Check if IndexedDB has any stored goals
 */
export async function hasStoredGoals(): Promise<boolean> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(GOALS_STORE, 'readonly');
    const store = transaction.objectStore(GOALS_STORE);
    const request = store.count();

    request.onerror = () => {
      reject(new Error('Failed to count goals in IndexedDB'));
    };

    request.onsuccess = () => {
      resolve(request.result > 0);
    };
  });
}

/**
 * Clear all goals from IndexedDB (for mode switching)
 */
export async function clearAllGoalsFromIndexedDB(): Promise<void> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([GOALS_STORE, CATEGORIES_STORE], 'readwrite');
    const goalsStore = transaction.objectStore(GOALS_STORE);
    const categoriesStore = transaction.objectStore(CATEGORIES_STORE);

    goalsStore.clear();
    categoriesStore.clear();

    transaction.oncomplete = () => {
      resolve();
    };

    transaction.onerror = () => {
      reject(new Error('Failed to clear goals from IndexedDB'));
    };
  });
}
