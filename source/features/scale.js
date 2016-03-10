import {featureBase,
            extractConstraintsFrom,
            calculateCentroidFrom,
            pointToPointDistance,
            lowerUpperLimit} from '../feature';

export function scale(params) {
    
    let constraints = extractConstraintsFrom(params),
        baseFeature = featureBase(params),
        limit = lowerUpperLimit(constraints);
    
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
                    baseFeature.setMatchedValue(averageScaleFactor);
                }
            }
            
            return match;
        },
        
        setValueToObject: baseFeature.setValueToObject
    };
}