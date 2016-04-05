import {featureBase,
        lowerUpperLimit} from '../feature';

export function objectparent(params) {
    
    isValidObjectParentFeature(params);
    
    let {constraints} = params,
        baseFeature = featureBase(params),
        limit = lowerUpperLimit(constraints),
        userIds = [];
        
    function userIdWithinRange(inputObject) {
        let userId = inputObject.user,
            match = userId >= limit.lower &&
                    userId <= limit.upper;
        return match;
    }
    
    function extractUserIdsFrom(inputObjects) {
        userIds.length = 0;
        for (let i = 0; i < inputObjects.length; i += 1) {
            userIds.push(inputObjects[i].user);
        }
        return userIds;
    }
    
    return {
        type() {
            return 'ObjectParent';
        },
        load(inputState) {
            let inputObjects = baseFeature.inputObjectsFrom(inputState)
                                            .filter(baseFeature.checkAgainstDefinition);
            
            let match = inputObjects.length !== 0 &&
                        inputObjects.every(userIdWithinRange);
            if (match) {
                let userIds = extractUserIdsFrom(inputObjects);
                baseFeature.setMatchedValue(userIds);
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