import motion from './features/motion';
import count from './features/count';
import path from './features/path';

export function featureFactory(params = {}) {

    let {type = ''} = params;

    switch (type.toLowerCase()) {
    case 'motion':
        return motion(params);
    case 'count':
        return count(params);
    case 'path':
        return path(params);
    default:
        throw new Error(`${featureException.NONEXISTING} ${type}`);
    }
}

function typeIdToBitmask(typeId) {
    return 1<<(typeId-1);
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
            typeIdMatchesFilters = filters & typeIdToBitmask(typeId),
            hasNoFilters = typeof filters === 'undefined';

        return hasNoFilters || (typeIdKnown && !!typeIdMatchesFilters);
    };

    return _feature;
}

export function lowerUpperLimit(constraints = []) {
    let _limit = {};

    _limit.lower = constraints[0];
    _limit.upper = constraints[1];

    return _limit;
}

export let featureException = {
    NONEXISTING: 'Attempting to add a gesture with a non-existing feature:'
};
