import { useState } from 'react';
import { PlusCircle, MinusCircle, Trash2, PiggyBank, Target, Award } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import Modal from './Modal';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function PersonalTracker() {
  const [transactions, setTransactions] = useLocalStorage('finance_personal', []);
  
  // Modal states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDeductOpen, setIsDeductOpen] = useState(false);
  const [isSaveOpen, setIsSaveOpen] = useState(false);
  const [expandedTx, setExpandedTx] = useState(null);

  // Form states
  const [amount, setAmount] = useState('');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');

  // Derived state
  const totalBalance = transactions.reduce((acc, t) => {
    return t.type === 'add' ? acc + t.amount : acc - t.amount;
  }, 0);

  // Compute Savings Math
  const savingsGoal = 50000;
  const currentSavings = transactions.filter(t => t.type === 'save').reduce((acc, t) => acc + t.amount, 0);
  const savingsPercentage = Math.min((currentSavings / savingsGoal) * 100, 100);
  const isGoalReached = currentSavings >= savingsGoal;

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const monthlyTransactions = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const monthlySpent = monthlyTransactions
    .filter(t => t.type === 'deduct')
    .reduce((acc, t) => acc + t.amount, 0);

  const monthlyAdded = monthlyTransactions
    .filter(t => t.type === 'add')
    .reduce((acc, t) => acc + t.amount, 0);
  
  // Generate data for spending graph (last 7 days)
  const getLast7DaysData = () => {
    const data = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const spentThatDay = transactions
        .filter(t => t.type === 'deduct' && t.date === dateStr)
        .reduce((sum, t) => sum + t.amount, 0);
      data.push({
        name: d.toLocaleDateString('en-IN', { weekday: 'short' }),
        Spent: spentThatDay
      });
    }
    return data;
  };

  const chartData = getLast7DaysData();

  const handleDelete = (id) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const handleSaveSubmit = (e) => {
    e.preventDefault();
    if (!amount || !title || !date) return;
    const newTx = { id: crypto.randomUUID(), type: 'save', amount: parseFloat(amount), title, note, date, timestamp: Date.now() };
    setTransactions([newTx, ...transactions]);
    resetForm();
    setIsSaveOpen(false);
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!amount || !title || !date) return;
    const newTx = { id: crypto.randomUUID(), type: 'add', amount: parseFloat(amount), title, date, timestamp: Date.now() };
    setTransactions([newTx, ...transactions]);
    resetForm();
    setIsAddOpen(false);
  };

  const handleDeductSubmit = (e) => {
    e.preventDefault();
    if (!amount || !title || !date) return;
    const newTx = { id: crypto.randomUUID(), type: 'deduct', amount: parseFloat(amount), title, note, date, timestamp: Date.now() };
    setTransactions([newTx, ...transactions]);
    resetForm();
    setIsDeductOpen(false);
  };

  const resetForm = () => {
    setAmount('');
    setTitle('');
    setNote('');
    setDate(new Date().toISOString().split('T')[0]);
  };

  return (
    <div className="tracker-grid" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Top row: Savings & Stats */}
      <div className="responsive-grid" style={{ marginBottom: 0 }}>
        <div className="card delay-1 animate-in" style={{ textAlign: 'center', padding: '2.5rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Target size={18} /> Savings Goal
          </h3>
          <div style={{ position: 'relative', width: '180px', height: '180px', margin: '2rem auto' }}>
            <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--border-color)" strokeWidth="2" />
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={isGoalReached ? 'var(--success)' : 'var(--primary-color)'} strokeWidth="2.5" strokeDasharray={`${savingsPercentage}, 100`} style={{ transition: 'stroke-dasharray 1.5s cubic-bezier(0.16, 1, 0.3, 1)', strokeLinecap: 'round' }} />
            </svg>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {isGoalReached ? (
                <Award size={48} color="var(--success)" className="floating" />
              ) : (
                <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: '1' }}>{Math.round(savingsPercentage)}%</span>
              )}
            </div>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>₹{currentSavings.toLocaleString('en-IN')} <span style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 500 }}>/ ₹{savingsGoal.toLocaleString('en-IN')}</span></div>
          <p style={{ color: isGoalReached ? 'var(--success)' : 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.75rem', fontWeight: 500 }}>
            {isGoalReached ? "Goal Reached! Amazing job. \uD83C\uDF89" : "Keep pushing! You are doing great."}
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card hover-3d delay-1 animate-in" style={{ flex: 1, borderLeft: '4px solid var(--danger)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Monthly Budget / Spent</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--danger)' }}>₹{monthlySpent.toLocaleString('en-IN')}</div>
          </div>
          <div className="card hover-3d delay-2 animate-in" style={{ flex: 1, borderLeft: '4px solid var(--success)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Monthly Added</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--success)' }}>₹{monthlyAdded.toLocaleString('en-IN')}</div>
          </div>
        </div>
      </div>

      {/* Spending Graph */}
      <div className="card delay-2 animate-in" style={{ padding: '2rem', height: '350px' }}>
        <h3 style={{ marginBottom: '1.5rem', fontSize: '1.2rem', color: 'var(--text-primary)' }}>Last 7 Days Spending</h3>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorSpent" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--danger)" stopOpacity={0.6}/>
                <stop offset="95%" stopColor="var(--danger)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--text-secondary)'}} />
            <YAxis axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v}`} tick={{fill: 'var(--text-secondary)'}} />
            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: 'var(--shadow-lg)' }} formatter={(v) => `₹${v.toLocaleString()}`} />
            <Area type="monotone" dataKey="Spent" stroke="var(--danger)" strokeWidth={3} fillOpacity={1} fill="url(#colorSpent)" activeDot={{ r: 6, strokeWidth: 0, fill: 'var(--danger)' }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Transactions */}
      <div className="main-panel card delay-3 animate-in">
        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.35rem' }}>Transaction History</h2>
        
        {transactions.length === 0 ? (
          <div className="empty-state">
            <div style={{ padding: '2rem', background: '#f1f5f9', borderRadius: '50%' }}>
              <PlusCircle size={48} color="var(--text-secondary)" />
            </div>
            <p>No transactions yet. Start tracking your finances!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {transactions.map(tx => (
              <div key={tx.id} style={{ display: 'flex', flexDirection: 'column', background: 'var(--bg-color)', borderRadius: 'var(--radius-md)', transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)', border: expandedTx === tx.id ? '1px solid var(--primary-color)' : '1px solid var(--border-color)', overflow: 'hidden' }} className="hover-3d">
                <div 
                  onClick={() => setExpandedTx(expandedTx === tx.id ? null : tx.id)}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', cursor: 'pointer' }}
                >
                  <div className="transaction-info">
                    <span className="title" style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem' }}>
                      {tx.type === 'save' && <PiggyBank size={18} color="var(--primary-color)" />}
                      {tx.type === 'save' ? `Savings: ${tx.title}` : tx.title}
                    </span>
                    <span className="date" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
                      {new Date(tx.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <div className={`transaction-amount ${tx.type === 'add' ? 'amount-positive' : tx.type === 'save' ? '' : 'amount-negative'}`} style={{ fontWeight: 800, fontSize: '1.2rem', color: tx.type === 'save' ? 'var(--primary-color)' : '' }}>
                    {tx.type === 'add' ? '+' : tx.type === 'save' ? '' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                  </div>
                </div>

                {expandedTx === tx.id && (
                  <div style={{ padding: '0 1.5rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(0,0,0,0.05)', marginTop: '0.5rem', paddingTop: '1.25rem', background: 'rgba(99, 102, 241, 0.03)' }} className="animate-in delay-0">
                    <div style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                       {tx.note ? <span><strong>Note:</strong> {tx.note}</span> : <em>No additional notes provided.</em>}
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(tx.id); }} className="btn-danger" style={{ padding: '0.5rem 1rem', borderRadius: '2rem', fontSize: '0.85rem' }}>
                      <Trash2 size={16} /> Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Action Buttons */}
      <div className="fab-container">
         <button className="fab" onClick={() => setIsAddOpen(true)} title="Add Income">
            <PlusCircle size={24} />
         </button>
         <button className="fab" onClick={() => setIsSaveOpen(true)} style={{ background: 'linear-gradient(135deg, var(--accent-teal), #2dd4bf)', boxShadow: '0 10px 25px rgba(20, 184, 166, 0.4)' }} title="Add Savings">
            <PiggyBank size={24} />
         </button>
         <button className="fab" onClick={() => setIsDeductOpen(true)} style={{ background: 'linear-gradient(135deg, var(--danger), #f87171)', boxShadow: '0 10px 25px rgba(239, 68, 68, 0.4)' }} title="Add Expense">
            <MinusCircle size={24} />
         </button>
      </div>

      {/* Modals */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add Income 💸">
        <form onSubmit={handleAddSubmit}>
          <div className="form-group">
            <label>Amount (₹)</label>
            <input type="number" step="0.01" min="0" value={amount} onChange={e => setAmount(e.target.value)} required placeholder="Eg. 5000" />
          </div>
          <div className="form-group">
            <label>Title/Source</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} required placeholder="Eg. Salary" />
          </div>
          <div className="form-group">
            <label>Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} required />
          </div>
          <button type="submit" className="btn-success" style={{ width: '100%', marginTop: '1rem', padding: '0.85rem' }}>Confirm Add</button>
        </form>
      </Modal>

      <Modal isOpen={isDeductOpen} onClose={() => setIsDeductOpen(false)} title="Log Expense 🛒">
        <form onSubmit={handleDeductSubmit}>
          <div className="form-group">
            <label>Amount (₹)</label>
            <input type="number" step="0.01" min="0" value={amount} onChange={e => setAmount(e.target.value)} required placeholder="Eg. 200" />
          </div>
          <div className="form-group">
            <label>Category/Title</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} required placeholder="Eg. Groceries, Netflix" />
          </div>
          <div className="form-group">
            <label>Note (Optional)</label>
            <input type="text" value={note} onChange={e => setNote(e.target.value)} placeholder="Eg. Bought from corner store" />
          </div>
          <div className="form-group">
            <label>Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} required />
          </div>
          <button type="submit" className="btn-danger" style={{ width: '100%', marginTop: '1rem', padding: '0.85rem' }}>Confirm Deduct</button>
        </form>
      </Modal>

      <Modal isOpen={isSaveOpen} onClose={() => setIsSaveOpen(false)} title="Add to Savings 🎯">
        <form onSubmit={handleSaveSubmit}>
          <div className="form-group">
            <label>Amount (₹)</label>
            <input type="number" step="0.01" min="0" value={amount} onChange={e => setAmount(e.target.value)} required placeholder="Eg. 2000" />
          </div>
          <div className="form-group">
            <label>Saving Goal</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} required placeholder="Eg. Emergency Fund, New Laptop" />
          </div>
          <div className="form-group">
            <label>Note (Optional)</label>
            <input type="text" value={note} onChange={e => setNote(e.target.value)} placeholder="Eg. Monthly auto-deposit" />
          </div>
          <div className="form-group">
            <label>Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} required />
          </div>
          <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1rem', padding: '0.85rem' }}>Confirm Save</button>
        </form>
      </Modal>
    </div>
  );
}
