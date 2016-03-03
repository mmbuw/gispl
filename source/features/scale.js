import {vector} from '../vector';
import {featureBase,
            lowerUpperLimit} from '../feature';

export default function scale(params) {
    
    let constraints = extractContraintsFrom(params),
        baseFeature = featureBase(params),
        limit = lowerUpperLimit(constraints);
    
    function pointToPointDistance(first, second) {
        // scale helps with floating point inprecision 
        // without it some edge case in tests will fail
        // because instead of 2, the scale factor will be 2.00...004
        // using screenX which is an integer does not always help
        // also don't change to (first - second) * scale
        let scale = 10000,
            x = (first.relativeScreenX * scale - second.relativeScreenX * scale),
            y = (first.relativeScreenY * scale - second.relativeScreenY * scale),
            directionVector = vector({x, y});
            
        return directionVector.length() / scale;
    }
    
    function calculateCentroidFrom(inputObjects) {
        let inputCount = inputObjects.length,
            // check above scale comment
            scale = 10000,
            relativeScreenX = 0,
            relativeScreenY = 0;
        
        inputObjects.forEach(inputObject => {
            relativeScreenX += inputObject.path[0].relativeScreenX * scale;
            relativeScreenY += inputObject.path[0].relativeScreenY * scale;
        });
        
        relativeScreenX /= inputCount * scale;
        relativeScreenY /= inputCount * scale;
                                    
        return {relativeScreenX, relativeScreenY};
    }
    
    function matchWithValue(scale) {
        return scale !== 1 &&
                scale >= limit.lower &&
                scale <= limit.upper;
    }
    
    return {
        type() {
            return 'Scale';
        },
        load(inputState) {
            let match = false,
                inputObjects = baseFeature
                                .inputObjectsFrom(inputState)
                                .filter(baseFeature.checkAgainstDefinition);
            
            let inputCount = inputObjects.length;
                
            if (inputCount > 1) {
                let centroid = calculateCentroidFrom(inputObjects);
                
                let totalScaleFactor = inputObjects.reduce((totalScaleFactor, inputObject) => {
                    let path = inputObject.path,
                        firstPoint = path[0],
                        lastPoint = path[path.length - 1];
                        
                    let originalDistance = pointToPointDistance(centroid, firstPoint),
                        currentDistance = pointToPointDistance(centroid, lastPoint),
                        currentPointScaleFactor = currentDistance / originalDistance;
                        
                    return totalScaleFactor + currentPointScaleFactor;
                }, 0);
                
                let averageScaleFactor = totalScaleFactor / inputCount;
                
                match = matchWithValue(averageScaleFactor);
                            
                if (match) {
                    baseFeature.setCalculatedValue(averageScaleFactor);
                }
            }
            
            return match;
        },
        
        setValueToObject: baseFeature.setValueToObject
    };
}

function extractContraintsFrom(params) {
    let {constraints} = params,
        defaultLowerLimit = 0,
        defaultUpperLimit = Number.POSITIVE_INFINITY;
        
    if (!Array.isArray(constraints)) {
        constraints = [defaultLowerLimit, defaultUpperLimit];
    }
    if (constraints.length === 0) {
        constraints.push(defaultLowerLimit);
    }
    if (constraints.length === 1) {
        constraints.push(defaultUpperLimit);
    }
    return constraints;
}