class NavigationManager {
    constructor() {
        this.currentScreen = null;
        this.screens = new Map();
        this.history = [];
        this.container = document.getElementById('app');
        
        // Handle browser back button
        window.addEventListener('popstate', (event) => {
            if (event.state && event.state.screen) {
                this.navigateTo(event.state.screen, event.state.params, true);
            }
        });
    }

    registerScreen(name, screenClass) {
        this.screens.set(name, screenClass);
    }

    async navigateTo(screenName, params = {}, isBackNavigation = false) {
        if (!this.screens.has(screenName)) {
            console.error(`Screen "${screenName}" not registered`);
            return;
        }

        // Hide current screen if exists
        if (this.currentScreen) {
            await this.currentScreen.hide();
            this.currentScreen.destroy();
        }

        // Create and initialize new screen
        const ScreenClass = this.screens.get(screenName);
        const screen = new ScreenClass(this.container, this);
        await screen.init();
        await screen.render(params);
        await screen.show();

        // Update current screen
        this.currentScreen = screen;

        // Update browser history
        if (!isBackNavigation) {
            const state = { screen: screenName, params };
            const url = this.generateUrl(screenName, params);
            history.pushState(state, '', url);
            this.history.push(state);
        }

        // Dispatch navigation event
        this.dispatchNavigationEvent(screenName, params);
    }

    generateUrl(screenName, params) {
        let url = `/${screenName.toLowerCase()}`;
        if (Object.keys(params).length > 0) {
            const queryString = new URLSearchParams(params).toString();
            url += `?${queryString}`;
        }
        return url;
    }

    goBack() {
        if (this.history.length > 1) {
            this.history.pop(); // Remove current state
            const previousState = this.history[this.history.length - 1];
            window.history.back();
            return true;
        }
        return false;
    }

    dispatchNavigationEvent(screenName, params) {
        const event = new CustomEvent('navigation', {
            detail: {
                screen: screenName,
                params: params
            }
        });
        window.dispatchEvent(event);
    }

    getCurrentScreen() {
        return this.currentScreen;
    }

    getScreenHistory() {
        return [...this.history];
    }
}

// Export the NavigationManager
export default NavigationManager; 