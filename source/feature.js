import motion from './features/motion';
import count from './features/count';

export function featureFactory(params = {}) {

    let {type = ''} = params;

    switch (type.toLowerCase()) {
    case 'motion':
        return motion(params);
    case 'count':
        return count(params);
    default:
        throw new Error(`${featureException.NONEXISTING} ${type}`);
    }
}

function typeIdToBitmask(typeId) {
    return 1<<(typeId-1);
}

function isTuio2(input) {
    return typeof input.getTypeId === 'function';
}

export function featureBase(params) {
    let featureApi = {},
        {filters} = params;

    featureApi.validInput = function featureLoad(inputState = []) {
        return !!inputState.length;
    };

    featureApi.matchFiltersWith = function featureMatchFiltersWith(input) {
        //tuio v1 objects and cursors have not typeid
        //unknown typeId in v2 is 0
        let typeId = isTuio2(input) ? input.getTypeId() : 0,
            typeIdKnown = typeId !== 0,
            typeIdMatchesFilters = filters & typeIdToBitmask(typeId),
            hasNoFilters = typeof filters === 'undefined';

        return hasNoFilters || (typeIdKnown && !!typeIdMatchesFilters);
    };

    return featureApi;
}

export function lowerUpperLimit(constraints = []) {
    let limitApi = {};

    limitApi.lower = constraints[0];
    limitApi.upper = constraints[1];

    return limitApi;
}

export let featureException = {
    NONEXISTING: 'Attempting to add a gesture with a non-existing feature:'
};
