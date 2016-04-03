import {featureBase,
            extractConstraintsFrom,
            lowerUpperLimit} from '../feature';
import screenCalibration from '../tuio/screenCalibration';
import {vector} from '../vector';

export function scale(params) {
    
    let constraints = extractConstraintsFrom(params),
        baseFeature = featureBase(params),
        limit = lowerUpperLimit(constraints),
        calibration = screenCalibration.instance(),
        centroid;
    
    function pointToPointDistance(first, second) {
        let x = (first.screenX - second.screenX),
            y = (first.screenY - second.screenY),
            directionVector = vector(x, y);
            
        return directionVector.length();
    }
        
    function calculateCentroidFrom(inputObjects) {
        let inputCount = inputObjects.length,
            screenX = 0,
            screenY = 0;
        
        for (let i = 0; i < inputCount; i += 1) {
            let firstInPath = inputObjects[i].path[0];
            screenX += firstInPath.screenX;
            screenY += firstInPath.screenY;
        }
        
        screenX /= inputCount;
        screenY /= inputCount;
        
        return calibration.screenToBrowserCoordinates(screenX, screenY);
    }
    
    function matchWithValue(scale) {
        return scale !== 1 &&
                scale >= limit.lower &&
                scale <= limit.upper;
    }
    
    function totalInputObjectsScale(totalScaleFactor, inputObject) {
        let path = inputObject.path,
            firstPoint = path[0],
            lastPoint = path[path.length - 1];
            
        let originalDistance = pointToPointDistance(centroid, firstPoint),
            currentDistance = pointToPointDistance(centroid, lastPoint),
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
                centroid = calculateCentroidFrom(inputObjects);
                
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