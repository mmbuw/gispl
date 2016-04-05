import {featureBase,
            lowerUpperLimit,
            extractConstraintsFrom} from '../feature';

export function delay(params) {
    
    isValidDelayFeature(params);
    
    let constraints = extractConstraintsFrom(params),
        baseFeature = featureBase(params),
        limit = lowerUpperLimit(constraints);
    
    function getTotalTimeDiff(totalTimeDiff, inputObject) {
        let currentTime = Date.now(),
            timeDiff = currentTime - inputObject.startingTime;
        
        return totalTimeDiff + timeDiff;
    }
    
    function inputWithinConstraints(inputObject) {
        let currentTime = Date.now(),
            timeDiff = currentTime - inputObject.startingTime;
        
        return timeDiff >= limit.lower &&
                timeDiff <= limit.upper;
    }
    
    return {
        type() {
            return 'Delay';
        },
        load(inputState) {
            let inputObjects = baseFeature.inputObjectsFrom(inputState)
                                            .filter(baseFeature.checkAgainstDefinition);
            let match = false;
            
            if (inputObjects.length > 0) {
                match = inputObjects.every(inputWithinConstraints);
                if (match) {
                    let totalTimeDiff = inputObjects.reduce(getTotalTimeDiff, 0);
                    let averageTimeDiff = totalTimeDiff / inputObjects.length;
                    baseFeature.setMatchedValue(averageTimeDiff);
                }
            }
            return match;
        },
        setValueToObject: baseFeature.setValueToObject
    };
}

export const delayException = Object.freeze({
    NO_CONSTRAINTS: `Attempting to add a delay feature with no constraints;
                        i.e. lower and upper limit`,
    INVALID_CONSTRAINTS: `Attempting to add a delay feature with invalid constraints;
                            expecting array of lower, upper`
});

function isValidDelayFeature(params) {
    let {constraints} = params;
    
    if (typeof constraints === 'undefined') {
        throw new Error(delayException.NO_CONSTRAINTS);
    }
    if (!Array.isArray(constraints)) {
        throw new Error(`${delayException.INVALID_CONSTRAINTS}; received ${constraints}`);
    }
    if (constraints.length === 0) {
        throw new Error(`${delayException.NO_CONSTRAINTS}; received empty array.`);
    }
    if (constraints.length > 2) {
        throw new Error(`${delayException.INVALID_CONSTRAINTS};
                            received more than 2 constraints.`);
    }
    constraints.forEach(value => {
        if (typeof value !== 'number') {
            throw new Error(`${delayException.INVALID_CONSTRAINTS};
                received: ${typeof constraints[0]}, ${typeof constraints[1]}`);
        } 
    });
}