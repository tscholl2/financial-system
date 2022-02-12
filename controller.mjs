export class Controller {
    constructor(initialState) {
        this.plugins = [];
        this.listeners = [];
        this.getState = () => this.state;
        this.addPlugin = (plugin) => {
            this.plugins.push(plugin);
        };
        this.removePlugin = (plugin) => {
            this.plugins = this.plugins.filter(p => p !== plugin);
        };
        this.addListener = (listener) => {
            this.listeners.push(listener);
        };
        this.removeListener = (listener) => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
        this.dispatch = (reducer) => {
            this.plugins.forEach(p => (reducer = p(reducer)));
            const result = reducer(this.state);
            // important: state should be immutable
            if (this.state !== result) {
                this.state = result;
                this.listeners.forEach(l => l(this.state, this.dispatch));
            }
        };
        this.state = initialState;
    }
}
