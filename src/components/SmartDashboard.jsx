import { useLocalStorage } from '../hooks/useLocalStorage';
import { Wallet, Briefcase, TrendingUp, TrendingDown, Package, Activity, ArrowRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';

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

  const expenseData = [
    { name: 'Personal Apps', value: personalExpensesThisMonth > 0 ? personalExpensesThisMonth : 1 },
    { name: 'Business Ops', value: businessExpensesThisMonth > 0 ? businessExpensesThisMonth : 1 }
  ];
  const COLORS = ['var(--accent-purple)', 'var(--accent-teal)'];

  return (
    <div className="animate-in delay-1">
      <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Activity size={24} color="var(--primary-color)" /> Overview
      </h2>

      <div className="responsive-grid">
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
      <div className="responsive-charts">
        <div className="card delay-2 animate-in" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.2rem', color: 'var(--text-primary)', fontWeight: 700 }}>Income Dynamics</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary-color)" stopOpacity={0.9}/>
                    <stop offset="95%" stopColor="var(--primary-color)" stopOpacity={0.2}/>
                  </linearGradient>
                  <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent-pink)" stopOpacity={0.9}/>
                    <stop offset="95%" stopColor="var(--accent-pink)" stopOpacity={0.2}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--text-secondary)'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--text-secondary)'}} tickFormatter={(value) => `₹${value}`} />
                <Tooltip cursor={{fill: 'rgba(0,0,0,0.02)'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: 'var(--shadow-xl)', padding: '1rem' }} formatter={(value) => `₹${value.toLocaleString()}`} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '1rem' }} />
                <Bar dataKey="Income" fill="url(#colorInc)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Expense" fill="url(#colorExp)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card delay-2 animate-in" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.2rem', color: 'var(--text-primary)', fontWeight: 700 }}>Expense Distribution</h3>
          <div style={{ width: '100%', height: 300, position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {expenseData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: 'var(--shadow-xl)' }} formatter={(value) => `₹${value.toLocaleString()}`} />
                <Legend iconType="circle" verticalAlign="bottom" />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ position: 'absolute', top: '48%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Spent</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>₹{totalExpenses.toLocaleString('en-IN')}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="card delay-3 animate-in" style={{ padding: '2rem' }}>
        <h3 style={{ marginBottom: '2rem', fontSize: '1.25rem', color: 'var(--text-primary)', fontWeight: 700 }}>Recent Activity Timeline</h3>
        {topTransactions.length === 0 ? (
           <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem 0' }}>No recent activity to display.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', borderLeft: '2px solid var(--border-color)', paddingLeft: '1.5rem', marginLeft: '0.5rem' }}>
            {topTransactions.map((tx, idx) => {
               const title = tx.type === 'order' ? `Order: ${tx.customerName}` :
                             tx.type === 'expense' ? `Expense: ${tx.itemName}` :
                             tx.type === 'save' ? `Savings: ${tx.title}` : tx.title;
               
               const isPositive = tx.type === 'add' || tx.type === 'order';
               const isNeutral = tx.type === 'save';

               return (
                 <div key={tx.id} style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--bg-color)', borderRadius: 'var(--radius-md)', transition: 'all 0.2s', cursor: 'pointer' }} className="hover-3d">
                    <div style={{ position: 'absolute', left: '-2rem', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', borderRadius: '50%', background: isPositive ? 'var(--success)' : isNeutral ? 'var(--primary-color)' : 'var(--danger)', border: '3px solid var(--surface-color)' }}></div>
                    <div className="transaction-info">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span className="title" style={{ fontSize: '1.05rem', fontWeight: 600 }}>{title}</span>
                        <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.6rem', borderRadius: '1rem', background: tx.source === 'Personal' ? 'var(--primary-light)' : '#ccfbf1', color: tx.source === 'Personal' ? 'var(--primary-hover)' : '#0f766e', fontWeight: 700, textTransform: 'uppercase' }}>
                          {tx.source}
                        </span>
                      </div>
                      <span className="date" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem', display: 'block' }}>
                        {new Date(tx.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} {tx.note && `• ${tx.note}`}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div className={`transaction-amount ${isPositive ? 'amount-positive' : isNeutral ? '' : 'amount-negative'}`} style={{ fontWeight: 800, fontSize: '1.15rem' }}>
                        {isPositive ? '+' : isNeutral ? '' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                      </div>
                      <ArrowRight size={16} color="var(--text-secondary)" />
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
