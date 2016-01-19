import {featureBase} from '../feature';
import {DollarRecognizer,
            Point} from '../libs/dollar';

export default function path(params) {

    isValidPathFeature(params);

    let _path = {},
        baseFeature = featureBase(params),
        {recognizer = new DollarRecognizer()} = params,
        constraints = dollarPointsFrom(params.constraints);

    recognizer.AddGesture('current', constraints);

    _path.type = function pathType() {
        return 'Path';
    };

    _path.load = function pathLoad(inputState) {
        if (!baseFeature.validInput(inputState)) {
            return false;
        }

        return inputState.every(inputObject => {
            let $points = inputObject.path.map(point => {
                return new Point(point.screenX, point.screenY);
            });

            return recognizer.Recognize($points).Score >= 0.8;
        });
    };

    return _path;
}

function isValidPathFeature(pathFeature) {
    if (typeof pathFeature.constraints === 'undefined'
            || ! pathFeature.constraints.length) {
        throw new Error(pathFeatureException.NO_CONSTRAINTS);
    }
}

function dollarPointsFrom(constraints) {
    return constraints.map(constraintPoint => {
        let x = constraintPoint[0],
            y = (1-constraintPoint[1]);

        return new Point(x, y);
    });
}

export let pathFeatureException = {
    NO_CONSTRAINTS: `Attempting to add a path feature with no constraints;
                        i.e. number of path points`
};
