import { EventEmitter } from './EventEmitter.js';

export class NavigationManager extends EventEmitter {
    constructor() {
        super();
        this.currentPath = window.location.pathname;
        this.routes = new Map();
        this.isInitialized = false;
    }

    async init() {
        if (this.isInitialized) return;

        // Handle browser back/forward buttons
        window.addEventListener('popstate', (e) => {
            this.handleNavigation(window.location.pathname, e.state);
        });

        // Handle initial route
        await this.handleNavigation(this.currentPath);
        this.isInitialized = true;
    }

    registerRoute(path, handler) {
        this.routes.set(path, handler);
    }

    async navigate(path, params = {}, replace = false) {
        // Don't navigate to the same path
        if (path === this.currentPath && !params) return;

        // Update browser history
        const state = { path, params };
        const url = this.buildUrl(path, params);

        if (replace) {
            window.history.replaceState(state, '', url);
        } else {
            window.history.pushState(state, '', url);
        }

        await this.handleNavigation(path, params);
    }

    async handleNavigation(path, params = {}) {
        this.currentPath = path;

        // Find matching route handler
        const handler = this.routes.get(path);
        if (handler) {
            try {
                await handler(params);
            } catch (error) {
                console.error('Navigation error:', error);
                this.emit('error', error);
            }
        }

        // Emit navigation event
        this.emit('navigate', { path, params });
    }

    buildUrl(path, params = {}) {
        const url = new URL(path, window.location.origin);
        
        // Add query parameters
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                url.searchParams.append(key, value);
            }
        });

        return url.pathname + url.search;
    }

    parseUrl(url) {
        const parsedUrl = new URL(url, window.location.origin);
        const params = {};

        // Parse query parameters
        parsedUrl.searchParams.forEach((value, key) => {
            params[key] = value;
        });

        return {
            path: parsedUrl.pathname,
            params
        };
    }

    getCurrentPath() {
        return this.currentPath;
    }

    getQueryParams() {
        return this.parseUrl(window.location.href).params;
    }

    back() {
        window.history.back();
    }

    forward() {
        window.history.forward();
    }
} 