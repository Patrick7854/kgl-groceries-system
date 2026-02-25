/**
 * KGL Groceries LTD - Login Functionality
 * Handles user authentication
 */

// ========================================
// GET FORM ELEMENTS
// ========================================
const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const togglePasswordBtn = document.getElementById('togglePassword');
const loginBtn = document.getElementById('loginBtn');
const errorContainer = document.getElementById('errorContainer');
const errorText = document.getElementById('errorText');
const rememberMeCheckbox = document.getElementById('rememberMe');

// ========================================
// PAGE LOAD
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('Login page loaded');
    
    // Check if already logged in
    if (localStorage.getItem('kgl_token') && localStorage.getItem('kgl_user')) {
        const user = JSON.parse(localStorage.getItem('kgl_user'));
        redirectToDashboard(user.role);
        return;
    }

    // Load saved email
    const savedEmail = localStorage.getItem('remembered_email');
    if (savedEmail) {
        emailInput.value = savedEmail;
        rememberMeCheckbox.checked = true;
    }

    // Add validation listeners
    emailInput.addEventListener('input', validateEmail);
    passwordInput.addEventListener('input', validatePassword);
    
    // Enter key support
    passwordInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            loginForm.dispatchEvent(new Event('submit'));
        }
    });
});

// ========================================
// TOGGLE PASSWORD VISIBILITY
// ========================================
togglePasswordBtn.addEventListener('click', function() {
    const type = passwordInput.type === 'password' ? 'text' : 'password';
    passwordInput.type = type;
    const icon = togglePasswordBtn.querySelector('i');
    icon.className = type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
});

// ========================================
// FORM SUBMISSION
// ========================================
loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    clearErrors();
    
    const isEmailValid = validateEmail();
    const isPasswordValid = validatePassword();
    
    if (isEmailValid && isPasswordValid) {
        attemptLogin();
    }
});

// ========================================
// VALIDATE EMAIL
// ========================================
function validateEmail() {
    const email = emailInput.value.trim();
    
    if (!email) {
        showFieldError('email', 'Email is required');
        return false;
    }
    
    if (!Validators.email(email)) {
        showFieldError('email', 'Enter a valid email');
        return false;
    }
    
    clearFieldError('email');
    return true;
}

// ========================================
// VALIDATE PASSWORD
// ========================================
function validatePassword() {
    const password = passwordInput.value;
    
    if (!password) {
        showFieldError('password', 'Password is required');
        return false;
    }
    
    if (!Validators.password(password)) {
        showFieldError('password', 'Password must be at least 6 characters');
        return false;
    }
    
    clearFieldError('password');
    return true;
}

// ========================================
// FIELD ERROR HELPERS
// ========================================
function showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const errorSpan = document.getElementById(fieldId + 'Error');
    
    if (field) field.classList.add('error');
    if (errorSpan) errorSpan.textContent = message;
}

function clearFieldError(fieldId) {
    const field = document.getElementById(fieldId);
    const errorSpan = document.getElementById(fieldId + 'Error');
    
    if (field) field.classList.remove('error');
    if (errorSpan) errorSpan.textContent = '';
}

function clearErrors() {
    clearFieldError('email');
    clearFieldError('password');
    errorContainer.style.display = 'none';
    errorText.textContent = '';
}

function showErrorMessage(message) {
    errorText.textContent = message;
    errorContainer.style.display = 'flex';
    
    setTimeout(function() {
        errorContainer.style.display = 'none';
    }, 5000);
}

// ========================================
// ATTEMPT LOGIN
// ========================================
async function attemptLogin() {
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const rememberMe = rememberMeCheckbox.checked;
    
    if (!email || !password) {
        showErrorMessage('Please fill in all fields');
        return;
    }
    
    try {
        // Show loading
        loginBtn.classList.add('loading');
        loginBtn.disabled = true;
        
        // Call API (from api-config.js)
        const response = await APIService.login(email, password);
        
        if (response.success) {
            // Save user data
            localStorage.setItem('kgl_user', JSON.stringify(response.user));
            localStorage.setItem('kgl_token', response.token);
            
            // Save email if remember me checked
            if (rememberMe) {
                localStorage.setItem('remembered_email', email);
            } else {
                localStorage.removeItem('remembered_email');
            }
            
            // Show success and redirect
            alert('Login successful!');
            redirectToDashboard(response.user.role);
        }
        
    } catch (error) {
        // Hide loading
        loginBtn.classList.remove('loading');
        loginBtn.disabled = false;
        
        console.log('Login error:', error);
        showErrorMessage('Invalid email or password');
        
        // Clear password
        passwordInput.value = '';
        passwordInput.focus();
    }
}

// ========================================
// REDIRECT BASED ON ROLE
// ========================================
function redirectToDashboard(role) {
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