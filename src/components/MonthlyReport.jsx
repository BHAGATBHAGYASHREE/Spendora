import { useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { FileText, Download, TrendingUp, TrendingDown, Package, PiggyBank } from 'lucide-react';
import jsPDF from 'jspdf';

export default function MonthlyReport() {
  const [personalTxs] = useLocalStorage('finance_personal', []);
  const [businessTxs] = useLocalStorage('finance_business', []);
  
  // Default to current month YYYY-MM
  const currentYearMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
  const [selectedMonth, setSelectedMonth] = useState(currentYearMonth);

  // Parse selected month
  const filterYear = parseInt(selectedMonth.split('-')[0], 10);
  const filterMonth = parseInt(selectedMonth.split('-')[1], 10) - 1; // 0-indexed

  // Filters
  const isInMonth = (dateString) => {
    if (!dateString) return false;
    const d = new Date(dateString);
    return d.getFullYear() === filterYear && d.getMonth() === filterMonth;
  };

  const personalThisMonth = personalTxs.filter(t => isInMonth(t.date));
  const businessThisMonth = businessTxs.filter(t => isInMonth(t.date));

  // 1. Total Income (Personal Additions + Business Orders)
  const personalIncome = personalThisMonth.filter(t => t.type === 'add').reduce((sum, t) => sum + t.amount, 0);
  const businessIncome = businessThisMonth.filter(t => t.type === 'order').reduce((sum, t) => sum + t.amount, 0);
  const totalIncome = personalIncome + businessIncome;

  // 2. Total Expenses (Personal Deduct + Business Expense)
  const personalExpenses = personalThisMonth.filter(t => t.type === 'deduct').reduce((sum, t) => sum + t.amount, 0);
  const rawMaterialExpenses = businessThisMonth.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = personalExpenses + rawMaterialExpenses;

  // 3. Total Savings (Personal Save)
  const totalSavings = personalThisMonth.filter(t => t.type === 'save').reduce((sum, t) => sum + t.amount, 0);

  // 4. Total Business Orders Count
  const totalBusinessOrdersCount = businessThisMonth.filter(t => t.type === 'order').length;

  // 5. Net Profit
  const netProfit = totalIncome - totalExpenses;

  const monthName = new Date(filterYear, filterMonth, 1).toLocaleString('default', { month: 'long', year: 'numeric' });

  const downloadReportPDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.setTextColor(79, 70, 229);
    doc.text('FinDashboard', 20, 30);
    
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Monthly Financial Report', 20, 40);
    
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text(`Period: ${monthName}`, 20, 47);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 52);

    // Line
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 58, 190, 58);

    let currentY = 70;

    // Helper for rows
    const addRow = (label, value, isBold = false) => {
      doc.setFont("helvetica", isBold ? "bold" : "normal");
      doc.setTextColor(0, 0, 0);
      doc.text(label, 20, currentY);
      doc.text(value, 160, currentY, { align: "right" });
      currentY += 10;
    };

    addRow("Total Income", `Rs. ${totalIncome.toFixed(2)}`, true);
    currentY += 5;
    addRow("  - Personal Additions", `Rs. ${personalIncome.toFixed(2)}`);
    addRow("  - Business Orders", `Rs. ${businessIncome.toFixed(2)}`);
    currentY += 5;

    addRow("Total Expenses", `Rs. ${totalExpenses.toFixed(2)}`, true);
    currentY += 5;
    addRow("  - Personal Deductions", `Rs. ${personalExpenses.toFixed(2)}`);
    addRow("  - Raw Materials", `Rs. ${rawMaterialExpenses.toFixed(2)}`);
    currentY += 5;

    addRow("Total Savings Logged", `Rs. ${totalSavings.toFixed(2)}`, true);
    currentY += 10;

    addRow("Operational Metrics", "", true);
    currentY += 5;
    addRow("  - Total Business Orders", `${totalBusinessOrdersCount}`);
    currentY += 10;

    // Line
    doc.setDrawColor(200, 200, 200);
    doc.line(20, currentY - 5, 190, currentY - 5);
    
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(netProfit >= 0 ? 16 : 239, netProfit >= 0 ? 185 : 68, netProfit >= 0 ? 129 : 68); // green or red
    doc.text("Net Profit:", 20, currentY + 5);
    doc.text(`Rs. ${netProfit.toFixed(2)}`, 190, currentY + 5, { align: "right" });

    doc.save(`Financial_Report_${monthName.replace(' ', '_')}.pdf`);
  };

  return (
    <div className="animate-in delay-1">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FileText size={24} color="var(--primary-color)" /> Smart Monthly Report
        </h2>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <span style={{ marginRight: '0.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Select Month:</span>
            <input 
              type="month" 
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              style={{ border: 'none', background: 'transparent', padding: 0, outline: 'none' }}
            />
          </div>
          
          <button className="btn-primary" onClick={downloadReportPDF} style={{ padding: '0.75rem 1.5rem' }}>
            <Download size={18} /> Download PDF
          </button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Financial Summary for <span style={{ color: 'var(--text-primary)' }}>{monthName}</span>
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {/* Income */}
          <div style={{ padding: '1.5rem', background: 'rgba(16, 185, 129, 0.05)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success)', marginBottom: '0.5rem' }}>
              <TrendingUp size={20} />
              <span style={{ fontWeight: 600 }}>Total Income</span>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              ₹{totalIncome.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              <div>Personal: ₹{personalIncome.toLocaleString('en-IN')}</div>
              <div>Business: ₹{businessIncome.toLocaleString('en-IN')}</div>
            </div>
          </div>

          {/* Expenses */}
          <div style={{ padding: '1.5rem', background: 'rgba(239, 68, 68, 0.05)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--danger)', marginBottom: '0.5rem' }}>
              <TrendingDown size={20} />
              <span style={{ fontWeight: 600 }}>Total Expenses</span>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              ₹{totalExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              <div>Personal: ₹{personalExpenses.toLocaleString('en-IN')}</div>
              <div>Raw Materials: ₹{rawMaterialExpenses.toLocaleString('en-IN')}</div>
            </div>
          </div>

          {/* Savings */}
          <div style={{ padding: '1.5rem', background: 'rgba(59, 130, 246, 0.05)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#3b82f6', marginBottom: '0.5rem' }}>
              <PiggyBank size={20} />
              <span style={{ fontWeight: 600 }}>Total Savings</span>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              ₹{totalSavings.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Logged explicitly in Personal Tracker
            </div>
          </div>
          
          {/* Business Orders */}
          <div style={{ padding: '1.5rem', background: 'rgba(245, 158, 11, 0.05)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f59e0b', marginBottom: '0.5rem' }}>
              <Package size={20} />
              <span style={{ fontWeight: 600 }}>Business Orders</span>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {totalBusinessOrdersCount}
            </div>
            <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Completed orders this month
            </div>
          </div>
        </div>
        
        {/* Net Profit Big Banner */}
        <div style={{ marginTop: '2rem', padding: '2rem', background: netProfit >= 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', borderRadius: 'var(--radius-xl)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
           <div>
             <div style={{ fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>Net Profit</div>
             <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Total Income minus Total Expenses</div>
           </div>
           <div style={{ fontSize: '3rem', fontWeight: 800, color: netProfit >= 0 ? 'var(--success)' : 'var(--danger)', letterSpacing: '-1px' }}>
             ₹{netProfit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
           </div>
        </div>
      </div>
    </div>
  );
}
