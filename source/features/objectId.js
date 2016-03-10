import {lowerUpperLimit} from '../feature';

export function objectId(params) {
    
    isValidObjectIdFeature(params);
    
    let {constraints} = params,
        limit = lowerUpperLimit(constraints);
    
    return {
        type() {
            return 'ObjectID';
        },
        load(inputState) {
            let {inputObjects} = inputState;
            
            return inputObjects.every(inputObject => {
                let {componentId} = inputObject;
                
                return componentId >= limit.lower &&
                            componentId <= limit.upper;
            });
        }
    };
}

function isValidObjectIdFeature(params) {
    let {constraints} = params;
    
    if (typeof constraints === 'undefined') {
        throw new Error(objectIdException.NO_CONSTRAINTS);
    }
    if (!Array.isArray(constraints) ||
            constraints.length !== 2) {
        throw new Error(`${objectIdException.INVALID_CONSTRAINTS};
                            received ${constraints}`);
    }
    constraints.forEach(value => {
        if (typeof value !== 'number') {
            throw new Error(`${objectIdException.INVALID_CONSTRAINTS};
                received: ${typeof constraints[0]}, ${typeof constraints[1]}`);
        } 
    });
}

export const objectIdException = Object.freeze({
    NO_CONSTRAINTS: `Attempting to add an objectId feature with no constraints;
                        i.e. lower and upper range limit`,
    INVALID_CONSTRAINTS: `Attempting to add an objectId feature with invalid constraints;
                            range has to contain lower and upper limit.`
});