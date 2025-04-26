// Import components
import { WelcomeScreen } from './components/WelcomeScreen.js';
import { AICompanion } from './components/AICompanion.js';
import { UserManager } from './utils/UserManager.js';
import { AuthScreen } from './components/AuthScreen.js';
import { MissionsSystem } from './components/MissionsSystem.js';
import { NavigationManager } from './utils/NavigationManager.js';
import { EventEmitter } from './utils/EventEmitter.js';
import { ErrorBoundary } from './components/ErrorBoundary.js';
import { LoadingScreen } from './components/LoadingScreen.js';
import { StateManager } from './utils/StateManager.js';

export class App {
    constructor() {
        // Initialize core systems
        this.events = new EventEmitter();
        this.state = new StateManager({
            isInitialized: false,
            currentUser: null,
            theme: 'light',
            isOnline: navigator.onLine
        });
        
        // Initialize UI components
        this.mainContainer = document.getElementById('app');
        this.errorBoundary = new ErrorBoundary(this.mainContainer);
        this.loadingScreen = new LoadingScreen(this.mainContainer);
        
        // Initialize managers
        this.navigation = new NavigationManager();
        this.userManager = new UserManager();
        
        // Initialize UI components
        this.welcomeScreen = new WelcomeScreen();
        this.authScreen = new AuthScreen(this.userManager);
        this.missionsSystem = new MissionsSystem();
        this.aiCompanion = null; // Lazy loaded when user logs in
        
        // Bind methods
        this.handleNavigation = this.handleNavigation.bind(this);
        this.handleAuth = this.handleAuth.bind(this);
        this.handleError = this.handleError.bind(this);
        this.handleOnlineStatus = this.handleOnlineStatus.bind(this);
        
        // Initialize app
        this.init().catch(this.handleError);
    }

    async init() {
        try {
            this.loadingScreen.show('Initializing app...');
            
            // Load saved state
            this.state.load();
            
            // Initialize core systems
            await Promise.all([
                this.userManager.init(),
                this.navigation.init(),
                this.missionsSystem.init()
            ]);

            // Setup event listeners
            this.setupEventListeners();

            // Check authentication state
            const currentUser = await this.userManager.getCurrentUser();
            if (currentUser) {
                await this.handleAuth({ type: 'login', user: currentUser });
            } else {
                await this.showAuth();
            }

            // Update state
            this.state.setState({ isInitialized: true });
            this.events.emit('app:ready');
            
            // Hide loading screen
            this.loadingScreen.hide();

        } catch (error) {
            this.handleError(error);
            throw error;
        }
    }

    setupEventListeners() {
        // Authentication events
        window.addEventListener('auth', async (e) => {
            await this.handleAuth(e.detail);
        });

        // Navigation events
        this.navigation.on('navigate', this.handleNavigation);

        // Error events
        window.addEventListener('error', (e) => {
            this.handleError(e.error);
        });

        // Unhandled promise rejections
        window.addEventListener('unhandledrejection', (e) => {
            this.handleError(e.reason);
        });

        // Online/offline events
        window.addEventListener('online', this.handleOnlineStatus);
        window.addEventListener('offline', this.handleOnlineStatus);

        // State changes
        this.state.watch('theme', (newTheme) => {
            document.documentElement.setAttribute('data-theme', newTheme);
        });
    }

    handleOnlineStatus() {
        const isOnline = navigator.onLine;
        this.state.setState({ isOnline });
        
        if (!isOnline) {
            this.showOfflineWarning();
        }
    }

    showOfflineWarning() {
        // Show offline toast notification
        const toast = document.createElement('div');
        toast.classList.add('toast', 'warning');
        toast.textContent = 'You are currently offline. Some features may be limited.';
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    async handleAuth({ type, user }) {
        this.loadingScreen.show('Updating authentication...');
        
        try {
            switch (type) {
                case 'login':
                    // Initialize AI companion with user data
                    this.aiCompanion = new AICompanion(user);
                    this.state.setState({ currentUser: user });
                    await this.showMainApp(user);
                    break;
                    
                case 'logout':
                    this.aiCompanion = null;
                    this.state.setState({ currentUser: null });
                    await this.showAuth();
                    break;
                    
                default:
                    console.warn('Unknown auth event type:', type);
            }
        } catch (error) {
            this.handleError(error);
        } finally {
            this.loadingScreen.hide();
        }
    }

    async handleNavigation({ path, params }) {
        if (!this.state.select('isInitialized')) return;

        const user = this.state.select('currentUser');
        if (!user && path !== '/auth') {
            this.navigation.navigate('/auth');
            return;
        }

        this.loadingScreen.show('Loading...');
        
        try {
            switch (path) {
                case '/':
                case '/missions':
                    await this.showMainApp(user);
                    break;
                case '/auth':
                    await this.showAuth();
                    break;
                case '/game':
                    await this.showGame(params);
                    break;
                case '/training':
                    await this.showTraining();
                    break;
                case '/chat':
                    await this.showChat();
                    break;
                default:
                    this.navigation.navigate('/');
            }
        } catch (error) {
            this.handleError(error);
        } finally {
            this.loadingScreen.hide();
        }
    }

    async showAuth() {
        this.currentScreen = await this.authScreen.init();
        this.mainContainer.innerHTML = '';
        this.mainContainer.appendChild(this.currentScreen);
    }

    async showMainApp(user) {
        // Initialize missions system with user data
        await this.missionsSystem.init(user);

        this.mainContainer.innerHTML = `
            <div class="main-app">
                <header class="app-header">
                    <div class="logo">
                        <img src="assets/images/logo.png" alt="Cyber Cat" class="header-logo">
                        <h1>Cyber Cat</h1>
                    </div>
                    <nav class="nav-menu">
                        <a href="/missions" class="nav-item active">Missions</a>
                        <a href="/training" class="nav-item">Training</a>
                        <a href="/achievements" class="nav-item">Achievements</a>
                        <a href="/shop" class="nav-item">Shop</a>
                        <a href="/chat" class="nav-item">AI Chat</a>
                    </nav>
                    <div class="user-info">
                        <div class="user-profile">
                            <img src="assets/images/cyber_cat.png" alt="Profile" class="profile-avatar">
                            <div class="profile-details">
                                <span class="username">${user.username}</span>
                                <span class="level">Level ${user.progress?.level || 1}</span>
                            </div>
                        </div>
                        <button id="logoutBtn" class="btn-secondary">Logout</button>
                    </div>
                </header>
                
                <main class="app-content">
                    <div class="missions-container">
                        <div class="section-header">
                            <h2>Your Missions</h2>
                            <div class="mission-filters">
                                <button class="btn filter-btn active" data-filter="all">All</button>
                                <button class="btn filter-btn" data-filter="beginner">Beginner</button>
                                <button class="btn filter-btn" data-filter="intermediate">Intermediate</button>
                                <button class="btn filter-btn" data-filter="advanced">Advanced</button>
                            </div>
                        </div>
                        <div id="missionsList" class="missions-grid"></div>
                    </div>
                    
                    <aside class="progress-container">
                        <h2>Your Progress</h2>
                        <div class="progress-stats">
                            <div class="stat-item">
                                <span class="stat-label">Level</span>
                                <span class="stat-value" id="userLevel">1</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">XP</span>
                                <div class="xp-bar">
                                    <div class="xp-fill" style="width: ${this.calculateXPPercentage(user)}%"></div>
                                </div>
                                <span class="stat-value" id="userXP">0</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Coins</span>
                                <span class="stat-value" id="userCoins">0</span>
                            </div>
                        </div>
                        
                        <div class="achievements-preview">
                            <h3>Recent Achievements</h3>
                            <div id="recentAchievements" class="achievements-grid">
                                <!-- Achievements will be loaded dynamically -->
                            </div>
                        </div>
                    </aside>
                </main>
            </div>
        `;

        // Update UI with user data
        this.updateProgressDisplay(user);
        
        // Load and display missions
        const missions = await this.missionsSystem.getMissionsByAgeGroup(user.age);
        this.displayMissions(missions);
        
        // Load recent achievements
        this.loadRecentAchievements(user);
        
        // Setup event handlers
        this.setupMainAppEventListeners();
    }

    calculateXPPercentage(user) {
        const progress = user.progress || { xp: 0, level: 1 };
        const xpForNextLevel = this.missionsSystem.getXPForNextLevel(progress.level);
        return (progress.xp / xpForNextLevel) * 100;
    }

    updateProgressDisplay(user) {
        const progress = user.progress || { level: 1, xp: 0, coins: 0 };
        document.getElementById('userLevel').textContent = progress.level;
        document.getElementById('userXP').textContent = progress.xp;
        document.getElementById('userCoins').textContent = progress.coins;
    }

    displayMissions(missions) {
        const missionsList = document.getElementById('missionsList');
        missionsList.innerHTML = missions.map(mission => `
            <div class="mission-card ${mission.completed ? 'completed' : ''}" data-mission-id="${mission.id}">
                <div class="mission-header">
                    <h3>${mission.title}</h3>
                    <span class="difficulty-badge ${mission.difficulty}">${mission.difficulty}</span>
                </div>
                <p class="mission-description">${mission.description}</p>
                <div class="mission-footer">
                    <div class="mission-rewards">
                        <span class="xp-reward">+${mission.rewards.xp} XP</span>
                        <span class="coins-reward">+${mission.rewards.coins} coins</span>
                    </div>
                    <button class="btn-primary start-mission" ${mission.completed ? 'disabled' : ''}>
                        ${mission.completed ? 'Completed' : 'Start Mission'}
                    </button>
                </div>
            </div>
        `).join('');
    }

    async loadRecentAchievements(user) {
        const achievements = await this.missionsSystem.getRecentAchievements(user.id);
        const container = document.getElementById('recentAchievements');
        
        if (achievements.length === 0) {
            container.innerHTML = `
                <div class="no-achievements">
                    <p>Complete missions to earn achievements!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = achievements.map(achievement => `
            <div class="achievement-card ${achievement.rarity}">
                <img src="assets/images/achievements/${achievement.icon}" alt="${achievement.title}">
                <div class="achievement-info">
                    <h4>${achievement.title}</h4>
                    <p>${achievement.description}</p>
                </div>
            </div>
        `).join('');
    }

    setupMainAppEventListeners() {
        // Handle logout
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', async () => {
                await this.userManager.logout();
                this.events.emit('auth', { type: 'logout' });
            });
        }

        // Handle mission selection
        const missionsList = document.getElementById('missionsList');
        if (missionsList) {
            missionsList.addEventListener('click', async (e) => {
                const missionBtn = e.target.closest('.start-mission');
                if (!missionBtn) return;
                
                const missionCard = missionBtn.closest('.mission-card');
                if (missionCard && !missionCard.classList.contains('completed')) {
                    const missionId = missionCard.dataset.missionId;
                    this.navigation.navigate('/game', { missionId });
                }
            });
        }

        // Handle mission filters
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', async () => {
                // Remove active class from all buttons
                filterBtns.forEach(b => b.classList.remove('active'));
                // Add active class to clicked button
                btn.classList.add('active');
                
                const filter = btn.dataset.filter;
                const user = await this.userManager.getCurrentUser();
                const missions = await this.missionsSystem.getMissionsByFilter(user.age, filter);
                this.displayMissions(missions);
            });
        });

        // Handle navigation menu
        const navLinks = document.querySelectorAll('.nav-item');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const path = link.getAttribute('href');
                this.navigation.navigate(path);
            });
        });
    }

    handleError(error) {
        console.error('Application error:', error);
        
        // Show error in UI
        this.errorBoundary.show(error);
        
        // Hide loading screen if visible
        this.loadingScreen.hide();

        // Emit error event
        this.events.emit('error', error);
    }
}

// Add styles
const styles = `
    .main-app {
        min-height: 100vh;
        background: var(--color-bg);
    }

    .app-header {
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        padding: var(--spacing-md) var(--spacing-lg);
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .logo {
        display: flex;
        align-items: center;
        gap: var(--spacing-md);
    }

    .header-logo {
        width: 40px;
        height: 40px;
    }

    .nav-menu {
        display: flex;
        gap: var(--spacing-md);
    }

    .nav-item {
        color: var(--color-text);
        text-decoration: none;
        padding: var(--spacing-sm) var(--spacing-md);
        border-radius: var(--radius-sm);
        transition: all var(--transition-fast);
    }

    .nav-item:hover {
        background: rgba(255, 255, 255, 0.1);
    }

    .nav-item.active {
        background: var(--color-primary);
        color: white;
    }

    .user-info {
        display: flex;
        align-items: center;
        gap: var(--spacing-md);
    }

    .user-profile {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        padding: var(--spacing-sm);
        background: rgba(255, 255, 255, 0.05);
        border-radius: var(--radius-md);
    }

    .profile-avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
    }

    .profile-details {
        display: flex;
        flex-direction: column;
    }

    .username {
        font-weight: 500;
        color: var(--color-text);
    }

    .level {
        font-size: 0.875rem;
        color: var(--color-primary);
    }

    .app-content {
        display: grid;
        grid-template-columns: 1fr 300px;
        gap: var(--spacing-lg);
        padding: var(--spacing-lg);
        max-width: 1400px;
        margin: 0 auto;
    }

    .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--spacing-lg);
    }

    .mission-filters {
        display: flex;
        gap: var(--spacing-sm);
    }

    .filter-btn {
        background: rgba(255, 255, 255, 0.1);
        color: var(--color-text);
        border: none;
        padding: var(--spacing-sm) var(--spacing-md);
        border-radius: var(--radius-sm);
        cursor: pointer;
        transition: all var(--transition-fast);
    }

    .filter-btn:hover {
        background: rgba(255, 255, 255, 0.2);
    }

    .filter-btn.active {
        background: var(--color-primary);
        color: white;
    }

    .missions-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: var(--spacing-md);
    }

    .mission-card {
        background: rgba(255, 255, 255, 0.05);
        border-radius: var(--radius-md);
        padding: var(--spacing-md);
        transition: transform var(--transition-fast);
    }

    .mission-card:hover {
        transform: translateY(-2px);
    }

    .mission-header {
        display: flex;
        justify-content: space-between;
        align-items: start;
        margin-bottom: var(--spacing-sm);
    }

    .difficulty-badge {
        padding: 4px 8px;
        border-radius: var(--radius-sm);
        font-size: 0.75rem;
        text-transform: uppercase;
    }

    .difficulty-badge.beginner { background: var(--color-success); }
    .difficulty-badge.intermediate { background: var(--color-warning); }
    .difficulty-badge.advanced { background: var(--color-danger); }

    .mission-description {
        color: var(--color-text);
        opacity: 0.8;
        margin-bottom: var(--spacing-md);
    }

    .mission-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .mission-rewards {
        display: flex;
        gap: var(--spacing-sm);
    }

    .xp-reward,
    .coins-reward {
        padding: 4px 8px;
        border-radius: var(--radius-sm);
        font-size: 0.875rem;
        background: rgba(255, 255, 255, 0.1);
    }

    .progress-container {
        background: rgba(255, 255, 255, 0.05);
        border-radius: var(--radius-md);
        padding: var(--spacing-md);
    }

    .progress-stats {
        display: grid;
        gap: var(--spacing-md);
        margin-bottom: var(--spacing-lg);
    }

    .stat-item {
        background: rgba(255, 255, 255, 0.05);
        padding: var(--spacing-md);
        border-radius: var(--radius-sm);
        text-align: center;
    }

    .stat-label {
        display: block;
        color: var(--color-text);
        opacity: 0.8;
        margin-bottom: var(--spacing-xs);
    }

    .stat-value {
        font-size: 1.5rem;
        font-weight: 600;
        color: var(--color-primary);
    }

    .xp-bar {
        height: 4px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: var(--radius-full);
        margin: var(--spacing-xs) 0;
        overflow: hidden;
    }

    .xp-fill {
        height: 100%;
        background: var(--color-primary);
        transition: width var(--transition-normal);
    }

    .achievements-preview {
        margin-top: var(--spacing-lg);
    }

    .achievements-grid {
        display: grid;
        gap: var(--spacing-sm);
        margin-top: var(--spacing-md);
    }

    .achievement-card {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        padding: var(--spacing-sm);
        background: rgba(255, 255, 255, 0.05);
        border-radius: var(--radius-sm);
    }

    .achievement-card img {
        width: 32px;
        height: 32px;
    }

    .achievement-info h4 {
        font-size: 0.875rem;
        margin-bottom: 2px;
    }

    .achievement-info p {
        font-size: 0.75rem;
        opacity: 0.8;
        margin: 0;
    }

    .achievement-card.common { border-left: 2px solid var(--color-success); }
    .achievement-card.rare { border-left: 2px solid var(--color-primary); }
    .achievement-card.epic { border-left: 2px solid var(--color-warning); }
    .achievement-card.legendary { border-left: 2px solid var(--color-danger); }

    .no-achievements {
        text-align: center;
        padding: var(--spacing-md);
        color: var(--color-text);
        opacity: 0.8;
    }

    @media (max-width: 1024px) {
        .app-content {
            grid-template-columns: 1fr;
        }

        .progress-container {
            order: -1;
        }

        .progress-stats {
            grid-template-columns: repeat(3, 1fr);
        }
    }

    @media (max-width: 768px) {
        .app-header {
            flex-direction: column;
            gap: var(--spacing-md);
            padding: var(--spacing-sm);
        }

        .nav-menu {
            width: 100%;
            overflow-x: auto;
            padding-bottom: var(--spacing-xs);
        }

        .nav-item {
            white-space: nowrap;
        }

        .user-info {
            width: 100%;
            justify-content: space-between;
        }

        .missions-grid {
            grid-template-columns: 1fr;
        }

        .progress-stats {
            grid-template-columns: 1fr;
        }
    }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
}); 