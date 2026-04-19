import { useState } from 'react';
import { PackageSearch, Download, ShoppingCart, ShoppingBag, Trash2, PlusCircle, TrendingUp, Users, Search, Edit2, ChevronDown, ChevronUp, Package } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';
import { useLocalStorage } from '../hooks/useLocalStorage';
import Modal from './Modal';
import jsPDF from 'jspdf';

export default function BusinessTracker() {
  const [activeTab, setActiveTab] = useState('transactions'); // 'transactions' | 'customers'

  const [transactions, setTransactions] = useLocalStorage('finance_business', []);
  const [customers, setCustomers] = useLocalStorage('finance_customers', []);
  
  // Modal states - Transactions
  const [isOrderOpen, setIsOrderOpen] = useState(false);
  const [isExpenseOpen, setIsExpenseOpen] = useState(false);
  const [previewTx, setPreviewTx] = useState(null);
  
  // Modal states - Customers
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  // Form states - General
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  // Form states - Order
  const [customerName, setCustomerName] = useState('');
  const [orderDetails, setOrderDetails] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [businessAddress, setBusinessAddress] = useState('foru.blooms\n123 Local Market\nCity, State 12345');

  // Form states - Expense
  const [itemName, setItemName] = useState('');

  // Form states - Customer
  const [cName, setCName] = useState('');
  const [cPhone, setCPhone] = useState('');
  const [cAddress, setCAddress] = useState('');
  const [cNotes, setCNotes] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // ---------------- COMPUTATION LOGIC ----------------

  const totalBalance = transactions.reduce((acc, t) => {
    return t.type === 'order' ? acc + t.amount : acc - t.amount;
  }, 0);

  const currentMonthTransactions = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === new Date().getMonth() && d.getFullYear() === new Date().getFullYear();
  });
  
  const monthlyRevenue = currentMonthTransactions.filter(t => t.type === 'order').reduce((a, b) => a + b.amount, 0);
  const monthlyExpenses = currentMonthTransactions.filter(t => t.type === 'expense').reduce((a, b) => a + b.amount, 0);

  const trendData = [...Array(6)].map((_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const rev = transactions.filter(t => t.type === 'order' && new Date(t.date).getMonth() === d.getMonth() && new Date(t.date).getFullYear() === d.getFullYear()).reduce((a,b) => a+b.amount, 0);
    return { name: d.toLocaleString('default', { month: 'short' }), rev };
  });

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.phone && c.phone.includes(searchTerm))
  );

  // ---------------- HANDLERS ----------------

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

  const handleDeleteTx = (id) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const handleCustomerSubmit = (e) => {
    e.preventDefault();
    if (!cName) return;

    if (editingId) {
      setCustomers(customers.map(c => 
        c.id === editingId ? { ...c, name: cName, phone: cPhone, address: cAddress, notes: cNotes, updatedAt: Date.now() } : c
      ));
    } else {
      const newCustomer = {
        id: crypto.randomUUID(),
        name: cName,
        phone: cPhone,
        address: cAddress,
        notes: cNotes,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      setCustomers([newCustomer, ...customers]);
    }
    
    closeCustomerModal();
  };

  const handleCustomerDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
       setCustomers(customers.filter(c => c.id !== id));
    }
  };

  const openCustomerEdit = (customer) => {
    setEditingId(customer.id);
    setCName(customer.name);
    setCPhone(customer.phone || '');
    setCAddress(customer.address || '');
    setCNotes(customer.notes || '');
    setIsCustomerModalOpen(true);
  };

  const closeCustomerModal = () => {
    setIsCustomerModalOpen(false);
    setEditingId(null);
    setCName('');
    setCPhone('');
    setCAddress('');
    setCNotes('');
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

  const getPastOrders = (name) => {
    return transactions.filter(t => t.type === 'order' && t.customerName === name)
                       .sort((a, b) => b.timestamp - a.timestamp);
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handlePreviewInvoice = (tx) => {
    setPreviewTx(tx);
  };

  const downloadProfessionalPDF = (tx) => {
    const doc = new jsPDF();
    const orderNum = tx.orderNumber || `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    
    doc.setProperties({ title: `Invoice_${orderNum}` });
    doc.setFillColor(79, 70, 229); 
    doc.rect(0, 0, 210, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(26);
    doc.text('INVOICE', 20, 21);
    doc.setFontSize(14);
    doc.text('foru.blooms', 150, 20, { align: 'right' });

    let currentY = 45;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    
    const addressLines = businessAddress.split('\n');
    addressLines.forEach(line => {
      doc.text(line, 190, currentY, { align: 'right' });
      currentY += 5;
    });

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

    doc.setFillColor(245, 245, 245);
    doc.rect(20, currentY, 170, 10, 'F');
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("Description", 25, currentY + 7);
    doc.text("Amount", 185, currentY + 7, { align: 'right' });
    currentY += 15;

    doc.setFont("helvetica", "normal");
    doc.setTextColor(60, 60, 60);
    const splitDetails = doc.splitTextToSize(tx.orderDetails || 'Order specific details', 130);
    doc.text(splitDetails, 25, currentY);
    doc.text(`Rs. ${parseFloat(tx.amount || 0).toFixed(2)}`, 185, currentY, { align: 'right' });
    currentY += Math.max(10, splitDetails.length * 7) + 5;
    
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

    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text("Thank you for your business!", 105, 280, { align: 'center' });

    doc.save(`${orderNum}_foru_blooms.pdf`);
    setPreviewTx(null);
  };

  // ---------------- RENDER ----------------

  return (
    <div className="tracker-grid">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div className="card delay-1 animate-in" style={{ textAlign: 'center', padding: '2.5rem 1.5rem', background: 'linear-gradient(135deg, var(--bg-color), #e0e7ff)' }}>
          <h3 style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Net Business Balance</h3>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary-hover)', margin: '1rem 0' }}>
            ₹{totalBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          
          <div style={{ height: '100px', width: '100%', marginTop: '1.5rem' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary-color)" stopOpacity={0.5}/>
                    <stop offset="95%" stopColor="var(--primary-color)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-md)' }} formatter={(v) => `₹${v}`} />
                <Area type="monotone" dataKey="rev" stroke="var(--primary-color)" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="summary-grid">
          <div className="card hover-3d" style={{ borderLeft: '4px solid var(--primary-color)' }}>
             <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Monthly Revenue</div>
             <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>₹{monthlyRevenue.toLocaleString('en-IN')}</div>
          </div>
          <div className="card hover-3d" style={{ borderLeft: '4px solid var(--danger)' }}>
             <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Monthly Expenses</div>
             <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--danger)' }}>₹{monthlyExpenses.toLocaleString('en-IN')}</div>
          </div>
        </div>
      </div>

      <div className="main-panel card delay-2 animate-in" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', background: '#f8fafc' }}>
          <button 
            onClick={() => setActiveTab('transactions')}
            style={{ flex: 1, padding: '1rem', background: activeTab === 'transactions' ? 'white' : 'transparent', borderBottom: activeTab === 'transactions' ? '3px solid var(--primary-color)' : '3px solid transparent', color: activeTab === 'transactions' ? 'var(--primary-color)' : 'var(--text-secondary)', borderRadius: 0, fontWeight: activeTab === 'transactions' ? 700 : 500 }}
          >
            Recent Transactions
          </button>
          <button 
            onClick={() => setActiveTab('customers')}
            style={{ flex: 1, padding: '1rem', background: activeTab === 'customers' ? 'white' : 'transparent', borderBottom: activeTab === 'customers' ? '3px solid var(--primary-color)' : '3px solid transparent', color: activeTab === 'customers' ? 'var(--primary-color)' : 'var(--text-secondary)', borderRadius: 0, fontWeight: activeTab === 'customers' ? 700 : 500 }}
          >
            Customer Database
          </button>
        </div>

        <div style={{ padding: '1.5rem', flex: 1 }}>
          {activeTab === 'transactions' ? (
             transactions.length === 0 ? (
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
                      <button onClick={() => handleDeleteTx(tx.id)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }} title="Delete transaction">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
             <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
                  <Search size={18} color="var(--text-secondary)" />
                  <input 
                    type="text" 
                    placeholder="Search customers by name or phone..." 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ border: 'none', background: 'transparent', padding: 0, outline: 'none', flex: 1, boxShadow: 'none' }}
                  />
                </div>

                {filteredCustomers.length === 0 ? (
                  <div className="empty-state">
                    <Users size={48} color="var(--text-secondary)" />
                    <p>No customers found.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {filteredCustomers.map(customer => {
                      const pastOrders = getPastOrders(customer.name);
                      const isExpanded = expandedId === customer.id;

                      return (
                        <div key={customer.id} style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.25rem', background: 'var(--surface-solid)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                            <div>
                              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.25rem', color: 'var(--text-primary)' }}>{customer.name}</h3>
                              {customer.phone && <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>📞 {customer.phone}</div>}
                              {customer.address && <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>📍 {customer.address}</div>}
                              {customer.notes && <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.5rem', fontStyle: 'italic' }}>📝 {customer.notes}</div>}
                            </div>
                            
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button className="btn-outline" onClick={() => openCustomerEdit(customer)} style={{ padding: '0.5rem', color: 'var(--text-secondary)' }} title="Edit">
                                <Edit2 size={16} />
                              </button>
                              <button className="btn-outline" onClick={() => handleCustomerDelete(customer.id)} style={{ padding: '0.5rem', color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.2)' }} title="Delete">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>

                          <div style={{ marginTop: '1rem', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                            <button 
                              onClick={() => toggleExpand(customer.id)}
                              style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0 0 0', background: 'none', border: 'none', color: 'var(--text-primary)', fontWeight: 600 }}
                            >
                              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}>
                                <Package size={16} color="var(--primary-color)" /> 
                                Past Orders ({pastOrders.length})
                              </span>
                              {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                            </button>

                            {isExpanded && (
                              <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {pastOrders.length === 0 ? (
                                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>No orders found for this customer.</p>
                                ) : (
                                  pastOrders.map(order => (
                                    <div key={order.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: '#f8fafc', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>
                                      <div>
                                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{new Date(order.date).toLocaleDateString()}</div>
                                        <div style={{ color: 'var(--text-secondary)' }}>{order.orderDetails}</div>
                                      </div>
                                      <div style={{ fontWeight: 700, color: 'var(--success)' }}>
                                        ₹{order.amount.toLocaleString()}
                                      </div>
                                    </div>
                                  ))
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
             </div>
          )}
        </div>
      </div>

      {/* Floating Action Buttons */}
      <div className="fab-container">
         {activeTab === 'customers' ? (
           <button className="fab" onClick={() => { setEditingId(null); setIsCustomerModalOpen(true); }} style={{ background: 'linear-gradient(135deg, var(--primary-color), #ff61d8)' }} title="Add New Customer">
              <PlusCircle size={24} />
           </button>
         ) : (
           <>
             <button className="fab" onClick={() => setIsOrderOpen(true)} style={{ background: 'linear-gradient(135deg, var(--success), #34d399)' }} title="Track Retail Order">
                <PackageSearch size={24} />
             </button>
             <button className="fab" onClick={() => setIsExpenseOpen(true)} style={{ background: 'linear-gradient(135deg, var(--danger), #fb7185)', boxShadow: '0 10px 25px rgba(239, 68, 68, 0.4)' }} title="Add Business Expense">
                <ShoppingBag size={24} />
             </button>
           </>
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
          <div className="responsive-grid">
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
          
          <button type="submit" className="btn-success" style={{ width: '100%', marginTop: '1rem', padding: '0.85rem' }}>
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
          <button type="submit" className="btn-danger" style={{ width: '100%', marginTop: '1rem', padding: '0.85rem' }}>Confirm Expense</button>
        </form>
      </Modal>

      {/* Add/Edit Customer Modal */}
      <Modal isOpen={isCustomerModalOpen} onClose={closeCustomerModal} title={editingId ? "Edit Customer" : "Add New Customer"}>
        <form onSubmit={handleCustomerSubmit}>
          <div className="form-group">
            <label>Customer Name *</label>
            <input type="text" value={cName} onChange={e => setCName(e.target.value)} required placeholder="Eg. John Doe" />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input type="tel" value={cPhone} onChange={e => setCPhone(e.target.value)} placeholder="Eg. +91 9876543210" />
          </div>
          <div className="form-group">
            <label>Address</label>
            <textarea value={cAddress} onChange={e => setCAddress(e.target.value)} rows="2" placeholder="Delivery address..."></textarea>
          </div>
          <div className="form-group">
            <label>Notes</label>
            <textarea value={cNotes} onChange={e => setCNotes(e.target.value)} rows="2" placeholder="Preferences, special instructions..."></textarea>
          </div>
          <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1rem', padding: '0.85rem' }}>
            {editingId ? "Save Changes" : "Confirm Submision"}
          </button>
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
         
         <button onClick={() => downloadProfessionalPDF(previewTx)} className="btn-primary" style={{ width: '100%', padding: '0.85rem' }}>
           <Download size={18} /> Confirm & Download PDF
         </button>
      </Modal>
    </div>
  );
}
