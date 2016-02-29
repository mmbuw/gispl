import {vector} from '../vector';
import {featureBase,
            lowerUpperLimit} from '../feature';

export default function scale(params) {
    
    let constraints = extractContraintsFrom(params),
        baseFeature = featureBase(params),
        limit = lowerUpperLimit(constraints),
        calculatedValue;
    
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
            relativeScreenX += inputObject.relativeScreenX * scale;
            relativeScreenY += inputObject.relativeScreenY * scale;
        });
        
        relativeScreenX /= inputCount * scale;
        relativeScreenY /= inputCount * scale;
                                    
        return {relativeScreenX, relativeScreenY};
    }
    
    return {
        type() {
            return 'Scale';
        },
        load(inputState) {
            let match = false,
                inputObjects = baseFeature
                                .inputObjectsFrom(inputState)
                                .filter(inputObject => baseFeature.checkAgainstDefinition(inputObject));
            
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
                
                match = averageScaleFactor !== 1 &&
                            averageScaleFactor >= limit.lower &&
                            averageScaleFactor <= limit.upper;
                            
                if (match) {
                    calculatedValue = averageScaleFactor;
                }
            }
            
            return match;
        },
        
        setValueToObject(featureValues) {
            if (typeof featureValues === 'object') {
                featureValues.scale = calculatedValue;
            }
        }
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