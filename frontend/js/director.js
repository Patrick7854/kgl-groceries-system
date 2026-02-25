/**
 * KARIBU GROCERIES LTD (KGL) - Director Dashboard
 * FULLY WORKING VERSION - Add/Delete Users
 * Branches: MAGANJO and MATUGGA
 * Director: Mr. Orban
 */

// ========================================
// GLOBAL VARIABLES
// ========================================
let usersList = [];

// ========================================
// CHECK AUTHENTICATION
// ========================================
document.addEventListener('DOMContentLoaded', async function() {
    console.log('📊 Director Dashboard loaded');
    
    // Check if user is logged in
    if (!APIService.isAuthenticated()) {
        console.log('❌ Not authenticated, redirecting');
        window.location.href = '/frontend/pages/login.html';
        return;
    }
    
    // Get current user
    const user = APIService.getCurrentUser();
    console.log('🔍 [DEBUG] Current user from storage:', user);
    
    // Verify user is Director
    if (user.role !== 'Director') {
        console.log('❌ Access denied');
        alert('Access denied. Director only.');
        APIService.redirectToDashboard(user.role);
        return;
    }
    
    console.log('✅ Authenticated as:', user.name);
    
    // Update UI with user name
    updateUserInfo(user);
    
    // Load users
    await loadUsers();
    
    // Setup modal
    setupModal();
});

// ========================================
// UPDATE USER INFO
// ========================================
function updateUserInfo(user) {
    const userNameElements = document.querySelectorAll('#userName');
    userNameElements.forEach(el => {
        if (el) el.textContent = user.name;
    });
}

// ========================================
// LOAD USERS (WITH DEBUG)
// ========================================
async function loadUsers() {
    try {
        showLoading(true);
        
        // Get token from localStorage
        const token = localStorage.getItem('kgl_token');
        console.log('🔍 [DEBUG] Token from localStorage:', token ? 'Token exists (length: ' + token.length + ')' : 'NO TOKEN');
        
        if (!token) {
            console.log('❌ [DEBUG] No token found! User might need to login again.');
            window.location.href = '/frontend/pages/login.html';
            return;
        }
        
        // Call API with token
        console.log('🔍 [DEBUG] Calling APIService.getUsers...');
        const response = await APIService.getUsers(token);
        
        if (response.success) {
            usersList = response.users;
            displayUsers();
            console.log(`✅ Loaded ${usersList.length} users`);
        } else {
            console.log('❌ API returned error:', response.message);
            // If token is invalid, redirect to login
            if (response.message === 'No token, authorization denied' || 
                response.message === 'Token is not valid') {
                alert('Session expired. Please login again.');
                APIService.logout();
            }
        }
    } catch (error) {
        console.log('❌ Error loading users:', error);
        usersList = [];
        displayUsers();
    } finally {
        showLoading(false);
    }
}

// ========================================
// SHOW LOADING
// ========================================
function showLoading(show) {
    const tableBody = document.getElementById('usersTableBody');
    if (!tableBody) return;
    
    if (show) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 40px;">
                    <i class="fas fa-spinner fa-spin" style="font-size: 30px; color: var(--gold-primary);"></i>
                    <p style="margin-top: 10px;">Loading users...</p>
                </td>
            </tr>
        `;
    }
}

// ========================================
// DISPLAY USERS
// ========================================
function displayUsers() {
    const tableBody = document.getElementById('usersTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    if (usersList.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 40px;">
                    <i class="fas fa-users" style="font-size: 30px; color: var(--gray-medium);"></i>
                    <p style="margin-top: 10px;">No users found</p>
                </td>
            </tr>
        `;
        updateUserCount();
        return;
    }
    
    usersList.forEach(user => {
        addUserRow(user);
    });
    
    updateUserCount();
}

// ========================================
// ADD USER ROW
// ========================================
function addUserRow(user) {
    const tableBody = document.getElementById('usersTableBody');
    
    const row = document.createElement('tr');
    row.setAttribute('data-user-id', user.id || user._id);
    
    let roleClass = '';
    let roleDisplay = user.role;
    
    if (user.role === 'Manager') {
        roleClass = 'manager';
        roleDisplay = 'Manager';
    } else if (user.role === 'Sales') {
        roleClass = 'sales';
        roleDisplay = 'Sales Agent';
    } else if (user.role === 'Director') {
        roleClass = 'director';
        roleDisplay = 'Director';
    }
    
    row.innerHTML = `
        <td>${user.name}</td>
        <td>${user.email}</td>
        <td><span class="role-badge ${roleClass}">${roleDisplay}</span></td>
        <td>${user.branch}</td>
        <td>${user.contact}</td>
        <td>
            <button class="action-btn edit" title="Edit User" ${user.role === 'Director' ? 'disabled' : ''}>
                <i class="fas fa-edit"></i>
            </button>
            <button class="action-btn delete" title="Delete User" ${user.role === 'Director' ? 'disabled' : ''}>
                <i class="fas fa-trash"></i>
            </button>
        </td>
    `;
    
    tableBody.appendChild(row);
    
    // Add event listeners
    const deleteBtn = row.querySelector('.action-btn.delete');
    if (deleteBtn && user.role !== 'Director') {
        deleteBtn.addEventListener('click', () => deleteUser(user.id || user._id, row));
    }
}

// ========================================
// DELETE USER
// ========================================
async function deleteUser(userId, row) {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
        row.style.opacity = '0.5';
        
        const token = localStorage.getItem('kgl_token');
        const response = await APIService.deleteUser(userId, token);
        
        if (response.success) {
            usersList = usersList.filter(u => (u.id || u._id) !== userId);
            row.remove();
            updateUserCount();
            alert('User deleted successfully');
            console.log('✅ User deleted');
        }
    } catch (error) {
        console.log('❌ Error deleting user:', error);
        alert(error.message || 'Error deleting user');
        row.style.opacity = '1';
    }
}

// ========================================
// UPDATE USER COUNT
// ========================================
function updateUserCount() {
    const countElement = document.getElementById('userCount');
    if (countElement) {
        countElement.textContent = usersList.length;
    }
}

// ========================================
// SETUP MODAL
// ========================================
function setupModal() {
    const addUserBtn = document.getElementById('addUserBtn');
    const modal = document.getElementById('userModal');
    const closeBtn = document.getElementById('closeModal');
    const form = document.getElementById('createUserForm');
    
    // Open modal
    if (addUserBtn) {
        addUserBtn.addEventListener('click', () => {
            modal.classList.add('active');
        });
    }
    
    // Close modal
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.classList.remove('active');
            form.reset();
        });
    }
    
    // Close on outside click
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
            form.reset();
        }
    });
    
    // Handle form submit
    if (form) {
        form.addEventListener('submit', createUser);
    }
}

// ========================================
// CREATE USER
// ========================================
async function createUser(e) {
    e.preventDefault();
    
    const userData = {
        name: document.getElementById('fullName').value.trim(),
        email: document.getElementById('email').value.trim(),
        role: document.getElementById('role').value,
        branch: document.getElementById('branch').value,
        contact: document.getElementById('contact').value.trim(),
        password: document.getElementById('password').value
    };
    
    // Validate
    if (!validateUser(userData)) return;
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    try {
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating...';
        submitBtn.disabled = true;
        
        const token = localStorage.getItem('kgl_token');
        const response = await APIService.createUser(userData, token);
        
        if (response.success) {
            usersList.push(response.user);
            addUserRow(response.user);
            updateUserCount();
            
            // Close and reset
            document.getElementById('userModal').classList.remove('active');
            e.target.reset();
            
            alert('User created successfully!');
            console.log('✅ User created:', response.user);
        } else {
            alert(response.message || 'Error creating user');
        }
    } catch (error) {
        console.log('❌ Error:', error);
        alert('Error creating user');
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// ========================================
// VALIDATE USER
// ========================================
function validateUser(data) {
    if (!data.name || data.name.length < 3) {
        alert('Name must be at least 3 characters');
        return false;
    }
    
    if (!data.email || !data.email.includes('@')) {
        alert('Valid email required');
        return false;
    }
    
    if (usersList.some(u => u.email === data.email)) {
        alert('Email already exists');
        return false;
    }
    
    if (!data.role) {
        alert('Please select a role');
        return false;
    }
    
    if (!data.branch) {
        alert('Please select a branch');
        return false;
    }
    
    if (!data.contact || data.contact.length < 10) {
        alert('Valid phone number required');
        return false;
    }
    
    if (!data.password || data.password.length < 6) {
        alert('Password must be at least 6 characters');
        return false;
    }
    
    return true;
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

console.log('🚀 Director.js loaded - FULLY WORKING');

// ========================================
// INITIALIZE CHARTS
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    // Sales Chart
    const salesCtx = document.getElementById('salesChart')?.getContext('2d');
    if (salesCtx) {
        new Chart(salesCtx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
                datasets: [{
                    label: 'Sales (UGX)',
                    data: [110, 115, 120, 115, 110, 105, 145],
                    borderColor: '#1B7F7A',
                    backgroundColor: 'rgba(27, 127, 122, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#1B7F7A',
                    pointBorderColor: '#FFFFFF',
                    pointBorderWidth: 2,
                    pointRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (ctx) => 'UGX ' + ctx.raw + 'K'
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: '#E9EDF2' }
                    }
                }
            }
        });
    }
    
    // Stock Chart
    const stockCtx = document.getElementById('stockChart')?.getContext('2d');
    if (stockCtx) {
        new Chart(stockCtx, {
            type: 'doughnut',
            data: {
                labels: ['In Stock', 'Low Stock', 'Out of Stock'],
                datasets: [{
                    data: [65, 20, 15],
                    backgroundColor: ['#0F766E', '#B45309', '#B91C1C'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                    legend: { display: false }
                }
            }
        });
    }
});