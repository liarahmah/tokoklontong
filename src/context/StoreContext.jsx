import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { findBackupFile, downloadBackupFile, syncToDrive } from '../utils/driveService';

const StoreContext = createContext();

const STORAGE_KEY = 'toko_klontong_db';

const INITIAL_INVENTORY = [
  { id: '1', sku: '8991234567890', name: 'Indomie Goreng', price: 3000, costPrice: 2500, stock: 50, category: 'Food' },
  { id: '2', sku: '8991234567891', name: 'Aqua Botol 600ml', price: 3500, costPrice: 2000, stock: 24, category: 'Beverage' },
];

const INITIAL_SETTINGS = {
  storeName: 'Toko Klontong',
  language: 'id',
  currency: 'IDR',
  categories: ['Food', 'Beverage', 'Staple', 'Household', 'Other']
};

export function StoreProvider({ children }) {
  const { accessToken } = useAuth();
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);

  const [storeData, setStoreData] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return { inventory: parsed, settings: INITIAL_SETTINGS, transactions: [] };
        }
        return {
          inventory: parsed.inventory || [],
          settings: { ...INITIAL_SETTINGS, ...parsed.settings },
          transactions: parsed.transactions || []
        };
      } catch (e) {
        console.error("Failed to parse from localStorage", e);
      }
    }
    return { inventory: INITIAL_INVENTORY, settings: INITIAL_SETTINGS, transactions: [] };
  });

  const isInitialMount = useRef(true);

  // 1. Pull from Drive on Login
  useEffect(() => {
    async function pullFromDrive() {
      if (!accessToken) return;
      setIsSyncing(true);
      try {
        const file = await findBackupFile(accessToken);
        if (file) {
          const cloudData = await downloadBackupFile(accessToken, file.id);
          if (Array.isArray(cloudData)) {
             setStoreData({ inventory: cloudData, settings: INITIAL_SETTINGS, transactions: [] });
          } else if (cloudData && cloudData.inventory) {
             setStoreData({
               inventory: cloudData.inventory || [],
               settings: { ...INITIAL_SETTINGS, ...cloudData.settings },
               transactions: cloudData.transactions || []
             });
          }
          setLastSyncTime(new Date());
        }
      } catch (error) {
        console.error("Failed to pull from drive", error);
      } finally {
        setIsSyncing(false);
      }
    }
    pullFromDrive();
  }, [accessToken]);

  // 2. Save to local storage and Drive on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storeData));
    
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (accessToken && !isSyncing) {
      const timer = setTimeout(() => {
        setIsSyncing(true);
        syncToDrive(accessToken, storeData)
          .then(() => setLastSyncTime(new Date()))
          .catch(e => console.error("Sync failed", e))
          .finally(() => setIsSyncing(false));
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [storeData, accessToken]);

  // --- Actions ---

  const addItem = (item) => {
    const newItem = { ...item, id: Date.now().toString() };
    setStoreData(prev => ({ ...prev, inventory: [...prev.inventory, newItem] }));
  };

  const updateItem = (id, updatedItem) => {
    setStoreData(prev => ({
      ...prev,
      inventory: prev.inventory.map(item => item.id === id ? { ...item, ...updatedItem } : item)
    }));
  };

  const deleteItem = (id) => {
    setStoreData(prev => ({
      ...prev,
      inventory: prev.inventory.filter(item => item.id !== id)
    }));
  };

  const processCheckout = (cart, total) => {
    setStoreData(prev => {
      // 1. Deduct Stock
      const newInventory = prev.inventory.map(item => {
        const cartItem = cart.find(i => i.id === item.id);
        if (cartItem) {
          return { ...item, stock: Math.max(0, item.stock - cartItem.quantity) };
        }
        return item;
      });

      // 2. Calculate Profit for this transaction
      let totalCost = 0;
      cart.forEach(item => {
        // If an item doesn't have a cost price, assume cost is 0 or maybe same as price. We'll default to 0 for profit calculation.
        const cost = item.costPrice || 0;
        totalCost += cost * item.quantity;
      });

      const transaction = {
        id: 'tx_' + Date.now(),
        date: new Date().toISOString(),
        items: cart,
        total: total,
        profit: total - totalCost
      };

      return {
        ...prev,
        inventory: newInventory,
        transactions: [transaction, ...(prev.transactions || [])]
      };
    });
  };

  const updateSettings = (newSettings) => {
    setStoreData(prev => ({
      ...prev,
      settings: { ...prev.settings, ...newSettings }
    }));
  };

  return (
    <StoreContext.Provider value={{ 
      inventory: storeData.inventory, 
      settings: storeData.settings,
      transactions: storeData.transactions || [],
      addItem, updateItem, deleteItem, processCheckout, 
      updateSettings, 
      isSyncing, lastSyncTime 
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export const useStore = () => useContext(StoreContext);
