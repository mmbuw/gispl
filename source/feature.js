import {vector} from './vector';
import motion from './features/motion';
import count from './features/count';
import path from './features/path';
import {extractDurationFrom,
        validDuration} from './gesture';
import {DollarRecognizer} from './libs/dollar';

let singleRecognizerInstance = new DollarRecognizer();

export function featureFactory(params = {}) {

    let {type = ''} = params;

    switch (type.toLowerCase()) {
    case 'motion':
        return motion(params);
    case 'count':
        return count(params);
    case 'path':
        params.recognizer = singleRecognizerInstance;
        return path(params);
    default:
        throw new Error(`${featureException.NONEXISTING} ${type}`);
    }
}

export function featureBase(params) {
    let {filters} = params,
        duration = extractDurationFrom(params);
    
    
    function matchFiltersWith(inputObject) {
        //tuio v1 objects and cursors have not typeid
        //unknown typeId in v2 is 0
        let typeId = inputObject.type ? inputObject.type : 0,
            typeIdKnown = typeId !== 0,
            hasNoFilters = typeof filters === 'undefined',
            filtersMatch = false;

        if (typeIdKnown) {
            let typeIdAsBitmask = 1<<(typeId-1);
            filtersMatch = filters & typeIdAsBitmask;
        }

        return hasNoFilters || filtersMatch;
    }

    return {
        checkAgainstDefinition(inputObject) {
            return matchFiltersWith(inputObject) &&
                    validDuration({inputObject, duration});
        }
    };
}

export function lowerUpperLimit(constraints = []) {
    let lower = constraints[0],
        upper = constraints[1];

    return {lower, upper};
}

export function lowerUpperVectorLimit(constraints = []) {
    // basicaly creates an object like
    // object.lower.x, object.lower.y
    // object.upper.x, object.upper.y
    return lowerUpperLimit([
        vector({
            x: constraints[0][0],
            y: constraints[0][1]
        }),
        vector({
            x: constraints[1][0],
            y: constraints[1][1]
        })
    ]);
}

export function clearUserDefinedPaths() {
    singleRecognizerInstance.DeleteUserGestures();
}

export let featureException = {
    NONEXISTING: 'Attempting to add a gesture with a non-existing feature:'
};
