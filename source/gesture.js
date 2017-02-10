import {featureFactory} from './feature';
import {inputObjectFromPath} from './tuio/tuioInputObject';
import {inputComparison} from './inputComparison';

export let userDefinedGestures = new Map();

const gestureFlags = Object.freeze({
    ONESHOT: 'oneshot',
    STICKY: 'sticky',
    BUBBLE: 'bubble'
});

const gestureFlagNames = Object.freeze(
    Object.keys(gestureFlags).map(key => gestureFlags[key])
);

const gesturePrivate = new WeakMap();

class Gesture {
    constructor(gestureDefinition) {
        gesturePrivate.set(this, {
            gestureDefinition,
            bubbleTopNodes: [],
            validTopNodesOnEmit: [],
            stickyTopNode: null,
            features: initializeFeaturesFrom(gestureDefinition),
            flags: extractFlagsFrom(gestureDefinition),
            duration: extractDurationFrom(gestureDefinition),
            inputCheck: inputComparison()
        });
    }

    definition() {
        return gesturePrivate.get(this).gestureDefinition;
    }

    name() {
        return gesturePrivate.get(this).gestureDefinition.name;
    }

    features() {
        return gesturePrivate.get(this).features;
    }

    flags() {
        return gesturePrivate.get(this).flags;
    }

    duration() {
        return gesturePrivate.get(this).duration;
    }

    featureValuesToObject(data) {
        const {features} = gesturePrivate.get(this);
        for (let i = 0; i < features.length; i += 1) {
            features[i].setValueToObject(data);
        }
        return this;
    }
    // hopefully somehow simpler in the future
    // checks if the gesture is valid by validating every feature
    // and returns nodes to emit gestures on (based on which flags are set)
    load(inputState = {}) {
        
        let {
            flags,
            duration,
            features,
            bubbleTopNodes,
            validTopNodesOnEmit,
            inputCheck
        } = gesturePrivate.get(this);

        let hasOneshotFlag = flags.indexOf(gestureFlags.ONESHOT) !== -1,
            hasBubbleFlag = flags.indexOf(gestureFlags.BUBBLE) !== -1,
            hasStickyFlag = flags.indexOf(gestureFlags.STICKY) !== -1,
            hasNoFlag = flags.length === 0;

        // temp inline
        function inputObjectsFrom(inputState) {
            let {inputObjects} = inputState;

            if (duration.definition.length !== 0) {
                inputObjects = validInputFromDuration(inputObjects, duration);
            }

            return inputObjects;
        }

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
                //inline temporarily
                everyFeatureMatches = true;
                for (let i = 0; i < features.length; i += 1) {
                    if (!features[i].load(inputState)) {
                        everyFeatureMatches = false; break;
                    } 
                }
            }
            if (hasBubbleFlag) {
                if (!inputCheck.previouslyUsed()) {
                    bubbleTopNodes.length = 0;
                }
                if (bubbleTopNodes.indexOf(node) === -1) {
                    bubbleTopNodes[bubbleTopNodes.length] = node;
                }
            }
            if (everyFeatureMatches) {
                validTopNodesOnEmit.length = 0;
                if (hasBubbleFlag) {
                    for (let i = 0; i < bubbleTopNodes.length; i += 1) {
                        validTopNodesOnEmit[i] = bubbleTopNodes[i];
                    }
                }
                else if (hasStickyFlag) {
                    // if input the same use the already known sticky node
                    if (!inputCheck.previouslyMatched()) {
                        gesturePrivate.get(this).stickyTopNode = node;
                    }
                    validTopNodesOnEmit[validTopNodesOnEmit.length] = gesturePrivate.get(this).stickyTopNode;
                }
                else if (
                    // oneshot gestures will get here only once
                    hasOneshotFlag || hasNoFlag
                ) {
                    validTopNodesOnEmit[validTopNodesOnEmit.length] = node;
                }
                // save currentInputIds for future reference
                inputCheck.matched();
            }
            else {
                validTopNodesOnEmit.length = 0;
            }
        }
        return validTopNodesOnEmit;
    }
}

export function createGesture(gestureDefinition) {
    // don't store gesture if definition invalid 
    isValidGesture(gestureDefinition);
    return new Gesture(gestureDefinition);
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

function validInputPathFromDuration(inputObject, duration, currentTime) {
    let validInputPath = [];
    for (let j = 0; j < inputObject.path.length; j += 1) {
        let point = inputObject.path[j];
        let timeDiff = currentTime - point.startingTime;
        if (timeDiff <= duration.start &&
            timeDiff >= duration.end) {
            validInputPath[validInputPath.length] = point;
        }
    }
    
    return validInputPath;
}

export function validInputFromDuration(inputObjects = [], duration) {
    let validInputObjects = [],
        currentTime = Date.now();

    for (let i = 0; i < inputObjects.length; i += 1) {
        let inputObject = inputObjects[i];
        let validInputPath = validInputPathFromDuration(inputObject,
                                                        duration,
                                                        currentTime);
        if (validInputPath.length !== 0) {
            let validInputObject = inputObjectFromPath(inputObject, validInputPath);
            validInputObjects[validInputObjects.length] = validInputObject;
        }
    }

    return validInputObjects;
}