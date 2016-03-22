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
            foundNode = findNode.fromPoint(lastKnownInputObject);
            
        findNode.withParentsOf(foundNode).forEach(
            node => events.emit(node, event)
        );
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
            nodesInput.forEach((inputObjects, node) => {
                userDefinedGestures.forEach(gesture => {
                    let inputHistory = nodesInputHistory.get(node),
                        inputState = {inputObjects, inputHistory, node},
                        nodesToEmitOn = gesture.load(inputState);
                    
                    if (nodesToEmitOn.length !== 0) {
                        let eventName = gesture.name(),
                            eventObject = createEventObject({
                                inputState, gesture
                            });
                                            
                        nodesToEmitOn.forEach(nodeToEmitOn => {
                            events.emit(nodeToEmitOn, eventName, eventObject);
                        });   
                    }
                });
            });
        }
    };
}