import {inputObjectFromTuio,
            tuioObjectUpdate} from './tuioInputObject';

export default function tuioInput(params = {}) {
    let {tuioClient} = params,
        listeners = [],
        enabled = false,
        tuioInputHistory = nodesInputHistory(params),   
        allTuioComponents = [];

    function onTuioRefresh() {
        fetchTuioData();        
        let allCurrentInput = tuioInputHistory.store(allTuioComponents);

        notify(tuioInputHistory.nodeCurrentInput(),
                tuioInputHistory.nodeHistoryInput(),
                allCurrentInput);
    }
    
    function copyCurrentTuioComponents(pointers, cursors, tokens, objects) {
        allTuioComponents.length = 0;   
        for (let i = 0, length = pointers.length; i < length; i += 1) {
            allTuioComponents.push(pointers[i]);
        }
        for (let i = 0, length = tokens.length; i < length; i += 1) {
            allTuioComponents.push(tokens[i]);
        }
        // tuio v1 types are stored in an {} object
        for (let key in cursors) {
            allTuioComponents.push(cursors[key]);
        }
        for (let key in objects) {
            allTuioComponents.push(objects[key]);
        }
    }
    
    function fetchTuioData() {
        let pointers = tuioClient.getTuioPointers(),
            cursors = tuioClient.getTuioCursors(),
            tokens = tuioClient.getTuioTokens(),
            objects = tuioClient.getTuioObjects();
        copyCurrentTuioComponents(pointers, cursors, tokens, objects);
    }

    function enable() {
        if (!enabled) {
            tuioClient.on('refresh', onTuioRefresh);
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
                tuioClient.off('refresh', onTuioRefresh);
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
            findNode,
            calibration} = params,
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
    function findIndexOf(tuioComponent) {
        let indexOfComponent = -1;
        for (let index = 0; index < storedObjects.length; index += 1) {
            let object = storedObjects[index];
            if (object.identifier === tuioComponent.getSessionId()) {
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
    function convertToInputObject(tuioComponent) {
        let indexOfComponent = findIndexOf(tuioComponent),
            newComponent = indexOfComponent === -1,
            inputObject;
        
        if (newComponent) {
            let storeLimitReached = storedObjects.length === limit;
            inputObject = inputObjectFromTuio(tuioComponent, calibration);
            if (storeLimitReached) {
                storedObjects.shift();
            }
            storedObjects.push(inputObject);
        }
        else {
            inputObject = storedObjects[indexOfComponent];
            tuioObjectUpdate(inputObject, tuioComponent, calibration);
        }
        return inputObject;
    }
    //
    function toNodeInputCurrent(node, inputObject) {
        if (!nodesWithInput.has(node)) {
            nodesWithInput.set(node, []);
        }
        nodesWithInput.get(node).push(inputObject);
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
            historyForNode.push(inputObject);
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
        store(tuioComponents) {
            nodesWithInput.clear();
            allCurrentInput.length = 0;
            for (let i = 0; i < tuioComponents.length; i += 1) {
                let inputObject = convertToInputObject(tuioComponents[i]);
                let foundNode = findNode.fromPoint(inputObject);
                if (foundNode) {
                    toNodeInputCurrent(foundNode, inputObject);
                    toNodeInputHistory(foundNode, inputObject);
                    allCurrentInput.push(inputObject);
                }
            }                      
            return allCurrentInput;
        }
    };
}