class NavigationManager {
    constructor() {
        this.screens = new Map();
        this.currentScreen = null;
        this.history = [];
        this.isNavigating = false;
        this.container = null;
        this.defaultRoute = '/';

        // Bind methods
        this.handlePopState = this.handlePopState.bind(this);
        this.handleScreenTransitionEnd = this.handleScreenTransitionEnd.bind(this);
    }

    /**
     * Initialize the navigation manager
     * @param {HTMLElement} container - The container element for screens
     */
    init(container) {
        this.container = container;
        window.addEventListener('popstate', this.handlePopState);
        this.setupInitialRoute();
    }

    /**
     * Register a screen with the navigation manager
     * @param {string} route - The route path for the screen
     * @param {typeof Screen} ScreenClass - The screen class to instantiate
     * @param {Object} options - Additional options for the screen
     */
    registerScreen(route, ScreenClass, options = {}) {
        if (this.screens.has(route)) {
            console.warn(`Screen for route ${route} is already registered`);
            return;
        }

        const screen = new ScreenClass(options);
        screen.init(this.container);
        this.screens.set(route, { screen, options });
    }

    /**
     * Navigate to a specific route
     * @param {string} route - The route to navigate to
     * @param {Object} params - Parameters to pass to the screen
     * @param {Object} options - Navigation options
     * @returns {Promise<void>}
     */
    async navigate(route, params = {}, options = {}) {
        if (this.isNavigating) return;
        this.isNavigating = true;

        const screenData = this.screens.get(route);
        if (!screenData) {
            console.error(`No screen registered for route: ${route}`);
            this.isNavigating = false;
            return;
        }

        try {
            const { screen } = screenData;
            const direction = options.isBack ? 'back' : 'forward';

            // Update URL and history
            if (!options.isBack) {
                const url = this.createUrl(route, params);
                window.history.pushState({ route, params }, '', url);
                this.history.push({ route, params });
            }

            // Transition screens
            await this.transitionScreens(screen, direction);

            // Update current screen
            this.currentScreen = screen;

            // Dispatch navigation event
            this.dispatchNavigationEvent(route, params);
        } catch (error) {
            console.error('Navigation failed:', error);
        } finally {
            this.isNavigating = false;
        }
    }

    /**
     * Handle browser back/forward navigation
     * @param {PopStateEvent} event 
     */
    async handlePopState(event) {
        if (!event.state) return;

        const { route, params } = event.state;
        await this.navigate(route, params, { isBack: true });
    }

    /**
     * Create a URL from a route and parameters
     * @param {string} route 
     * @param {Object} params 
     * @returns {string}
     */
    createUrl(route, params) {
        const url = new URL(window.location.origin + route);
        Object.entries(params).forEach(([key, value]) => {
            url.searchParams.append(key, value);
        });
        return url.toString();
    }

    /**
     * Handle screen transitions
     * @param {Screen} newScreen 
     * @param {string} direction 
     * @returns {Promise<void>}
     */
    async transitionScreens(newScreen, direction) {
        return new Promise((resolve) => {
            if (!this.currentScreen) {
                newScreen.show();
                resolve();
                return;
            }

            const currentElement = this.currentScreen.getElement();
            const newElement = newScreen.getElement();

            // Set up transition classes
            const exitClass = direction === 'forward' ? 'screen-exit' : 'screen-back-exit';
            const enterClass = direction === 'forward' ? 'screen-enter' : 'screen-back-enter';

            // Show new screen
            newScreen.show();
            newElement.classList.add(enterClass);

            // Add exit animation to current screen
            currentElement.classList.add(exitClass);

            // Listen for transition end
            const handleTransitionEnd = () => {
                currentElement.removeEventListener('animationend', handleTransitionEnd);
                this.currentScreen.hide();
                currentElement.classList.remove(exitClass);
                newElement.classList.remove(enterClass);
                resolve();
            };

            currentElement.addEventListener('animationend', handleTransitionEnd);
        });
    }

    /**
     * Set up the initial route based on current URL
     */
    setupInitialRoute() {
        const path = window.location.pathname || this.defaultRoute;
        const params = Object.fromEntries(new URLSearchParams(window.location.search));
        
        this.navigate(path, params).catch(error => {
            console.error('Failed to set up initial route:', error);
            if (path !== this.defaultRoute) {
                this.navigate(this.defaultRoute).catch(console.error);
            }
        });
    }

    /**
     * Navigate back to the previous screen
     * @returns {Promise<void>}
     */
    async back() {
        if (this.history.length > 1) {
            window.history.back();
        }
    }

    /**
     * Dispatch a navigation event
     * @param {string} route 
     * @param {Object} params 
     */
    dispatchNavigationEvent(route, params) {
        const event = new CustomEvent('navigation', {
            detail: { route, params }
        });
        window.dispatchEvent(event);
    }

    /**
     * Clean up the navigation manager
     */
    destroy() {
        window.removeEventListener('popstate', this.handlePopState);
        this.screens.forEach(({ screen }) => screen.destroy());
        this.screens.clear();
        this.history = [];
        this.currentScreen = null;
    }
}

export default NavigationManager; 