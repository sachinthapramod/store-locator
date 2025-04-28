import React, { useState } from 'react';
import StoreLocator from './components/StoreLocator';
import AdminStoreManager from './components/AdminStoreManager';
import LoginForm from './components/LoginForm';

function App() {
  const [view, setView] = useState('customer'); // 'customer' or 'admin'
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = (success: boolean) => {
    setIsAuthenticated(success);
    if (success) {
      setView('admin');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setView('customer');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {view === 'admin' && !isAuthenticated ? (
        <LoginForm onLogin={handleLogin} />
      ) : view === 'admin' ? (
        <AdminStoreManager />
      ) : (
        <StoreLocator isAuthenticated={isAuthenticated} onLogout={handleLogout} onAdminView={() => setView('admin')} />
      )}
    </div>
  );
}

export default App;