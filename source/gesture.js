import {featureFactory} from './feature';

export let userDefinedGestures = new Map();

let gestureFlags = {
    ONESHOT: 'oneshot',
    STICKY: 'sticky',
    BUBBLE: 'bubble'
};

export function createGesture(definition) {
    let features = [],
        flags = [],
        matchedInputIds = [],
        previousInputIds = [],
        bubbleNodesToEmitOn = [],
        nodesToEmitOn = [];

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

    let hasOneshotFlag = flags.indexOf(gestureFlags.ONESHOT) !== -1,
        hasStickyFlag = flags.indexOf(gestureFlags.STICKY) !== -1,
        hasBubbleFlag = flags.indexOf(gestureFlags.BUBBLE) !== -1,
        hasNoFlags = flags.length === 0;

    function extractIdentifiersFrom(inputObjects = []) {
        return inputObjects
                    .filter(inputObject => !!inputObject)
                    .map(inputObject => inputObject.identifier);
    }

    function compareInput(first, second) {
        let equalLength = first.length === second.length,
            secondContainsAllOfFirst = first.every(item => {
                return second.indexOf(item) !== -1;
            });

        return equalLength && secondContainsAllOfFirst;
    }

    function validInput(inputObjects = []) {
        return !!inputObjects.length;
    }

    return {
        definition() {
            return definition;
        },

        name() {
            return definition.name;
        },

        features() {
            return features;
        },

        load(inputState = {}) {
            let {inputObjects,
                    node} = inputState;

            if (validInput(inputObjects)) {
                // boils down to
                // gestures with oneshot flags should be triggered once
                // until the identifiers change (e.g. tuio session ids)
                let currentInputIds = extractIdentifiersFrom(inputObjects),
                    inputPreviouslyMatched = compareInput(currentInputIds,
                                                        matchedInputIds),
                    isSameAsPreviousInput = compareInput(currentInputIds,
                                                        previousInputIds),
                    everyFeatureMatches = false,
                    oneshotFlagFulfilled = hasOneshotFlag && inputPreviouslyMatched;

                // save for the next time the .load method is called
                previousInputIds = currentInputIds;
                // the gesture should not match if it is oneshot
                // and already triggered
                if (!oneshotFlagFulfilled) {
                    everyFeatureMatches = features.every(
                            feature => feature.load(inputState));
                }
                if (hasBubbleFlag) {
                    if (!isSameAsPreviousInput) {
                        bubbleNodesToEmitOn = [];
                    }
                    if (bubbleNodesToEmitOn.indexOf(node) === -1) {
                        bubbleNodesToEmitOn.push(node);
                    }
                }
                if (everyFeatureMatches) {
                    if (hasBubbleFlag) {
                        nodesToEmitOn = bubbleNodesToEmitOn;
                    }
                    else if (
                        // oneshot gestures will get here only once
                        hasOneshotFlag ||
                        // if the input was already matched
                        // use the node previously set for sticky gestures
                        (hasStickyFlag && !inputPreviouslyMatched) ||
                        hasNoFlags
                    ) {
                        nodesToEmitOn = [node];
                    }
                    // save currentInputIds for future reference
                    matchedInputIds = currentInputIds;
                }
                else {
                    nodesToEmitOn = [];
                }
            }

            return nodesToEmitOn;
        },

        flags() {
            return flags;
        }
    };
}

export let gestureException = {
    EMPTY: `Attempting to define a gesture without
                        passing a gesture`,
    NO_NAME: 'Attempting to define a gesture without name',
    NO_FEATURES: 'Attempting to define a gestures without features',
    DUPLICATE: 'Attempting to define a gesture that already exists',
    INVALID_FLAGS: 'Attempting to define a gesture with an invalid flag'
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
