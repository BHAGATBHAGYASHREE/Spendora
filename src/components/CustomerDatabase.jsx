import { useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Users, Search, PlusCircle, Trash2, Edit2, ChevronDown, ChevronUp, Package } from 'lucide-react';
import Modal from './Modal';

export default function CustomerDatabase() {
  const [customers, setCustomers] = useLocalStorage('finance_customers', []);
  const [transactions] = useLocalStorage('finance_business', []);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.phone && c.phone.includes(searchTerm))
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name) return;

    if (editingId) {
      setCustomers(customers.map(c => 
        c.id === editingId ? { ...c, name, phone, address, notes, updatedAt: Date.now() } : c
      ));
    } else {
      const newCustomer = {
        id: crypto.randomUUID(),
        name,
        phone,
        address,
        notes,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      setCustomers([newCustomer, ...customers]);
    }
    
    closeModal();
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
       setCustomers(customers.filter(c => c.id !== id));
    }
  };

  const openEdit = (customer) => {
    setEditingId(customer.id);
    setName(customer.name);
    setPhone(customer.phone || '');
    setAddress(customer.address || '');
    setNotes(customer.notes || '');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setName('');
    setPhone('');
    setAddress('');
    setNotes('');
  };

  const getPastOrders = (customerName) => {
    return transactions.filter(t => t.type === 'order' && t.customerName === customerName)
                       .sort((a, b) => b.timestamp - a.timestamp);
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="animate-in delay-1">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Users size={24} color="var(--primary-color)" /> Customer Database
        </h2>
        <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
          <PlusCircle size={18} /> Add Customer
        </button>
      </div>

      <div className="card" style={{ marginBottom: '2rem', padding: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f8fafc', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <Search size={18} color="var(--text-secondary)" />
          <input 
            type="text" 
            placeholder="Search customers by name or phone..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ border: 'none', background: 'transparent', padding: 0, outline: 'none', flex: 1, boxShadow: 'none' }}
          />
        </div>
      </div>

      {filteredCustomers.length === 0 ? (
        <div className="empty-state card">
          <Users size={48} color="var(--text-secondary)" />
          <p>No customers found.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredCustomers.map(customer => {
            const pastOrders = getPastOrders(customer.name);
            const isExpanded = expandedId === customer.id;

            return (
              <div key={customer.id} className="card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{customer.name}</h3>
                    {customer.phone && <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>📞 {customer.phone}</div>}
                    {customer.address && <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>📍 {customer.address}</div>}
                    {customer.notes && <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem', fontStyle: 'italic' }}>📝 {customer.notes}</div>}
                  </div>
                  
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn-outline" onClick={() => openEdit(customer)} style={{ padding: '0.5rem' }} title="Edit">
                      <Edit2 size={16} />
                    </button>
                    <button className="btn-outline" onClick={() => handleDelete(customer.id)} style={{ padding: '0.5rem', color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.2)' }} title="Delete">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
                  <button 
                    onClick={() => toggleExpand(customer.id)}
                    style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0 0 0', background: 'none', border: 'none', color: 'var(--text-primary)', fontWeight: 600 }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Package size={18} color="var(--primary-color)" /> 
                      Past Orders ({pastOrders.length})
                    </span>
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>

                  {isExpanded && (
                    <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {pastOrders.length === 0 ? (
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No orders found for this customer.</p>
                      ) : (
                        pastOrders.map(order => (
                          <div key={order.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: '#f8fafc', borderRadius: 'var(--radius-md)', fontSize: '0.9rem' }}>
                            <div>
                              <div style={{ fontWeight: 600 }}>{new Date(order.date).toLocaleDateString()}</div>
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

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingId ? "Edit Customer" : "Add New Customer"}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Customer Name *</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="Eg. John Doe" />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Eg. +91 9876543210" />
          </div>
          <div className="form-group">
            <label>Address</label>
            <textarea value={address} onChange={e => setAddress(e.target.value)} rows="2" placeholder="Delivery address..."></textarea>
          </div>
          <div className="form-group">
            <label>Notes</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows="2" placeholder="Preferences, special instructions..."></textarea>
          </div>
          <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1rem', padding: '0.75rem' }}>
            {editingId ? "Save Changes" : "Confirm"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
