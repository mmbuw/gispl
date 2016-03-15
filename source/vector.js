let vectorPool = [],
    usedVectors = 0;
const vectorPoolSize = 100;
        
for (let i = 0; i < vectorPoolSize; i += 1) {
    vectorPool.push(vectorConstructor());
}

export function vector(params = {}) {
    
    let {x = 0, y = 0} = params;

    if (!validVector(x, y)) {
        throw new Error(`${vectorException.ILLEGAL_COORDINATES}.
                            Instead using ${params}`);
    }
    
    if (usedVectors === vectorPoolSize) {
        usedVectors = 0;
    }
    
    let vectorObject = vectorPool[usedVectors];
    
    vectorObject.setCoordinates(params);
    usedVectors += 1;
    
    return vectorObject;
}

function vectorConstructor(params = {}) {
    let {x:_x = 0,
            y:_y = 0} = params;
    
    let vectorApi = {
        add(vectorToAdd = {}) {
            let {x, y} = vectorToAdd;

            if (!validVector(x, y)) {
                throw new Error(`${vectorException.ILLEGAL_ADD}.
                                    Instead using: ${vectorToAdd}`);
            }
            _x += x;
            _y += y;
            return this;
        },
        scaleWith(value) {
            return this.scaleX(value)
                        .scaleY(value);
        },
        scaleX(value) {
            validScalar(value);
            _x *= value;
            return this;
        },
        scaleY(value) {
            validScalar(value);
            _y *= value;
            return this;
        },
        length() {
            return Math.sqrt(
                Math.pow(_x, 2) + Math.pow(_y, 2)
            );
        },
        dot(withVector = {}) {
            let {x, y} = withVector;
            if (!validVector(x, y)) {
                throw new Error(`${vectorException.INVALID_VECTOR}.
                                    Expecting {x: Number, y: Number}.
                                    Received ${typeof x} ${typeof y}`);
            }
            return _x * x + _y * y;
        },
        setCoordinates(toValues = {}) {
            let {x = 0, y = 0} = toValues;
            _x = x;
            _y = y;
            return this;
        }
    };
    
    return Object.defineProperties(vectorApi, {
        x: gettableEnumerableProperty(function getX() {
            return _x;
        }),
        y: gettableEnumerableProperty(function getY() {
            return _y;
        })
    });
}

function validVector(x, y) {
    return (typeof x === 'number' &&
                typeof y === 'number');
}

function validScalar(value) {
    if (typeof value !== 'number') {
        throw new Error(`${vectorException.ILLEGAL_SCALAR}. Instead using: ${value}`);
    }
}

function gettableEnumerableProperty(get) {
    let configurable = false,
        enumerable = true;

    return Object.assign({},
                  {configurable, enumerable},
                  {get}
    );
}

export const vectorException = Object.freeze({
    ILLEGAL_COORDINATES: 'Initializing a vector with incorrect coordinates',
    ILLEGAL_ADD: 'Adding to a vector with a non-vector value',
    ILLEGAL_SCALAR: 'Multiplying a vector with a non-scalar value',
    INVALID_VECTOR: 'Invalid vector'
});
