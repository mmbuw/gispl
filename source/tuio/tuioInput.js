import {inputObjectFromTuio,
            tuioObjectUpdate} from './tuioInputObject';

export default function tuioInput(params = {}) {
    let {tuioClient,
            findNode,
            calibration} = params,
        listeners = [],
        tuioInputHistory = nodeInputHistory(),
        enabled = false,
        nodesWithInput = new Map();
        
    function findNodesFromInputObject(inputObject) {
        let node = findNode.fromPoint(inputObject);
        if (node) {
            if (!nodesWithInput.has(node)) {
                nodesWithInput.set(node, []);
            }
            nodesWithInput.get(node).push(inputObject);
            tuioInputHistory.add(node, inputObject);   
        }
    }

    function onTuioRefresh() {
        nodesWithInput.clear();
        let tuioComponents = fetchTuioData();
        
        tuioInputHistory
            .store(tuioComponents, calibration)
            .forEach(findNodesFromInputObject);

        notify(nodesWithInput, tuioInputHistory.historyData());
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

function nodeInputHistory(params = {}) {
    let storedObjects = [],
        nodeHistory = new WeakMap(),
        {limit = 10} = params;
    
    function findIndexOf(tuioComponent) {
        let indexOfComponent = -1;  
        storedObjects.forEach((object, index) => {
            if (object.identifier === tuioComponent.getSessionId()) {
                indexOfComponent = index;
            }
        });
        return indexOfComponent;
    }
    
    function removeDroppedInputObjectsFrom(historyForNode) {
        historyForNode.forEach((inputObject, currentIndex) => {
            let notStored = storedObjects.indexOf(inputObject) === -1;
            if (notStored) {
                historyForNode.splice(currentIndex, 1);
            }
        });
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
        store(tuioComponents, calibration) {
            return tuioComponents.map(tuioComponent => {
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
            });
        }
    };
}