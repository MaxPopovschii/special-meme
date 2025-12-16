class SmartContract {
    constructor(name, owner) {
        this.name = name;
        this.owner = owner;
        this.state = {};
        this.events = [];
        this.deployed = false;
        this.permissions = {}; // Map of method -> allowed addresses
    }

    deploy(initialState) {
        if (this.deployed) {
            throw new Error(`Contract ${this.name} is already deployed`);
        }
        this.state = initialState;
        this.deployed = true;
        this.events.push({
            type: 'DEPLOY',
            timestamp: Date.now(),
            message: `Contract ${this.name} deployed by ${this.owner}`
        });
        return this.state;
    }

    execute(method, caller, ...args) {
        if (!this.deployed) {
            throw new Error(`Contract ${this.name} is not deployed`);
        }

        // Check permissions
        if (this.permissions[method]) {
            if (!this.permissions[method].includes(caller) && caller !== this.owner) {
                throw new Error(`Caller ${caller} does not have permission to execute ${method}`);
            }
        }

        if (typeof this[method] === 'function') {
            const result = this[method](...args);
            this.events.push({
                type: 'EXECUTE',
                timestamp: Date.now(),
                method,
                caller,
                args: JSON.stringify(args),
                message: `Executed ${method} with args: ${JSON.stringify(args)}`
            });
            return result;
        } else {
            throw new Error(`Method ${method} does not exist on contract ${this.name}`);
        }
    }

    setPermission(method, addresses) {
        if (!Array.isArray(addresses)) {
            addresses = [addresses];
        }
        this.permissions[method] = addresses;
        this.events.push({
            type: 'PERMISSION',
            timestamp: Date.now(),
            message: `Permission set for ${method}: ${addresses.join(', ')}`
        });
    }

    getEvents() {
        return this.events;
    }

    getState() {
        return { ...this.state };
    }

    validateState(schema) {
        // Simple state validation
        for (const key in schema) {
            if (schema[key].required && !(key in this.state)) {
                throw new Error(`Required state key ${key} is missing`);
            }
            if (key in this.state && schema[key].type) {
                const actualType = typeof this.state[key];
                if (actualType !== schema[key].type) {
                    throw new Error(`State key ${key} has type ${actualType}, expected ${schema[key].type}`);
                }
            }
        }
        return true;
    }

    // Example contract methods
    set(key, value) {
        this.state[key] = value;
        return this.state;
    }

    get(key) {
        return this.state[key];
    }

    increment(key) {
        if (typeof this.state[key] !== 'number') {
            throw new Error(`Cannot increment non-numeric value at key ${key}`);
        }
        this.state[key]++;
        return this.state[key];
    }

    decrement(key) {
        if (typeof this.state[key] !== 'number') {
            throw new Error(`Cannot decrement non-numeric value at key ${key}`);
        }
        this.state[key]--;
        return this.state[key];
    }

    transfer(from, to, amount) {
        if (!this.state.balances) {
            this.state.balances = {};
        }
        
        const balances = this.state.balances;
        
        if (!balances[from] || balances[from] < amount) {
            throw new Error(`Insufficient balance for ${from}`);
        }
        
        balances[from] -= amount;
        balances[to] = (balances[to] || 0) + amount;
        
        return { from, to, amount, newBalances: { ...balances } };
    }
}

module.exports = SmartContract;