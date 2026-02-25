/**
 * KARIBU GROCERIES LTD (KGL) - Sales Agent Dashboard
 * Branches: MAGANJO and MATUGGA
 * Sales Agent can: Record sales, credit sales, view history
 * CANNOT: Record procurement, manage users, set prices
 */

// ========================================
// GLOBAL VARIABLES
// ========================================
let currentUser = null;
let currentBranch = '';
let produceList = [];
let mySales = [];
let myCreditSales = [];

// ========================================
// CHECK AUTHENTICATION
// ========================================
document.addEventListener('DOMContentLoaded', async function() {
    console.log('📊 Sales Dashboard loaded');
    
    // Check if user is logged in
    if (!APIService.isAuthenticated()) {
        console.log('❌ Not authenticated, redirecting');
        window.location.href = '/frontend/pages/login.html';
        return;
    }
    
    // Get current user
    currentUser = APIService.getCurrentUser();
    
    // Verify user is Sales Agent
    if (currentUser.role !== 'Sales') {
        console.log('❌ Access denied');
        alert('Access denied. Sales Agents only.');
        APIService.redirectToDashboard(currentUser.role);
        return;
    }
    
    currentBranch = currentUser.branch;
    console.log('✅ Authenticated as:', currentUser.name);
    console.log('🏢 Branch:', currentBranch);
    
    // Update UI with user info
    updateUserInfo();
    
    // Load data
    await loadProduce();
    await loadMySales();
    
    // Setup page based on which page we're on
    setupPage();
});

// ========================================
// UPDATE USER INFO
// ========================================
function updateUserInfo() {
    // Update user name
    const userNameElements = document.querySelectorAll('#userName');
    userNameElements.forEach(el => {
        if (el) el.textContent = currentUser.name;
    });
    
    // Update branch name
    const branchElements = document.querySelectorAll('#branchName, #branchDisplay');
    branchElements.forEach(el => {
        if (el) el.textContent = currentBranch + ' Branch';
    });
}

// ========================================
// LOAD PRODUCE FROM API
// ========================================
async function loadProduce() {
    try {
        const response = await APIService.getProduce(currentBranch);
        if (response.success) {
            produceList = response.produce;
            console.log(`✅ Loaded ${produceList.length} produce items`);
            updateStockDisplay();
        }
    } catch (error) {
        console.log('❌ Error loading produce:', error);
        produceList = [];
    }
}

// ========================================
// LOAD MY SALES FROM API
// ========================================
async function loadMySales() {
    try {
        // For now, use mock data
        // In real backend, this would filter by sales agent
        mySales = [
            {
                id: 's1',
                dateTime: new Date().toISOString(),
                produceName: 'Beans',
                quantity: 100,
                amountPaid: 500000,
                buyerName: 'John Customer',
                type: 'Cash',
                status: 'Completed'
            },
            {
                id: 's2',
                dateTime: new Date(Date.now() - 86400000).toISOString(),
                produceName: 'Maize',
                quantity: 200,
                amountPaid: 600000,
                buyerName: 'Jane Customer',
                type: 'Cash',
                status: 'Completed'
            }
        ];
        
        myCreditSales = [
            {
                id: 'c1',
                dateTime: new Date().toISOString(),
                produceName: 'Beans',
                quantity: 50,
                amountDue: 250000,
                buyerName: 'Peter Trusted',
                dueDate: '2024-03-01',
                status: 'Pending'
            }
        ];
        
        updateSalesDisplay();
    } catch (error) {
        console.log('❌ Error loading sales:', error);
        mySales = [];
        myCreditSales = [];
    }
}

// ========================================
// UPDATE STOCK DISPLAY
// ========================================
function updateStockDisplay() {
    // Update dashboard stock table
    const stockBody = document.getElementById('stockBody');
    if (stockBody) {
        if (produceList.length === 0) {
            stockBody.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align: center;">No stock available</td>
                </tr>
            `;
        } else {
            let html = '';
            let totalStock = 0;
            
            produceList.forEach(item => {
                totalStock += item.tonnage;
                
                let statusClass = 'in-stock';
                let statusText = 'In Stock';
                
                if (item.tonnage <= 0) {
                    statusClass = 'out-stock';
                    statusText = 'Out of Stock';
                } else if (item.tonnage < 1000) {
                    statusClass = 'low-stock';
                    statusText = 'Low Stock';
                }
                
                html += `
                    <tr>
                        <td>${item.name}</td>
                        <td>${item.tonnage} kg</td>
                        <td>UGX ${item.sellingPrice?.toLocaleString() || '0'}</td>
                        <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                    </tr>
                `;
            });
            
            stockBody.innerHTML = html;
            
            // Update stats
            document.getElementById('availableStock') && (document.getElementById('availableStock').textContent = totalStock + ' kg');
        }
    }
}

// ========================================
// UPDATE SALES DISPLAY
// ========================================
function updateSalesDisplay() {
    // Update dashboard recent sales
    const recentBody = document.getElementById('recentSalesBody');
    if (recentBody) {
        const allSales = [...mySales, ...myCreditSales]
            .sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime))
            .slice(0, 5);
        
        if (allSales.length === 0) {
            recentBody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center;">No sales yet</td>
                </tr>
            `;
        } else {
            let html = '';
            allSales.forEach(sale => {
                html += `
                    <tr>
                        <td>${new Date(sale.dateTime).toLocaleString()}</td>
                        <td>${sale.produceName}</td>
                        <td>${sale.quantity} kg</td>
                        <td>UGX ${(sale.amountPaid || sale.amountDue)?.toLocaleString()}</td>
                        <td>${sale.buyerName}</td>
                        <td>${sale.type || (sale.amountDue ? 'Credit' : 'Cash')}</td>
                    </tr>
                `;
            });
            recentBody.innerHTML = html;
        }
    }
    
    // Update history page
    const historyBody = document.getElementById('salesHistoryBody');
    if (historyBody) {
        const filterType = document.getElementById('filterType')?.value || 'all';
        const dateFilter = document.getElementById('dateFilter')?.value;
        
        let filteredSales = [];
        
        if (filterType === 'cash') {
            filteredSales = mySales;
        } else if (filterType === 'credit') {
            filteredSales = myCreditSales.map(s => ({
                ...s,
                amountPaid: s.amountDue,
                type: 'Credit',
                status: s.status
            }));
        } else {
            filteredSales = [
                ...mySales,
                ...myCreditSales.map(s => ({
                    ...s,
                    amountPaid: s.amountDue,
                    type: 'Credit',
                    status: s.status
                }))
            ];
        }
        
        // Apply date filter
        if (dateFilter) {
            filteredSales = filteredSales.filter(s => 
                s.dateTime.startsWith(dateFilter)
            );
        }
        
        // Sort by date
        filteredSales.sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime));
        
        if (filteredSales.length === 0) {
            historyBody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center;">No sales found</td>
                </tr>
            `;
        } else {
            let html = '';
            let total = 0;
            
            filteredSales.forEach(sale => {
                total += sale.amountPaid || 0;
                html += `
                    <tr>
                        <td>${new Date(sale.dateTime).toLocaleString()}</td>
                        <td>${sale.produceName}</td>
                        <td>${sale.quantity} kg</td>
                        <td>UGX ${(sale.amountPaid || sale.amountDue)?.toLocaleString()}</td>
                        <td>${sale.buyerName}</td>
                        <td>${sale.type || (sale.amountDue ? 'Credit' : 'Cash')}</td>
                        <td><span class="status-badge ${sale.status === 'Pending' ? 'warning' : 'success'}">${sale.status || 'Completed'}</span></td>
                    </tr>
                `;
            });
            
            historyBody.innerHTML = html;
            document.getElementById('totalAmount') && (document.getElementById('totalAmount').textContent = `Total: UGX ${total.toLocaleString()}`);
        }
    }
    
    // Update stats
    document.getElementById('todaySales') && (document.getElementById('todaySales').textContent = mySales.length);
    document.getElementById('creditSales') && (document.getElementById('creditSales').textContent = myCreditSales.length);
}

// ========================================
// SETUP PAGE BASED ON CURRENT PAGE
// ========================================
function setupPage() {
    const path = window.location.pathname;
    
    if (path.includes('newsale.html')) {
        setupNewSalePage();
    } else if (path.includes('creditsale.html')) {
        setupCreditSalePage();
    } else if (path.includes('history.html')) {
        setupHistoryPage();
    }
}

// ========================================
// NEW SALE PAGE
// ========================================
function setupNewSalePage() {
    const produceSelect = document.getElementById('produceSelect');
    const form = document.getElementById('saleForm');
    
    if (!produceSelect || !form) return;
    
    // Populate produce dropdown
    if (produceList.length > 0) {
        produceList.forEach(item => {
            if (item.tonnage > 0) {
                const option = document.createElement('option');
                option.value = item.name;
                option.textContent = `${item.name} - ${item.tonnage}kg available @ UGX ${item.sellingPrice}/kg`;
                option.setAttribute('data-price', item.sellingPrice);
                option.setAttribute('data-max', item.tonnage);
                produceSelect.appendChild(option);
            }
        });
    }
    
    // Calculate amount when quantity changes
    document.getElementById('quantity').addEventListener('input', function() {
        const selectedOption = produceSelect.options[produceSelect.selectedIndex];
        const price = selectedOption?.getAttribute('data-price') || 0;
        const quantity = parseInt(this.value) || 0;
        document.getElementById('amountPaid').value = price * quantity;
    });
    
    // Validate quantity against available stock
    document.getElementById('quantity').addEventListener('change', function() {
        const selectedOption = produceSelect.options[produceSelect.selectedIndex];
        const maxStock = parseInt(selectedOption?.getAttribute('data-max') || 0);
        const quantity = parseInt(this.value) || 0;
        
        if (quantity > maxStock) {
            alert(`Only ${maxStock}kg available!`);
            this.value = maxStock;
            // Trigger amount calculation
            this.dispatchEvent(new Event('input'));
        }
    });
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const selectedOption = produceSelect.options[produceSelect.selectedIndex];
        const quantity = parseInt(document.getElementById('quantity').value);
        const maxStock = parseInt(selectedOption?.getAttribute('data-max') || 0);
        
        // Check if enough stock
        if (quantity > maxStock) {
            alert('Insufficient stock!');
            return;
        }
        
        const saleData = {
            produceName: produceSelect.value,
            quantity: quantity,
            amountPaid: parseInt(document.getElementById('amountPaid').value),
            buyerName: document.getElementById('buyerName').value,
            salesAgent: currentUser.name,
            branch: currentBranch,
            dateTime: new Date().toISOString()
        };
        
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        try {
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
            submitBtn.disabled = true;
            
            const response = await APIService.createSale(saleData);
            
            if (response.success) {
                alert('Sale recorded successfully!');
                form.reset();
                await loadProduce(); // Reload stock
                await loadMySales(); // Reload sales
                
                // Redirect to dashboard
                setTimeout(() => {
                    window.location.href = '/frontend/pages/sales/dashboard.html';
                }, 1500);
            }
        } catch (error) {
            console.log('❌ Error:', error);
            alert('Error recording sale');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
}

// ========================================
// CREDIT SALE PAGE
// ========================================
function setupCreditSalePage() {
    const produceSelect = document.getElementById('produceSelect');
    const form = document.getElementById('creditSaleForm');
    
    if (!produceSelect || !form) return;
    
    // Set default dates
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('dispatchDate').value = today;
    
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    document.getElementById('dueDate').value = nextMonth.toISOString().split('T')[0];
    
    // Populate produce dropdown
    if (produceList.length > 0) {
        produceList.forEach(item => {
            if (item.tonnage > 0) {
                const option = document.createElement('option');
                option.value = item.name;
                option.textContent = `${item.name} - ${item.tonnage}kg available @ UGX ${item.sellingPrice}/kg`;
                option.setAttribute('data-price', item.sellingPrice);
                option.setAttribute('data-max', item.tonnage);
                produceSelect.appendChild(option);
            }
        });
    }
    
    // Calculate amount when quantity changes
    document.getElementById('quantity').addEventListener('input', function() {
        const selectedOption = produceSelect.options[produceSelect.selectedIndex];
        const price = selectedOption?.getAttribute('data-price') || 0;
        const quantity = parseInt(this.value) || 0;
        document.getElementById('amountDue').value = price * quantity;
    });
    
    // Validate quantity against available stock
    document.getElementById('quantity').addEventListener('change', function() {
        const selectedOption = produceSelect.options[produceSelect.selectedIndex];
        const maxStock = parseInt(selectedOption?.getAttribute('data-max') || 0);
        const quantity = parseInt(this.value) || 0;
        
        if (quantity > maxStock) {
            alert(`Only ${maxStock}kg available!`);
            this.value = maxStock;
            // Trigger amount calculation
            this.dispatchEvent(new Event('input'));
        }
    });
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const selectedOption = produceSelect.options[produceSelect.selectedIndex];
        const quantity = parseInt(document.getElementById('quantity').value);
        const maxStock = parseInt(selectedOption?.getAttribute('data-max') || 0);
        
        // Check if enough stock
        if (quantity > maxStock) {
            alert('Insufficient stock!');
            return;
        }
        
        const creditData = {
            buyerName: document.getElementById('buyerName').value,
            nin: document.getElementById('nin').value,
            location: document.getElementById('location').value,
            contact: document.getElementById('contact').value,
            amountDue: parseInt(document.getElementById('amountDue').value),
            salesAgent: currentUser.name,
            produceName: produceSelect.value,
            quantity: quantity,
            dueDate: document.getElementById('dueDate').value,
            dispatchDate: document.getElementById('dispatchDate').value,
            branch: currentBranch,
            status: 'Pending'
        };
        
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        try {
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
            submitBtn.disabled = true;
            
            const response = await APIService.createCreditSale(creditData);
            
            if (response.success) {
                alert('Credit sale recorded successfully!');
                form.reset();
                
                // Reset dates
                document.getElementById('dispatchDate').value = today;
                document.getElementById('dueDate').value = nextMonth.toISOString().split('T')[0];
                
                await loadProduce(); // Reload stock
                await loadMySales(); // Reload sales
                
                // Redirect to dashboard
                setTimeout(() => {
                    window.location.href = '/frontend/pages/sales/dashboard.html';
                }, 1500);
            }
        } catch (error) {
            console.log('❌ Error:', error);
            alert('Error recording credit sale');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
}

// ========================================
// HISTORY PAGE
// ========================================
function setupHistoryPage() {
    updateSalesDisplay();
    
    const applyFilter = document.getElementById('applyFilter');
    if (applyFilter) {
        applyFilter.addEventListener('click', updateSalesDisplay);
    }
    
    const filterType = document.getElementById('filterType');
    const dateFilter = document.getElementById('dateFilter');
    
    if (filterType) {
        filterType.addEventListener('change', updateSalesDisplay);
    }
    
    if (dateFilter) {
        dateFilter.addEventListener('change', updateSalesDisplay);
    }
}

// ========================================
// LOGOUT
// ========================================
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        APIService.logout();
    });
}

console.log('🚀 Sales.js loaded');