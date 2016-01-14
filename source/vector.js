export function vector(params = {}) {
    let vectorApi = {},
        {x:coordinateX = 0,
            y:coordinateY = 0} = params;
        
    if (!validVector(coordinateX, coordinateY)) {
        throw new Error(`${vectorException.ILLEGAL_COORDINATES}. Instead using ${params}`);
    }
    
    let xAccessor = Object.assign({}, vectorValuesConfig, {
            get: function getX() {
                return coordinateX;
            }
        }),
        yAccessor = Object.assign({}, vectorValuesConfig, {
            get: function getY() {
                return coordinateY;
            }
        });
    
    
    Object.defineProperties(vectorApi, {
        x: xAccessor,
        y: yAccessor
    });
    
    vectorApi.add = function vectorAdd(vector = {}) {
        let {x, y} = vector;
        
        if (!validVector(x, y)) {
            throw new Error(`${vectorException.ILLEGAL_ADD}. Instead using: ${vector}`);
        }
        
        coordinateX += x;
        coordinateY += y;
    };
    
    vectorApi.withScalar = function vectorWithScalar(value) {
        if (typeof value !== 'number') {
            throw new Error(`${vectorException.ILLEGAL_SCALAR}. Instead using: ${value}`);
        }
        
        coordinateX *= value;
        coordinateY *= value;
    };
    
    vectorApi.length = function vectorLength() {
        return Math.sqrt(
            Math.pow(coordinateX, 2) + Math.pow(coordinateY, 2)
        );
    };
    
    return vectorApi;
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