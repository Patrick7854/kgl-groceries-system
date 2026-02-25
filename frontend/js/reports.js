/**
 * KGL Groceries LTD - Reports Page
 * Director only - View aggregated sales
 */

// ========================================
// GLOBAL VARIABLES
// ========================================
let branchChart, productChart;
let salesData = [];
let creditData = [];

// ========================================
// CHECK AUTHENTICATION
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('Reports page loaded');
    
    // Check if logged in
    if (!localStorage.getItem('kgl_token') || !localStorage.getItem('kgl_user')) {
        window.location.href = '/frontend/pages/login.html';
        return;
    }
    
    // Check if director
    const user = JSON.parse(localStorage.getItem('kgl_user'));
    if (user.role !== 'Director') {
        alert('Access denied. Directors only.');
        window.location.href = '/frontend/pages/login.html';
        return;
    }
    
    // Load sample data
    loadSampleData();
    
    // Setup filters
    document.getElementById('filterBtn').addEventListener('click', function() {
        updateReports();
    });
});

// ========================================
// LOAD SAMPLE DATA
// ========================================
function loadSampleData() {
    // Sample sales data
    salesData = [
        { date: '2024-01-15', branch: 'MAGANJO', product: 'Beans', quantity: 500, amount: 2500000, type: 'Cash' },
        { date: '2024-01-15', branch: 'MATUGGA', product: 'Maize', quantity: 800, amount: 2400000, type: 'Cash' },
        { date: '2024-01-16', branch: 'MAGANJO', product: 'Beans', quantity: 300, amount: 1500000, type: 'Credit', status: 'Pending' },
        { date: '2024-01-16', branch: 'MATUGGA', product: 'Groundnuts', quantity: 200, amount: 1000000, type: 'Cash' },
        { date: '2024-01-17', branch: 'MAGANJO', product: 'Maize', quantity: 600, amount: 1800000, type: 'Cash' },
        { date: '2024-01-17', branch: 'MATUGGA', product: 'Beans', quantity: 400, amount: 2000000, type: 'Credit', status: 'Paid' },
        { date: '2024-01-18', branch: 'MAGANJO', product: 'Soybeans', quantity: 300, amount: 900000, type: 'Cash' },
        { date: '2024-01-18', branch: 'MATUGGA', product: 'Cow Peas', quantity: 350, amount: 1050000, type: 'Cash' }
    ];
    
    // Sample credit data
    creditData = salesData.filter(s => s.type === 'Credit');
    
    updateReports();
}

// ========================================
// UPDATE REPORTS
// ========================================
function updateReports() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    
    // Filter by date
    let filtered = salesData;
    if (startDate && endDate) {
        filtered = salesData.filter(s => s.date >= startDate && s.date <= endDate);
    }
    
    // Calculate branch totals
    const maganjoTotal = filtered
        .filter(s => s.branch === 'MAGANJO')
        .reduce((sum, s) => sum + s.amount, 0);
    
    const matuggaTotal = filtered
        .filter(s => s.branch === 'MATUGGA')
        .reduce((sum, s) => sum + s.amount, 0);
    
    const combinedTotal = maganjoTotal + matuggaTotal;
    
    // Calculate credit totals
    const creditTotal = filtered
        .filter(s => s.type === 'Credit')
        .reduce((sum, s) => sum + s.amount, 0);
    
    const outstanding = filtered
        .filter(s => s.type === 'Credit' && s.status === 'Pending')
        .reduce((sum, s) => sum + s.amount, 0);
    
    const maganjoCredit = filtered
        .filter(s => s.branch === 'MAGANJO' && s.type === 'Credit')
        .reduce((sum, s) => sum + s.amount, 0);
    
    const matuggaCredit = filtered
        .filter(s => s.branch === 'MATUGGA' && s.type === 'Credit')
        .reduce((sum, s) => sum + s.amount, 0);
    
    // Update UI
    document.getElementById('maganjoTotal').textContent = 'UGX ' + maganjoTotal.toLocaleString();
    document.getElementById('matuggaTotal').textContent = 'UGX ' + matuggaTotal.toLocaleString();
    document.getElementById('combinedTotal').textContent = 'UGX ' + combinedTotal.toLocaleString();
    
    document.getElementById('totalCredit').textContent = 'UGX ' + creditTotal.toLocaleString();
    document.getElementById('outstanding').textContent = 'UGX ' + outstanding.toLocaleString();
    document.getElementById('maganjoCredit').textContent = 'UGX ' + maganjoCredit.toLocaleString();
    document.getElementById('matuggaCredit').textContent = 'UGX ' + matuggaCredit.toLocaleString();
    
    // Update charts
    updateBranchChart(maganjoTotal, matuggaTotal);
    updateProductChart(filtered);
    
    // Update transactions table
    updateTransactionsTable(filtered);
}

// ========================================
// UPDATE BRANCH CHART
// ========================================
function updateBranchChart(maganjo, matugga) {
    const ctx = document.getElementById('branchChart').getContext('2d');
    
    if (branchChart) {
        branchChart.destroy();
    }
    
    branchChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['MAGANJO', 'MATUGGA'],
            datasets: [{
                label: 'Sales (UGX)',
                data: [maganjo, matugga],
                backgroundColor: ['#D4AF37', '#0B1E33'],
                borderColor: ['#B49450', '#1A2F4A'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return 'UGX ' + value.toLocaleString();
                        }
                    }
                }
            }
        }
    });
}

// ========================================
// UPDATE PRODUCT CHART
// ========================================
function updateProductChart(filtered) {
    // Group by product
    const products = {};
    filtered.forEach(sale => {
        if (!products[sale.product]) {
            products[sale.product] = 0;
        }
        products[sale.product] += sale.amount;
    });
    
    const ctx = document.getElementById('productChart').getContext('2d');
    
    if (productChart) {
        productChart.destroy();
    }
    
    productChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: Object.keys(products),
            datasets: [{
                data: Object.values(products),
                backgroundColor: [
                    '#D4AF37',
                    '#0B1E33',
                    '#1A2F4A',
                    '#2C3E5A',
                    '#6B7280'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.label || '';
                            let value = context.raw || 0;
                            return label + ': UGX ' + value.toLocaleString();
                        }
                    }
                }
            }
        }
    });
}

// ========================================
// UPDATE TRANSACTIONS TABLE
// ========================================
function updateTransactionsTable(filtered) {
    const tbody = document.getElementById('recentTransactions');
    
    // Sort by date (newest first)
    const sorted = [...filtered].sort((a, b) => b.date.localeCompare(a.date));
    
    if (sorted.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">No transactions</td></tr>';
        return;
    }
    
    let html = '';
    sorted.slice(0, 10).forEach(sale => {
        html += `
            <tr>
                <td>${sale.date}</td>
                <td>${sale.branch}</td>
                <td>${sale.product}</td>
                <td>${sale.quantity} kg</td>
                <td>UGX ${sale.amount.toLocaleString()}</td>
                <td>${sale.type}</td>
                <td>${sale.status || 'Completed'}</td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
}

// ========================================
// LOGOUT
// ========================================
document.getElementById('logoutBtn').addEventListener('click', function() {
    localStorage.removeItem('kgl_user');
    localStorage.removeItem('kgl_token');
    window.location.href = '/frontend/pages/login.html';
});