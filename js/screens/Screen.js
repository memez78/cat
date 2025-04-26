/**
 * Base Screen class that provides common functionality for all screens
 */
class Screen {
    constructor(options = {}) {
        this.element = null;
        this.isVisible = false;
        this.options = options;
        this.eventListeners = new Map();
    }

    /**
     * Initialize the screen
     * @param {HTMLElement} container - The container element
     */
    init(container) {
        this.element = this.createElement();
        container.appendChild(this.element);
        this.setupEventListeners();
        this.hide();
    }

    /**
     * Create the screen element
     * @returns {HTMLElement}
     */
    createElement() {
        const element = document.createElement('div');
        element.classList.add('screen');
        return element;
    }

    /**
     * Set up event listeners for the screen
     */
    setupEventListeners() {
        // Override in child classes
    }

    /**
     * Show the screen
     */
    show() {
        this.element.classList.remove('screen-hidden');
        this.isVisible = true;
        this.onShow();
    }

    /**
     * Hide the screen
     */
    hide() {
        this.element.classList.add('screen-hidden');
        this.isVisible = false;
        this.onHide();
    }

    /**
     * Called when the screen is shown
     */
    onShow() {
        // Override in child classes
    }

    /**
     * Called when the screen is hidden
     */
    onHide() {
        // Override in child classes
    }

    /**
     * Get the screen element
     * @returns {HTMLElement}
     */
    getElement() {
        return this.element;
    }

    /**
     * Add an event listener to the screen
     * @param {string} event - The event name
     * @param {Function} callback - The event callback
     * @param {Object} options - Event listener options
     */
    addEventListener(event, callback, options = {}) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, new Set());
        }
        this.eventListeners.get(event).add({ callback, options });
        this.element.addEventListener(event, callback, options);
    }

    /**
     * Remove an event listener from the screen
     * @param {string} event - The event name
     * @param {Function} callback - The event callback
     * @param {Object} options - Event listener options
     */
    removeEventListener(event, callback, options = {}) {
        const listeners = this.eventListeners.get(event);
        if (listeners) {
            listeners.delete({ callback, options });
            this.element.removeEventListener(event, callback, options);
        }
    }

    /**
     * Remove all event listeners for a specific event
     * @param {string} event - The event name
     */
    removeAllEventListeners(event) {
        const listeners = this.eventListeners.get(event);
        if (listeners) {
            listeners.forEach(({ callback, options }) => {
                this.element.removeEventListener(event, callback, options);
            });
            this.eventListeners.delete(event);
        }
    }

    /**
     * Set screen content
     * @param {string|HTMLElement} content - The content to set
     */
    setContent(content) {
        if (typeof content === 'string') {
            this.element.innerHTML = content;
        } else if (content instanceof HTMLElement) {
            this.element.innerHTML = '';
            this.element.appendChild(content);
        }
    }

    /**
     * Show loading state
     */
    showLoading() {
        this.element.classList.add('screen-loading');
    }

    /**
     * Hide loading state
     */
    hideLoading() {
        this.element.classList.remove('screen-loading');
    }

    /**
     * Clean up the screen
     */
    destroy() {
        // Remove all event listeners
        this.eventListeners.forEach((listeners, event) => {
            this.removeAllEventListeners(event);
        });
        this.eventListeners.clear();

        // Remove the element from DOM
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
        this.element = null;
    }
}

export default Screen; 