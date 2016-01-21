import {vector} from './vector';
import motion from './features/motion';
import count from './features/count';
import path from './features/path';
import {DollarRecognizer} from './libs/dollar';

let singleAppRecognizer = new DollarRecognizer();

export function featureFactory(params = {}) {

    let {type = ''} = params;

    switch (type.toLowerCase()) {
    case 'motion':
        return motion(params);
    case 'count':
        return count(params);
    case 'path':
        params.recognizer = singleAppRecognizer;
        return path(params);
    default:
        throw new Error(`${featureException.NONEXISTING} ${type}`);
    }
}

export function featureBase(params) {
    let _feature = {},
        {filters} = params;

    _feature.validInput = function featureLoad(inputState = []) {
        return !!inputState.length;
    };

    _feature.matchFiltersWith = function featureMatchFiltersWith(input) {
        //tuio v1 objects and cursors have not typeid
        //unknown typeId in v2 is 0
        let typeId = input.type ? input.type : 0,
            typeIdKnown = typeId !== 0,
            hasNoFilters = typeof filters === 'undefined',
            filtersMatch = false;

        if (typeIdKnown) {
            let typeIdAsBitmask = 1<<(typeId-1);
            filtersMatch = filters & typeIdAsBitmask;
        }

        return hasNoFilters || filtersMatch;
    };

    return _feature;
}

export function lowerUpperLimit(constraints = []) {
    let _limit = {};

    _limit.lower = constraints[0];
    _limit.upper = constraints[1];

    return _limit;
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

export let featureException = {
    NONEXISTING: 'Attempting to add a gesture with a non-existing feature:'
};
