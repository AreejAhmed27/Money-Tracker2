import { AssetItem, ExpenseItem, UserAccount } from '../types';
import { formatCurrency, formatDateDisplay, MONTH_NAMES } from './formatters';
import {
  calculateCategoryBreakdown,
  calculateCurrentNetBalance,
  calculateDailyTotal,
  calculateMonthlyTotal,
  calculateYTDSummary,
} from './calculations';

export function generateFinanceReportCSV(options: {
  expenses: ExpenseItem[];
  assets: AssetItem[];
  activeMonth: string;
  activeYear: number;
  currencyCode?: string;
  period?: 'daily' | 'monthly' | 'yearly';
}) {
  downloadExcelReport(
    options.expenses,
    options.assets,
    options.activeMonth,
    options.activeYear,
    options.currencyCode || 'EGP'
  );
}

export function generateFinanceReportPDF(options: {
  expenses: ExpenseItem[];
  assets: AssetItem[];
  activeMonth: string;
  activeYear: number;
  currencyCode?: string;
  period?: 'daily' | 'monthly' | 'yearly';
  userAccount?: UserAccount;
}) {
  printPDFReport(
    options.expenses,
    options.assets,
    options.activeMonth,
    options.activeYear,
    options.currencyCode || 'EGP',
    options.userAccount
  );
}

export function downloadExcelReport(
  expenses: ExpenseItem[],
  assets: AssetItem[],
  activeMonth: string,
  activeYear: number,
  currencyCode: string = 'EGP'
) {
  const monthExpenses = expenses.filter(
    (e) => e.month_name.toLowerCase() === activeMonth.toLowerCase() && e.year === activeYear
  );
  const monthAssets = assets.filter(
    (a) => a.month_name.toLowerCase() === activeMonth.toLowerCase() && a.year === activeYear
  );
  const yearExpenses = expenses.filter((e) => e.year === activeYear);
  const yearAssets = assets.filter((a) => a.year === activeYear);

  const monthExpenseTotal = monthExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const monthAssetTotal = monthAssets.reduce((sum, a) => sum + Number(a.amount), 0);
  const yearExpenseTotal = yearExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const yearAssetTotal = yearAssets.reduce((sum, a) => sum + Number(a.amount), 0);
  const netBalanceAllTime = calculateCurrentNetBalance(assets, expenses);

  const lines: string[] = [];

  // Summary Block
  lines.push(`FINANCIAL DASHBOARD REPORT - ${activeMonth.toUpperCase()} ${activeYear}`);
  lines.push(`Currency: ${currencyCode}`);
  lines.push(`Generated On: ${new Date().toLocaleString()}`);
  lines.push('');

  lines.push('--- EXECUTIVE FINANCIAL SUMMARY ---');
  lines.push(`Total Net Balance (All Time),${netBalanceAllTime}`);
  lines.push(`Selected Month (${activeMonth} ${activeYear}) Income/Funds Added,${monthAssetTotal}`);
  lines.push(`Selected Month (${activeMonth} ${activeYear}) Total Expenses,${monthExpenseTotal}`);
  lines.push(`Selected Month Net Cash Flow,${monthAssetTotal - monthExpenseTotal}`);
  lines.push(`Full Year (${activeYear}) Total Income,${yearAssetTotal}`);
  lines.push(`Full Year (${activeYear}) Total Expenses,${yearExpenseTotal}`);
  lines.push(`Full Year (${activeYear}) Net Cash Flow,${yearAssetTotal - yearExpenseTotal}`);
  lines.push('');

  // Category Breakdown Block
  lines.push('--- MONTHLY CATEGORY BREAKDOWN ---');
  lines.push('Category,Amount (' + currencyCode + '),Percentage of Monthly Spend');
  const breakdown = calculateCategoryBreakdown(expenses, activeMonth, activeYear);
  Object.entries(breakdown).forEach(([cat, amt]) => {
    const pct = monthExpenseTotal > 0 ? ((amt / monthExpenseTotal) * 100).toFixed(1) : '0.0';
    lines.push(`"${cat}",${amt},${pct}%`);
  });
  lines.push('');

  // Transactions Ledger
  lines.push('--- TRANSACTION LEDGER DETAILS ---');
  lines.push('Type,Transaction ID,Date,Category / Source,Amount (' + currencyCode + '),Notes,Month,Year');

  monthExpenses.forEach((e) => {
    lines.push(
      `Expense,${e.transaction_id},${e.entry_date},"${e.category}",-${e.amount},"${(
        e.notes || ''
      ).replace(/"/g, '""')}",${e.month_name},${e.year}`
    );
  });

  monthAssets.forEach((a) => {
    lines.push(
      `Funds/Asset,${a.asset_id},${a.date_added},"${a.source_label}",+${a.amount},"${(
        a.notes || 'Cash Injection'
      ).replace(/"/g, '""')}",${a.month_name},${a.year}`
    );
  });

  const csvString = 'data:text/csv;charset=utf-8,\uFEFF' + lines.map((l) => l).join('\n');
  const encodedUri = encodeURI(csvString);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `Financial_Report_${activeMonth}_${activeYear}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function printPDFReport(
  expenses: ExpenseItem[],
  assets: AssetItem[],
  activeMonth: string,
  activeYear: number,
  currencyCode: string = 'EGP',
  userAccount?: UserAccount
) {
  const monthExpenses = expenses.filter(
    (e) => e.month_name.toLowerCase() === activeMonth.toLowerCase() && e.year === activeYear
  );
  const monthAssets = assets.filter(
    (a) => a.month_name.toLowerCase() === activeMonth.toLowerCase() && a.year === activeYear
  );

  const monthExpenseTotal = monthExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const monthAssetTotal = monthAssets.reduce((sum, a) => sum + Number(a.amount), 0);
  const netBalanceAllTime = calculateCurrentNetBalance(assets, expenses);
  const breakdown = calculateCategoryBreakdown(expenses, activeMonth, activeYear);

  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Financial Report - ${activeMonth} ${activeYear}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 30px; color: #1e293b; max-width: 800px; margin: 0 auto; }
          .header { display: flex; justify-content: space-between; align-items: center; border-b: 2px solid #0f172a; padding-bottom: 15px; margin-bottom: 25px; }
          .title { font-size: 24px; font-weight: bold; color: #0f172a; }
          .subtitle { font-size: 13px; color: #64748b; }
          .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 30px; }
          .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 15px; text-align: center; }
          .card-title { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: bold; }
          .card-value { font-size: 20px; font-weight: bold; font-family: monospace; margin-top: 5px; }
          .val-green { color: #10b981; }
          .val-red { color: #ef4444; }
          .val-dark { color: #0f172a; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 13px; }
          th { background: #0f172a; color: white; text-align: left; padding: 10px; font-weight: 600; }
          td { border-bottom: 1px solid #e2e8f0; padding: 10px; }
          tr:nth-child(even) { background: #f8fafc; }
          .footer { font-size: 11px; text-align: center; color: #94a3b8; border-t: 1px solid #e2e8f0; padding-top: 15px; margin-top: 40px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="title">FINANCIAL STATEMENT REPORT</div>
            <div class="subtitle">Period: ${activeMonth} ${activeYear} | Generated for: ${userAccount?.name || 'Account Holder'} (${userAccount?.email || ''})</div>
          </div>
          <div style="text-align: right;">
            <div style="font-weight: bold; font-size: 16px;">Finance Tracker</div>
            <div class="subtitle">Currency: ${currencyCode}</div>
          </div>
        </div>

        <div class="summary-grid">
          <div class="card">
            <div class="card-title">Net Available Balance</div>
            <div class="card-value ${netBalanceAllTime < 0 ? 'val-red' : 'val-green'}">${formatCurrency(netBalanceAllTime, currencyCode)}</div>
          </div>
          <div class="card">
            <div class="card-title">${activeMonth} Total Funds</div>
            <div class="card-value val-green">+${formatCurrency(monthAssetTotal, currencyCode)}</div>
          </div>
          <div class="card">
            <div class="card-title">${activeMonth} Total Expenses</div>
            <div class="card-value val-red">-${formatCurrency(monthExpenseTotal, currencyCode)}</div>
          </div>
        </div>

        <h3>Category Breakdown (${activeMonth} ${activeYear})</h3>
        <table>
          <thead>
            <tr>
              <th>Category</th>
              <th>Total Spent</th>
              <th>Share of Monthly Spend</th>
            </tr>
          </thead>
          <tbody>
            ${Object.entries(breakdown)
              .map(([cat, amt]) => {
                const pct = monthExpenseTotal > 0 ? ((amt / monthExpenseTotal) * 100).toFixed(1) : '0.0';
                return `
                  <tr>
                    <td><strong>${cat}</strong></td>
                    <td style="font-family: monospace;">${formatCurrency(amt, currencyCode)}</td>
                    <td>${pct}%</td>
                  </tr>
                `;
              })
              .join('')}
          </tbody>
        </table>

        <h3>Transaction History Log (${activeMonth} ${activeYear})</h3>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Description / Category</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${monthExpenses
              .map(
                (e) => `
              <tr>
                <td>${formatDateDisplay(e.entry_date)}</td>
                <td><span style="color:#ef4444; font-weight:bold;">Expense</span></td>
                <td>${e.notes ? `${e.notes} (${e.category})` : e.category}</td>
                <td style="font-family: monospace; color:#ef4444; font-weight:bold;">-${formatCurrency(e.amount, currencyCode)}</td>
              </tr>
            `
              )
              .join('')}
            ${monthAssets
              .map(
                (a) => `
              <tr>
                <td>${formatDateDisplay(a.date_added)}</td>
                <td><span style="color:#10b981; font-weight:bold;">Fund Added</span></td>
                <td>${a.source_label}</td>
                <td style="font-family: monospace; color:#10b981; font-weight:bold;">+${formatCurrency(a.amount, currencyCode)}</td>
              </tr>
            `
              )
              .join('')}
            ${monthExpenses.length === 0 && monthAssets.length === 0 ? '<tr><td colspan="4" style="text-align:center; color:#94a3b8;">No transactions logged in this period.</td></tr>' : ''}
          </tbody>
        </table>

        <div class="footer">
          Report generated automatically by Personal Finance & Expense Manager. Page 1 of 1
        </div>

        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}
