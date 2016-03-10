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
            match = motionVector.x > limit.lower.x &&
                    motionVector.y > limit.lower.y &&
                    motionVector.x < limit.upper.x &&
                    motionVector.y < limit.upper.y;
        }
        else {
            match = motionVector.length() !== 0;
        }
        return match;
    }

    return {
        type() {
            return 'Motion';
        },

        load(inputState) {
            let inputObjects = baseFeature.inputObjectsFrom(inputState)
                                            .filter(baseFeature.checkAgainstDefinition),
                directionVectorAllInputs = vector(),
                inputCount = 0,
                match = false;

            inputObjects.forEach(inputObject => {
                let path = inputObject.path;
                if (path.length > 1) {
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
                    directionVectorAllInputs.add(vector({x, y}));

                    inputCount += 1;
                }
            });

            if (inputCount !== 0) {
                match = matchWithValue(directionVectorAllInputs);
                if (match) {
                    let {x, y} = directionVectorAllInputs;
                    baseFeature.setMatchedValue({x, y});
                }
            }

            return match;
        },
        
        setValueToObject: baseFeature.setValueToObject
    };
}
