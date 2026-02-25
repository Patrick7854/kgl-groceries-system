/**
 * KARIBU GROCERIES LTD (KGL) - Manager Dashboard
 * Branches: MAGANJO and MATUGGA
 * Manager can: Add stock, record sales, credit sales, view inventory
 */

// ========================================
// GLOBAL VARIABLES
// ========================================
let currentUser = null;
let currentBranch = '';
let produceList = [];

// ========================================
// CHECK AUTHENTICATION
// ========================================
document.addEventListener('DOMContentLoaded', async function() {
    console.log('📊 Manager Dashboard loaded');
    
    // Check if user is logged in
    if (!APIService.isAuthenticated()) {
        console.log('❌ Not authenticated, redirecting');
        window.location.href = '/frontend/pages/login.html';
        return;
    }
    
    // Get current user
    currentUser = APIService.getCurrentUser();
    
    // Verify user is Manager
    if (currentUser.role !== 'Manager') {
        console.log('❌ Access denied');
        alert('Access denied. Manager only.');
        APIService.redirectToDashboard(currentUser.role);
        return;
    }
    
    currentBranch = currentUser.branch;
    console.log('✅ Authenticated as:', currentUser.name);
    console.log('🏢 Branch:', currentBranch);
    
    // Update UI with user info
    updateUserInfo();
    
    // Load produce for this branch
    await loadProduce();
    
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
            updateInventoryDisplay();
        }
    } catch (error) {
        console.log('❌ Error loading produce:', error);
        produceList = [];
    }
}

// ========================================
// UPDATE INVENTORY DISPLAY
// ========================================
function updateInventoryDisplay() {
    // Update dashboard inventory table
    const inventoryBody = document.getElementById('inventoryTableBody');
    if (inventoryBody) {
        if (produceList.length === 0) {
            inventoryBody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center;">No inventory found</td>
                </tr>
            `;
        } else {
            let html = '';
            let totalStock = 0;
            let lowStockCount = 0;
            
            produceList.forEach(item => {
                totalStock += item.tonnage;
                
                // Determine stock status
                let statusClass = 'in-stock';
                let statusText = 'In Stock';
                
                if (item.tonnage <= 0) {
                    statusClass = 'out-stock';
                    statusText = 'Out of Stock';
                } else if (item.tonnage < 1000) {
                    statusClass = 'low-stock';
                    statusText = 'Low Stock';
                    lowStockCount++;
                }
                
                html += `
                    <tr>
                        <td>${item.name}</td>
                        <td>${item.type || item.name}</td>
                        <td>${item.tonnage} kg</td>
                        <td>UGX ${item.sellingPrice?.toLocaleString() || '0'}</td>
                        <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                    </tr>
                `;
            });
            
            inventoryBody.innerHTML = html;
            
            // Update stats
            document.getElementById('totalStock') && (document.getElementById('totalStock').textContent = totalStock + ' kg');
            document.getElementById('totalProducts') && (document.getElementById('totalProducts').textContent = produceList.length);
            document.getElementById('lowStock') && (document.getElementById('lowStock').textContent = lowStockCount);
        }
    }
}

// ========================================
// SETUP PAGE BASED ON CURRENT PAGE
// ========================================
function setupPage() {
    const path = window.location.pathname;
    
    if (path.includes('procurement.html')) {
        setupProcurementPage();
    } else if (path.includes('sales.html')) {
        setupSalesPage();
    } else if (path.includes('creditsales.html')) {
        setupCreditSalesPage();
    } else if (path.includes('inventory.html')) {
        setupInventoryPage();
    }
}

// ========================================
// PROCUREMENT PAGE
// ========================================
function setupProcurementPage() {
    const form = document.getElementById('procurementForm');
    if (!form) return;
    
    // Set default date and time
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date').value = today;
    
    const now = new Date();
    const time = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
    document.getElementById('time').value = time;
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const produceData = {
            name: document.getElementById('produceName').value,
            type: document.getElementById('produceType').value,
            tonnage: parseInt(document.getElementById('tonnage').value),
            cost: parseInt(document.getElementById('cost').value),
            dealerName: document.getElementById('dealerName').value,
            dealerContact: document.getElementById('dealerContact').value,
            sellingPrice: parseInt(document.getElementById('sellingPrice').value),
            branch: currentBranch,
            date: document.getElementById('date').value,
            time: document.getElementById('time').value
        };
        
        // Validate tonnage (minimum 1000kg for procurement)
        if (produceData.tonnage < 1000) {
            alert('Tonnage must be at least 1000kg for procurement');
            return;
        }
        
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        try {
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
            submitBtn.disabled = true;
            
            const response = await APIService.createProduce(produceData);
            
            if (response.success) {
                alert('Procurement recorded successfully!');
                form.reset();
                
                // Reset date and time
                document.getElementById('date').value = today;
                document.getElementById('time').value = time;
            }
        } catch (error) {
            console.log('❌ Error:', error);
            alert('Error recording procurement');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
}

// ========================================
// SALES PAGE
// ========================================
function setupSalesPage() {
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
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const selectedOption = produceSelect.options[produceSelect.selectedIndex];
        const price = selectedOption?.getAttribute('data-price') || 0;
        const quantity = parseInt(document.getElementById('quantity').value);
        
        // Check if enough stock
        const produce = produceList.find(p => p.name === produceSelect.value);
        if (!produce || produce.tonnage < quantity) {
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
                await loadProduce(); // Reload inventory
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
// CREDIT SALES PAGE
// ========================================
function setupCreditSalesPage() {
    const produceSelect = document.getElementById('produceSelect');
    const form = document.getElementById('creditSaleForm');
    
    if (!produceSelect || !form) return;
    
    // Populate produce dropdown
    if (produceList.length > 0) {
        produceList.forEach(item => {
            if (item.tonnage > 0) {
                const option = document.createElement('option');
                option.value = item.name;
                option.textContent = `${item.name} - ${item.tonnage}kg available @ UGX ${item.sellingPrice}/kg`;
                produceSelect.appendChild(option);
            }
        });
    }
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const quantity = parseInt(document.getElementById('quantity').value);
        
        // Check if enough stock
        const produce = produceList.find(p => p.name === produceSelect.value);
        if (!produce || produce.tonnage < quantity) {
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
                await loadProduce(); // Reload inventory
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
// INVENTORY PAGE
// ========================================
function setupInventoryPage() {
    updateInventoryDisplay();
    
    // Check for low stock
    const lowStockItems = produceList.filter(item => item.tonnage < 1000 && item.tonnage > 0);
    const outOfStock = produceList.filter(item => item.tonnage <= 0);
    
    if (lowStockItems.length > 0 || outOfStock.length > 0) {
        const alertDiv = document.getElementById('lowStockAlert');
        const messageSpan = document.getElementById('lowStockMessage');
        
        if (alertDiv && messageSpan) {
            let message = '';
            if (outOfStock.length > 0) {
                message += `${outOfStock.length} item(s) out of stock. `;
            }
            if (lowStockItems.length > 0) {
                message += `${lowStockItems.length} item(s) low on stock (<1000kg).`;
            }
            messageSpan.textContent = message;
            alertDiv.style.display = 'flex';
        }
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

console.log('🚀 Manager.js loaded');