import {tuioObjectUpdate} from '../tuio/tuioInputObject';

export default function touchInput(params) {
    let listeners = [],
        enabled = false,
        currentIndentifier = 0,
        identifierMapping = new Map(),
        currentInput = [],
        touchInputHistory = nodesInputHistory(params);

    function inputObjectFromNative(nativeInputObject) {
        let identifier = currentIndentifier,
            point = pointInformation(nativeInputObject),
            path = [point];
        
        identifierMapping.set(nativeInputObject.identifier, identifier);
        currentIndentifier += 1;

        return {
            identifier,
            path,
            ...point
        };
    }

    function pointInformation(nativeInputObject) {
        let {screenX, screenY,
            clientX, clientY,
            pageX, pageY} = nativeInputObject;
        
        return {
            screenX, screenY,
            clientX, clientY,
            pageX, pageY
        };
    }

    function nativeObjectUpdate(inputObject, nativeInputObject) {
        // update path
        let lastPoint = pointInformation(nativeInputObject);
        inputObject.path[inputObject.path.length] = lastPoint;
        // update point information (screenX, clientX...)
        // but keep the original identifier
        Object.assign(inputObject, lastPoint);
    }
        
    function onStart(event) {
        for (let i = 0; i < event.changedTouches.length; i += 1) {
            let inputObject = inputObjectFromNative(event.changedTouches[i]);
            currentInput[currentInput.length] = inputObject;
        }
        onInputChange();
    }
    
    function onEnd(event) {
        for (let i = 0; i < event.changedTouches.length; i += 1) {
            let nativeIdentifier = event.changedTouches[i].identifier, 
                gisplIdentifier = identifierMapping.get(nativeIdentifier);
            
            for (let j = 0; j < currentInput.length; j += 1) {
                if (currentInput[j].identifier === gisplIdentifier) {
                    currentInput.splice(j, 1);
                    identifierMapping.delete(nativeIdentifier);
                    break;
                }
            }
        }
        onInputChange();
    }
    
    function onMove(event) {
        for (let i = 0; i < event.changedTouches.length; i += 1) {
            let nativeInputObject = event.changedTouches[i],
                nativeIdentifier = nativeInputObject.identifier, 
                gisplIdentifier = identifierMapping.get(nativeIdentifier);
            
            for (let j = 0; j < currentInput.length; j += 1) {
                let inputObject = currentInput[j];
                if (inputObject.identifier === gisplIdentifier) {
                    nativeObjectUpdate(inputObject, nativeInputObject);
                    break;
                }
            }
        }
        onInputChange();
    }

    function onInputChange() {
        touchInputHistory.store(currentInput);

        notify(touchInputHistory.nodeCurrentInput(),
                touchInputHistory.nodeHistoryInput(),
                currentInput);
    }

    function enable() {
        if (!enabled) {
            document.addEventListener('touchstart', onStart, false);
            document.addEventListener('touchend', onEnd, false);
            document.addEventListener('touchmove', onMove, false);
            enabled = true;
        }
    }

    function notify(...args) {
        for (let i = 0; i < listeners.length; i += 1) {
            let callback = listeners[i];
            callback(...args);
        }
    }

    // listen to tuio/websocket
    enable();

    return {
        listen(callback) {
            if (typeof callback !== 'function') {
                throw new Error(`Attempting to register a listener that
                                    is not a function`);
            }
            listeners.push(callback);
        },

        notify,

        mute(callback) {
            let callbackIndex = listeners.indexOf(callback);
            if (callbackIndex !== -1) {
                listeners.splice(callbackIndex, 1);
            }
        },

        enable,

        // doesn't remove the callback registered with 'listen'
        // use mute for that
        // this removes the listener from tuioclient
        disable() {
            if (enabled) {
                document.removeEventListener('touchstart', onInputChange, false);
                document.removeEventListener('touchend', onInputChange, false);
                document.removeEventListener('touchcancel', onInputChange, false);
                document.removeEventListener('touchmove', onInputChange, false);
                enabled = false;
            }
        }
    };
}
// a helper object for tuioInput
// it creates, keeps and updates instances of inputObjects
// that correspond to tuioComponents like cursors or pointers
function nodesInputHistory(params = {}) {
        // limit for all stored objects
    let {findNode} = params,
        // a map of node => [inputObjects]
        // all inputObjects that were in contact with the node at one point
        nodesWithInputHistory = new WeakMap(),
        // similar map, but only with nodes that have active input
        nodesWithInput = new Map(),
        allCurrentInput = [];
        
    //
    function toNodeInputCurrent(node, inputObject) {
        if (!nodesWithInput.has(node)) {
            nodesWithInput.set(node, []);
        }
        let inputObjects = nodesWithInput.get(node);
        inputObjects[inputObjects.length] = inputObject;
    }
    //
    function toNodeInputHistory(node, inputObject) {
        if (!nodesWithInputHistory.has(node)) {
            nodesWithInputHistory.set(node, []);
        }
        let historyForNode = nodesWithInputHistory.get(node),
            inputObjectNotInHistory = historyForNode.indexOf(inputObject) === -1;
        if (inputObjectNotInHistory) {
            historyForNode[historyForNode.length] = inputObject;
        }
    }
        
    return {
        nodeHistoryInput() {
            return nodesWithInputHistory;
        },
        nodeCurrentInput() {
            return nodesWithInput;
        },
        // returns an array of in browser inputObjects that correspond to tuioComponents
        store(inputObjects) {
            nodesWithInput.clear();
            allCurrentInput.length = 0;
            for (let i = 0; i < inputObjects.length; i += 1) {
                let inputObject = inputObjects[i],
                    foundNode = findNode.fromPoint(inputObject);
                if (foundNode) {
                    toNodeInputCurrent(foundNode, inputObject);
                    toNodeInputHistory(foundNode, inputObject);
                }
            }
        }
    };
}
