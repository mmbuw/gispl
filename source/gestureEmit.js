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
        nodesForBuiltInEvents = Array(1),
        triggeredParents = [],
        {findNode} = params;
    
    function triggerCollection(nodesToEmitOn, inputObjects, gesture) {
        let eventName = typeof gesture === 'string' ?
                                            gesture :
                                            gesture.name();
        let eventObject;
        triggeredParents.length = 0;
        for (let i = 0; i < nodesToEmitOn.length; i += 1) {
            let currentNode = nodesToEmitOn[i];
            eventObject = createEventObject(nodesToEmitOn, currentNode, inputObjects, gesture);
            events.emit(currentNode, eventName, eventObject);
            if (eventPropagates(eventObject)) {
                let parents = findNode.parentsOf(currentNode);
                for (let j = 0; j < parents.length; j += 1) {
                    if (eventPropagates(eventObject)) {
                        let parent = parents[j];
                        if (triggeredParents.indexOf(parent) === -1) {
                            triggeredParents[triggeredParents.length] = parent;
                            eventObject = createEventObject(nodesToEmitOn, currentNode, inputObjects, gesture);
                            eventObject.currentTarget = parent;
                            events.emit(parent, eventName, eventObject);   
                        }
                    }
                }
            }
        }
    }

    function triggerOnLastKnownNode(inputObjects, event) {
        let lastKnownInputObject = inputObjects[0],
            foundNode = findNode.fromPoint(lastKnownInputObject);
            
        nodesForBuiltInEvents[0] = foundNode;
        triggerCollection(nodesForBuiltInEvents, inputObjects, event);
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
                        triggerCollection(nodesToEmitOn, inputObjects, gesture);
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