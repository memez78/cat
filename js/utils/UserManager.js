// Database schema version
const DB_VERSION = 1;
const DB_NAME = 'CyberCatDB';
const USER_STORE = 'users';
const PROGRESS_STORE = 'progress';

// Initialize IndexedDB
export async function initializeDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;

            // Create users store
            if (!db.objectStoreNames.contains(USER_STORE)) {
                const userStore = db.createObjectStore(USER_STORE, { keyPath: 'id', autoIncrement: true });
                userStore.createIndex('email', 'email', { unique: true });
                userStore.createIndex('username', 'username', { unique: true });
            }

            // Create progress store
            if (!db.objectStoreNames.contains(PROGRESS_STORE)) {
                const progressStore = db.createObjectStore(PROGRESS_STORE, { keyPath: 'userId' });
                progressStore.createIndex('lastUpdated', 'lastUpdated');
            }
        };
    });
}

export class UserManager {
    constructor() {
        this.currentUser = null;
        this.db = null;
        this.init();
    }

    async init() {
        try {
            this.db = await initializeDB();
            await this.loadCurrentUser();
        } catch (error) {
            console.error('Failed to initialize UserManager:', error);
        }
    }

    async loadCurrentUser() {
        const userId = localStorage.getItem('currentUserId');
        if (userId) {
            try {
                this.currentUser = await this.getUserById(parseInt(userId));
            } catch (error) {
                console.error('Failed to load current user:', error);
                localStorage.removeItem('currentUserId');
            }
        }
    }

    async createUser(userData) {
        const { email, username, password, type, age } = userData;

        // Validate required fields
        if (!email || !username || !password) {
            throw new Error('Missing required fields');
        }

        // Hash password (in a real app, use a proper password hashing library)
        const hashedPassword = await this.hashPassword(password);

        const user = {
            email,
            username,
            password: hashedPassword,
            type: type || 'normal',
            age: age || null,
            created: Date.now(),
            lastLogin: Date.now()
        };

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([USER_STORE], 'readwrite');
            const store = transaction.objectStore(USER_STORE);

            const request = store.add(user);

            request.onsuccess = () => {
                user.id = request.result;
                this.currentUser = user;
                localStorage.setItem('currentUserId', user.id);
                this.initializeUserProgress(user.id);
                resolve(user);
            };

            request.onerror = () => {
                reject(new Error('Failed to create user'));
            };
        });
    }

    async loginUser(email, password) {
        const user = await this.getUserByEmail(email);
        
        if (!user) {
            throw new Error('User not found');
        }

        // Verify password (in a real app, use proper password verification)
        const isValid = await this.verifyPassword(password, user.password);
        
        if (!isValid) {
            throw new Error('Invalid password');
        }

        // Update last login
        user.lastLogin = Date.now();
        await this.updateUser(user);

        this.currentUser = user;
        localStorage.setItem('currentUserId', user.id);

        return user;
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUserId');
    }

    async getCurrentUser() {
        return this.currentUser;
    }

    async getUserById(id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([USER_STORE], 'readonly');
            const store = transaction.objectStore(USER_STORE);
            const request = store.get(id);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getUserByEmail(email) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([USER_STORE], 'readonly');
            const store = transaction.objectStore(USER_STORE);
            const index = store.index('email');
            const request = index.get(email);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async updateUser(user) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([USER_STORE], 'readwrite');
            const store = transaction.objectStore(USER_STORE);
            const request = store.put(user);

            request.onsuccess = () => resolve(user);
            request.onerror = () => reject(request.error);
        });
    }

    async deleteUser(id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([USER_STORE, PROGRESS_STORE], 'readwrite');
            const userStore = transaction.objectStore(USER_STORE);
            const progressStore = transaction.objectStore(PROGRESS_STORE);

            // Delete user progress
            progressStore.delete(id);

            // Delete user
            const request = userStore.delete(id);

            request.onsuccess = () => {
                if (this.currentUser && this.currentUser.id === id) {
                    this.logout();
                }
                resolve();
            };

            request.onerror = () => reject(request.error);
        });
    }

    async initializeUserProgress(userId) {
        const progress = {
            userId,
            level: 1,
            xp: 0,
            coins: 0,
            completedMissions: [],
            achievements: [],
            settings: {
                notifications: true,
                sound: true,
                theme: 'light'
            },
            lastUpdated: Date.now()
        };

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([PROGRESS_STORE], 'readwrite');
            const store = transaction.objectStore(PROGRESS_STORE);
            const request = store.add(progress);

            request.onsuccess = () => resolve(progress);
            request.onerror = () => reject(request.error);
        });
    }

    async getUserProgress(userId) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([PROGRESS_STORE], 'readonly');
            const store = transaction.objectStore(PROGRESS_STORE);
            const request = store.get(userId);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async updateUserProgress(userId, updates) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([PROGRESS_STORE], 'readwrite');
            const store = transaction.objectStore(PROGRESS_STORE);
            
            // First get existing progress
            const getRequest = store.get(userId);
            
            getRequest.onsuccess = () => {
                const progress = getRequest.result;
                if (!progress) {
                    reject(new Error('Progress not found'));
                    return;
                }

                // Update progress with new values
                Object.assign(progress, updates, {
                    lastUpdated: Date.now()
                });

                // Save updated progress
                const putRequest = store.put(progress);
                putRequest.onsuccess = () => resolve(progress);
                putRequest.onerror = () => reject(putRequest.error);
            };

            getRequest.onerror = () => reject(getRequest.error);
        });
    }

    // Helper methods for password handling
    // In a real app, use a proper password hashing library
    async hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hash = await crypto.subtle.digest('SHA-256', data);
        return Array.from(new Uint8Array(hash))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    }

    async verifyPassword(password, hashedPassword) {
        const hash = await this.hashPassword(password);
        return hash === hashedPassword;
    }
} 