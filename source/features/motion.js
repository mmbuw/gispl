import {featureBase,
        lowerUpperVectorLimit} from '../feature';
import {vector} from '../vector';

export function motion(params) {
    let baseFeature = featureBase(params),
        {constraints} = params,
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
    
    function totalInputObjectsMotion(vectorSum, inputObject) {
        let path = inputObject.path;
        let lastPoint = path[path.length-1],
            beforeLastPoint = path[path.length-2];

        // use relative position because for very small movements
        // different relative position will translate to the same screen pixel
        let x = lastPoint.screenX - beforeLastPoint.screenX,
            // not a bug
            // tuio coordinates are with top left origin
            // so last - beforeLast, is actually (1-last) - (1-beforeLast)
            // if we want a vector with bottom left origin
            // which equals beforeLast - last
            y = beforeLastPoint.screenY - lastPoint.screenY;
        return vectorSum.add({x, y});
    }

    return {
        type() {
            return 'Motion';
        },

        load(inputState) {
            let inputObjects = baseFeature.inputObjectsFrom(inputState)
                                            .filter(baseFeature.checkAgainstDefinition)
                                            .filter(inputObject => inputObject.path.length > 1),
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
