import { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { t } from '../utils/i18n';

export default function Settings() {
  const { settings, updateSettings } = useStore();
  const [newCategory, setNewCategory] = useState('');

  const handleLanguageChange = (e) => {
    updateSettings({ language: e.target.value });
  };

  const handleCurrencyChange = (e) => {
    updateSettings({ currency: e.target.value });
  };

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    if (settings.categories.includes(newCategory.trim())) return;
    
    updateSettings({ 
      categories: [...settings.categories, newCategory.trim()] 
    });
    setNewCategory('');
  };

  const handleRemoveCategory = (catToRemove) => {
    if (window.confirm(`Remove category "${catToRemove}"?`)) {
      updateSettings({
        categories: settings.categories.filter(cat => cat !== catToRemove)
      });
    }
  };

  const handleStoreNameChange = (e) => {
    updateSettings({ storeName: e.target.value });
  };

  return (
    <div className="page-container" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '2rem' }}>{t('settingsTitle', settings.language)}</h2>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="material-symbols-rounded" style={{ color: 'var(--primary)' }}>storefront</span>
          General
        </h3>
        <div className="form-group" style={{ maxWidth: '400px' }}>
          <label>{t('storeName', settings.language)}</label>
          <input 
            type="text" 
            value={settings.storeName || ''} 
            onChange={handleStoreNameChange}
            placeholder="Toko Klontong"
          />
        </div>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="material-symbols-rounded" style={{ color: 'var(--primary)' }}>language</span>
          Localization
        </h3>
        
        <div className="grid-cols-2" style={{ gap: '2rem' }}>
          <div className="form-group">
            <label>{t('language', settings.language)}</label>
            <select value={settings.language} onChange={handleLanguageChange}>
              <option value="en">English</option>
              <option value="id">Bahasa Indonesia</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>{t('currency', settings.language)}</label>
            <select value={settings.currency} onChange={handleCurrencyChange}>
              <option value="IDR">IDR (Rp)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="material-symbols-rounded" style={{ color: 'var(--primary)' }}>category</span>
          {t('categories', settings.language)}
        </h3>

        <form onSubmit={handleAddCategory} style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          <input 
            type="text" 
            placeholder={t('categoryName', settings.language)} 
            value={newCategory} 
            onChange={(e) => setNewCategory(e.target.value)}
            style={{ flexGrow: 1 }}
          />
          <button type="submit" className="btn btn-primary" disabled={!newCategory.trim()}>
            <span className="material-symbols-rounded">add</span>
            {t('addCategory', settings.language)}
          </button>
        </form>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
          {settings.categories.map((cat, idx) => (
            <div key={idx} style={{ 
              display: 'flex', alignItems: 'center', gap: '0.5rem', 
              padding: '0.5rem 1rem', backgroundColor: 'var(--bg-main)', 
              borderRadius: 'var(--radius-full)', border: '1px solid var(--border)'
            }}>
              <span style={{ fontWeight: 500 }}>{cat}</span>
              <button 
                type="button" 
                className="btn-icon" 
                style={{ padding: '0.1rem', color: 'var(--danger)', width: '20px', height: '20px' }}
                onClick={() => handleRemoveCategory(cat)}
              >
                <span className="material-symbols-rounded" style={{ fontSize: '1.2rem' }}>close</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
