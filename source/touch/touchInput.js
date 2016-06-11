import {tuioObjectUpdate} from '../tuio/tuioInputObject';

export default function touchInput(params) {
    let listeners = [],
        enabled = false,
        tuioInputHistory = nodesInputHistory();

    function onInput(event) {
        let allCurrentInput = tuioInputHistory.store(event.touches);

        notify(tuioInputHistory.nodeCurrentInput(),
                tuioInputHistory.nodeHistoryInput(),
                allCurrentInput);
    }

    function enable() {
        if (!enabled) {
            document.addEventListener('touchstart', onInput, false);
            document.addEventListener('touchend', onInput, false);
            document.addEventListener('touchcancel', onInput, false);
            document.addEventListener('touchmove', onInput, false);
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
    tuioClient.connect();

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
                document.removeEventListener('touchstart', onInput, false);
                document.removeEventListener('touchend', onInput, false);
                document.removeEventListener('touchcancel', onInput, false);
                document.removeEventListener('touchmove', onInput, false);
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
    let {limit = 10,
            findNode} = params,
        // list of stored inputObject instances used by all nodes
        storedObjects = [],
        // a map of node => [inputObjects]
        // all inputObjects that were in contact with the node at one point
        nodesWithInputHistory = new WeakMap(),
        // similar map, but only with nodes that have active input
        nodesWithInput = new Map(),
        allCurrentInput = [];
    
    // find matching inputObject for a tuioComponent
    // matches per id
    function findIndexOf(nativeInputObject) {
        let indexOfComponent = -1;
        for (let index = 0; index < storedObjects.length; index += 1) {
            let object = storedObjects[index];
            if (object.identifier === nativeInputObject.identifier) {
                indexOfComponent = index;
                break;
            }
        }
        return indexOfComponent;
    }
    // removes an inputObject from node => [inputObjects]
    // if the instance does not exist in storedObjects
    // this is done because once the limit for storedObjects is reached
    // it will remove the first element from the list
    // but it is still in the list for an individual node history
    function removeDroppedInputObjectsFrom(historyForNode) {
        for (let historyIndex = 0; historyIndex < historyForNode.length; historyIndex += 1) {
            let historyInputObject = historyForNode[historyIndex],
                notStored = storedObjects.indexOf(historyInputObject) === -1;
            if (notStored) {
                historyForNode.splice(historyIndex, 1);
            }
        }
    }
    // takes a tuioComponent and either
    // finds and updates a matching inputObject
    // or creates a new inputObject
    // this is based on sessionId
    function convertToInputObject(nativeInputObject) {
        let indexOfComponent = findIndexOf(nativeInputObject),
            newComponent = indexOfComponent === -1,
            inputObject;
        
        if (newComponent) {
            let storeLimitReached = storedObjects.length === limit;
            inputObject = inputObjectFromNative(nativeInputObject);
            if (storeLimitReached) {
                storedObjects.shift();
            }
            storedObjects[storedObjects.length] = inputObject;
        }
        else {
            inputObject = storedObjects[indexOfComponent];
            nativeObjectUpdate(inputObject, nativeInputObject);
        }
        return inputObject;
    }
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
            removeDroppedInputObjectsFrom(historyForNode);
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
        store(nativeInputObjects) {
            nodesWithInput.clear();
            allCurrentInput.length = 0;
            for (let i = 0; i < nativeInputObjects.length; i += 1) {
                let foundNode = findNode.fromPoint(nativeInputObjects[i]);
                if (foundNode) {
                    let inputObject = convertToInputObject(nativeInputObjects[i]);
                    toNodeInputCurrent(foundNode, inputObject);
                    toNodeInputHistory(foundNode, inputObject);
                    allCurrentInput[allCurrentInput.length] = inputObject;
                }
            }                      
            return allCurrentInput;
        }
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

function inputObjectFromNative(nativeInputObject) {
    let {identifier} = nativeInputObject,
        point = pointInformation(nativeInputObject),
        path = [point];

    return {
        identifier,
        path,
        ...point
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
