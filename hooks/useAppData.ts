
import { useState, useEffect } from 'react';
import { AppData, DayItinerary, Ticket, FlightSegment } from '../types';
import { INITIAL_DATA } from '../constants';

// 升級 Key 版本，確保舊的快取不會影響新邏輯
const STORAGE_KEY = 'sg_trip_2025_v7_flights';
const DB_NAME = 'sg_trip_db';
const STORE_NAME = 'files';

// --- IndexedDB Helpers ---
const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const dbPut = async (id: string, data: string) => {
  const db = await openDB();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.put(data, id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
};

const dbGet = async (id: string): Promise<string> => {
  const db = await openDB();
  return new Promise((resolve) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.get(id);
    req.onsuccess = () => resolve(req.result || '');
    req.onerror = () => resolve('');
  });
};

const dbDelete = async (id: string) => {
  const db = await openDB();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
};

const dbClear = async () => {
  const db = await openDB();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.clear();
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
};

export const useAppData = () => {
  const [data, setData] = useState<AppData>(INITIAL_DATA);
  const [isLoaded, setIsLoaded] = useState(false);

  // 1. Load Data (LocalStorage + IndexedDB)
  useEffect(() => {
    const load = async () => {
      const savedJSON = localStorage.getItem(STORAGE_KEY);
      let localData = INITIAL_DATA;

      if (savedJSON) {
        try {
          const parsed = JSON.parse(savedJSON);
          if (parsed.itinerary && parsed.flights) {
            // Migration for old data without airline/origin/dest
            if (!parsed.flights.outbound.airline) parsed.flights.outbound.airline = 'STARLUX';
            if (!parsed.flights.outbound.origin) parsed.flights.outbound.origin = 'TPE';
            if (!parsed.flights.outbound.destination) parsed.flights.outbound.destination = 'SIN';
            
            if (!parsed.flights.inbound.airline) parsed.flights.inbound.airline = 'STARLUX';
            if (!parsed.flights.inbound.origin) parsed.flights.inbound.origin = 'SIN';
            if (!parsed.flights.inbound.destination) parsed.flights.inbound.destination = 'TPE';

            localData = parsed;
          }
        } catch (e) {
          console.error("Data load error", e);
        }
      }

      // Rehydrate tickets from DB
      if (localData.tickets.length > 0) {
        const fullTickets = await Promise.all(
          localData.tickets.map(async (t) => {
            if (!t.data || t.data === '') {
                const fileData = await dbGet(t.id);
                return { ...t, data: fileData };
            }
            return t;
          })
        );
        localData = { ...localData, tickets: fullTickets };
      }

      setData(localData);
      setIsLoaded(true);
    };

    load();
  }, []);

  // 2. Save Data (Split LocalStorage & IndexedDB)
  useEffect(() => {
    if (!isLoaded) return;

    // 儲存到 LocalStorage 時，把 data (檔案內容) 移除，只存 metadata
    const minimalTickets = data.tickets.map(t => ({
        ...t,
        data: '' // Keep LocalStorage clean
    }));

    const dataToSave = { ...data, tickets: minimalTickets };
    
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (e) {
        console.error("Storage full?", e);
    }
  }, [data, isLoaded]);

  // Actions
  const updateItinerary = (newItinerary: DayItinerary[]) => {
    setData(prev => ({ ...prev, itinerary: newItinerary }));
  };

  const updateFlights = (type: 'outbound' | 'inbound', segment: FlightSegment) => {
      setData(prev => ({
          ...prev,
          flights: {
              ...prev.flights,
              [type]: segment
          }
      }));
  };

  const addTicket = async (ticket: Ticket) => {
    try {
        await dbPut(ticket.id, ticket.data);
        setData(prev => ({ ...prev, tickets: [...prev.tickets, ticket] }));
    } catch (e) {
        alert("儲存失敗：資料庫錯誤或空間不足");
        console.error(e);
    }
  };

  const updateTicket = async (updatedTicket: Ticket) => {
    if (updatedTicket.data && updatedTicket.data.length > 100) {
        await dbPut(updatedTicket.id, updatedTicket.data);
    }
    
    setData(prev => ({
      ...prev,
      tickets: prev.tickets.map(t => t.id === updatedTicket.id ? updatedTicket : t)
    }));
  };

  const removeTicket = async (id: string) => {
    await dbDelete(id);
    setData(prev => ({ ...prev, tickets: prev.tickets.filter(t => t.id !== id) }));
  };

  const resetData = async () => {
    await dbClear();
    localStorage.removeItem(STORAGE_KEY);
    window.location.reload();
  };
  
  const importData = async (newData: AppData) => {
    await dbClear();
    if (newData.tickets) {
        for (const t of newData.tickets) {
            if (t.data) await dbPut(t.id, t.data);
        }
    }
    setData(newData);
  };

  return { data, updateItinerary, updateFlights, addTicket, updateTicket, removeTicket, resetData, importData };
};
