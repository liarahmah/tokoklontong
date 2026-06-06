import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { useState, useMemo } from 'react';
import { t, formatCurrency } from '../utils/i18n';
import { groupTransactionsByPeriod } from '../utils/analytics';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const { inventory, transactions, isSyncing, lastSyncTime, settings } = useStore();
  const { accessToken } = useAuth();
  const [isExporting, setIsExporting] = useState(false);
  
  // Analytics state
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [period, setPeriod] = useState('daily');

  const totalItems = inventory.length;
  const lowStockItems = inventory.filter(item => item.stock < 10);
  const totalInventoryValue = inventory.reduce((total, item) => total + (item.price * item.stock), 0);

  // Today's Summary calculation
  const todayStr = new Date().toISOString().split('T')[0];
  const todaysTransactions = transactions.filter(tx => tx.date.startsWith(todayStr));
  const todayRevenue = todaysTransactions.reduce((sum, tx) => sum + tx.total, 0);
  const todayProfit = todaysTransactions.reduce((sum, tx) => sum + (tx.profit || 0), 0);
  const todayCost = todayRevenue - todayProfit;

  // Chart Data calculation
  const chartData = useMemo(() => {
    return groupTransactionsByPeriod(transactions, startDate, endDate, period);
  }, [transactions, startDate, endDate, period]);

  const handleExport = async () => {
    if (!accessToken) {
      alert(t('connectDrive', settings.language) + "!");
      return;
    }
    
    setIsExporting(true);
    try {
      // Create CSV content
      const headers = ['SKU', 'Name', 'Category', 'Price', 'Stock'];
      const csvRows = inventory.map(item => 
        `${item.sku},"${item.name}",${item.category},${item.price},${item.stock}`
      );
      const csvContent = [headers.join(','), ...csvRows].join('\n');
      
      const metadata = {
        name: `Toko_Klontong_Export_${new Date().toISOString().split('T')[0]}.csv`,
        mimeType: 'text/csv',
      };

      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      form.append('file', new Blob([csvContent], { type: 'text/csv' }));

      const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
        body: form
      });

      if (!response.ok) throw new Error('Failed to export to Drive');
      alert("Successfully exported to Google Drive!");
    } catch (err) {
      console.error(err);
      alert("Export failed.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ margin: 0 }}>{t('overview', settings.language)}</h2>
          {accessToken ? (
            <div style={{ fontSize: '0.85rem', color: isSyncing ? 'var(--warning)' : 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.5rem' }}>
              <span className="material-symbols-rounded" style={{ fontSize: '1rem' }}>{isSyncing ? 'sync' : 'cloud_done'}</span>
              {isSyncing ? t('syncing', settings.language) : `${t('synced', settings.language)} ${lastSyncTime ? '(' + lastSyncTime.toLocaleTimeString() + ')' : ''}`}
            </div>
          ) : (
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              {t('localMode', settings.language)}
            </div>
          )}
        </div>
        
        <button 
          className="btn btn-outline" 
          onClick={handleExport}
          disabled={!accessToken || isExporting}
        >
          <span className="material-symbols-rounded">download</span>
          {isExporting ? 'Exporting...' : t('exportCsv', settings.language)}
        </button>
      </div>

      <h3 style={{ marginBottom: '1rem' }}>{t('todaysSummary', settings.language)}</h3>
      <div className="grid-cols-3" style={{ marginBottom: '2rem' }}>
        <div className="card" style={{ borderLeft: '4px solid var(--primary-light)' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{t('cost', settings.language)}</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{formatCurrency(todayCost, settings.currency, settings.language)}</div>
        </div>
        <div className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{t('revenue', settings.language)}</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{formatCurrency(todayRevenue, settings.currency, settings.language)}</div>
        </div>
        <div className="card" style={{ borderLeft: '4px solid var(--success)' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{t('todayProfit', settings.language)}</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--success)' }}>{formatCurrency(todayProfit, settings.currency, settings.language)}</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h3 style={{ margin: 0 }}>{t('salesAnalytics', settings.language)}</h3>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>{t('startDate', settings.language)}</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ padding: '0.4rem' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>{t('endDate', settings.language)}</label>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={{ padding: '0.4rem' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>{t('period', settings.language)}</label>
              <select value={period} onChange={e => setPeriod(e.target.value)} style={{ padding: '0.4rem' }}>
                <option value="daily">{t('daily', settings.language)}</option>
                <option value="weekly">{t('weekly', settings.language)}</option>
                <option value="monthly">{t('monthly', settings.language)}</option>
              </select>
            </div>
          </div>
        </div>

        <div style={{ height: '400px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(val) => {
                  if (period === 'monthly') return val;
                  return new Date(val).toLocaleDateString(settings.language === 'en' ? 'en-US' : 'id-ID', { month: 'short', day: 'numeric' });
                }}
                stroke="var(--text-muted)"
              />
              <YAxis 
                tickFormatter={(val) => formatCurrency(val, settings.currency, settings.language).replace(/\.00$/, '')} 
                stroke="var(--text-muted)"
                width={80}
              />
              <Tooltip 
                formatter={(value) => formatCurrency(value, settings.currency, settings.language)}
                labelFormatter={(label) => new Date(label).toLocaleDateString(settings.language === 'en' ? 'en-US' : 'id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-main)' }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                name={t('revenue', settings.language)} 
                stroke="var(--primary)" 
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="profit" 
                name={t('profit', settings.language)} 
                stroke="var(--success)" 
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <h3 style={{ marginBottom: '1rem' }}>{t('inventory', settings.language)} Status</h3>
      <div className="grid-cols-3" style={{ marginBottom: '2rem' }}>
        <div className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{t('totalProducts', settings.language)}</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{totalItems}</div>
        </div>
        <div className="card" style={{ borderLeft: '4px solid var(--warning)' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{t('lowStock', settings.language)}</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{lowStockItems.length}</div>
        </div>
        <div className="card" style={{ borderLeft: '4px solid var(--success)' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{t('estValue', settings.language)}</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', paddingTop: '0.5rem' }}>
            {formatCurrency(totalInventoryValue, settings.currency, settings.language)}
          </div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '1rem' }}>{t('lowStockAlerts', settings.language)}</h3>
        {lowStockItems.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <span className="material-symbols-rounded" style={{ fontSize: '3rem', opacity: 0.5 }}>check_circle</span>
            <p style={{ marginTop: '1rem' }}>{t('allGood', settings.language)}</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>{t('productName', settings.language)}</th>
                <th>{t('sku', settings.language)}</th>
                <th>{t('stock', settings.language)}</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {lowStockItems.map(item => (
                <tr key={item.id}>
                  <td style={{ fontWeight: 500 }}>{item.name}</td>
                  <td>{item.sku}</td>
                  <td style={{ color: 'var(--danger)', fontWeight: 'bold' }}>{item.stock}</td>
                  <td><span className="badge badge-danger">{t('needsRestock', settings.language)}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
