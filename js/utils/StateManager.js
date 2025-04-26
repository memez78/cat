import { EventEmitter } from './EventEmitter.js';

export class StateManager extends EventEmitter {
    constructor(initialState = {}) {
        super();
        this.state = new Proxy(initialState, {
            set: (target, property, value) => {
                const oldValue = target[property];
                target[property] = value;
                this.emit('stateChange', { 
                    property, 
                    oldValue, 
                    newValue: value 
                });
                return true;
            }
        });
    }

    setState(updates) {
        Object.entries(updates).forEach(([key, value]) => {
            this.state[key] = value;
        });
    }

    getState() {
        return { ...this.state };
    }

    watch(property, callback) {
        return this.on('stateChange', (change) => {
            if (change.property === property) {
                callback(change.newValue, change.oldValue);
            }
        });
    }

    // Persist state to localStorage
    persist(key = 'app_state') {
        try {
            localStorage.setItem(key, JSON.stringify(this.state));
        } catch (error) {
            console.error('Failed to persist state:', error);
        }
    }

    // Load state from localStorage
    load(key = 'app_state') {
        try {
            const savedState = localStorage.getItem(key);
            if (savedState) {
                this.setState(JSON.parse(savedState));
            }
        } catch (error) {
            console.error('Failed to load state:', error);
        }
    }

    // Reset state to initial values
    reset(initialState = {}) {
        Object.keys(this.state).forEach(key => {
            delete this.state[key];
        });
        this.setState(initialState);
    }

    // Get a specific slice of state
    select(selector) {
        if (typeof selector === 'string') {
            return this.state[selector];
        }
        if (typeof selector === 'function') {
            return selector(this.state);
        }
        return null;
    }
} 