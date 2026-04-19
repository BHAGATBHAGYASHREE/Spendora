import { User, Mail, Shield, LogOut, Award } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useState } from 'react';

export default function Profile({ setAuthToken }) {
  const [personalTxs] = useLocalStorage('finance_personal', []);
  const [businessTxs] = useLocalStorage('finance_business', []);
  const [name, setName] = useState('Spendora Admin');
  const [newPassword, setNewPassword] = useState('');
  
  const handleUpdate = (e) => {
    e.preventDefault();
    alert('Profile credentials securely updated!');
    setNewPassword('');
  };

  // Simple stats calculation for the profile display
  const totalSaved = personalTxs.filter(t => t.type === 'save').reduce((sum, t) => sum + t.amount, 0);
  const totalOrders = businessTxs.filter(t => t.type === 'order').length;

  return (
    <div className="animate-in delay-1" style={{ maxWidth: '800px', margin: '0 auto', padding: '1rem' }}>
      <div className="glass-panel card-3d relative overflow-hidden" style={{ textAlign: 'center', padding: '4rem 2rem', borderTop: '5px solid var(--primary-color)' }}>
        
        {/* Floating background decorative blobs */}
        <div className="blob" style={{ background: 'var(--primary-color)', top: '-50px', left: '-50px', animationDelay: '0s' }}></div>
        <div className="blob" style={{ background: 'var(--success)', bottom: '-50px', right: '-50px', animationDelay: '2s' }}></div>

        <div className="profile-avatar floating sticky-z" style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary-color) 0%, #ff61d8 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', boxShadow: '0 20px 25px -5px rgba(168, 85, 247, 0.4)', border: '4px solid var(--surface-color)' }}>
          <User size={64} color="white" />
        </div>
        
        <h2 className="gradient-text floating" style={{ fontSize: '2.5rem', marginBottom: '0.5rem', letterSpacing: '-1px' }}>{name}</h2>
        
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', marginBottom: '3rem' }}>
          <Shield size={16} color="var(--success)" />
          <span>Premium Secure Session</span>
        </div>

        <div className="responsive-grid" style={{ marginBottom: '3rem' }}>
          <div className="card card-3d" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <Award size={32} color="var(--primary-color)" style={{ marginBottom: '0.5rem' }} />
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Savings Goal Met</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>₹{totalSaved.toLocaleString()}</div>
          </div>
          <div className="card card-3d delay-1" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <Award size={32} color="var(--success)" style={{ marginBottom: '0.5rem' }} />
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Total Orders Shipped</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{totalOrders}</div>
          </div>
        </div>

        <div style={{ marginBottom: '3rem', textAlign: 'left', maxWidth: '500px', margin: '0 auto 3rem auto' }}>
          {/* Profile Details Edit */}
          <div style={{ background: 'var(--bg-color)', padding: '2rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-md)' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontWeight: '800' }}>Edit Profile</h3>
            <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
               <div className="form-group">
                  <label>Admin Name</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} style={{ padding: '0.85rem' }} />
               </div>
               <div className="form-group">
                  <label>New Master Password</label>
                  <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Enter new secure password to change" style={{ padding: '0.85rem' }} />
               </div>
               <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start', marginTop: '0.5rem', padding: '0.75rem 2rem' }}>Update Credentials</button>
            </form>
          </div>
        </div>

        <button 
          onClick={() => setAuthToken(null)}
          className="btn-danger hover-3d"
          style={{ padding: '1rem 3rem', fontSize: '1.1rem', borderRadius: '50px', letterSpacing: '1px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '0 auto', boxShadow: '0 10px 15px -3px rgba(239, 68, 68, 0.4)' }}
        >
          <LogOut size={20} /> Terminate Session
        </button>
      </div>
    </div>
  );
}
