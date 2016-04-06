import {featureBase,
        lowerUpperVectorLimit} from '../feature';
import {vector} from '../vector';

export function motion(params) {
    let baseFeature = featureBase(params),
        {constraints} = params,
        tempVector = vector(),
        limit;

    if (typeof constraints !== 'undefined') {
        limit = lowerUpperVectorLimit(constraints);
    }
    
    function matchWithValue(motionVector) {
        let match;
        if (typeof limit !== 'undefined') {
            match = motionVector.x >= limit.lower.x &&
                    motionVector.y >= limit.lower.y &&
                    motionVector.x <= limit.upper.x &&
                    motionVector.y <= limit.upper.y;
        }
        else {
            match = motionVector.length() !== 0;
        }
        return match;
    }
    // not a bug
    // tuio coordinates are with top left origin
    // if we want a vector with bottom left origin
    // which for y equals previous - current
    function totalInputObjectsMotion(vectorSum, inputObject) {
        let path = inputObject.path;
        if (path.length > 1) {
            let currentPoint = path[path.length-1],
                previousPoint = path[path.length-2];
                
            let x = currentPoint.screenX - previousPoint.screenX,
                y = previousPoint.screenY - currentPoint.screenY;
            
            tempVector.setCoordinates(x, y);
            vectorSum.add(tempVector);
        }
        return vectorSum;
    }

    return {
        type() {
            return 'Motion';
        },

        load(inputState) {
            let inputObjects = baseFeature.inputObjectsFrom(inputState)
                                            .filter(baseFeature.checkAgainstDefinition),
                match = false;

            if (inputObjects.length !== 0) {
                let motionVector = inputObjects.reduce(totalInputObjectsMotion, vector());
                // average based on input count
                motionVector.scaleWith(1/inputObjects.length);
                match = matchWithValue(motionVector);
                
                if (match) {
                    let {x, y} = motionVector;
                    baseFeature.setMatchedValue({x, y});
                }
            }

            return match;
        },
        
        setValueToObject: baseFeature.setValueToObject
    };
}
