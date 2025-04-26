class WelcomeScreen {
    constructor() {
        this.container = document.createElement('div');
        this.container.className = 'welcome-screen';
        this.currentStep = 'welcome';
        this.userType = null;
        this.init();
    }

    init() {
        this.render();
        this.setupEventListeners();
        this.checkInstallState();
    }

    render() {
        switch (this.currentStep) {
            case 'welcome':
                this.renderWelcome();
                break;
            case 'userType':
                this.renderUserTypeSelection();
                break;
            case 'createAccount':
                this.renderCreateAccount();
                break;
            case 'parentSetup':
                this.renderParentSetup();
                break;
        }
    }

    renderWelcome() {
        this.container.innerHTML = `
            <div class="welcome-content">
                <img src="assets/images/cyber_cat.png" alt="Cyber Cat" class="welcome-logo">
                <h1 class="welcome-title">Welcome to Cyber Cat</h1>
                <p class="welcome-description">Your personal guide to online safety</p>
                <button class="btn primary-btn" id="getStartedBtn">Get Started</button>
                <div class="install-prompt" id="installPrompt" style="display: none;">
                    <p>Install Cyber Cat for the best experience!</p>
                    <button class="btn secondary-btn" id="installBtn">Install Now</button>
                </div>
                <div class="notification-prompt" id="notificationPrompt" style="display: none;">
                    <p>Enable notifications to stay updated!</p>
                    <button class="btn secondary-btn" id="notificationBtn">Enable Notifications</button>
                </div>
            </div>
        `;
    }

    renderUserTypeSelection() {
        this.container.innerHTML = `
            <div class="user-type-selection">
                <h2>Choose Your Path</h2>
                <div class="user-type-options">
                    <div class="user-type-card" data-type="normal">
                        <img src="assets/images/normal-user.png" alt="Normal User">
                        <h3>I'm a User</h3>
                        <p>Learn and play while staying safe online</p>
                    </div>
                    <div class="user-type-card" data-type="parent">
                        <img src="assets/images/parent-user.png" alt="Parent">
                        <h3>I'm a Parent</h3>
                        <p>Set up and monitor your child's online safety</p>
                    </div>
                </div>
            </div>
        `;
    }

    renderCreateAccount() {
        this.container.innerHTML = `
            <div class="create-account">
                <h2>${this.userType === 'parent' ? 'Create Parent Account' : 'Create Your Account'}</h2>
                <form id="createAccountForm" class="account-form">
                    <div class="form-group">
                        <label for="username">Username</label>
                        <input type="text" id="username" required minlength="3" maxlength="20">
                    </div>
                    <div class="form-group">
                        <label for="email">Email</label>
                        <input type="email" id="email" required>
                    </div>
                    <div class="form-group">
                        <label for="password">Password</label>
                        <input type="password" id="password" required minlength="8">
                        <div class="password-strength" id="passwordStrength"></div>
                    </div>
                    ${this.userType === 'normal' ? `
                        <div class="form-group">
                            <label for="age">Age</label>
                            <input type="number" id="age" required min="6" max="99">
                        </div>
                    ` : ''}
                    <button type="submit" class="btn primary-btn">Create Account</button>
                </form>
            </div>
        `;
    }

    renderParentSetup() {
        this.container.innerHTML = `
            <div class="parent-setup">
                <h2>Set Up Child Account</h2>
                <form id="childSetupForm" class="setup-form">
                    <div class="form-group">
                        <label for="childName">Child's Name</label>
                        <input type="text" id="childName" required>
                    </div>
                    <div class="form-group">
                        <label for="childAge">Child's Age</label>
                        <input type="number" id="childAge" required min="6" max="17">
                    </div>
                    <div class="safety-settings">
                        <h3>Safety Settings</h3>
                        <div class="setting-group">
                            <label>
                                <input type="checkbox" id="timeLimit" checked>
                                Enable Time Limits
                            </label>
                            <div class="time-settings" id="timeSettings">
                                <label for="dailyLimit">Daily Limit (hours)</label>
                                <input type="number" id="dailyLimit" value="2" min="0.5" max="8" step="0.5">
                            </div>
                        </div>
                        <div class="setting-group">
                            <label>
                                <input type="checkbox" id="contentFilter" checked>
                                Enable Content Filter
                            </label>
                        </div>
                        <div class="setting-group">
                            <label>
                                <input type="checkbox" id="progressNotifications" checked>
                                Receive Progress Notifications
                            </label>
                        </div>
                    </div>
                    <button type="submit" class="btn primary-btn">Complete Setup</button>
                </form>
            </div>
        `;
    }

    setupEventListeners() {
        this.container.addEventListener('click', (e) => {
            if (e.target.id === 'getStartedBtn') {
                this.currentStep = 'userType';
                this.render();
            } else if (e.target.closest('.user-type-card')) {
                this.userType = e.target.closest('.user-type-card').dataset.type;
                this.currentStep = 'createAccount';
                this.render();
            } else if (e.target.id === 'installBtn') {
                this.promptInstall();
            } else if (e.target.id === 'notificationBtn') {
                this.requestNotificationPermission();
            }
        });

        this.container.addEventListener('submit', (e) => {
            e.preventDefault();
            if (e.target.id === 'createAccountForm') {
                this.handleAccountCreation(e.target);
            } else if (e.target.id === 'childSetupForm') {
                this.handleChildSetup(e.target);
            }
        });
    }

    async checkInstallState() {
        // Check if app can be installed
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            document.getElementById('installPrompt').style.display = 'block';
        });

        // Check notification permission
        if (Notification.permission === 'default') {
            document.getElementById('notificationPrompt').style.display = 'block';
        }
    }

    async promptInstall() {
        if (this.deferredPrompt) {
            this.deferredPrompt.prompt();
            const { outcome } = await this.deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                document.getElementById('installPrompt').style.display = 'none';
            }
            this.deferredPrompt = null;
        }
    }

    async requestNotificationPermission() {
        try {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                document.getElementById('notificationPrompt').style.display = 'none';
                this.showNotification('Welcome to Cyber Cat!', 'You\'ll now receive important safety updates.');
            }
        } catch (error) {
            console.error('Error requesting notification permission:', error);
        }
    }

    showNotification(title, body) {
        if (Notification.permission === 'granted') {
            navigator.serviceWorker.ready.then(registration => {
                registration.showNotification(title, {
                    body,
                    icon: '/assets/images/icon-192.png',
                    badge: '/assets/images/notification-badge.png'
                });
            });
        }
    }

    async handleAccountCreation(form) {
        const formData = new FormData(form);
        const userData = {
            username: formData.get('username'),
            email: formData.get('email'),
            password: formData.get('password'),
            userType: this.userType,
            age: formData.get('age')
        };

        try {
            const response = await fetch('/api/create-account', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            if (response.ok) {
                if (this.userType === 'parent') {
                    this.currentStep = 'parentSetup';
                    this.render();
                } else {
                    this.completeSetup(await response.json());
                }
            } else {
                throw new Error('Account creation failed');
            }
        } catch (error) {
            console.error('Error creating account:', error);
            // Show error message to user
        }
    }

    async handleChildSetup(form) {
        const formData = new FormData(form);
        const childData = {
            name: formData.get('childName'),
            age: formData.get('childAge'),
            settings: {
                timeLimit: formData.get('timeLimit') === 'on',
                dailyLimit: formData.get('dailyLimit'),
                contentFilter: formData.get('contentFilter') === 'on',
                progressNotifications: formData.get('progressNotifications') === 'on'
            }
        };

        try {
            const response = await fetch('/api/create-child-account', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(childData)
            });

            if (response.ok) {
                this.completeSetup(await response.json());
            } else {
                throw new Error('Child account setup failed');
            }
        } catch (error) {
            console.error('Error setting up child account:', error);
            // Show error message to user
        }
    }

    completeSetup(userData) {
        // Store user data
        localStorage.setItem('userData', JSON.stringify(userData));
        
        // Initialize AI companion based on user type and age
        const ai = new AICompanion(userData);
        
        // Redirect to appropriate dashboard
        window.location.href = this.userType === 'parent' ? '/parent-dashboard' : '/dashboard';
    }
}

// Export for use in main app
export default WelcomeScreen; 