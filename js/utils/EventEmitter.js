export class EventEmitter {
    constructor() {
        this.events = new Map();
    }

    on(event, callback) {
        if (!this.events.has(event)) {
            this.events.set(event, new Set());
        }
        this.events.get(event).add(callback);
        
        // Return unsubscribe function
        return () => {
            this.events.get(event).delete(callback);
            if (this.events.get(event).size === 0) {
                this.events.delete(event);
            }
        };
    }

    off(event, callback) {
        if (this.events.has(event)) {
            this.events.get(event).delete(callback);
            if (this.events.get(event).size === 0) {
                this.events.delete(event);
            }
        }
    }

    once(event, callback) {
        const onceCallback = (...args) => {
            this.off(event, onceCallback);
            callback.apply(this, args);
        };
        return this.on(event, onceCallback);
    }

    emit(event, ...args) {
        if (this.events.has(event)) {
            for (const callback of this.events.get(event)) {
                try {
                    callback.apply(this, args);
                } catch (error) {
                    console.error(`Error in event handler for ${event}:`, error);
                }
            }
        }
    }

    removeAllListeners(event) {
        if (event) {
            this.events.delete(event);
        } else {
            this.events.clear();
        }
    }

    listenerCount(event) {
        return this.events.has(event) ? this.events.get(event).size : 0;
    }

    listeners(event) {
        return this.events.has(event) ? Array.from(this.events.get(event)) : [];
    }

    eventNames() {
        return Array.from(this.events.keys());
    }
} 