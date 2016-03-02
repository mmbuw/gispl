import {featureBase,
        lowerUpperVectorLimit} from '../feature';
import {vector} from '../vector';

export default function motion(params) {
    let baseFeature = featureBase(params),
        {constraints} = params,
        limit = false;

    if (typeof constraints !== 'undefined') {
        limit = lowerUpperVectorLimit(constraints);
    }

    return {
        type() {
            return 'Motion';
        },

        load(inputState) {
            let inputObjects = baseFeature.inputObjectsFrom(inputState),
                directionVectorAllInputs = vector(),
                inputCount = 0,
                match = false;

            inputObjects.forEach(inputObject => {
                let path = inputObject.path;
                if (path.length > 1 &&
                        baseFeature.checkAgainstDefinition(inputObject)) {
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
                
                //directionVectorAllInputs.scaleWith(1/inputCount);
                
                if (limit) {
                    match = directionVectorAllInputs.x > limit.lower.x &&
                            directionVectorAllInputs.y > limit.lower.y &&
                            directionVectorAllInputs.x < limit.upper.x &&
                            directionVectorAllInputs.y < limit.upper.y;
                }
                else {
                    match = directionVectorAllInputs.length() !== 0;
                }
                if (match) {
                    let {x, y} = directionVectorAllInputs;
                    baseFeature.setCalculatedValue({x, y});
                }
            }

            return match;
        },
        
        setValueToObject: baseFeature.setValueToObject
    };
}
