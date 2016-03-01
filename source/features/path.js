import {featureBase} from '../feature';
import {Point} from '../libs/dollar';

export default function path(params) {

    isValidPathFeature(params);

    let baseFeature = featureBase(params),
        {recognizer} = params,
        // name will be something lik
        // "0,0,10,10" from [[0,0], [10,10]]
        name = params.constraints.toString(),
        constraints = dollarPointsFrom(params.constraints);

    recognizer.AddGesture(name, constraints);

    return {
        type() {
            return 'Path';
        },

        load(inputState) {
            let inputObjects = baseFeature.inputObjectsFrom(inputState),
                totalScore = 0;

            let match = inputObjects.every(inputObject => {
                let inputObjectMatch = false;

                if (baseFeature.checkAgainstDefinition(inputObject)) {
                    let $points = inputObject.path.map(point => {
                        return new Point(point.screenX, point.screenY);
                    });

                    let result = recognizer.Recognize($points, true);
                    
                    totalScore += result.Score;
                    inputObjectMatch = (result.Name === name &&
                                // value is empirical
                                // TODO allow it to be user defined
                                result.Score > 1.9);
                }

                return inputObjectMatch;
            });
            
            if (match) {
                baseFeature.setCalculatedValue(totalScore / inputObjects.length);
            }
            
            return match;
        },
        setValueToObject: baseFeature.setValueToObject
    };
}

function isValidPathFeature(pathFeature = {}) {
    let {constraints} = pathFeature;

    if (typeof constraints === 'undefined'
            || ! constraints.length) {
        throw new Error(pathFeatureException.NO_CONSTRAINTS);
    }
    if (constraints.length < 2) {
        throw new Error(pathFeatureException.INVALID_CONSTRAINTS);
    }
    constraints.forEach(point => {
        if (point.length < 2) {
            throw new Error(pathFeatureException.INVALID_CONSTRAINTS_POINT);
        }
    });
}

function dollarPointsFrom(constraints) {
    return constraints.map(constraintPoint => {
        let x = constraintPoint[0],
            // constraints with bottom left origin
            // tuio input with top left
            y = (1-constraintPoint[1]);

        return new Point(x, y);
    });
}

export let pathFeatureException = {
    NO_CONSTRAINTS: `Attempting to add a path feature with no constraints;
                        i.e. number of path points`,
    INVALID_CONSTRAINTS: `Attempting to add a path feature with invalid constraints;
                            number of points less than two`,
    INVALID_CONSTRAINTS_POINT: `Attempting to add a path point, but it does not contain
                                    two coordinates x, y`
};
