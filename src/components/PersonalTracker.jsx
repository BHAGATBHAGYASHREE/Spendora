import { useState } from 'react';
import { PlusCircle, MinusCircle, Trash2, PiggyBank } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import Modal from './Modal';

export default function PersonalTracker() {
  const [transactions, setTransactions] = useLocalStorage('finance_personal', []);
  
  // Modal states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDeductOpen, setIsDeductOpen] = useState(false);
  const [isSaveOpen, setIsSaveOpen] = useState(false);

  // Form states
  const [amount, setAmount] = useState('');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');

  // Derived state
  const totalBalance = transactions.reduce((acc, t) => {
    return t.type === 'add' ? acc + t.amount : acc - t.amount;
  }, 0);

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
  
  const monthlySaved = monthlyTransactions
    .filter(t => t.type === 'save')
    .reduce((acc, t) => acc + t.amount, 0);

  const handleDelete = (id) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const handleSaveSubmit = (e) => {
    e.preventDefault();
    if (!amount || !title || !date) return;
    
    const newTx = {
      id: crypto.randomUUID(),
      type: 'save',
      amount: parseFloat(amount),
      title,
      note,
      date,
      timestamp: Date.now()
    };
    
    setTransactions([newTx, ...transactions]);
    resetForm();
    setIsSaveOpen(false);
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!amount || !title || !date) return;
    
    const newTx = {
      id: crypto.randomUUID(),
      type: 'add',
      amount: parseFloat(amount),
      title,
      date,
      timestamp: Date.now()
    };
    
    setTransactions([newTx, ...transactions]);
    resetForm();
    setIsAddOpen(false);
  };

  const handleDeductSubmit = (e) => {
    e.preventDefault();
    if (!amount || !title || !date) return;
    
    const newTx = {
      id: crypto.randomUUID(),
      type: 'deduct',
      amount: parseFloat(amount),
      title,
      note,
      date,
      timestamp: Date.now()
    };
    
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
    <div className="tracker-grid">
      <div className="sidebar delay-1 animate-in">
        <div className="balance-card glass-panel" style={{ borderRadius: 'var(--radius-xl)' }}>
          <div className="balance-label">Total Balance</div>
          <div className={`balance-value ${totalBalance >= 0 ? 'amount-positive' : 'amount-negative'}`}>
            ₹{totalBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          
          <div className="action-buttons" style={{ flexWrap: 'wrap' }}>
            <button className="btn-success" onClick={() => setIsAddOpen(true)}>
              <PlusCircle size={18} /> Add Amount
            </button>
            <button className="btn-primary" onClick={() => setIsSaveOpen(true)}>
              <PiggyBank size={18} /> Save
            </button>
            <button className="btn-danger" onClick={() => setIsDeductOpen(true)}>
              <MinusCircle size={18} /> Deduct
            </button>
          </div>
        </div>

        <div className="summary-grid">
          <div className="summary-card spent" style={{ backgroundColor: 'var(--surface-color)' }}>
            <div className="label">Monthly Spent</div>
            <div className="value">₹{monthlySpent.toLocaleString('en-IN')}</div>
          </div>
          <div className="summary-card saved" style={{ backgroundColor: 'var(--surface-color)' }}>
            <div className="label">Monthly Saved</div>
            <div className="value">₹{monthlySaved.toLocaleString('en-IN')}</div>
          </div>
        </div>
      </div>

      <div className="main-panel card delay-2 animate-in">
        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.35rem' }}>Transaction History</h2>
        
        {transactions.length === 0 ? (
          <div className="empty-state">
            <div style={{ padding: '2rem', background: '#f1f5f9', borderRadius: '50%' }}>
              <PlusCircle size={48} color="var(--text-secondary)" />
            </div>
            <p>No transactions yet. Start tracking your finances!</p>
          </div>
        ) : (
          <div className="transaction-list">
            {transactions.map(tx => (
              <div key={tx.id} className="transaction-item">
                <div className="transaction-info">
                  <span className="title" style={tx.type === 'save' ? { color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '4px' } : {}}>
                    {tx.type === 'save' && <PiggyBank size={14} />}
                    {tx.type === 'save' ? `Savings: ${tx.title}` : tx.title}
                  </span>
                  <span className="date">{new Date(tx.date).toLocaleDateString('en-IN', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })} {tx.note && `• ${tx.note}`}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div className={`transaction-amount ${tx.type === 'add' ? 'amount-positive' : tx.type === 'save' ? '' : 'amount-negative'}`} style={tx.type === 'save' ? { color: 'var(--primary-color)', fontWeight: '600' } : {}}>
                    {tx.type === 'add' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                  <button onClick={() => handleDelete(tx.id)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }} title="Delete transaction" className="hover-scale">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Amount Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add Amount">
        <form onSubmit={handleAddSubmit}>
          <div className="form-group">
            <label>Amount (₹)</label>
            <input type="number" step="0.01" min="0" value={amount} onChange={e => setAmount(e.target.value)} required placeholder="Eg. 5000" />
          </div>
          <div className="form-group">
            <label>Title/Reason</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} required placeholder="Eg. Salary" />
          </div>
          <div className="form-group">
            <label>Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} required />
          </div>
          <button type="submit" className="btn-success" style={{ width: '100%', marginTop: '1rem', padding: '0.75rem' }}>Confirm Add</button>
        </form>
      </Modal>

      {/* Deduct Amount Modal */}
      <Modal isOpen={isDeductOpen} onClose={() => setIsDeductOpen(false)} title="Deduct Amount">
        <form onSubmit={handleDeductSubmit}>
          <div className="form-group">
            <label>Amount (₹)</label>
            <input type="number" step="0.01" min="0" value={amount} onChange={e => setAmount(e.target.value)} required placeholder="Eg. 200" />
          </div>
          <div className="form-group">
            <label>Title/Reason</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} required placeholder="Eg. Groceries" />
          </div>
          <div className="form-group">
            <label>Note (Optional)</label>
            <input type="text" value={note} onChange={e => setNote(e.target.value)} placeholder="Eg. Bought from corner store" />
          </div>
          <div className="form-group">
            <label>Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} required />
          </div>
          <button type="submit" className="btn-danger" style={{ width: '100%', marginTop: '1rem', padding: '0.75rem' }}>Confirm Deduct</button>
        </form>
      </Modal>

      {/* Save Amount Modal */}
      <Modal isOpen={isSaveOpen} onClose={() => setIsSaveOpen(false)} title="Log Savings">
        <form onSubmit={handleSaveSubmit}>
          <div className="form-group">
            <label>Amount (₹)</label>
            <input type="number" step="0.01" min="0" value={amount} onChange={e => setAmount(e.target.value)} required placeholder="Eg. 2000" />
          </div>
          <div className="form-group">
            <label>Saving Goal / Reason</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} required placeholder="Eg. Emergency Fund" />
          </div>
          <div className="form-group">
            <label>Note (Optional)</label>
            <input type="text" value={note} onChange={e => setNote(e.target.value)} placeholder="Eg. Put into savings account" />
          </div>
          <div className="form-group">
            <label>Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} required />
          </div>
          <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1rem', padding: '0.75rem' }}>Confirm Save</button>
        </form>
      </Modal>
    </div>
  );
}
