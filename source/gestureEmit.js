import {events} from './events';
import {compareInput} from './inputComparison';
import {createEventObject} from './eventObject';
import {userDefinedGestures} from './gesture';

const builtInEvents = Object.freeze({
    INPUTSTART: 'inputstart',
    INPUTEND: 'inputend',
    INPUTCHANGE: 'inputchange'
});

export function gestureEmition(params = {}) {
    
    let allPreviousInput = [],
        {findNode} = params;

    function triggerOnLastKnownNode(inputObjects, event) {
        let lastKnownInputObject = inputObjects[0],
            foundNode = findNode.fromPoint(lastKnownInputObject),
            foundNodeWithParents = findNode.withParentsOf(foundNode);
            
        for (let i = 0; i < foundNodeWithParents.length; i += 1) {
            let node = foundNodeWithParents[i],
                eventObject = createEventObject(inputObjects);
                
            events.emit(node, event, eventObject);
        }
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
                events.emit(document,
                                builtInEvents.INPUTCHANGE);
            }
            
            allPreviousInput = allCurrentInput;
        },
        userDefined(nodesInput, nodesInputHistory) {
            nodesInput.forEach(function forAllNodes(inputObjects, node) {
                userDefinedGestures.forEach(function forAllGestures(gesture) {
                    let inputHistory = nodesInputHistory.get(node),
                        inputState = createInputState(inputObjects, inputHistory, node),
                        nodesToEmitOn = gesture.load(inputState);
                    
                    if (nodesToEmitOn.length !== 0) {
                        let eventName = gesture.name(),
                            eventObject = createEventObject(inputObjects, gesture);
                        
                        for (let i = 0; i < nodesToEmitOn.length; i += 1) {
                            events.emit(nodesToEmitOn[i], eventName, eventObject);
                        }
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