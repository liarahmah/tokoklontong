import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { t } from '../utils/i18n';

export default function Topbar({ title }) {
  const { userProfile, login, logout } = useAuth();
  const { settings } = useStore();
  
  // Dynamic date based on language
  const today = new Date().toLocaleDateString(settings.language === 'en' ? 'en-US' : 'id-ID', { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
  });

  return (
    <header className="topbar">
      <div>
        <h2 style={{ margin: 0 }}>{title}</h2>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{settings.storeName || 'Toko Klontong'}</span>
          <span>•</span>
          <span>{today}</span>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {userProfile ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{userProfile.name}</span>
            <img 
              src={userProfile.picture} 
              alt="Profile" 
              style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', cursor: 'pointer' }} 
              onClick={logout}
              title="Logout"
            />
          </div>
        ) : (
          <button className="btn btn-outline" onClick={() => login()}>
            <span className="material-symbols-rounded" style={{ fontSize: '1.2rem', color: '#DB4437' }}>cloud_sync</span>
            {t('connectDrive', settings.language)}
          </button>
        )}
      </div>
    </header>
  );
}
