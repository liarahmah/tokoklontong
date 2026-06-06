import { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { t, formatCurrency } from '../utils/i18n';

export default function Transactions() {
  const { transactions, settings } = useStore();
  const [filterDate, setFilterDate] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterProduct, setFilterProduct] = useState('');

  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      // Date Filter
      if (filterDate) {
        const txDate = new Date(tx.date).toISOString().split('T')[0];
        if (txDate !== filterDate) return false;
      }
      
      // Category Filter: transaction is valid if ANY of its items match the category
      if (filterCategory !== 'All') {
        const hasCategory = tx.items.some(item => item.category === filterCategory);
        if (!hasCategory) return false;
      }
      
      // Product Filter
      if (filterProduct) {
        const searchTerms = filterProduct.toLowerCase();
        const hasProduct = tx.items.some(item => 
          item.name.toLowerCase().includes(searchTerms) || 
          item.sku.includes(searchTerms)
        );
        if (!hasProduct) return false;
      }
      
      return true;
    });
  }, [transactions, filterDate, filterCategory, filterProduct]);

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ margin: 0 }}>{t('transactions', settings.language)}</h2>
      </div>

      <div className="card" style={{ marginBottom: '2rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div style={{ flex: '1 1 200px' }}>
          <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{t('date', settings.language)}</label>
          <input 
            type="date" 
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            style={{ width: '100%' }}
          />
        </div>
        <div style={{ flex: '1 1 200px' }}>
          <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{t('category', settings.language)}</label>
          <select 
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            style={{ width: '100%' }}
          >
            <option value="All">All Categories</option>
            {settings.categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
        <div style={{ flex: '2 1 300px' }}>
          <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{t('productName', settings.language)}</label>
          <div style={{ position: 'relative' }}>
            <span className="material-symbols-rounded" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>search</span>
            <input 
              type="text" 
              placeholder={t('search', settings.language)}
              value={filterProduct}
              onChange={(e) => setFilterProduct(e.target.value)}
              style={{ width: '100%', paddingLeft: '3rem' }}
            />
          </div>
        </div>
        <button className="btn btn-outline" onClick={() => { setFilterDate(''); setFilterCategory('All'); setFilterProduct(''); }}>
          Clear
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {filteredTransactions.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <span className="material-symbols-rounded" style={{ fontSize: '3rem', opacity: 0.3, marginBottom: '1rem' }}>receipt_long</span>
            <p>{t('noTransactions', settings.language)}</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {filteredTransactions.map((tx, idx) => (
              <div key={tx.id} style={{ 
                padding: '1.5rem', 
                borderBottom: idx === filteredTransactions.length - 1 ? 'none' : '1px solid var(--border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start'
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    <div style={{ fontWeight: 'bold', color: 'var(--text-main)', fontSize: '1.1rem' }}>
                      {new Date(tx.date).toLocaleDateString(settings.language === 'en' ? 'en-US' : 'id-ID', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <span className="badge" style={{ backgroundColor: 'var(--bg-main)', fontFamily: 'monospace' }}>{tx.id}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {tx.items.map(item => (
                      <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', maxWidth: '400px', fontSize: '0.95rem' }}>
                        <span>{item.quantity}x {item.name}</span>
                        <span style={{ color: 'var(--text-muted)' }}>{formatCurrency(item.price * item.quantity, settings.currency, settings.language)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ textAlign: 'right', minWidth: '150px' }}>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>{t('total', settings.language)}</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '0.5rem' }}>
                    {formatCurrency(tx.total, settings.currency, settings.language)}
                  </div>
                  {tx.profit > 0 && (
                    <div style={{ fontSize: '0.9rem', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.2rem' }}>
                      <span className="material-symbols-rounded" style={{ fontSize: '1rem' }}>trending_up</span>
                      {t('profit', settings.language)}: {formatCurrency(tx.profit, settings.currency, settings.language)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
