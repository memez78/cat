export class ErrorBoundary {
    constructor(container) {
        this.container = container;
        this.element = null;
        this.init();
    }

    init() {
        this.element = document.createElement('div');
        this.element.id = 'errorBoundary';
        this.element.classList.add('error-boundary', 'hidden');
        this.element.innerHTML = `
            <div class="error-content">
                <div class="error-icon">⚠️</div>
                <h2>Oops! Something went wrong</h2>
                <p id="errorMessage"></p>
                <div class="error-actions">
                    <button class="btn btn-primary" onclick="window.location.reload()">Reload App</button>
                    <button class="btn btn-secondary" id="errorDismissBtn">Dismiss</button>
                </div>
            </div>
        `;
        
        this.container.appendChild(this.element);
        this.setupEventListeners();
    }

    setupEventListeners() {
        const dismissBtn = this.element.querySelector('#errorDismissBtn');
        if (dismissBtn) {
            dismissBtn.addEventListener('click', () => this.hide());
        }
    }

    show(error) {
        const messageEl = this.element.querySelector('#errorMessage');
        if (messageEl) {
            messageEl.textContent = error.message || 'An unexpected error occurred';
        }
        this.element.classList.remove('hidden');
    }

    hide() {
        this.element.classList.add('hidden');
    }

    destroy() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }
} 