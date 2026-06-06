import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { findBackupFile, downloadBackupFile, syncToDrive } from '../utils/driveService';

const STORAGE_KEY = 'toko_klontong_inventory';

const INITIAL_DATA = [
  { id: '1', sku: '8991234567890', name: 'Indomie Goreng', price: 3000, stock: 50, category: 'Food' },
  { id: '2', sku: '8991234567891', name: 'Aqua Botol 600ml', price: 3500, stock: 24, category: 'Beverage' },
  { id: '3', sku: '8991234567892', name: 'Teh Pucuk Harum', price: 4000, stock: 30, category: 'Beverage' },
  { id: '4', sku: '8991234567893', name: 'Beras Ramos 5kg', price: 65000, stock: 10, category: 'Staple' },
  { id: '5', sku: '8991234567894', name: 'Minyak Goreng Bimoli 2L', price: 38000, stock: 15, category: 'Staple' },
  { id: '6', sku: '8991234567895', name: 'Telur Ayam 1kg', price: 28000, stock: 20, category: 'Food' },
  { id: '7', sku: '8991234567896', name: 'Gula Pasir Gulaku 1kg', price: 14000, stock: 5, category: 'Staple' }, // Low stock
];

export function useInventory() {
  const { accessToken } = useAuth();
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  
  const [inventory, setInventory] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse inventory from localStorage", e);
      }
    }
    return INITIAL_DATA;
  });

  const isInitialMount = useRef(true);

  // 1. Pull data when user logs in
  useEffect(() => {
    async function pullFromDrive() {
      if (!accessToken) return;
      setIsSyncing(true);
      try {
        const file = await findBackupFile(accessToken);
        if (file) {
          const cloudData = await downloadBackupFile(accessToken, file.id);
          if (Array.isArray(cloudData)) {
            setInventory(cloudData);
            setLastSyncTime(new Date());
          }
        }
      } catch (error) {
        console.error("Failed to pull from drive", error);
      } finally {
        setIsSyncing(false);
      }
    }
    pullFromDrive();
  }, [accessToken]);

  // 2. Save to local storage and push to Drive when inventory changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(inventory));
    
    // Skip push on initial mount to avoid overwriting cloud with local data immediately
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (accessToken && !isSyncing) {
      // Debounce the sync to avoid API limits on fast typings
      const timer = setTimeout(() => {
        setIsSyncing(true);
        syncToDrive(accessToken, inventory)
          .then(() => setLastSyncTime(new Date()))
          .catch(e => console.error("Sync failed", e))
          .finally(() => setIsSyncing(false));
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [inventory, accessToken]);

  const addItem = (item) => {
    const newItem = { ...item, id: Date.now().toString() };
    setInventory(prev => [...prev, newItem]);
  };

  const updateItem = (id, updatedItem) => {
    setInventory(prev => prev.map(item => item.id === id ? { ...item, ...updatedItem } : item));
  };

  const deleteItem = (id) => {
    setInventory(prev => prev.filter(item => item.id !== id));
  };

  const deductStock = (itemsToDeduct) => {
    setInventory(prev => {
      return prev.map(item => {
        const deductedItem = itemsToDeduct.find(i => i.id === item.id);
        if (deductedItem) {
          return { ...item, stock: Math.max(0, item.stock - deductedItem.quantity) };
        }
        return item;
      });
    });
  };

  return { inventory, addItem, updateItem, deleteItem, deductStock, isSyncing, lastSyncTime };
}
