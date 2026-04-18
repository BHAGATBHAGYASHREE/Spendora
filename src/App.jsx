import { useState, useEffect } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import PersonalTracker from './components/PersonalTracker';
import BusinessTracker from './components/BusinessTracker';
import SmartDashboard from './components/SmartDashboard';
import CustomerDatabase from './components/CustomerDatabase';
import MonthlyReport from './components/MonthlyReport';
import Auth from './components/Auth';
import { LayoutDashboard, User, Briefcase, Users, FileText, Sun, Moon, LogOut } from 'lucide-react';
import './index.css';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [theme, setTheme] = useLocalStorage('theme', 'light');
  const [authToken, setAuthToken] = useLocalStorage('session_token', null);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  if (!authToken) {
    return <Auth setToken={setAuthToken} />;
  }

  return (
    <div className="layout-container">
      <header className="header animate-in">
        <h1 className="header-title">FinDashboard</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <button 
            onClick={() => setAuthToken(null)} 
            className="btn-outline" 
            style={{ padding: '0.5rem', borderRadius: '50%', display: 'flex', color: 'var(--danger)', borderColor: 'var(--danger)' }}
            title="Secure Logout"
          >
            <LogOut size={18} />
          </button>
          <button 
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} 
            className="btn-outline" 
            style={{ padding: '0.5rem', borderRadius: '50%', display: 'flex' }}
            title="Toggle Theme"
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          
          <div className="tabs">
          <button 
            className={`tab ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <LayoutDashboard size={16} /> Overview
          </button>
          <button 
            className={`tab ${activeTab === 'personal' ? 'active' : ''}`}
            onClick={() => setActiveTab('personal')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <User size={16} /> Personal
          </button>
          <button 
            className={`tab ${activeTab === 'business' ? 'active' : ''}`}
            onClick={() => setActiveTab('business')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Briefcase size={16} /> Business
          </button>
          <button 
            className={`tab ${activeTab === 'customers' ? 'active' : ''}`}
            onClick={() => setActiveTab('customers')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Users size={16} /> Customers
          </button>
          <button 
            className={`tab ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <FileText size={16} /> Reports
          </button>
        </div>
        </div>
      </header>
      
      <main className="main-content">
        {activeTab === 'dashboard' && <SmartDashboard />}
        {activeTab === 'personal' && <PersonalTracker />}
        {activeTab === 'business' && <BusinessTracker />}
        {activeTab === 'customers' && <CustomerDatabase />}
        {activeTab === 'reports' && <MonthlyReport />}
      </main>
    </div>
  );
}

export default App;
