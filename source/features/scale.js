import {vector} from '../vector';
import {featureBase,
            extractConstraintsFrom,
            calculateCentroidFrom,
            lowerUpperLimit} from '../feature';

export default function scale(params) {
    
    let constraints = extractConstraintsFrom(params),
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