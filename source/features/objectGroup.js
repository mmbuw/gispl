import {featureBase,
        lowerUpperLimit} from '../feature';
import screenCalibration from '../tuio/screenCalibration';

export function objectgroup(params) {
    
    isValidObjectGroupFeature(params);
    
    let {constraints} = params,
        baseFeature = featureBase(params),
        limit = lowerUpperLimit(constraints),
        // TODO
        // maybe pass in an instance somehow
        calibration = screenCalibration.instance(),
        radius = constraints[2];

    function calculateCentroidFrom(inputObjects) {
        let inputCount = inputObjects.length,
            screenX = 0,
            screenY = 0;
        
        inputObjects.forEach(inputObject => {
            screenX += inputObject.screenX;
            screenY += inputObject.screenY;
        });
        
        screenX /= inputCount;
        screenY /= inputCount;
        
        return calibration.screenToBrowserCoordinates(screenX, screenY);
    }
    
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
                    distance = baseFeature.pointToPointDistance(centroid, inputObjects[0]);
                    
                match = Math.floor(distance) <= radius &&
                        count >= limit.lower &&
                        count <= limit.upper;
            
                if (match) {
                    baseFeature.setMatchedValue({
                        radius: distance,
                        midpoint: centroid
                    });
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