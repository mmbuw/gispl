export function vector(params = {}) {
    let _vector = {},
        {x:_x = 0,
            y:_y = 0} = params;

    if (!validVector(_x, _y)) {
        throw new Error(`${vectorException.ILLEGAL_COORDINATES}. Instead using ${params}`);
    }

    let xAccessor = Object.assign({}, vectorValuesConfig, {
            get: function getX() {
                return _x;
            }
        }),
        yAccessor = Object.assign({}, vectorValuesConfig, {
            get: function getY() {
                return _y;
            }
        });


    Object.defineProperties(_vector, {
        x: xAccessor,
        y: yAccessor
    });

    _vector.add = function vectorAdd(vector = {}) {
        let {x, y} = vector;

        if (!validVector(x, y)) {
            throw new Error(`${vectorException.ILLEGAL_ADD}. Instead using: ${vector}`);
        }

        _x += x;
        _y += y;
    };

    _vector.withScalar = function vectorWithScalar(value) {
        if (typeof value !== 'number') {
            throw new Error(`${vectorException.ILLEGAL_SCALAR}. Instead using: ${value}`);
        }

        _x *= value;
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

let vectorValuesConfig = {
    configurable: false,
    enumerable: true
};

export let vectorException = {
    ILLEGAL_COORDINATES: `Initializing a vector with incorrect coordinates`,
    ILLEGAL_ADD: `Adding to a vector with a non-vector value`,
    ILLEGAL_SCALAR: `Multiplying a vector with a non-scalar value`
};
