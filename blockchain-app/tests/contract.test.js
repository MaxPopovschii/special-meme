const SmartContract = require('../src/smart-contracts/contract');

describe('SmartContract', () => {
    test('Creates a contract with name and owner', () => {
        const contract = new SmartContract('TestContract', 'owner123');
        expect(contract.name).toBe('TestContract');
        expect(contract.owner).toBe('owner123');
        expect(contract.state).toEqual({});
        expect(contract.events).toEqual([]);
        expect(contract.deployed).toBe(false);
    });

    test('Can deploy a contract with initial state', () => {
        const contract = new SmartContract('TestContract', 'owner123');
        const initialState = { balance: 100, users: [] };
        const state = contract.deploy(initialState);
        
        expect(state).toEqual(initialState);
        expect(contract.state).toEqual(initialState);
        expect(contract.deployed).toBe(true);
        expect(contract.events.length).toBe(1);
        expect(contract.events[0].type).toBe('DEPLOY');
    });

    test('Cannot deploy a contract twice', () => {
        const contract = new SmartContract('TestContract', 'owner123');
        contract.deploy({});
        
        expect(() => contract.deploy({})).toThrow('already deployed');
    });

    test('Cannot execute method on undeployed contract', () => {
        const contract = new SmartContract('TestContract', 'owner123');
        
        expect(() => contract.execute('set', 'caller', 'key', 'value')).toThrow('not deployed');
    });

    test('Can set and get values', () => {
        const contract = new SmartContract('TestContract', 'owner123');
        contract.deploy({});
        
        contract.execute('set', 'owner123', 'key1', 'value1');
        expect(contract.get('key1')).toBe('value1');
        
        contract.execute('set', 'owner123', 'key2', 42);
        expect(contract.get('key2')).toBe(42);
    });

    test('Execute method logs events with caller', () => {
        const contract = new SmartContract('TestContract', 'owner123');
        contract.deploy({});
        
        contract.execute('set', 'caller123', 'test', 'data');
        
        expect(contract.events.length).toBe(2); // deploy + execute
        expect(contract.events[1].type).toBe('EXECUTE');
        expect(contract.events[1].caller).toBe('caller123');
    });

    test('Execute throws error for non-existent method', () => {
        const contract = new SmartContract('TestContract', 'owner123');
        contract.deploy({});
        
        expect(() => {
            contract.execute('nonExistentMethod', 'caller');
        }).toThrow('Method nonExistentMethod does not exist');
    });

    test('Can set and check permissions', () => {
        const contract = new SmartContract('TestContract', 'owner123');
        contract.deploy({});
        
        contract.setPermission('set', ['user1', 'user2']);
        
        // Allowed users can execute
        expect(() => contract.execute('set', 'user1', 'key', 'value')).not.toThrow();
        
        // Owner can always execute
        expect(() => contract.execute('set', 'owner123', 'key', 'value')).not.toThrow();
        
        // Unauthorized user cannot execute
        expect(() => contract.execute('set', 'user3', 'key', 'value')).toThrow('does not have permission');
    });

    test('Can increment and decrement numeric values', () => {
        const contract = new SmartContract('TestContract', 'owner123');
        contract.deploy({ counter: 10 });
        
        const result1 = contract.execute('increment', 'owner123', 'counter');
        expect(result1).toBe(11);
        
        const result2 = contract.execute('decrement', 'owner123', 'counter');
        expect(result2).toBe(10);
    });

    test('Cannot increment/decrement non-numeric values', () => {
        const contract = new SmartContract('TestContract', 'owner123');
        contract.deploy({ text: 'hello' });
        
        expect(() => contract.execute('increment', 'owner123', 'text')).toThrow('Cannot increment non-numeric value');
    });

    test('Transfer method updates balances correctly', () => {
        const contract = new SmartContract('TestContract', 'owner123');
        contract.deploy({ balances: { alice: 100, bob: 50 } });
        
        const result = contract.execute('transfer', 'owner123', 'alice', 'bob', 30);
        
        expect(result.from).toBe('alice');
        expect(result.to).toBe('bob');
        expect(result.amount).toBe(30);
        expect(contract.state.balances.alice).toBe(70);
        expect(contract.state.balances.bob).toBe(80);
    });

    test('Transfer fails with insufficient balance', () => {
        const contract = new SmartContract('TestContract', 'owner123');
        contract.deploy({ balances: { alice: 10 } });
        
        expect(() => contract.execute('transfer', 'owner123', 'alice', 'bob', 20))
            .toThrow('Insufficient balance');
    });

    test('Can validate state schema', () => {
        const contract = new SmartContract('TestContract', 'owner123');
        contract.deploy({ name: 'Test', count: 42 });
        
        const schema = {
            name: { required: true, type: 'string' },
            count: { required: true, type: 'number' }
        };
        
        expect(() => contract.validateState(schema)).not.toThrow();
    });

    test('State validation fails for missing required fields', () => {
        const contract = new SmartContract('TestContract', 'owner123');
        contract.deploy({ name: 'Test' });
        
        const schema = {
            name: { required: true, type: 'string' },
            count: { required: true, type: 'number' }
        };
        
        expect(() => contract.validateState(schema)).toThrow('Required state key count is missing');
    });

    test('getState returns a copy of state', () => {
        const contract = new SmartContract('TestContract', 'owner123');
        contract.deploy({ value: 100 });
        
        const state = contract.getState();
        state.value = 200;
        
        expect(contract.state.value).toBe(100); // Original unchanged
    });
});

