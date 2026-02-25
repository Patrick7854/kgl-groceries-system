/**
 * KARIBU GROCERIES LTD (KGL) - API Configuration
 * PROFESSIONAL VERSION - FULLY WORKING
 */

// ========================================
// API CONFIGURATION
// ========================================

const API = {
    USE_MOCK: false, // Set to true to use mock data and functions instead of real API calls
    BASE_URL: 'http://localhost:3000/api',
    
    endpoints: {
        login: '/auth/login',
        logout: '/auth/logout',
        users: '/users',
        createUser: '/users',
        updateUser: '/users/',
        deleteUser: '/users/',
        produce: '/produce',
        createProduce: '/produce',
        sales: '/sales',
        createSale: '/sales',
        creditSales: '/creditsales',
        createCreditSale: '/creditsales',
        reports: '/reports',
        branchReports: '/reports/branch/',
        directorReports: '/reports/director'
    },
    
    getHeaders: function(token = null) {
        const headers = {
            'Content-Type': 'application/json'
        };
        if (token) {
            headers['Authorization'] = 'Bearer ' + token;
        }
        return headers;
    }
};

// ========================================
// MOCK DATA
// ========================================

const MOCK_DATA = {
    users: [
        // Director
        {
            id: '1',
            name: 'Mr. Orban',
            email: 'director@karibugroceries.com',
            role: 'Director',
            branch: 'Head Office',
            contact: '+256700123456',
            password: 'password123'
        },
        // Matugga Branch
        {
            id: '2',
            name: 'John Manager',
            email: 'manager.matugga@karibugroceries.com',
            role: 'Manager',
            branch: 'MATUGGA',
            contact: '+256700123457',
            password: 'password123'
        },
        {
            id: '4',
            name: 'Peter Agent',
            email: 'agent.matugga@karibugroceries.com',
            role: 'Sales',
            branch: 'MATUGGA',
            contact: '+256700123459',
            password: 'password123'
        },
        {
            id: '6',
            name: 'Grace Agent',
            email: 'agent2.matugga@karibugroceries.com',
            role: 'Sales',
            branch: 'MATUGGA',
            contact: '+256700123461',
            password: 'password123'
        },
        // Maganjo Branch
        {
            id: '3',
            name: 'Sarah Manager',
            email: 'manager.maganjo@karibugroceries.com',
            role: 'Manager',
            branch: 'MAGANJO',
            contact: '+256700123458',
            password: 'password123'
        },
        {
            id: '5',
            name: 'Paul Agent',
            email: 'agent.maganjo@karibugroceries.com',
            role: 'Sales',
            branch: 'MAGANJO',
            contact: '+256700123460',
            password: 'password123'
        },
        {
            id: '7',
            name: 'Anna Agent',
            email: 'agent2.maganjo@karibugroceries.com',
            role: 'Sales',
            branch: 'MAGANJO',
            contact: '+256700123462',
            password: 'password123'
        }
    ],
    produce: [],
    sales: [],
    creditSales: []
};

// ========================================
// MOCK API SERVICE
// ========================================

const MockAPIService = {
    // LOGIN
    login: function(email, password) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                console.log('🔍 Checking login for:', email);
                const user = MOCK_DATA.users.find(u => u.email === email);
                
                if (user && password === 'password123') {
                    console.log('✅ User found:', user.name);
                    const { password, ...userWithoutPassword } = user;
                    resolve({
                        success: true,
                        user: userWithoutPassword,
                        token: 'mock-token-' + Date.now()
                    });
                } else {
                    console.log('❌ Invalid credentials');
                    reject({ 
                        success: false, 
                        message: 'Invalid email or password' 
                    });
                }
            }, 800);
        });
    },
    
    // GET ALL USERS
    getUsers: function() {
        return new Promise((resolve) => {
            setTimeout(() => {
                const usersWithoutPasswords = MOCK_DATA.users.map(user => {
                    const { password, ...userWithoutPassword } = user;
                    return userWithoutPassword;
                });
                resolve({ success: true, users: usersWithoutPasswords });
            }, 300);
        });
    },
    
    // CREATE USER
    createUser: function(userData) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const newUser = {
                    id: 'user_' + Date.now(),
                    name: userData.name,
                    email: userData.email,
                    role: userData.role,
                    branch: userData.branch,
                    contact: userData.contact,
                    password: userData.password
                };
                
                MOCK_DATA.users.push(newUser);
                
                const { password, ...userWithoutPassword } = newUser;
                resolve({
                    success: true,
                    user: userWithoutPassword,
                    message: 'User created successfully'
                });
            }, 300);
        });
    },
    
    // DELETE USER
    deleteUser: function(userId) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const index = MOCK_DATA.users.findIndex(u => u.id === userId);
                if (index !== -1) {
                    if (MOCK_DATA.users[index].role === 'Director') {
                        reject({ success: false, message: 'Cannot delete director' });
                        return;
                    }
                    MOCK_DATA.users.splice(index, 1);
                    resolve({ success: true, message: 'User deleted successfully' });
                } else {
                    reject({ success: false, message: 'User not found' });
                }
            }, 300);
        });
    },
    
    // GET PRODUCE
    getProduce: function(branch = null) {
        return new Promise((resolve) => {
            setTimeout(() => {
                let produce = MOCK_DATA.produce.filter(p => !branch || p.branch === branch);
                resolve({ success: true, produce: produce });
            }, 300);
        });
    },
    
    // CREATE PRODUCE
    createProduce: function(produceData) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const newProduce = {
                    id: 'prod_' + Date.now(),
                    ...produceData
                };
                MOCK_DATA.produce.push(newProduce);
                resolve({ success: true, produce: newProduce });
            }, 300);
        });
    },
    
    // CREATE SALE
    createSale: function(saleData) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const newSale = {
                    id: 'sale_' + Date.now(),
                    ...saleData,
                    dateTime: new Date().toISOString()
                };
                MOCK_DATA.sales.push(newSale);
                
                // Reduce stock
                const produceIndex = MOCK_DATA.produce.findIndex(
                    p => p.name === saleData.produceName && p.branch === saleData.branch
                );
                if (produceIndex !== -1) {
                    MOCK_DATA.produce[produceIndex].tonnage -= saleData.quantity;
                }
                
                resolve({ success: true, sale: newSale });
            }, 300);
        });
    },
    
    // CREATE CREDIT SALE
    createCreditSale: function(creditData) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const newCreditSale = {
                    id: 'credit_' + Date.now(),
                    ...creditData,
                    status: 'Pending',
                    dateTime: new Date().toISOString()
                };
                MOCK_DATA.creditSales.push(newCreditSale);
                
                // Reduce stock
                const produceIndex = MOCK_DATA.produce.findIndex(
                    p => p.name === creditData.produceName && p.branch === creditData.branch
                );
                if (produceIndex !== -1) {
                    MOCK_DATA.produce[produceIndex].tonnage -= creditData.quantity;
                }
                
                resolve({ success: true, creditSale: newCreditSale });
            }, 300);
        });
    },
    
    // GET REPORTS
    getReports: function(type, branch = null) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ success: true, reports: {} });
            }, 300);
        });
    },
    
    // LOGOUT
    logout: function() {
        localStorage.removeItem('kgl_user');
        localStorage.removeItem('kgl_token');
        window.location.href = '/frontend/pages/login.html';
    },
    
    // GET CURRENT USER
    getCurrentUser: function() {
        const userStr = localStorage.getItem('kgl_user');
        return userStr ? JSON.parse(userStr) : null;
    },
    
    // CHECK AUTHENTICATION
    isAuthenticated: function() {
        return !!localStorage.getItem('kgl_token') && !!localStorage.getItem('kgl_user');
    },
    
    // REDIRECT BASED ON ROLE
    redirectToDashboard: function(role) {
        console.log('➡️ Redirecting to:', role, 'dashboard');
        switch(role) {
            case 'Director':
                window.location.href = '/frontend/pages/director/dashboard.html';
                break;
            case 'Manager':
                window.location.href = '/frontend/pages/manager/dashboard.html';
                break;
            case 'Sales':
                window.location.href = '/frontend/pages/sales/dashboard.html';
                break;
            default:
                window.location.href = '/frontend/pages/login.html';
        }
    }
};

// ========================================
// REAL API SERVICE (WITH DEBUG LOGS)
// ========================================

const RealAPIService = {
    // LOGIN with debug
    login: async function(email, password) {
        console.log('🔍 [DEBUG] Attempting login for:', email);
        try {
            const response = await fetch(API.BASE_URL + API.endpoints.login, {
                method: 'POST',
                headers: API.getHeaders(),
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();
            console.log('🔍 [DEBUG] Login response:', data);
            return data;
        } catch (error) {
            console.log('🔍 [DEBUG] Login error:', error);
            throw error;
        }
    },
    
    // GET USERS with debug
    getUsers: async function(token) {
        console.log('🔍 [DEBUG] getUsers called with token:', token ? 'Token exists (length: ' + token.length + ')' : 'NO TOKEN');
        console.log('🔍 [DEBUG] First 20 chars of token:', token ? token.substring(0, 20) + '...' : 'none');
        
        try {
            const headers = API.getHeaders(token);
            console.log('🔍 [DEBUG] Request headers:', headers);
            
            const response = await fetch(API.BASE_URL + API.endpoints.users, {
                method: 'GET',
                headers: headers
            });
            
            console.log('🔍 [DEBUG] Response status:', response.status);
            const data = await response.json();
            console.log('🔍 [DEBUG] Response data:', data);
            
            return data;
        } catch (error) {
            console.log('🔍 [DEBUG] getUsers error:', error);
            throw error;
        }
    },
    
    // CREATE USER
    createUser: async function(userData, token) {
        console.log('🔍 [DEBUG] Creating user:', userData.email);
        try {
            const response = await fetch(API.BASE_URL + API.endpoints.createUser, {
                method: 'POST',
                headers: API.getHeaders(token),
                body: JSON.stringify(userData)
            });
            const data = await response.json();
            console.log('🔍 [DEBUG] Create user response:', data);
            return data;
        } catch (error) {
            console.log('🔍 [DEBUG] Create user error:', error);
            throw error;
        }
    },
    
    // DELETE USER
    deleteUser: async function(userId, token) {
        console.log('🔍 [DEBUG] Deleting user:', userId);
        try {
            const response = await fetch(API.BASE_URL + API.endpoints.deleteUser + userId, {
                method: 'DELETE',
                headers: API.getHeaders(token)
            });
            const data = await response.json();
            console.log('🔍 [DEBUG] Delete user response:', data);
            return data;
        } catch (error) {
            console.log('🔍 [DEBUG] Delete user error:', error);
            throw error;
        }
    },
    
    getProduce: async function(branch = null, token) {
        let url = API.BASE_URL + API.endpoints.produce;
        if (branch) url += '?branch=' + branch;
        const response = await fetch(url, { headers: API.getHeaders(token) });
        return await response.json();
    },
    
    createProduce: async function(produceData, token) {
        const response = await fetch(API.BASE_URL + API.endpoints.createProduce, {
            method: 'POST',
            headers: API.getHeaders(token),
            body: JSON.stringify(produceData)
        });
        return await response.json();
    },
    
    createSale: async function(saleData, token) {
        const response = await fetch(API.BASE_URL + API.endpoints.createSale, {
            method: 'POST',
            headers: API.getHeaders(token),
            body: JSON.stringify(saleData)
        });
        return await response.json();
    },
    
    createCreditSale: async function(creditData, token) {
        const response = await fetch(API.BASE_URL + API.endpoints.createCreditSale, {
            method: 'POST',
            headers: API.getHeaders(token),
            body: JSON.stringify(creditData)
        });
        return await response.json();
    },
    
    logout: MockAPIService.logout,
    getCurrentUser: MockAPIService.getCurrentUser,
    isAuthenticated: MockAPIService.isAuthenticated,
    redirectToDashboard: MockAPIService.redirectToDashboard
};

// ========================================
// EXPORT THE SERVICE
// ========================================

const APIService = API.USE_MOCK ? MockAPIService : RealAPIService;

console.log(`✅ API Service running in ${API.USE_MOCK ? 'MOCK' : 'REAL'} mode`);
console.log('📧 Available test accounts:');
console.log('   - director@karibugroceries.com');
console.log('   - manager.matugga@karibugroceries.com');
console.log('   - manager.maganjo@karibugroceries.com');
console.log('   - agent.matugga@karibugroceries.com');
console.log('   - agent.maganjo@karibugroceries.com');
console.log('🔑 All passwords: password123');