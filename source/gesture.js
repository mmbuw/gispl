import {featureFactory} from './feature';
import {inputObjectFromPath} from './tuio/tuioInputObject';
import {inputComparison} from './inputComparison';
import nodeSearch from './tuio/nodeSearch';

export let userDefinedGestures = new Map();

const gestureFlags = Object.freeze({
    ONESHOT: 'oneshot',
    STICKY: 'sticky',
    BUBBLE: 'bubble'
});

const gestureFlagNames = Object.freeze(
    Object.keys(gestureFlags).map(key => {
        return gestureFlags[key];
    })
);

export function createGesture(gestureDefinition,
                                findNode = nodeSearch()) {
    let bubbleTopNodes = [],
        stickyTopNode = null,
        validTopNodesOnEmit = [],
        result = [],
        features;

    // don't store gesture if definition invalid 
    isValidGesture(gestureDefinition);
    // initialize and store features
    // a valid gesture has every feature valid
    features = initializeFeaturesFrom(gestureDefinition);
    // initialize flags
    let flags = extractFlagsFrom(gestureDefinition),
        hasOneshotFlag = flags.indexOf(gestureFlags.ONESHOT) !== -1,
        hasBubbleFlag = flags.indexOf(gestureFlags.BUBBLE) !== -1,
        hasStickyFlag = flags.indexOf(gestureFlags.STICKY) !== -1,
        hasNoFlag = flags.length === 0,
        duration = extractDurationFrom(gestureDefinition),
        // whether the gesture should be triggered on the found top nodes
        // or on top nodes and all the parent nodes
        // as with native event propagation
        {propagation = true} = gestureDefinition;
    
    let inputCheck = inputComparison();

    function validateEveryFeatureFor(inputState) {
        return features.every(feature => feature.load(inputState));
    }

    function inputObjectsFrom(inputState) {
        let {inputObjects} = inputState;

        if (duration.definition.length !== 0) {
            inputObjects = validInputFromDuration(inputObjects, duration);
        }

        return inputObjects;
    }
    
    // find all parent nodes from all valid nodes
    // and add them only once
    function nodeWithParents() {
        for (let i = 0; i < validTopNodesOnEmit.length; i += 1) {
            let topNode = validTopNodesOnEmit[i],
                topNodeWithParents = findNode.withParentsOf(topNode);
            for (let j = 0; j < topNodeWithParents.length; j += 1) {
                let node = topNodeWithParents[j];
                if (result.indexOf(node) === -1) {
                    result.push(node);
                }   
            }
        }
    }

    function resultingNodes() {
        result.length = 0;
        if (propagation) {
            nodeWithParents();
        }
        else {
            for (let i = 0; i < validTopNodesOnEmit.length; i += 1) {
                result.push(validTopNodesOnEmit[i]);
            }
        }
        return result;
    }

    return {
        definition() {
            return gestureDefinition;
        },

        name() {
            return gestureDefinition.name;
        },

        features() {
            return features;
        },

        flags() {
            return flags;
        },

        duration() {
            return duration;
        },
        // hopefully somehow simpler in the future
        // checks if the gesture is valid by validating every feature
        // and returns nodes to emit gestures on (based on which flags are set)
        load(inputState = {}) {

            inputState.inputObjects = inputObjectsFrom(inputState);

            let {node,
                inputObjects} = inputState;

            if (validInput(inputObjects)) {
                inputCheck.use(inputObjects);
                // boils down to
                // gestures with oneshot flags should be triggered once
                // until the identifiers change (e.g. tuio session ids)
                let everyFeatureMatches = false,
                    oneshotFlagFulfilled = hasOneshotFlag &&
                                                inputCheck.previouslyMatched();
                // the gesture should not match if it is oneshot
                // and already triggered
                if (!oneshotFlagFulfilled) {
                    everyFeatureMatches = validateEveryFeatureFor(inputState);
                }
                if (hasBubbleFlag) {
                    if (!inputCheck.previouslyUsed()) {
                        bubbleTopNodes.length = 0;
                    }
                    if (bubbleTopNodes.indexOf(node) === -1) {
                        bubbleTopNodes.push(node);
                    }
                }
                if (everyFeatureMatches) {
                    if (hasBubbleFlag) {
                        validTopNodesOnEmit = bubbleTopNodes;
                    }
                    else if (hasStickyFlag) {
                        // if input the same use the already known sticky node
                        if (!inputCheck.previouslyMatched()) {
                            stickyTopNode = node;
                        }
                        validTopNodesOnEmit.length = 0;
                        validTopNodesOnEmit.push(stickyTopNode);
                    }
                    else if (
                        // oneshot gestures will get here only once
                        hasOneshotFlag ||
                        hasNoFlag
                    ) {
                        validTopNodesOnEmit.length = 0;
                        validTopNodesOnEmit.push(node);
                    }
                    // save currentInputIds for future reference
                    inputCheck.matched();
                }
                else {
                    validTopNodesOnEmit.length = 0;
                }
            }
            // will also include parent nodes of all nodes, if enabled 
            return resultingNodes();
        },
        featureValuesToObject(data) {
            for (let i = 0; i < features.length; i += 1) {
                let feature = features[i];
                feature.setValueToObject(data);
            }
            return this;
        }
    };
}

export const gestureException = Object.freeze({
    EMPTY: `Attempting to define a gesture without
                        passing a gesture`,
    NO_NAME: 'Attempting to define a gesture without name',
    NO_FEATURES: 'Attempting to define a gestures without features',
    DUPLICATE: 'Attempting to define a gesture that already exists',
    INVALID_FLAGS: 'Attempting to define a gesture with an invalid flag',
    INVALID_DURATION: 'Attempting to define a gesture with invalid duration'
});

function isValidGesture(definition) {
    if (typeof definition === 'undefined' ||
        Object.keys(definition).length === 0) {
        throw new Error(gestureException.EMPTY);
    }

    let {name, features, duration} = definition;

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
    if (typeof duration !== 'undefined') {
        if (!Array.isArray(duration) ||
            duration.length > 2) {
            throw new Error(`${gestureException.INVALID_DURATION}. Expecting
                                [number], or [number, number]; received ${duration}`);
        }
        duration.forEach(durationLimit => {
            if (typeof durationLimit !== 'number') {
                throw new Error(`${gestureException.INVALID_DURATION}. Expecting
                                    array of numbers, received ${typeof durationLimit}`);
            }
        });
    }
}

// returns an array of instantiated feature objects
function initializeFeaturesFrom(gestureDefinition) {
    return gestureDefinition.features.map(feature => {
        return featureFactory(feature);
    });
}

// definition can have flags set as string, 'oneshot'
// or array of flags, ['oneshot'], or ['oneshot', 'bubble']
// always returns an array
function extractFlagsFrom(gestureDefinition) {
    let definitionFlags = gestureDefinition.flags,
        flags = [];
    if (typeof definitionFlags !== 'undefined') {
        if (!Array.isArray(definitionFlags)) {
            definitionFlags = [definitionFlags];
        }
        flags = definitionFlags;
    }
    return flags;
}

export function extractDurationFrom(definitionObject) {
    let duration = {
        // original definition
        definition: [],
        // in milliseconds
        start: Infinity,
        end: 0
    };
    if (typeof definitionObject.duration !== 'undefined') {
        let definition = duration.definition = definitionObject.duration;
        if (typeof definition[0] !== 'undefined') {
            duration.start = definition[0];
        }
        if (typeof definition[1] !== 'undefined') {
            duration.end = definition[1];
        }
    }
    return duration;
}
// check if inputObjects are an array with at least one element
function validInput(inputObjects = []) {
    return !!inputObjects.length;
}

export function validInputFromDuration(inputObjects = [], duration) {
    let validInputObjects = [],
        currentTime = new Date().getTime();

    inputObjects.forEach(inputObject => {
        let validInputPath = inputObject.path.filter(point => {
            let timeDiff = currentTime - point.startingTime;
            return (timeDiff <= duration.start &&
                timeDiff >= duration.end);
        });
        if (validInputPath.length !== 0) {
            let validInputObject = inputObjectFromPath({
                inputObject,
                path: validInputPath
            });
            validInputObjects.push(validInputObject);
        }
    });

    return validInputObjects;
}