import { UserManager } from '../utils/UserManager.js';

export class AuthScreen {
    constructor() {
        this.userManager = new UserManager();
        this.container = null;
        this.currentView = 'login'; // 'login' or 'register'
    }

    async init() {
        this.container = document.createElement('div');
        this.container.className = 'auth-screen';
        this.render();
        this.attachEventListeners();
        return this.container;
    }

    render() {
        this.container.innerHTML = `
            <div class="auth-container">
                <div class="auth-header">
                    <img src="assets/images/logo.png" alt="Cyber Cat" class="auth-logo">
                    <h1>Welcome to Cyber Cat</h1>
                </div>
                
                <div class="auth-tabs">
                    <button class="tab-btn ${this.currentView === 'login' ? 'active' : ''}" data-view="login">Login</button>
                    <button class="tab-btn ${this.currentView === 'register' ? 'active' : ''}" data-view="register">Register</button>
                </div>

                <div class="auth-form ${this.currentView === 'login' ? 'active' : ''}">
                    ${this.currentView === 'login' ? this.renderLoginForm() : this.renderRegisterForm()}
                </div>

                <div class="auth-message" style="display: none;"></div>
            </div>
        `;
    }

    renderLoginForm() {
        return `
            <form id="loginForm">
                <div class="form-group">
                    <label for="loginEmail">Email</label>
                    <input type="email" id="loginEmail" required>
                </div>
                <div class="form-group">
                    <label for="loginPassword">Password</label>
                    <input type="password" id="loginPassword" required>
                </div>
                <button type="submit" class="btn-primary">Login</button>
            </form>
        `;
    }

    renderRegisterForm() {
        return `
            <form id="registerForm">
                <div class="form-group">
                    <label for="registerUsername">Username</label>
                    <input type="text" id="registerUsername" required>
                </div>
                <div class="form-group">
                    <label for="registerEmail">Email</label>
                    <input type="email" id="registerEmail" required>
                </div>
                <div class="form-group">
                    <label for="registerPassword">Password</label>
                    <input type="password" id="registerPassword" required minlength="8">
                </div>
                <div class="form-group">
                    <label for="registerAge">Age</label>
                    <input type="number" id="registerAge" required min="1" max="120">
                </div>
                <button type="submit" class="btn-primary">Create Account</button>
            </form>
        `;
    }

    attachEventListeners() {
        // Tab switching
        this.container.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.currentView = e.target.dataset.view;
                this.render();
                this.attachEventListeners();
            });
        });

        // Form submissions
        const loginForm = this.container.querySelector('#loginForm');
        const registerForm = this.container.querySelector('#registerForm');

        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        try {
            const user = await this.userManager.loginUser(email, password);
            this.showMessage('Login successful!', 'success');
            this.dispatchAuthEvent('login', user);
        } catch (error) {
            this.showMessage(error.message, 'error');
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        const userData = {
            username: document.getElementById('registerUsername').value,
            email: document.getElementById('registerEmail').value,
            password: document.getElementById('registerPassword').value,
            age: parseInt(document.getElementById('registerAge').value),
            type: 'normal'
        };

        try {
            const user = await this.userManager.createUser(userData);
            this.showMessage('Registration successful! Please log in.', 'success');
            this.currentView = 'login';
            this.render();
            this.attachEventListeners();
        } catch (error) {
            this.showMessage(error.message, 'error');
        }
    }

    showMessage(message, type = 'info') {
        const messageEl = this.container.querySelector('.auth-message');
        messageEl.textContent = message;
        messageEl.className = `auth-message ${type}`;
        messageEl.style.display = 'block';

        setTimeout(() => {
            messageEl.style.display = 'none';
        }, 5000);
    }

    dispatchAuthEvent(type, user) {
        const event = new CustomEvent('auth', {
            detail: { type, user }
        });
        window.dispatchEvent(event);
    }
}

// Add styles
const styles = `
    .auth-screen {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
        padding: 20px;
    }

    .auth-container {
        background: white;
        border-radius: 10px;
        padding: 30px;
        width: 100%;
        max-width: 400px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .auth-header {
        text-align: center;
        margin-bottom: 30px;
    }

    .auth-logo {
        width: 100px;
        height: 100px;
        margin-bottom: 15px;
    }

    .auth-tabs {
        display: flex;
        margin-bottom: 20px;
        border-bottom: 2px solid #eee;
    }

    .tab-btn {
        flex: 1;
        padding: 10px;
        border: none;
        background: none;
        font-size: 16px;
        cursor: pointer;
        transition: all 0.3s ease;
    }

    .tab-btn.active {
        color: #007bff;
        border-bottom: 2px solid #007bff;
        margin-bottom: -2px;
    }

    .form-group {
        margin-bottom: 20px;
    }

    .form-group label {
        display: block;
        margin-bottom: 5px;
        color: #666;
    }

    .form-group input {
        width: 100%;
        padding: 8px 12px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 14px;
    }

    .btn-primary {
        width: 100%;
        padding: 12px;
        background: #007bff;
        color: white;
        border: none;
        border-radius: 4px;
        font-size: 16px;
        cursor: pointer;
        transition: background 0.3s ease;
    }

    .btn-primary:hover {
        background: #0056b3;
    }

    .auth-message {
        margin-top: 20px;
        padding: 10px;
        border-radius: 4px;
        text-align: center;
    }

    .auth-message.success {
        background: #d4edda;
        color: #155724;
    }

    .auth-message.error {
        background: #f8d7da;
        color: #721c24;
    }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = styles;
document.head.appendChild(styleSheet); 