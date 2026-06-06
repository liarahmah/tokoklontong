import { createContext, useContext, useState, useEffect } from 'react';
import { useGoogleLogin, googleLogout } from '@react-oauth/google';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem('toko_drive_token') || null);
  const [userProfile, setUserProfile] = useState(null);

  // When access token changes, store it in local storage and fetch profile
  useEffect(() => {
    if (accessToken) {
      localStorage.setItem('toko_drive_token', accessToken);
      // Fetch user profile info
      fetch('https://www.googleapis.com/oauth2/v1/userinfo?alt=json', {
        headers: { Authorization: `Bearer ${accessToken}` }
      })
      .then(res => res.json())
      .then(data => setUserProfile(data))
      .catch(err => {
        console.error("Failed to fetch user profile, token might be expired", err);
        handleLogout();
      });
    } else {
      localStorage.removeItem('toko_drive_token');
      setUserProfile(null);
    }
  }, [accessToken]);

  const login = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      setAccessToken(tokenResponse.access_token);
    },
    onError: (error) => console.error('Login Failed:', error),
    scope: 'https://www.googleapis.com/auth/drive.file'
  });

  const handleLogout = () => {
    googleLogout();
    setAccessToken(null);
  };

  return (
    <AuthContext.Provider value={{ accessToken, userProfile, login, logout: handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
