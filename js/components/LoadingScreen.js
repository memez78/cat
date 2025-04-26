export class LoadingScreen {
    constructor(container) {
        this.container = container;
        this.element = null;
        this.init();
    }

    init() {
        this.element = document.createElement('div');
        this.element.id = 'loadingScreen';
        this.element.classList.add('loading-screen', 'hidden');
        this.element.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner"></div>
                <p class="loading-text">Loading...</p>
                <div class="loading-progress">
                    <div class="progress-bar">
                        <div class="progress-fill"></div>
                    </div>
                    <span class="progress-text">0%</span>
                </div>
            </div>
        `;
        
        this.container.appendChild(this.element);
    }

    show(message = 'Loading...') {
        this.setMessage(message);
        this.element.classList.remove('hidden');
    }

    hide() {
        this.element.classList.add('hidden');
    }

    setMessage(message) {
        const messageEl = this.element.querySelector('.loading-text');
        if (messageEl) {
            messageEl.textContent = message;
        }
    }

    updateProgress(percent) {
        const fill = this.element.querySelector('.progress-fill');
        const text = this.element.querySelector('.progress-text');
        
        if (fill && text) {
            fill.style.width = `${percent}%`;
            text.textContent = `${Math.round(percent)}%`;
        }
    }

    destroy() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }
} 