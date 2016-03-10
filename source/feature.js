import {vector} from './vector';
import * as features from './features';
import {extractDurationFrom,
        validInputFromDuration} from './gesture';
import {DollarRecognizer} from './libs/dollar';

let singleRecognizerInstance = new DollarRecognizer();

export function featureFactory(params = {}) {

    let {type = ''} = params;
    
    type = type.toLowerCase();
    let constructor = features[type];
    
    if (typeof constructor === 'undefined') {
        throw new Error(`${featureException.NONEXISTING} ${type}`);
    }
    if (type === 'path') {
        params.recognizer = singleRecognizerInstance;   
    }
    
    return constructor(params);
}

export function featureBase(params) {
    let {filters,
            type} = params,
        duration = extractDurationFrom(params),
        matchedValue;
    
    
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
        setMatchedValue(value) {
            matchedValue = value;
        },
        setValueToObject(featureValues) {
            if (typeof featureValues === 'object') {
                featureValues[type.toLowerCase()] = matchedValue;
            }
        }
    };
}

export function extractConstraintsFrom(params) {
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
    
export function pointToPointDistance(first, second) {
    // scale helps with floating point inprecision 
    // without it some edge case in tests will fail
    // because instead of 2, the scale factor will be 2.00...004
    // using screenX which is an integer does not always help
    // also don't change to (first - second) * scale
    let scale = 10000,
        x = (first.relativeScreenX * scale - second.relativeScreenX * scale),
        y = (first.relativeScreenY * scale - second.relativeScreenY * scale),
        directionVector = vector({x, y});
        
    return directionVector.length() / scale;
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
    
    let screenX = relativeScreenX * window.screen.width,
        screenY = relativeScreenY * window.screen.height; 
                                
    return {relativeScreenX, relativeScreenY,
                screenX, screenY};
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

export const featureException = Object.freeze({
    NONEXISTING: 'Attempting to add a gesture with a non-existing feature:'
});
