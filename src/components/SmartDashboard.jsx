import { useLocalStorage } from '../hooks/useLocalStorage';
import { Wallet, Briefcase, TrendingUp, TrendingDown, Package, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area } from 'recharts';

export default function SmartDashboard() {
  const [personalTxs] = useLocalStorage('finance_personal', []);
  const [businessTxs] = useLocalStorage('finance_business', []);

  // 1. Total Personal Balance
  const personalBalance = personalTxs.reduce((acc, t) => {
    return t.type === 'add' ? acc + t.amount : acc - t.amount;
  }, 0);

  // 2. Total Business Balance
  const businessBalance = businessTxs.reduce((acc, t) => {
    return t.type === 'order' ? acc + t.amount : acc - t.amount;
  }, 0);

  // Combine and sort recent transactions
  const combinedTxs = [
    ...personalTxs.map(t => ({ ...t, source: 'Personal' })),
    ...businessTxs.map(t => ({ ...t, source: 'Business' }))
  ].sort((a, b) => b.timestamp - a.timestamp);

  const topTransactions = combinedTxs.slice(0, 10);

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const isCurrentMonth = (dateString) => {
    const d = new Date(dateString);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  };

  const isToday = (dateString) => {
     return new Date(dateString).toISOString().split('T')[0] === new Date().toISOString().split('T')[0];
  };

  // 3. Today's Orders
  const todaysOrders = businessTxs.filter(t => t.type === 'order' && isToday(t.date)).length;

  // 4. Total Monthly Income
  const personalIncomeThisMonth = personalTxs.filter(t => t.type === 'add' && isCurrentMonth(t.date)).reduce((a, b) => a + b.amount, 0);
  const businessIncomeThisMonth = businessTxs.filter(t => t.type === 'order' && isCurrentMonth(t.date)).reduce((a, b) => a + b.amount, 0);
  const totalIncome = personalIncomeThisMonth + businessIncomeThisMonth;

  // 5. Total Monthly Expenses
  const personalExpensesThisMonth = personalTxs.filter(t => t.type === 'deduct' && isCurrentMonth(t.date)).reduce((a, b) => a + b.amount, 0);
  const businessExpensesThisMonth = businessTxs.filter(t => t.type === 'expense' && isCurrentMonth(t.date)).reduce((a, b) => a + b.amount, 0);
  const totalExpenses = personalExpensesThisMonth + businessExpensesThisMonth;

  // 6. Current Net Profit
  const netProfit = totalIncome - totalExpenses;

  const getMonthlyData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const data = [];
    const currentDate = new Date();
    
    // Go from 5 months ago to current month
    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthStr = months[d.getMonth()];
      
      const pIncomeThisMonth = personalTxs.filter(t => t.type === 'add' && new Date(t.date).getMonth() === d.getMonth() && new Date(t.date).getFullYear() === d.getFullYear()).reduce((a, b) => a + b.amount, 0);
      const bIncomeThisMonth = businessTxs.filter(t => t.type === 'order' && new Date(t.date).getMonth() === d.getMonth() && new Date(t.date).getFullYear() === d.getFullYear()).reduce((a, b) => a + b.amount, 0);
      const monthlyIncome = pIncomeThisMonth + bIncomeThisMonth;

      const pExpenseThisMonth = personalTxs.filter(t => t.type === 'deduct' && new Date(t.date).getMonth() === d.getMonth() && new Date(t.date).getFullYear() === d.getFullYear()).reduce((a, b) => a + b.amount, 0);
      const bExpenseThisMonth = businessTxs.filter(t => t.type === 'expense' && new Date(t.date).getMonth() === d.getMonth() && new Date(t.date).getFullYear() === d.getFullYear()).reduce((a, b) => a + b.amount, 0);
      const monthlyExpense = pExpenseThisMonth + bExpenseThisMonth;

      data.push({
        name: monthStr,
        Income: monthlyIncome,
        Expense: monthlyExpense,
        Profit: monthlyIncome - monthlyExpense
      });
    }
    return data;
  };

  const chartData = getMonthlyData();

  return (
    <div className="animate-in delay-1">
      <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Activity size={24} color="var(--primary-color)" /> Overview
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        {/* Personal Balance */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderTop: '4px solid #3b82f6' }}>
          <div style={{ padding: '1rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '50%', color: '#3b82f6' }}>
            <Wallet size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Personal Balance</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>₹{personalBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
          </div>
        </div>

        {/* Business Balance */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderTop: '4px solid #8b5cf6' }}>
          <div style={{ padding: '1rem', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '50%', color: '#8b5cf6' }}>
            <Briefcase size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Business Balance</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>₹{businessBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
          </div>
        </div>

        {/* Today's Orders */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderTop: '4px solid #f59e0b' }}>
          <div style={{ padding: '1rem', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '50%', color: '#f59e0b' }}>
            <Package size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Today's Orders</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>{todaysOrders}</div>
          </div>
        </div>

        {/* Total Income */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderTop: '4px solid var(--success)' }}>
          <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '50%', color: 'var(--success)' }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Monthly Income</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--success)' }}>₹{totalIncome.toLocaleString('en-IN')}</div>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderTop: '4px solid var(--danger)' }}>
          <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '50%', color: 'var(--danger)' }}>
            <TrendingDown size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Monthly Expenses</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--danger)' }}>₹{totalExpenses.toLocaleString('en-IN')}</div>
          </div>
        </div>

        {/* Net Profit */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderTop: '4px solid var(--primary-color)' }}>
          <div style={{ padding: '1rem', background: 'rgba(79, 70, 229, 0.1)', borderRadius: '50%', color: 'var(--primary-color)' }}>
            <Activity size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Net Profit</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: netProfit >= 0 ? 'var(--primary-color)' : 'var(--danger)' }}>
              ₹{netProfit.toLocaleString('en-IN')}
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div className="card delay-2 animate-in" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.2rem', color: 'var(--text-primary)' }}>Income vs Expenses (6 Months)</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} tickFormatter={(value) => `₹${value}`} />
                <Tooltip cursor={{fill: 'rgba(0,0,0,0.04)'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} formatter={(value) => `₹${value.toLocaleString()}`} />
                <Legend iconType="circle" />
                <Bar dataKey="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card delay-2 animate-in" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.2rem', color: 'var(--text-primary)' }}>Net Profit Trend</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} tickFormatter={(value) => `₹${value}`} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} formatter={(value) => `₹${value.toLocaleString()}`} />
                <Area type="monotone" dataKey="Profit" stroke="#4f46e5" fillOpacity={1} fill="url(#colorProfit)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card delay-3 animate-in">
        <h3 style={{ marginBottom: '1.5rem', fontSize: '1.2rem', color: 'var(--text-primary)' }}>Recent Transactions</h3>
        {topTransactions.length === 0 ? (
           <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem 0' }}>No recent activity to display.</p>
        ) : (
          <div className="transaction-list">
            {topTransactions.map(tx => {
               const title = tx.type === 'order' ? `Order: ${tx.customerName}` :
                             tx.type === 'expense' ? `Expense: ${tx.itemName}` :
                             tx.type === 'save' ? `Savings: ${tx.title}` : tx.title;
               
               const isPositive = tx.type === 'add' || tx.type === 'order';
               const isNeutral = tx.type === 'save';

               return (
                 <div key={tx.id} className="transaction-item" style={{ padding: '1rem' }}>
                    <div className="transaction-info">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span className="title" style={{ fontSize: '1.05rem' }}>{title}</span>
                        <span style={{ fontSize: '0.75rem', padding: '0.15rem 0.5rem', borderRadius: '1rem', background: tx.source === 'Personal' ? '#e0f2fe' : '#ede9fe', color: tx.source === 'Personal' ? '#0284c7' : '#7c3aed', fontWeight: 600 }}>
                          {tx.source}
                        </span>
                      </div>
                      <span className="date">{new Date(tx.date).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })} {tx.note && `• ${tx.note}`}</span>
                    </div>
                    <div className={`transaction-amount ${isPositive ? 'amount-positive' : isNeutral ? '' : 'amount-negative'}`} style={isNeutral ? { color: 'var(--primary-color)', fontWeight: '600'} : {}}>
                      {isPositive ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                 </div>
               );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
