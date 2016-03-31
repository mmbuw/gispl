class Vector {
    
    constructor(x, y) {
        this.exceptions = Object.freeze({
            ILLEGAL_COORDINATES: 'Initializing a vector with incorrect coordinates',
            ILLEGAL_ADD: 'Adding to a vector with a non-vector value',
            ILLEGAL_SCALAR: 'Multiplying a vector with a non-scalar value',
            INVALID_VECTOR: 'Invalid vector'
        });
        this.x = x;
        this.y = y;
    }
    
    validVector(x, y) {
        return (typeof x === 'number' &&
                    typeof y === 'number');
    }

    validScalar(value) {
        if (typeof value !== 'number') {
            throw new Error(`${this.exceptions.ILLEGAL_SCALAR}. Instead using: ${value}`);
        }
    }
    add(vectorToAdd = {}) {
        let {x, y} = vectorToAdd;

        if (!this.validVector(x, y)) {
            throw new Error(`${this.exceptions.ILLEGAL_ADD}.
                                Instead using: ${vectorToAdd}`);
        }
        this.x += x;
        this.y += y;
        return this;
    }
    scaleWith(value) {
        return this.scaleX(value)
                    .scaleY(value);
    }
    scaleX(value) {
        this.validScalar(value);
        this.x *= value;
        return this;
    }
    scaleY(value) {
        this.validScalar(value);
        this.y *= value;
        return this;
    }
    length() {
        return Math.sqrt(
            Math.pow(this.x, 2) + Math.pow(this.y, 2)
        );
    }
    dot(withVector = {}) {
        let {x, y} = withVector;
        if (!this.validVector(x, y)) {
            throw new Error(`${this.exceptions.INVALID_VECTOR}.
                                Expecting {x: Number, y: Number}.
                                Received ${typeof x} ${typeof y}`);
        }
        return this.x * x + this.y * y;
    }
    setCoordinates(x = 0, y = 0) {
        if (!this.validVector(x, y)) {
            throw new Error(`${this.exceptions.ILLEGAL_COORDINATES}.
                                Expecting {x: Number, y: Number}.
                                Received ${typeof x} ${typeof y}`);
        }
        this.x = x;
        this.y = y;
        return this;
    }
}

let vectorPool = [],
    usedVectors = 0;
// needs to be fixed
const vectorPoolSize = 100;
        
for (let i = 0; i < vectorPoolSize; i += 1) {
    vectorPool.push(new Vector());
}

export function vector(x = 0, y = 0) {
    
    if (usedVectors === vectorPoolSize) {
        usedVectors = 0;
    }
    
    let vectorObject = vectorPool[usedVectors];
    
    vectorObject.setCoordinates(x, y);
    usedVectors += 1;
    
    return vectorObject;
}