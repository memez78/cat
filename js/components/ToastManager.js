export class ToastManager {
    constructor() {
        this.container = null;
        this.init();
    }

    init() {
        this.container = document.createElement('div');
        this.container.classList.add('toast-container');
        document.body.appendChild(this.container);
    }

    show(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.classList.add('toast', `toast-${type}`);
        toast.innerHTML = `
            <div class="toast-content">
                <span class="toast-message">${message}</span>
                <button class="toast-close">×</button>
            </div>
        `;

        // Add to container
        this.container.appendChild(toast);

        // Setup close button
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => this.dismiss(toast));

        // Animate in
        requestAnimationFrame(() => {
            toast.classList.add('toast-visible');
        });

        // Auto dismiss
        if (duration > 0) {
            setTimeout(() => {
                this.dismiss(toast);
            }, duration);
        }

        return toast;
    }

    success(message, duration) {
        return this.show(message, 'success', duration);
    }

    error(message, duration) {
        return this.show(message, 'error', duration);
    }

    warning(message, duration) {
        return this.show(message, 'warning', duration);
    }

    info(message, duration) {
        return this.show(message, 'info', duration);
    }

    dismiss(toast) {
        toast.classList.remove('toast-visible');
        toast.addEventListener('transitionend', () => {
            toast.remove();
        });
    }

    dismissAll() {
        const toasts = this.container.querySelectorAll('.toast');
        toasts.forEach(toast => this.dismiss(toast));
    }
} 