import {inputObjectFromTuio,
            tuioObjectUpdate} from './tuioInputObject';

export default function tuioInput(params = {}) {
    let {tuioClient,
            findNode,
            calibration} = params,
        listeners = [],
        knownTuioInput = tuioObjectStore(),
        tuioInputHistory = nodeInputHistory(),
        enabled = false;

    function onTuioRefresh() {
        let tuioComponents = fetchTuioData(),
            nodesWithInput = new Map();
        
        knownTuioInput
            .store({tuioComponents, calibration})
            .forEach(inputObject => {
                let screenX = inputObject.screenX,
                    screenY = inputObject.screenY;
            
                let node = findNode.fromPoint({screenX, screenY});
                if (!nodesWithInput.has(node)) {
                    nodesWithInput.set(node, []);
                }
                nodesWithInput.get(node).push(inputObject);
                tuioInputHistory.add({node, inputObject});
            });

        notify(nodesWithInput, tuioInputHistory.data());
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
            
export function tuioObjectStore(params = {}) {
    let {storeLimit = 10} = params,
        storedObjects = [];
    
    function findIndexOf(tuioComponent) {
        let indexOfComponent = -1;  
        storedObjects.forEach((object, index) => {
            if (object.identifier === tuioComponent.getSessionId()) {
                indexOfComponent = index;
            }
        });
        return indexOfComponent;
    }
    
    return {
        objects() {
            return storedObjects;
        },
        store({tuioComponents, calibration}) {
            return tuioComponents.map(tuioComponent => {
                let indexOfComponent = findIndexOf(tuioComponent),
                    newComponent = indexOfComponent === -1,
                    inputObject;
                
                if (newComponent) {
                    let storeLimitReached = storedObjects.length === storeLimit;
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

function nodeInputHistory() {
    let nodeHistory = new WeakMap(),
        historyLimit = 10;
        
    return {
        data() {
            return nodeHistory;
        },
        add({node, inputObject}) {
            if (!nodeHistory.has(node)) {
                nodeHistory.set(node, []);
            }
            let historyForNode = nodeHistory.get(node),
                historyLimitReached = historyForNode.length === historyLimit;
            if (historyLimitReached) {
                historyForNode.shift();
            }
            if (historyForNode.indexOf(inputObject) === -1) {
                historyForNode.push(inputObject);
            }
            return this;
        }
    };
}