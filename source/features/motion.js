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
            let {inputObjects:inputObjectsHistory} = inputState,
                inputObjects = inputObjectsHistory[0];

            let directionVectorAllInputs = vector(),
                inputCount = 0;

            inputObjects.forEach(inputObject => {
                let path = inputObject.path;
                if (path.length > 1 &&
                        baseFeature.checkAgainstDefinition(inputObject)) {
                    let lastPoint = path[path.length-1],
                        beforeLastPoint = path[path.length-2];

                    // use relative position because for very small movements
                    // different relative position will translate to the same screen pixel
                    let x = lastPoint.relativeScreenX - beforeLastPoint.relativeScreenX,
                        // not a bug
                        // tuio coordinates are with top left origin
                        // so last - beforeLast, is actually (1-last) - (1-beforeLast)
                        // if we want a vector with bottom left origin
                        // which equals beforeLast - last
                        y = beforeLastPoint.relativeScreenY - lastPoint.relativeScreenY;
                    directionVectorAllInputs.add(vector({x, y}));

                    inputCount += 1;
                }
            });

            if (inputCount === 0) {
                return false;
            }

            if (limit) {
                let screen = window.screen;
                // normalize the resulting vector with inputCount
                // (take the average motion of all input points)
                // and blow it up from relative screen coordinates to actual screen size
                directionVectorAllInputs.scaleX(screen.width/inputCount);
                directionVectorAllInputs.scaleY(screen.height/inputCount);

                return directionVectorAllInputs.x > limit.lower.x &&
                        directionVectorAllInputs.y > limit.lower.y &&
                        directionVectorAllInputs.x < limit.upper.x &&
                        directionVectorAllInputs.y < limit.upper.y;
            }

            return directionVectorAllInputs.length() !== 0;
        }
    };
}
