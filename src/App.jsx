import { Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Dashboard from './pages/Dashboard';
import POS from './pages/POS';
import Inventory from './pages/Inventory';
import Transactions from './pages/Transactions';
import Settings from './pages/Settings';
import { useStore } from './context/StoreContext';
import { t } from './utils/i18n';

function App() {
  const location = useLocation();
  const { settings } = useStore();
  
  // Dynamic title based on route
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/': return t('dashboard', settings.language);
      case '/pos': return t('pos', settings.language);
      case '/inventory': return t('inventory', settings.language);
      case '/transactions': return t('transactions', settings.language);
      case '/settings': return t('settings', settings.language);
      default: return settings.storeName || 'Toko Klontong';
    }
  };

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Topbar title={getPageTitle()} />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/pos" element={<POS />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
