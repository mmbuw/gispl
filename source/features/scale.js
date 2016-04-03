import {featureBase,
            extractConstraintsFrom,
            lowerUpperLimit} from '../feature';

export function scale(params) {
    
    let constraints = extractConstraintsFrom(params),
        baseFeature = featureBase(params),
        limit = lowerUpperLimit(constraints),
        centroid;
    
    function matchWithValue(scale) {
        return scale !== 1 &&
                scale >= limit.lower &&
                scale <= limit.upper;
    }
    
    function totalInputObjectsScale(totalScaleFactor, inputObject) {
        let path = inputObject.path,
            firstPoint = path[0],
            lastPoint = path[path.length - 1];
            
        let originalDistance = baseFeature.pointToPointDistance(centroid, firstPoint),
            currentDistance = baseFeature.pointToPointDistance(centroid, lastPoint),
            currentPointScaleFactor = currentDistance / originalDistance;
            
        return totalScaleFactor + currentPointScaleFactor;
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
                centroid = baseFeature.calculateCentroid(inputObjects, true);
                
                let totalScaleFactor = inputObjects.reduce(totalInputObjectsScale, 0),
                    averageScaleFactor = totalScaleFactor / inputCount;
                
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