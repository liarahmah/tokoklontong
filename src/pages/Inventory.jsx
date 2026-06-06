import { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { t, formatCurrency } from '../utils/i18n';

export default function Inventory() {
  const { inventory, addItem, updateItem, deleteItem, settings } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({ name: '', sku: '', price: '', costPrice: '', stock: '', category: settings.categories[0] || 'Food' });

  const filteredInventory = inventory.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.sku.includes(searchTerm)
  );

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({ ...item });
    } else {
      setEditingItem(null);
      setFormData({ name: '', sku: '', price: '', costPrice: '', stock: '', category: settings.categories[0] || 'Food' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      // Support decimals for non-IDR currencies
      price: settings.currency === 'IDR' ? parseInt(formData.price, 10) : parseFloat(formData.price),
      costPrice: formData.costPrice ? (settings.currency === 'IDR' ? parseInt(formData.costPrice, 10) : parseFloat(formData.costPrice)) : 0,
      stock: parseInt(formData.stock, 10)
    };

    if (editingItem) {
      updateItem(editingItem.id, payload);
    } else {
      addItem(payload);
    }
    handleCloseModal();
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      deleteItem(id);
    }
  };

  return (
    <div className="page-container" style={{ position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ position: 'relative', width: '300px' }}>
          <span className="material-symbols-rounded" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>search</span>
          <input 
            type="text" 
            placeholder={t('searchInventory', settings.language)} 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', paddingLeft: '3rem' }}
          />
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <span className="material-symbols-rounded">add</span>
          {t('addProduct', settings.language)}
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>{t('sku', settings.language)}</th>
              <th>{t('productName', settings.language)}</th>
              <th>{t('category', settings.language)}</th>
              <th>{t('costPrice', settings.language)}</th>
              <th>{t('price', settings.language)}</th>
              <th>{t('stock', settings.language)}</th>
              <th style={{ textAlign: 'right' }}>{t('actions', settings.language)}</th>
            </tr>
          </thead>
          <tbody>
            {filteredInventory.map(item => (
              <tr key={item.id}>
                <td style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>{item.sku}</td>
                <td style={{ fontWeight: 500 }}>{item.name}</td>
                <td><span className="badge" style={{ backgroundColor: 'var(--bg-main)' }}>{item.category}</span></td>
                <td style={{ color: 'var(--text-muted)' }}>{formatCurrency(item.costPrice, settings.currency, settings.language)}</td>
                <td>{formatCurrency(item.price, settings.currency, settings.language)}</td>
                <td>
                  <span className={item.stock < 10 ? 'badge badge-danger' : item.stock < 20 ? 'badge badge-warning' : ''} style={{ padding: item.stock < 20 ? '0.25rem 0.6rem' : '0' }}>
                    {item.stock}
                  </span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button className="btn-icon" onClick={() => handleOpenModal(item)} title="Edit">
                    <span className="material-symbols-rounded">edit</span>
                  </button>
                  <button className="btn-icon" onClick={() => handleDelete(item.id)} title="Delete" style={{ color: 'var(--danger)' }}>
                    <span className="material-symbols-rounded">delete</span>
                  </button>
                </td>
              </tr>
            ))}
            {filteredInventory.length === 0 && (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  {t('noProducts', settings.language)}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Overlay */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(2px)' }}>
          <div className="card" style={{ width: '400px', maxWidth: '90%', padding: '2rem' }}>
            <h3 style={{ marginTop: 0, marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {editingItem ? t('editProduct', settings.language) : t('addProduct', settings.language)}
              <button className="btn-icon" onClick={handleCloseModal} style={{ padding: 0 }}>
                <span className="material-symbols-rounded">close</span>
              </button>
            </h3>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>{t('productName', settings.language)}</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Indomie Goreng" />
              </div>
              <div className="form-group">
                <label>{t('sku', settings.language)}</label>
                <input required type="text" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} placeholder="e.g. 899..." />
              </div>
              <div className="grid-cols-2" style={{ gap: '1rem' }}>
                <div className="form-group">
                  <label>{t('costPrice', settings.language)}</label>
                  <input required type="number" step={settings.currency === 'IDR' ? '1' : '0.01'} min="0" value={formData.costPrice} onChange={e => setFormData({...formData, costPrice: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>{t('price', settings.language)}</label>
                  <input required type="number" step={settings.currency === 'IDR' ? '1' : '0.01'} min="0" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                </div>
              </div>
              <div className="grid-cols-2" style={{ gap: '1rem' }}>
                <div className="form-group">
                  <label>Initial Stock</label>
                  <input required type="number" min="0" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>{t('category', settings.language)}</label>
                  <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                    {settings.categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={handleCloseModal}>{t('cancel', settings.language)}</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>{t('save', settings.language)}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
