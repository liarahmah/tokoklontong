import { NavLink } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { t } from '../utils/i18n';

export default function Sidebar() {
  const { settings } = useStore();
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <span className="material-symbols-rounded">storefront</span>
        </div>
        <div className="sidebar-title">Toko Klontong</div>
      </div>
      
      <nav className="nav-links">
        <NavLink to="/" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
          <span className="material-symbols-rounded">dashboard</span>
          <span>{t('dashboard', settings.language)}</span>
        </NavLink>
        <NavLink to="/pos" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
          <span className="material-symbols-rounded">point_of_sale</span>
          <span>{t('pos', settings.language)}</span>
        </NavLink>
        <NavLink to="/inventory" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
          <span className="material-symbols-rounded">inventory_2</span>
          <span>{t('inventory', settings.language)}</span>
        </NavLink>
        <NavLink to="/transactions" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
          <span className="material-symbols-rounded">receipt_long</span>
          <span>{t('transactions', settings.language)}</span>
        </NavLink>
        <NavLink to="/settings" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
          <span className="material-symbols-rounded">settings</span>
          <span>{t('settings', settings.language)}</span>
        </NavLink>
      </nav>
    </aside>
  );
}
