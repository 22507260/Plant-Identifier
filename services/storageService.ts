import { SavedPlant, JournalEntry } from "../types";

const DB_NAME = 'GreenThumbDB';
const DB_VERSION = 1;
const STORE_NAME = 'plants';
const LS_KEY = 'green_thumb_garden';

/**
 * Compresses a Base64 image string to optimize storage performance.
 * Even with IndexedDB, smaller images load faster in the UI.
 */
const compressImage = (base64Str: string, maxWidth = 600, quality = 0.7): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => {
      resolve(base64Str); 
    };
  });
};

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
};

// Migrate old LocalStorage data to IndexedDB once
const migrateFromLocalStorage = async (db: IDBDatabase) => {
  const lsData = localStorage.getItem(LS_KEY);
  if (lsData) {
    try {
      const plants: SavedPlant[] = JSON.parse(lsData);
      if (plants.length > 0) {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        for (const plant of plants) {
          store.put(plant);
        }
        await new Promise<void>((resolve, reject) => {
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
      }
      localStorage.removeItem(LS_KEY); // Clear old storage after successful migration
    } catch (e) {
      console.error('Migration failed', e);
    }
  }
};

export const getSavedPlants = async (): Promise<SavedPlant[]> => {
  try {
    const db = await openDB();
    await migrateFromLocalStorage(db);
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();
      request.onsuccess = () => {
          const results = request.result as SavedPlant[];
          // Sort by dateSaved descending (newest first)
          results.sort((a, b) => b.dateSaved - a.dateSaved);
          resolve(results);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("Error getting plants:", error);
    return [];
  }
};

export const savePlantToGarden = async (plant: Omit<SavedPlant, 'id' | 'dateSaved'>): Promise<SavedPlant> => {
  let finalImage = plant.imageBase64;
  if (finalImage) {
    try {
        finalImage = await compressImage(finalImage);
    } catch (e) {
        console.warn("Image compression failed, using raw", e);
    }
  }

  const newPlant: SavedPlant = {
    ...plant,
    id: Date.now().toString(),
    dateSaved: Date.now(),
    imageBase64: finalImage,
    journal: [] // Initialize empty journal
  };

  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.add(newPlant);
    request.onsuccess = () => resolve(newPlant);
    request.onerror = () => reject(request.error);
  });
};

export const deletePlantFromGarden = async (id: string): Promise<void> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
};

export const updatePlantNote = async (id: string, note: string): Promise<void> => {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    
    // Get, Update, Put flow
    return new Promise((resolve, reject) => {
        const getReq = store.get(id);
        getReq.onsuccess = () => {
            const plant = getReq.result as SavedPlant;
            if (plant) {
                plant.personalNotes = note;
                store.put(plant);
                resolve();
            } else {
                resolve(); // Plant not found, ignore
            }
        };
        getReq.onerror = () => reject(getReq.error);
    });
};

export const updatePlantWatering = async (id: string, interval: number | undefined, lastWatered: number | undefined): Promise<void> => {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);

  return new Promise((resolve, reject) => {
      const getReq = store.get(id);
      getReq.onsuccess = () => {
          const plant = getReq.result as SavedPlant;
          if (plant) {
              plant.wateringInterval = interval;
              if (lastWatered !== undefined) {
                  plant.lastWatered = lastWatered;
              }
              store.put(plant);
              resolve();
          } else {
              resolve();
          }
      };
      getReq.onerror = () => reject(getReq.error);
  });
};

export const updatePlantSoilType = async (id: string, soilType: string): Promise<void> => {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    
    return new Promise((resolve, reject) => {
        const getReq = store.get(id);
        getReq.onsuccess = () => {
            const plant = getReq.result as SavedPlant;
            if (plant) {
                plant.soilType = soilType;
                store.put(plant);
                resolve();
            } else {
                resolve();
            }
        };
        getReq.onerror = () => reject(getReq.error);
    });
};

export const addPlantJournalEntry = async (id: string, entry: JournalEntry): Promise<void> => {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);

  return new Promise((resolve, reject) => {
    const getReq = store.get(id);
    getReq.onsuccess = () => {
      const plant = getReq.result as SavedPlant;
      if (plant) {
        if (!plant.journal) {
          plant.journal = [];
        }
        plant.journal.push(entry);
        store.put(plant);
        resolve();
      } else {
        resolve();
      }
    };
    getReq.onerror = () => reject(getReq.error);
  });
};
