import {featureBase} from '../feature';
import {Point} from '../libs/dollar';

export function path(params) {

    isValidPathFeature(params);

    let baseFeature = featureBase(params),
        {recognizer} = params,
        // name will be something like
        // "0,0,10,10" from [[0,0], [10,10]]
        name = params.constraints.toString(),
        constraints = dollarPointsFrom(params.constraints),
        allScores = [],
        // value is empirical
        // TODO allow it to be user defined
        validThreshold = 1.9;

    recognizer.AddGesture(name, constraints);
    
    function coordinatesToPoint(point) {
        // could create a pool to avoid creating objects
        // but the $1 recognizer already creates new instances when resampling
        return new Point(point.screenX, point.screenY);
    }
    
    function toAllScores(allScores, inputObject) {
        let $points = inputObject.path.map(coordinatesToPoint);
        let result = recognizer.Recognize($points, true);
        if (result.Name === name &&
            result.Score > validThreshold) {
            allScores[allScores.length] = result.Score;
        }
        return allScores;
    }
    
    function toTotalScore(previous, current) {
        return previous + current;
    }

    return {
        type() {
            return 'Path';
        },

        load(inputState) {
            let inputObjects = baseFeature.inputObjectsFrom(inputState)
                                            .filter(baseFeature.checkAgainstDefinition),
                match = false;

            if (inputObjects.length !== 0) {
                allScores.length = 0;
                // calculate scores of valid inputs
                let allCurrentScores = inputObjects.reduce(toAllScores, allScores);
                // calculate total score if all inputs valid
                if (allCurrentScores.length === inputObjects.length) {
                    let totalScore = allCurrentScores.reduce(toTotalScore);
                    let averageScore = totalScore / inputObjects.length;
                    if (averageScore > validThreshold) {
                        match = true;
                        baseFeature.setMatchedValue(totalScore / inputObjects.length);
                    }   
                }
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

export const pathFeatureException = Object.freeze({
    NO_CONSTRAINTS: `Attempting to add a path feature with no constraints;
                        i.e. number of path points`,
    INVALID_CONSTRAINTS: `Attempting to add a path feature with invalid constraints;
                            number of points less than two`,
    INVALID_CONSTRAINTS_POINT: `Attempting to add a path point, but it does not contain
                                    two coordinates x, y`
});
