import { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { useCart } from '../hooks/useCart';
import { t, formatCurrency } from '../utils/i18n';

export default function POS() {
  const { inventory, processCheckout, settings } = useStore();
  const { cart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal } = useCart();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.sku.includes(searchTerm);
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCheckout = () => {
    if (cart.length === 0) return;
    processCheckout(cart, cartTotal);
    clearCart();
    alert(t('checkoutSuccess', settings.language));
  };

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 70px)' }}>
      {/* Product List Area */}
      <div style={{ flexGrow: 1, padding: '2rem', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem' }}>
          <div style={{ flexGrow: 1, position: 'relative' }}>
            <span className="material-symbols-rounded" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>search</span>
            <input 
              type="text" 
              placeholder={t('search', settings.language)} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', paddingLeft: '3rem', paddingRight: '1rem', height: '48px', fontSize: '1rem', borderRadius: 'var(--radius-lg)' }}
            />
          </div>
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{ height: '48px', borderRadius: 'var(--radius-lg)', padding: '0 1rem', border: '1px solid var(--border)' }}
          >
            <option value="All">All Categories</option>
            {settings.categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>

        <div className="grid-cols-4" style={{ gap: '1.5rem' }}>
          {filteredInventory.map(item => (
            <div 
              key={item.id} 
              className="card" 
              style={{ cursor: item.stock > 0 ? 'pointer' : 'not-allowed', opacity: item.stock > 0 ? 1 : 0.6, padding: '1rem', display: 'flex', flexDirection: 'column' }}
              onClick={() => item.stock > 0 && addToCart(item)}
            >
              <div style={{ height: '120px', backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-md)', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="material-symbols-rounded" style={{ fontSize: '3rem', color: 'var(--primary-light)' }}>
                  {item.category === 'Food' ? 'lunch_dining' : item.category === 'Beverage' ? 'water_drop' : 'inventory_2'}
                </span>
              </div>
              <div style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '0.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>{t('stock', settings.language)}: {item.stock}</div>
              <div style={{ color: 'var(--primary)', fontWeight: 'bold', marginTop: 'auto', fontSize: '1.1rem' }}>
                {formatCurrency(item.price, settings.currency, settings.language)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cart Sidebar */}
      <div style={{ width: '380px', backgroundColor: 'var(--bg-surface)', borderLeft: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="material-symbols-rounded">shopping_cart</span>
            {t('currentOrder', settings.language)}
          </h3>
        </div>
        
        <div style={{ flexGrow: 1, overflowY: 'auto', padding: '1rem' }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '3rem' }}>
              <span className="material-symbols-rounded" style={{ fontSize: '3rem', opacity: 0.3 }}>remove_shopping_cart</span>
              <p>{t('cartEmpty', settings.language)}</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {cart.map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px dashed var(--border)' }}>
                  <div style={{ flexGrow: 1 }}>
                    <div style={{ fontWeight: 500 }}>{item.name}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {formatCurrency(item.price, settings.currency, settings.language)} x {item.quantity}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                    <div style={{ fontWeight: 'bold' }}>
                      {formatCurrency(item.price * item.quantity, settings.currency, settings.language)}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-full)', padding: '0.2rem' }}>
                      <button className="btn-icon" style={{ padding: '0.2rem' }} onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                        <span className="material-symbols-rounded" style={{ fontSize: '1rem' }}>remove</span>
                      </button>
                      <span style={{ fontSize: '0.9rem', fontWeight: 500, minWidth: '1.5rem', textAlign: 'center' }}>{item.quantity}</span>
                      <button className="btn-icon" style={{ padding: '0.2rem' }} onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                        <span className="material-symbols-rounded" style={{ fontSize: '1rem' }}>add</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border)', backgroundColor: 'var(--bg-surface-hover)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '1.2rem' }}>
            <span style={{ fontWeight: 500 }}>{t('total', settings.language)}</span>
            <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>
              {formatCurrency(cartTotal, settings.currency, settings.language)}
            </span>
          </div>
          <button 
            className="btn btn-success" 
            style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}
            disabled={cart.length === 0}
            onClick={handleCheckout}
          >
            <span className="material-symbols-rounded">payments</span>
            {t('processPayment', settings.language)}
          </button>
          <button 
            className="btn btn-outline" 
            style={{ width: '100%', marginTop: '0.5rem', color: 'var(--danger)', borderColor: 'var(--danger-light)' }}
            disabled={cart.length === 0}
            onClick={clearCart}
          >
            {t('clearCart', settings.language)}
          </button>
        </div>
      </div>
    </div>
  );
}
