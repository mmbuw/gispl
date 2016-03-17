import {inputObjectFromTuio,
            tuioObjectUpdate} from './tuioInputObject';

export default function tuioInput(params = {}) {
    let {tuioClient} = params,
        listeners = [],
        enabled = false,
        tuioInputHistory = nodesInputHistory(params);

    function onTuioRefresh() {
        let tuioComponents = fetchTuioData();        
        let allCurrentInput = tuioInputHistory.store(tuioComponents);

        notify(tuioInputHistory.nodeInputData(),
                tuioInputHistory.historyData(),
                allCurrentInput);
    }
    
    function fetchTuioData() {
        let pointers = tuioClient.getTuioPointers(),
            cursors = tuioClient.getTuioCursors(),
            tokens = tuioClient.getTuioTokens(),
            objects = tuioClient.getTuioObjects();
            
        let tuioComponents = pointers;
        tuioComponents.push(...tokens);
        // tuio v1 types are stored in an {} object
        Object.keys(cursors).forEach(key => {
            tuioComponents.push(cursors[key]); 
        });
        Object.keys(objects).forEach(key => {
            tuioComponents.push(objects[key]); 
        });
        
        return tuioComponents;
    }

    function enable() {
        if (!enabled) {
            tuioClient.on('refresh', onTuioRefresh);
            enabled = true;
        }
    }

    function notify(...args) {
        listeners.forEach(callback => {
            callback(...args);
        });
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
        // list of stored inputObject instances used by all nodes
    let storedObjects = [],
        // a map of node => [inputObjects]
        // all inputObjects that were in contact with the node at one point
        nodesWithInputHistory = new WeakMap(),
        // similar map, but only with nodes that have active input
        nodesWithInput = new Map(),
        // limit for all stored objects
        {limit = 10,
            findNode,
            calibration} = params;
    
    // find matching inputObject for a tuioComponent
    // matches per id
    function findIndexOf(tuioComponent) {
        let indexOfComponent = -1;  
        storedObjects.forEach((object, index) => {
            if (object.identifier === tuioComponent.getSessionId()) {
                indexOfComponent = index;
            }
        });
        return indexOfComponent;
    }
    // removes an inputObject from node => [inputObjects]
    // if the instance does not exist in storedObjects
    // this is done because once the limit for storedObjects is reached
    // it will remove the first element from the list
    // but it is still in the list for an individual node history
    function removeDroppedInputObjectsFrom(historyForNode) {
        historyForNode.forEach((inputObject, currentIndex) => {
            let notStored = storedObjects.indexOf(inputObject) === -1;
            if (notStored) {
                historyForNode.splice(currentIndex, 1);
            }
        });
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
            inputObject = inputObjectFromTuio({
                tuioComponent,
                calibration
            });
            if (storeLimitReached) {
                storedObjects.shift();
            }
            storedObjects.push(inputObject);
        }
        else {
            inputObject = storedObjects[indexOfComponent];
            tuioObjectUpdate({inputObject, tuioComponent, calibration});
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
    //
    function storeNode(foundNode, inputObject) {
        if (foundNode) {
            toNodeInputCurrent(foundNode, inputObject);
            toNodeInputHistory(foundNode, inputObject);
        }
    }
    // filters out input objects on the screen
    // that are not in the browser window
    function inputInBrowserOnly(inputObject) {
        let foundNode = findNode.fromPoint(inputObject);
        // ideally should not be here
        storeNode(foundNode, inputObject);
        return !!foundNode;
    }
        
    return {
        historyData() {
            return nodesWithInputHistory;
        },
        nodeInputData() {
            return nodesWithInput;
        },
        // returns an array of in browser inputObjects that correspond to tuioComponents
        store(tuioComponents) {
            nodesWithInput.clear();
            return tuioComponents
                    .map(convertToInputObject)
                    .filter(inputInBrowserOnly);
        }
    };
}