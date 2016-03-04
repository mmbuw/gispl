import {vector} from './vector';
import motion from './features/motion';
import count from './features/count';
import path from './features/path';
import scale from './features/scale';
import rotation from './features/rotation';
import {extractDurationFrom,
        validInputFromDuration} from './gesture';
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
    case 'scale':
        return scale(params);
    case 'rotation':
        return rotation(params);
    default:
        throw new Error(`${featureException.NONEXISTING} ${type}`);
    }
}

export function featureBase(params) {
    let {filters,
            type} = params,
        duration = extractDurationFrom(params),
        calculatedValue;
    
    
    function matchFiltersWith(inputObject) {
        //tuio v1 objects and cursors have not typeid
        //unknown typeId in v2 is 0
        let typeId = inputObject.type ? inputObject.type : 0,
            typeIdKnown = typeId !== 0,
            hasNoFilters = typeof filters === 'undefined',
            filtersMatch = false;

        if (typeIdKnown) {
            let typeIdAsBitmask = 1<<(typeId-1);
            filtersMatch = !!(filters & typeIdAsBitmask);
        }

        return hasNoFilters || filtersMatch;
    }

    return {
        inputObjectsFrom(inputState) {
            let {inputObjects,
                    inputHistory} = inputState;
            // for individual features, take the whole history
            // when duration defined
            // allows for features like double tap
            if (duration.definition.length !== 0) {
                inputObjects = validInputFromDuration(inputHistory, duration);
            }
            return inputObjects;
        },
        checkAgainstDefinition(inputObject) {
            return matchFiltersWith(inputObject);
        },
        setCalculatedValue(value) {
            calculatedValue = value;
        },
        setValueToObject(featureValues) {
            if (typeof featureValues === 'object') {
                featureValues[type.toLowerCase()] = calculatedValue;
            }
        }
    };
}

export function extractContraintsFrom(params) {
    let {constraints} = params,
        defaultLowerLimit = 0,
        defaultUpperLimit = Number.POSITIVE_INFINITY;
        
    if (!Array.isArray(constraints)) {
        constraints = [defaultLowerLimit, defaultUpperLimit];
    }
    if (constraints.length === 0) {
        constraints.push(defaultLowerLimit);
    }
    if (constraints.length === 1) {
        constraints.push(defaultUpperLimit);
    }
    return constraints;
}

export function calculateCentroidFrom(inputObjects) {
    let inputCount = inputObjects.length,
        // check above scale comment
        scale = 10000,
        relativeScreenX = 0,
        relativeScreenY = 0;
    
    inputObjects.forEach(inputObject => {
        relativeScreenX += inputObject.path[0].relativeScreenX * scale;
        relativeScreenY += inputObject.path[0].relativeScreenY * scale;
    });
    
    relativeScreenX /= inputCount * scale;
    relativeScreenY /= inputCount * scale;
                                
    return {relativeScreenX, relativeScreenY};
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
