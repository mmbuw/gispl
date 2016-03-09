export function vector(params = {}) {
    let {x:_x = 0,
            y:_y = 0} = params;

    if (!validVector(_x, _y)) {
        throw new Error(`${vectorException.ILLEGAL_COORDINATES}. Instead using ${params}`);
    }
    
    let vectorApi = {
        add(vectorToAdd = {}) {
            let {x, y} = vectorToAdd;

            if (!validVector(x, y)) {
                throw new Error(`${vectorException.ILLEGAL_ADD}. Instead using: ${vectorToAdd}`);
            }
            _x += x;
            _y += y;
        },
        scaleWith(value) {
            this.scaleX(value);
            this.scaleY(value);
        },
        scaleX(value) {
            validScalar(value);
            _x *= value;
        },
        scaleY(value) {
            validScalar(value);
            _y *= value;
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
                            Expecting {x: Number, y: Number}. Received ${withVector}`);
            }
            return _x * x + _y * y;
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
