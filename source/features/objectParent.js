import {featureBase,
        lowerUpperLimit} from '../feature';

export function objectparent(params) {
    
    isValidObjectParentFeature(params);
    
    let {constraints} = params,
        baseFeature = featureBase(params),
        limit = lowerUpperLimit(constraints);
    
    return {
        type() {
            return 'ObjectParent';
        },
        load(inputState) {
            let inputObjects = baseFeature.inputObjectsFrom(inputState)
                                            .filter(baseFeature.checkAgainstDefinition),
                matchedValues = [];
            
            let match = inputObjects.length !== 0 &&
                        inputObjects.every(inputObject => {
                            let userId = inputObject.user,
                                match = userId >= limit.lower &&
                                        userId <= limit.upper;
                            if (match) {
                                matchedValues.push(userId);
                            }
                            return match;
                        });
            if (match) {
                baseFeature.setMatchedValue(matchedValues);
            }
            return match;
        },
        setValueToObject: baseFeature.setValueToObject
    };
}

function isValidObjectParentFeature(params) {
    let {constraints} = params;
    
    if (typeof constraints === 'undefined') {
        throw new Error(objectParentException.NO_CONSTRAINTS);
    }
    if (!Array.isArray(constraints) ||
            constraints.length !== 2) {
        throw new Error(`${objectParentException.INVALID_CONSTRAINTS};
                            received ${constraints}`);
    }
    constraints.forEach(value => {
        if (typeof value !== 'number') {
            throw new Error(`${objectParentException.INVALID_CONSTRAINTS};
                received: ${typeof constraints[0]}, ${typeof constraints[1]}`);
        } 
    });
}

export const objectParentException = Object.freeze({
    NO_CONSTRAINTS: `Attempting to add an objectParent feature with no constraints;
                        i.e. lower and upper range limit`,
    INVALID_CONSTRAINTS: `Attempting to add an objectParent feature with invalid constraints;
                            range has to contain lower and upper limit.`
});