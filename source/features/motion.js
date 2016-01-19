import {featureBase,
        lowerUpperVectorLimit} from '../feature';
import {vector} from '../vector';

export default function motion(params) {
    let _motion = {},
        baseFeature = featureBase(params),
        {constraints} = params,
        limit = false;

    if (typeof constraints !== 'undefined') {
        limit = lowerUpperVectorLimit(constraints);
    }

    _motion.type = function _motion() {
        return 'Motion';
    };

    _motion.load = function motionLoad(inputState) {
        if (!baseFeature.validInput(inputState)) {
            return false;
        }

        let result = vector(),
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

                result.add(vector({x, y}));

                inputCount += 1;
            }
        });

        if (inputCount === 0) {
            return false;
        }

        if (limit) {
            result.withScalar(1/inputCount);

            return result.x > limit.lower.x &&
                    result.y > limit.lower.y &&
                    result.x < limit.upper.x &&
                    result.y < limit.upper.y;
        }

        return result.length() !== 0;
    };

    return _motion;
}
