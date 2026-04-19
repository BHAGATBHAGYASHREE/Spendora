import { useState, useEffect } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import PersonalTracker from './components/PersonalTracker';
import BusinessTracker from './components/BusinessTracker';
import SmartDashboard from './components/SmartDashboard';
import MonthlyReport from './components/MonthlyReport';
import Profile from './components/Profile';
import Auth from './components/Auth';
import { Activity, Fingerprint, Wallet, Rocket, PieChart, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import './index.css';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [authToken, setAuthToken] = useLocalStorage('session_token', null);

  if (!authToken) {
    return <Auth setToken={setAuthToken} />;
  }

  return (
    <div className="app-wrapper" style={{ position: 'relative' }}>
      {/* Drifting Background Blobs for Visual Interest */}
      <div className="blob" style={{ background: '#a855f7', top: '10%', left: '15%' }}></div>
      <div className="blob" style={{ background: '#34d399', bottom: '20%', right: '10%', animationDelay: '2s' }}></div>
      <div className="blob" style={{ background: '#3b82f6', top: '50%', left: '50%', animationDelay: '4s' }}></div>

      {/* Mobile Top Navigation */}
      <div className="mobile-top-nav">
        <img src="/logo.png" alt="Spendora Logo" />
        <button className="mobile-profile-btn" onClick={() => setActiveTab('profile')}>
          <Fingerprint size={24} color="var(--primary-color)" />
        </button>
      </div>

      {/* GenZ Sidebar */}
      <aside className={`sidebar animate-in ${!isSidebarExpanded ? 'collapsed' : ''}`}>
        <div className="sidebar-logo" style={{ display: 'flex', alignItems: 'center', justifyContent: isSidebarExpanded ? 'space-between' : 'center', width: '100%', marginBottom: '2rem' }}>
          {isSidebarExpanded && (
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
               <img src="/logo.png" alt="Spendora Logo" style={{ height: '60px', width: 'auto' }} />
             </div>
          )}
          {!isSidebarExpanded && <img src="/logo.png" alt="Logo" style={{ height: '60px', width: 'auto' }} />}
          
          <button onClick={() => setIsSidebarExpanded(!isSidebarExpanded)} className="btn-outline" style={{ padding: '0.25rem', border: 'none', display: window.innerWidth > 900 ? 'block' : 'none' }}>
            {isSidebarExpanded ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          <button className={`nav-item hover-3d ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            <Activity size={20} /> <span className="nav-text">Overview</span>
          </button>
          <button className={`nav-item hover-3d mobile-hide ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
            <Fingerprint size={20} /> <span className="nav-text">Profile</span>
          </button>
          <button className={`nav-item hover-3d ${activeTab === 'personal' ? 'active' : ''}`} onClick={() => setActiveTab('personal')}>
            <Wallet size={20} /> <span className="nav-text">Personal</span>
          </button>
          <button className={`nav-item hover-3d ${activeTab === 'business' ? 'active' : ''}`} onClick={() => setActiveTab('business')}>
            <Rocket size={20} /> <span className="nav-text">Business</span>
          </button>
          <button className={`nav-item hover-3d ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => setActiveTab('reports')}>
            <PieChart size={20} /> <span className="nav-text">Reports</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <button className="nav-item text-danger" onClick={() => setAuthToken(null)} style={{ borderTop: '1px solid var(--border-color)', borderRadius: '0', paddingTop: '1.5rem', justifyContent: isSidebarExpanded ? 'flex-start' : 'center' }}>
            <LogOut size={20} /> {isSidebarExpanded && <span className="nav-text">Terminate Session</span>}
          </button>
        </div>
      </aside>

      {/* Main Glassmorphism Pane */}
      <main className="main-pane animate-in delay-1">
        <div className="pane-content">
        {activeTab === 'dashboard' && <SmartDashboard />}
        {activeTab === 'personal' && <PersonalTracker />}
        {activeTab === 'business' && <BusinessTracker />}
        {activeTab === 'reports' && <MonthlyReport />}
        {activeTab === 'profile' && <Profile setAuthToken={setAuthToken} />}
        </div>
      </main>
    </div>
  );
}

export default App;
