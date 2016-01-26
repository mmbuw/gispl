import {featureFactory} from './feature';

export let userDefinedGestures = new Map();

export function createGesture(definition) {
    let gestureApi = {},
        features = [],
        flags = [],
        matchedInputIds = [];

    isValidGesture(definition);

    definition.features.forEach(feature => {
        features.push(featureFactory(feature));
    });

    let definitionFlags = definition.flags;
    if (typeof definitionFlags === 'string') {
        definitionFlags = [definitionFlags];
    }
    if (Array.isArray(definitionFlags)) {
        flags.push(...definitionFlags);
    }

    function extractIdentifiersFrom(inputState = []) {
        return inputState.map(inputObject => inputObject.identifier);
    }

    function inputEquals(first, second) {
        let equalLength = first.length === second.length,
            secondContainsAllOfFirst = first.every(item => {
                return second.indexOf(item) !== -1;
            });

        return equalLength && secondContainsAllOfFirst;
    }

    gestureApi.definition = function gestureDefinition() {
        return definition;
    };

    gestureApi.name = function gestureName() {
        return definition.name;
    };

    gestureApi.features = function gestureFeatures() {
        return features;
    };

    gestureApi.load = function gestureLoad(inputState) {
        let match = false,
            // boils down to
            // gestures with oneshot flags should be triggered once
            // until the identifiers change (e.g. tuio session ids)
            currentInputIds = extractIdentifiersFrom(inputState),
            changedInputIds = !inputEquals(currentInputIds, matchedInputIds);

        let hasOneshotFlag = flags.indexOf('oneshot') !== -1,
            oneshotFlagFulfilled = hasOneshotFlag && !changedInputIds;

        if (!oneshotFlagFulfilled) {
            match = features.every(feature => feature.load(inputState));
            if (match && hasOneshotFlag) {
                matchedInputIds = currentInputIds;
            }
        }

        return match;
    };

    gestureApi.flags = function gestureFlags() {
        return flags;
    };

    return gestureApi;
}

export let gestureException = {
    EMPTY: `Attempting to define a gesture without
                        passing a gesture`,
    NO_NAME: 'Attempting to define a gesture without name',
    NO_FEATURES: 'Attempting to define a gestures without features',
    DUPLICATE: 'Attempting to define a gesture that already exists',
    INVALID_FLAGS: 'Attempting to define a gesture with an invalid flag'
};

let gestureFlags = {
    ONESHOT: 'oneshot',
    STICKY: 'sticky',
    BUBBLE: 'bubble'
};

let gestureFlagNames = Object.keys(gestureFlags).map(key => {
    return gestureFlags[key];
});

function isValidGesture(definition) {
    if (typeof definition === 'undefined' ||
            Object.keys(definition).length === 0) {
        throw new Error(gestureException.EMPTY);
    }

    let {name, features, flags:definitionFlags} = definition;

    if (typeof name === 'undefined') {
        throw new Error(gestureException.NO_NAME);
    }
    if (typeof features === 'undefined' ||
            typeof features.length === 'undefined' ||
            features.length === 0) {
        throw new Error(gestureException.NO_FEATURES);
    }
    if (userDefinedGestures.has(name)) {
        throw new Error(gestureException.DUPLICATE);
    }
    if (typeof definitionFlags !== 'undefined') {
        let flagIsValid = false;
        if (typeof definitionFlags === 'string') {
            flagIsValid = gestureFlagNames.some(flagName => {
                return flagName === definitionFlags;
            });
        }
        else if (Array.isArray(definitionFlags)) {
            flagIsValid = definitionFlags.every(flagName => {
                return gestureFlagNames.indexOf(flagName) !== -1;
            });
        }
        if (!flagIsValid) {
            throw new Error(`${gestureException.INVALID_FLAGS}.
                Expecting some of: ${gestureFlagNames}; received: ${definitionFlags}`);
        }
    }
}
