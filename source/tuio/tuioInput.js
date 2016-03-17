import {inputObjectFromTuio,
            tuioObjectUpdate} from './tuioInputObject';

export default function tuioInput(params = {}) {
    let {tuioClient,
            findNode,
            calibration} = params,
        listeners = [],
        enabled = false,
        nodesWithInput = new Map(),
        tuioInputHistory = nodeInputHistory();
        
    function findNodesFromInputObject(inputObject) {
        let foundNode = findNode.fromPoint(inputObject);
        if (foundNode) {
            if (!nodesWithInput.has(foundNode)) {
                nodesWithInput.set(foundNode, []);
            }
            nodesWithInput.get(foundNode).push(inputObject);
            tuioInputHistory.add(foundNode, inputObject);   
        }
    }

    function onTuioRefresh() {
        nodesWithInput.clear();
        let tuioComponents = fetchTuioData();
        
        let allCurrentInput = tuioInputHistory.store(tuioComponents, calibration)
        allCurrentInput.forEach(findNodesFromInputObject);

        notify(nodesWithInput, tuioInputHistory.historyData(), allCurrentInput);
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
// e.g. tuioComponent.getSessionId() === inputObject.identifier
// normally used by tuioInput like
// * passes tuioComponents to nodeInputHistory.store()
// * nodeInputHistory returns a list of matching inputObjects
// * tuioInput iterates the list, locates dom nodes that the inputObject is on
// * calls nodeInputHistory.add(node, inputObject) to place it in history
function nodeInputHistory(params = {}) {
        // list of stored inputObject instances used by all nodes
    let storedObjects = [],
        // a map of node => [inputObjects]
        // all inputObjects that were in contact with the node at one point
        nodeHistory = new WeakMap(),
        // limit for all stored objects
        {limit = 10} = params;
    
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
    function convertToInputObject(tuioComponent, calibration) {
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
        
    return {
        historyData() {
            return nodeHistory;
        },
        add(node, inputObject) {
            if (!nodeHistory.has(node)) {
                nodeHistory.set(node, []);
            }
            let historyForNode = nodeHistory.get(node),
                inputObjectNotInHistory = historyForNode.indexOf(inputObject) === -1;
            if (inputObjectNotInHistory) {
                removeDroppedInputObjectsFrom(historyForNode);
                historyForNode.push(inputObject);
            }
            return this;
        },
        // returns an array of inputObjects that correspond to tuioComponents
        store(tuioComponents, calibration) {
            return tuioComponents.map(
                tuioComponent => convertToInputObject(tuioComponent, calibration) 
            );
        }
    };
}