export function vector(params = {}) {
    let _vector = {},
        {x:_x = 0,
            y:_y = 0} = params;

    if (!validVector(_x, _y)) {
        throw new Error(`${vectorException.ILLEGAL_COORDINATES}. Instead using ${params}`);
    }

    Object.defineProperties(_vector, {
        x: gettableEnumerableProperty(function getX() {
            return _x;
        }),
        y: gettableEnumerableProperty(function getY() {
            return _y;
        })
    });

    _vector.add = function vectorAdd(vector = {}) {
        let {x, y} = vector;

        if (!validVector(x, y)) {
            throw new Error(`${vectorException.ILLEGAL_ADD}. Instead using: ${vector}`);
        }

        _x += x;
        _y += y;
    };

    _vector.scaleWith = function vectorWithScalar(value) {
        _vector.scaleX(value);
        _vector.scaleY(value);
    };
    
    _vector.scaleX = function vectorScaleX(value) {
        validScalar(value);
        _x *= value;
    };
    
    _vector.scaleY = function vectorScaleY(value) {
        validScalar(value);
        _y *= value;
    };

    _vector.length = function vectorLength() {
        return Math.sqrt(
            Math.pow(_x, 2) + Math.pow(_y, 2)
        );
    };

    return _vector;
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

export let vectorException = {
    ILLEGAL_COORDINATES: `Initializing a vector with incorrect coordinates`,
    ILLEGAL_ADD: `Adding to a vector with a non-vector value`,
    ILLEGAL_SCALAR: `Multiplying a vector with a non-scalar value`
};
