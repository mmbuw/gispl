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
            if (!baseFeature.validInput(inputState)) {
                return false;
            }

            let directionVectorAllInputs = vector(),
                inputCount = 0;

            inputState.forEach(inputObject => {
                let path = inputObject.path;
                if (path.length > 1
                        && baseFeature.matchFiltersWith(inputObject)) {
                    let lastPoint = path[path.length-1],
                        beforeLastPoint = path[path.length-2];

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

            if (inputCount === 0) {
                return false;
            }

            if (limit) {
                directionVectorAllInputs.scaleWith(1/inputCount);

                return directionVectorAllInputs.x > limit.lower.x &&
                        directionVectorAllInputs.y > limit.lower.y &&
                        directionVectorAllInputs.x < limit.upper.x &&
                        directionVectorAllInputs.y < limit.upper.y;
            }

            return directionVectorAllInputs.length() !== 0;
        }
    };
}
