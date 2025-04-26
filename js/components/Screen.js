class Screen {
    constructor(container, navigationManager) {
        this.container = container;
        this.navigationManager = navigationManager;
        this.element = null;
        this.isVisible = false;
        this.eventListeners = new Map();
    }

    async init() {
        this.element = document.createElement('div');
        this.element.classList.add('screen');
        this.container.appendChild(this.element);
    }

    async render(params = {}) {
        // To be implemented by child classes
        throw new Error('render() method must be implemented by child class');
    }

    async show() {
        if (this.element) {
            this.element.style.display = 'block';
            this.element.classList.add('screen-visible');
            this.isVisible = true;
            await this.onShow();
        }
    }

    async hide() {
        if (this.element) {
            this.element.classList.remove('screen-visible');
            this.element.style.display = 'none';
            this.isVisible = false;
            await this.onHide();
        }
    }

    destroy() {
        // Remove all event listeners
        this.eventListeners.forEach((listener, element) => {
            element.removeEventListener(listener.type, listener.callback);
        });
        this.eventListeners.clear();

        // Remove the element from DOM
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }

        this.element = null;
    }

    // Protected methods for child classes
    async onShow() {
        // Optional hook for child classes
    }

    async onHide() {
        // Optional hook for child classes
    }

    // Utility methods
    addEventListener(element, type, callback, options = {}) {
        element.addEventListener(type, callback, options);
        this.eventListeners.set(element, { type, callback });
    }

    removeEventListener(element) {
        const listener = this.eventListeners.get(element);
        if (listener) {
            element.removeEventListener(listener.type, listener.callback);
            this.eventListeners.delete(element);
        }
    }

    setContent(html) {
        if (this.element) {
            this.element.innerHTML = html;
        }
    }

    appendContent(html) {
        if (this.element) {
            this.element.insertAdjacentHTML('beforeend', html);
        }
    }

    querySelector(selector) {
        return this.element ? this.element.querySelector(selector) : null;
    }

    querySelectorAll(selector) {
        return this.element ? this.element.querySelectorAll(selector) : [];
    }

    addClass(className) {
        this.element?.classList.add(className);
    }

    removeClass(className) {
        this.element?.classList.remove(className);
    }

    toggleClass(className) {
        this.element?.classList.toggle(className);
    }

    // Animation helpers
    async fadeIn(duration = 300) {
        if (!this.element) return;
        
        this.element.style.opacity = '0';
        this.element.style.display = 'block';
        
        await new Promise(resolve => {
            requestAnimationFrame(() => {
                this.element.style.transition = `opacity ${duration}ms ease-in-out`;
                this.element.style.opacity = '1';
                setTimeout(resolve, duration);
            });
        });
    }

    async fadeOut(duration = 300) {
        if (!this.element) return;
        
        this.element.style.opacity = '1';
        
        await new Promise(resolve => {
            this.element.style.transition = `opacity ${duration}ms ease-in-out`;
            this.element.style.opacity = '0';
            setTimeout(() => {
                this.element.style.display = 'none';
                resolve();
            }, duration);
        });
    }
}

export default Screen; 