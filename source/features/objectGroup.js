import {featureBase,
        calculateCentroidFrom,
        pointToPointDistance,
        lowerUpperLimit} from '../feature';

export function objectgroup(params) {
    
    isValidObjectGroupFeature(params);
    
    let {constraints} = params,
        baseFeature = featureBase(params),
        limit = lowerUpperLimit(constraints),
        radius = constraints[2];
    
    return {
        type() {
            return 'ObjectGroup';
        },
        load(inputState) {
            let inputObjects = baseFeature.inputObjectsFrom(inputState)
                                            .filter(baseFeature.checkAgainstDefinition),
                count = inputObjects.length,
                match = false;
            
            if (inputObjects.length > 1) {
                let centroid = calculateCentroidFrom(inputObjects),
                    distance = pointToPointDistance(centroid, inputObjects[0], true);
                    
                match = Math.floor(distance) <= radius &&
                        count >= limit.lower &&
                        count <= limit.upper;
            
                if (match) {
                    baseFeature.setMatchedValue(distance);
                }   
            }
            
            return match;
        },
        setValueToObject: baseFeature.setValueToObject
    };
}

function isValidObjectGroupFeature(params) {
    let {constraints} = params;
    
    if (typeof constraints === 'undefined') {
        throw new Error(objectGroupException.NO_CONSTRAINTS);
    }
    if (!Array.isArray(constraints) ||
            constraints.length !== 3) {
        throw new Error(`${objectGroupException.INVALID_CONSTRAINTS};
                            received ${constraints}`);
    }
    constraints.forEach(value => {
        if (typeof value !== 'number') {
            throw new Error(`${objectGroupException.INVALID_CONSTRAINTS};
                received: ${typeof constraints[0]}, ${typeof constraints[1]}`);
        } 
    });
}

export const objectGroupException = Object.freeze({
    NO_CONSTRAINTS: `Attempting to add an objectGroup feature with no constraints;
                        i.e. lower and upper input limit, and radius`,
    INVALID_CONSTRAINTS: `Attempting to add an objectGroup feature with invalid constraints;
                            has to contain lower and upper input limit, and radius`
});