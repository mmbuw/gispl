import {events} from './events';
import {compareInput} from './inputComparison';
import {createEventObject,
        eventPropagates} from './eventObject';
import {userDefinedGestures} from './gesture';

const builtInEvents = Object.freeze({
    INPUTSTART: 'inputstart',
    INPUTEND: 'inputend',
    INPUTCHANGE: 'inputchange'
});

export function gestureEmition(params = {}) {
    
    let allPreviousInput = [],
        {findNode} = params;
    
    function triggerCollection(nodesToEmitOn, eventName, eventObject) {
        for (let i = 0; i < nodesToEmitOn.length; i += 1) {
            let currentNode = nodesToEmitOn[i];
            events.emit(currentNode, eventName, eventObject);
            if (eventPropagates(eventObject)) {
                let parents = findNode.parentsOf(currentNode);
                for (let j = 0; j < parents.length; j += 1) {
                    if (eventPropagates(eventObject)) {
                        let parent = parents[j];
                        eventObject.currentTarget = parent;
                        events.emit(parent, eventName, eventObject);
                    }
                }
            }
        }
    }

    function triggerOnLastKnownNode(inputObjects, event) {
        let lastKnownInputObject = inputObjects[0],
            foundNode = findNode.fromPoint(lastKnownInputObject),
            eventObject = createEventObject(inputObjects, foundNode);
        
        triggerCollection([foundNode], event, eventObject);
    }
    
    return {
        builtIn(allCurrentInput) {
            if (allCurrentInput.length !== 0 &&
                allPreviousInput.length === 0) {
                triggerOnLastKnownNode(allCurrentInput,
                                        builtInEvents.INPUTSTART);
            }
            else if (allCurrentInput.length === 0 &&
                allPreviousInput.length !== 0) {
                triggerOnLastKnownNode(allPreviousInput,
                                        builtInEvents.INPUTEND);
            }
            else if (!compareInput(allCurrentInput,
                                            allPreviousInput)) {
                triggerOnLastKnownNode(allCurrentInput,
                                        builtInEvents.INPUTCHANGE);
            }
            
            allPreviousInput.length = 0;
            for (let i = 0; i < allCurrentInput.length; i += 1) {
                allPreviousInput[i] = allCurrentInput[i];
            }
        },
        userDefined(nodesInput, nodesInputHistory) {
            nodesInput.forEach(function forAllNodes(inputObjects, node) {
                userDefinedGestures.forEach(function forAllGestures(gesture) {
                    let inputHistory = nodesInputHistory.get(node),
                        inputState = createInputState(inputObjects, inputHistory, node),
                        nodesToEmitOn = gesture.load(inputState);
                    if (nodesToEmitOn.length !== 0) {
                        let eventName = gesture.name(),
                            eventObject = createEventObject(inputObjects, nodesToEmitOn[0], gesture);
                        triggerCollection(nodesToEmitOn, eventName, eventObject);
                    }
                });
            });
        }
    };
}

let inputState = {
    inputObjects: undefined,
    inputHistory: undefined,
    node: undefined
};
function createInputState(inputObjects, inputHistory, node) {
    inputState.inputObjects = inputObjects;
    inputState.inputHistory = inputHistory;
    inputState.node = node;
    return inputState;
}