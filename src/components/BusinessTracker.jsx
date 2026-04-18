import { useState } from 'react';
import { PackageSearch, Download, ShoppingCart, ShoppingBag, Trash2 } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import Modal from './Modal';
import jsPDF from 'jspdf';

export default function BusinessTracker() {
  const [transactions, setTransactions] = useLocalStorage('finance_business', []);
  const [customers, setCustomers] = useLocalStorage('finance_customers', []);
  
  // Modal states
  const [isOrderOpen, setIsOrderOpen] = useState(false);
  const [isExpenseOpen, setIsExpenseOpen] = useState(false);
  
  // Invoice states
  const [previewTx, setPreviewTx] = useState(null);
  const [businessAddress, setBusinessAddress] = useState('foru.blooms\\n123 Local Market\\nCity, State 12345');

  // General Form states
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  // Order specific
  const [customerName, setCustomerName] = useState('');
  const [orderDetails, setOrderDetails] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');

  // Expense specific
  const [itemName, setItemName] = useState('');

  const totalBalance = transactions.reduce((acc, t) => {
    return t.type === 'order' ? acc + t.amount : acc - t.amount;
  }, 0);

  const handleOrderSubmit = (e) => {
    e.preventDefault();
    if (!amount || !customerName || !orderDetails) return;
    
    // Auto-save new customer if not exists
    const existingCustomer = customers.find(c => c.name.toLowerCase() === customerName.toLowerCase());
    if (!existingCustomer) {
      const newCustomer = {
        id: crypto.randomUUID(),
        name: customerName,
        phone: '',
        address: '',
        notes: '',
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      setCustomers([...customers, newCustomer]);
    }

    const newTx = {
      id: crypto.randomUUID(),
      type: 'order',
      amount: parseFloat(amount),
      customerName,
      orderDetails,
      date,
      deliveryDate,
      note,
      timestamp: Date.now(),
      orderNumber: `ORD-${Math.floor(1000 + Math.random() * 9000)}`
    };
    
    setTransactions([newTx, ...transactions]);
    resetForm();
    setIsOrderOpen(false);
  };

  const handleDelete = (id) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const handleExpenseSubmit = (e) => {
    e.preventDefault();
    if (!amount || !itemName) return;
    
    const newTx = {
      id: crypto.randomUUID(),
      type: 'expense',
      amount: parseFloat(amount),
      itemName,
      date,
      note,
      timestamp: Date.now()
    };
    
    setTransactions([newTx, ...transactions]);
    resetForm();
    setIsExpenseOpen(false);
  };

  const resetForm = () => {
    setAmount('');
    setNote('');
    setDate(today);
    setCustomerName('');
    setOrderDetails('');
    setDeliveryDate('');
    setItemName('');
  };

  const handlePreviewInvoice = (tx) => {
    setPreviewTx(tx);
  };

  const downloadProfessionalPDF = (tx) => {
    const doc = new jsPDF();
    const orderNum = tx.orderNumber || `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    
    // Set Document Properties
    doc.setProperties({
       title: `Invoice_${orderNum}`
    });
    
    // Header section
    doc.setFillColor(79, 70, 229); // Primary color banner
    doc.rect(0, 0, 210, 30, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(26);
    doc.text('INVOICE', 20, 21);
    
    doc.setFontSize(14);
    doc.text('foru.blooms', 150, 20, { align: 'right' });

    let currentY = 45;
    
    // Business Address
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    
    const addressLines = businessAddress.split('\\n');
    addressLines.forEach(line => {
      doc.text(line, 190, currentY, { align: 'right' });
      currentY += 5;
    });

    // Invoice Meta (Left side)
    const startYMeta = 45;
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text('Bill To:', 20, startYMeta);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    doc.text(tx.customerName || 'Customer Name', 20, startYMeta + 7);
    
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text(`Invoice Number:`, 80, startYMeta);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    doc.text(orderNum, 80, startYMeta + 7);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text(`Date of Issue:`, 80, startYMeta + 17);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    doc.text(new Date(tx.date).toLocaleDateString(), 80, startYMeta + 24);

    if (tx.deliveryDate) {
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 0, 0);
      doc.text(`Delivery Date:`, 20, startYMeta + 17);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(80, 80, 80);
      doc.text(new Date(tx.deliveryDate).toLocaleDateString(), 20, startYMeta + 24);
    }

    currentY = Math.max(currentY + 15, startYMeta + 35);

    // Table Header
    doc.setFillColor(245, 245, 245);
    doc.rect(20, currentY, 170, 10, 'F');
    
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("Description", 25, currentY + 7);
    doc.text("Amount", 185, currentY + 7, { align: 'right' });
    currentY += 15;

    // Table Row
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60, 60, 60);
    const splitDetails = doc.splitTextToSize(tx.orderDetails || 'Order specific details', 130);
    doc.text(splitDetails, 25, currentY);
    doc.text(`Rs. ${parseFloat(tx.amount || 0).toFixed(2)}`, 185, currentY, { align: 'right' });
    
    currentY += Math.max(10, splitDetails.length * 7) + 5;
    
    // Total Section styling
    doc.setDrawColor(200, 200, 200);
    doc.line(20, currentY, 190, currentY);
    currentY += 10;
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text("Total Due:", 140, currentY);
    doc.setTextColor(79, 70, 229);
    doc.text(`Rs. ${parseFloat(tx.amount || 0).toFixed(2)}`, 185, currentY, { align: 'right' });

    if (tx.note) {
      currentY += 20;
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(100, 100, 100);
      doc.text("Notes:", 20, currentY);
      doc.setFont("helvetica", "normal");
      doc.text(tx.note, 20, currentY + 6);
    }

    // Footer
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text("Thank you for your business!", 105, 280, { align: 'center' });

    doc.save(`${orderNum}_foru_blooms.pdf`);
    setPreviewTx(null);
  };

  const currentMonthTransactions = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === new Date().getMonth() && d.getFullYear() === new Date().getFullYear();
  });
  
  const monthlyRevenue = currentMonthTransactions.filter(t => t.type === 'order').reduce((a, b) => a + b.amount, 0);
  const monthlyExpenses = currentMonthTransactions.filter(t => t.type === 'expense').reduce((a, b) => a + b.amount, 0);

  return (
    <div className="tracker-grid">
      <div className="sidebar delay-1 animate-in">
        <div className="balance-card glass-panel" style={{ borderRadius: 'var(--radius-xl)' }}>
          <div className="balance-label">Business Balance</div>
          <div className={`balance-value ${totalBalance >= 0 ? 'amount-positive' : 'amount-negative'}`}>
            ₹{totalBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          
          <div className="action-buttons">
            <button className="btn-primary" onClick={() => setIsOrderOpen(true)}>
              <PackageSearch size={18} /> Track Order
            </button>
            <button className="btn-outline" onClick={() => setIsExpenseOpen(true)}>
              <ShoppingBag size={18} /> Add Expense
            </button>
          </div>
        </div>

        <div className="summary-grid">
          <div className="summary-card" style={{ backgroundColor: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary-color)', border: '1px solid rgba(79, 70, 229, 0.2)' }}>
            <div className="label">Monthly Revenue</div>
            <div className="value">₹{monthlyRevenue.toLocaleString('en-IN')}</div>
          </div>
          <div className="summary-card spent" style={{ backgroundColor: 'var(--surface-color)' }}>
            <div className="label">Monthly Expenses</div>
            <div className="value">₹{monthlyExpenses.toLocaleString('en-IN')}</div>
          </div>
        </div>
      </div>

      <div className="main-panel card delay-2 animate-in">
        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.35rem' }}>Business Transactions</h2>
        
        {transactions.length === 0 ? (
          <div className="empty-state">
            <div style={{ padding: '2rem', background: '#f1f5f9', borderRadius: '50%' }}>
              <ShoppingCart size={48} color="var(--text-secondary)" />
            </div>
            <p>No business transactions yet. Track an order to start!</p>
          </div>
        ) : (
          <div className="transaction-list">
            {transactions.map(tx => (
              <div key={tx.id} className="transaction-item">
                <div className="transaction-info">
                  <span className="title">
                    {tx.type === 'order' ? `Order: ${tx.customerName}` : `Expense: ${tx.itemName}`}
                  </span>
                  <span className="date">
                    {new Date(tx.date).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
                    {tx.type === 'order' ? ` • Details: ${tx.orderDetails}` : ` • Note: ${tx.note || 'N/A'}`}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div className={`transaction-amount ${tx.type === 'order' ? 'amount-positive' : 'amount-negative'}`}>
                    {tx.type === 'order' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                  {tx.type === 'order' && (
                    <button onClick={() => handlePreviewInvoice(tx)} style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', padding: '4px' }} title="Preview & Download Invoice">
                      <Download size={16} />
                    </button>
                  )}
                  <button onClick={() => handleDelete(tx.id)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }} title="Delete transaction" className="hover-scale">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Track Order Modal */}
      <Modal isOpen={isOrderOpen} onClose={() => setIsOrderOpen(false)} title="Track Order Amount">
        <form onSubmit={handleOrderSubmit}>
          <div className="form-group">
            <label>Customer Name</label>
            <input 
              type="text" 
              value={customerName} 
              onChange={e => setCustomerName(e.target.value)} 
              required 
              placeholder="Eg. John Doe" 
              list="customer-list"
            />
            <datalist id="customer-list">
              {customers.map(c => (
                <option key={c.id} value={c.name} />
              ))}
            </datalist>
          </div>
          <div className="form-group">
            <label>What did the customer order?</label>
            <input type="text" value={orderDetails} onChange={e => setOrderDetails(e.target.value)} required placeholder="Eg. 2x Custom Bouquets" />
          </div>
          <div className="form-group">
            <label>Order Amount (₹)</label>
            <input type="number" step="0.01" min="0" value={amount} onChange={e => setAmount(e.target.value)} required placeholder="Eg. 1500" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
             <div className="form-group">
              <label>Order Date</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} required />
             </div>
             <div className="form-group">
              <label>Delivery Date</label>
              <input type="date" value={deliveryDate} onChange={e => setDeliveryDate(e.target.value)} />
             </div>
          </div>
          <div className="form-group">
            <label>Note / Special Instructions</label>
            <textarea value={note} onChange={e => setNote(e.target.value)} rows="2" placeholder="Eg. Wrap in pink paper..."></textarea>
          </div>
          
          <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1rem', padding: '0.75rem' }}>
            Confirm Order
          </button>
        </form>
      </Modal>

      {/* Raw Material Expense Modal */}
      <Modal isOpen={isExpenseOpen} onClose={() => setIsExpenseOpen(false)} title="Add Raw Material Expense">
        <form onSubmit={handleExpenseSubmit}>
           <div className="form-group">
            <label>Item Name</label>
            <input type="text" value={itemName} onChange={e => setItemName(e.target.value)} required placeholder="Eg. Red Roses Bunch" />
          </div>
          <div className="form-group">
            <label>Amount Spent (₹)</label>
            <input type="number" step="0.01" min="0" value={amount} onChange={e => setAmount(e.target.value)} required placeholder="Eg. 800" />
          </div>
          <div className="form-group">
            <label>Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Notes (Optional)</label>
            <textarea value={note} onChange={e => setNote(e.target.value)} rows="2" placeholder="Eg. Bought from main market..."></textarea>
          </div>
          <button type="submit" className="btn-danger" style={{ width: '100%', marginTop: '1rem', padding: '0.75rem' }}>Confirm Expense</button>
        </form>
      </Modal>

      {/* Invoice Preview Modal */}
      <Modal isOpen={!!previewTx} onClose={() => setPreviewTx(null)} title="Invoice Generator Preview">
         <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label>Business Identity (Address Lines)</label>
            <textarea value={businessAddress} onChange={e => setBusinessAddress(e.target.value)} rows="3" placeholder="foru.blooms&#10;City" />
         </div>
         
         {previewTx && (
           <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.95rem', border: '1px solid var(--border-color)' }}>
              <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Invoice Number:</span>
                <span style={{ fontWeight: 600 }}>{previewTx.orderNumber || 'Auto-generated'}</span>
              </div>
              <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Customer Name:</span>
                <span style={{ fontWeight: 600 }}>{previewTx.customerName}</span>
              </div>
              <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Subtotal:</span>
                <span style={{ fontWeight: 600, color: 'var(--success)' }}>₹{previewTx.amount.toLocaleString()}</span>
              </div>
           </div>
         )}
         
         <button onClick={() => downloadProfessionalPDF(previewTx)} className="btn-primary" style={{ width: '100%', padding: '0.75rem' }}>
           <Download size={18} /> Confirm & Download PDF
         </button>
      </Modal>
    </div>
  );
}
