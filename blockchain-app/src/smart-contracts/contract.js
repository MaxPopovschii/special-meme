class SmartContract {
    constructor(name, owner) {
        this.name = name;
        this.owner = owner;
        this.state = {};
        this.events = [];
    }

    deploy(initialState) {
        this.state = initialState;
        this.events.push(`Contract ${this.name} deployed by ${this.owner}`);
        return this.state;
    }

    execute(method, ...args) {
        if (typeof this[method] === 'function') {
            const result = this[method](...args);
            this.events.push(`Executed ${method} with args: ${JSON.stringify(args)}`);
            return result;
        } else {
            throw new Error(`Method ${method} does not exist on contract ${this.name}`);
        }
    }

    getEvents() {
        return this.events;
    }

    // Example of a smart contract method
    set(key, value) {
        this.state[key] = value;
        return this.state;
    }

    get(key) {
        return this.state[key];
    }
}

module.exports = SmartContract;