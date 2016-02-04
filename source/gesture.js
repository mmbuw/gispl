import {featureFactory} from './feature';

export let userDefinedGestures = new Map();

let gestureFlags = {
    ONESHOT: 'oneshot',
    STICKY: 'sticky',
    BUBBLE: 'bubble'
};

let gestureFlagNames = Object.keys(gestureFlags).map(key => {
    return gestureFlags[key];
});

export function createGesture(definition) {
    let matchedInputIds = [],
        previousInputIds = [],
        bubbleTopNodes = [],
        validTopNodesOnEmit = [],
        features;
        
    // don't store gesture if definition invalid 
    isValidGesture(definition);
    // initialize and store features
    // a valid gesture has every feature valid
    features = initializeFeaturesFrom(definition);
    // initialize flags
    let flags = extractFlagsFrom(definition),
    // whether the gesture should be triggered on the found top nodes
    // or on top nodes and all the parent nodes
    // as with native event propagation
        {propagation = true} = definition;
    // check state of flags
    // at the moment, flags can't be changed after defining the gesture
    let hasOneshotFlag = flags.indexOf(gestureFlags.ONESHOT) !== -1,
        hasStickyFlag = flags.indexOf(gestureFlags.STICKY) !== -1,
        hasBubbleFlag = flags.indexOf(gestureFlags.BUBBLE) !== -1,
        hasNoFlags = flags.length === 0;
        
    function validateEveryFeatureFrom(inputState) {
        return features.every(feature => feature.load(inputState));
    }
    
    function resultingNodes() {
        let result = [];
        if (propagation) {
            // find all parent nodes from all valid nodes
            // and add them only once
            validTopNodesOnEmit.forEach(topNode => {
                parentNodesFrom(topNode).forEach(node => {
                    if (result.indexOf(node) === -1) {
                        result.push(node);
                    }
                });
            });
        }
        else {
            result = validTopNodesOnEmit;
        }
        return result;
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
        // hopefully somehow simpler in the future
        // checks if the gesture is valid by validating every feature
        // and returns nodes to emit gestures on (based on which flags are set)
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
                    everyFeatureMatches = validateEveryFeatureFrom(inputState);
                }
                if (hasBubbleFlag) {
                    if (!isSameAsPreviousInput) {
                        bubbleTopNodes = [];
                    }
                    bubbleTopNodes.push(node);
                }
                if (everyFeatureMatches) {
                    if (hasBubbleFlag) {
                        validTopNodesOnEmit = bubbleTopNodes;
                    }
                    else if (
                        // oneshot gestures will get here only once
                        hasOneshotFlag ||
                        // if the input was already matched
                        // use the node previously set for sticky gestures
                        (hasStickyFlag && !inputPreviouslyMatched) ||
                        hasNoFlags
                    ) {
                        validTopNodesOnEmit = [node];
                    }
                    // save currentInputIds for future reference
                    matchedInputIds = currentInputIds;
                }
                else {
                    validTopNodesOnEmit = [];
                }
            }
            // will also include parent nodes of all nodes, if enabled 
            return resultingNodes();
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

function isValidGesture(definition) {
    if (typeof definition === 'undefined' ||
            Object.keys(definition).length === 0) {
        throw new Error(gestureException.EMPTY);
    }

    let {name, features} = definition;

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
    if (typeof definition.flags !== 'undefined') {
        let definitionFlags = extractFlagsFrom(definition);
        // needs to be one of 'sticky', 'bubble', 'oneshot'
        let validFlags = definitionFlags.every(flagName => {
            return gestureFlagNames.indexOf(flagName) !== -1;
        });
        if (!validFlags) {
            throw new Error(`${gestureException.INVALID_FLAGS}.
                Expecting some of: ${gestureFlagNames}; received: ${definitionFlags}`);
        }
    }
}

// returns an array of instantiated feature objects
function initializeFeaturesFrom(definition) {
    return definition.features.map(feature => {
        return featureFactory(feature);
    });
}

// definition can have flags set as string, 'oneshot'
// or array of flags, ['oneshot'], or ['oneshot', 'bubble']
// always returns an array
function extractFlagsFrom(definition) {
    let definitionFlags = definition.flags,
        flags = [];
    if (typeof definitionFlags !== 'undefined') {
        if (!Array.isArray(definitionFlags)) {
            definitionFlags = [definitionFlags];   
        }
        flags = definitionFlags;
    }
    return flags;
}

// returns an array of identifiers [1,2,...]
// from an array of inputObjects
// [{identifier: 1,...}, {identifier: 2,...},...}
function extractIdentifiersFrom(inputObjects = []) {
    return inputObjects
                .filter(inputObject => !!inputObject)
                .map(inputObject => inputObject.identifier);
}
// compares if an array (of identifiers) is equal to another
// [1,2,3] equals [1,2,3]
// but also [3,2,1]
function compareInput(first, second) {
    let equalLength = first.length === second.length,
        secondContainsAllOfFirst = first.every(item => {
            return second.indexOf(item) !== -1;
        });

    return equalLength && secondContainsAllOfFirst;
}
// check if inputObjects are an array with at least one element
function validInput(inputObjects = []) {
    return !!inputObjects.length;
}

function parentNodesFrom(topNode) {
    let existingNode = topNode,
        result = [];
        
    while (existingNode) {
        result.push(existingNode);
        existingNode = existingNode.parentNode;
    }
    
    return result;
}