import {inputObjectFromTuio,
            tuioObjectUpdate} from './tuioInputObject';

export default function tuioInput(params = {}) {
    let {tuioClient,
            findNode,
            calibration} = params,
        listeners = [],
        knownTuioInput = tuioObjectStore(),
        inputHistory = tuioInputStateHistory(),
        enabled = false;

    function onTuioRefresh() {
        let tuioComponents = fetchTuioData(),
            nodesWithInput = new Map();
        
        knownTuioInput
            .store({tuioComponents, calibration})
            .forEach(tuioObject => {
                let screenX = tuioObject.screenX,
                    screenY = tuioObject.screenY;
            
                let node = findNode.fromPoint({screenX, screenY});
                if (!nodesWithInput.has(node)) {
                    nodesWithInput.set(node, []);
                }
                nodesWithInput.get(node).push(tuioObject);
            });
            
        let nodesWithInputHistory = new Map();
        nodesWithInput.forEach((inputObjects, node) => {
            inputHistory.add({node, inputObjects});
            // add to active nodes map
            nodesWithInputHistory.set(node, inputHistory.getFor({node}));
        });

        notify(nodesWithInputHistory);
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

export function tuioInputStateHistory({historyLimit = 3} = {}) {
    
    let nodesHistory = new WeakMap();
    
    function isPreviousInputState({inputObjects, currentNodeHistory}) {
        let previousInputObjects = currentNodeHistory[0]; // last one
        return !!previousInputObjects &&
                !!inputObjects &&
                (previousInputObjects.length === inputObjects.length) &&
                previousInputObjects.every(previousInputObject => {
                    return inputObjects.some(inputObject => {
                        return inputObject === previousInputObject;
                    });
                });
    }
    
    return {
        add({node, inputObjects}) {
            let currentNodeHistory = this.getFor({node});
            if (!isPreviousInputState({inputObjects, currentNodeHistory})) {
                if (currentNodeHistory.length === historyLimit) {
                    currentNodeHistory.pop();
                }            
                // push latest history to front
                currentNodeHistory.unshift(inputObjects);   
            }        
            return this;
        },
        getFor({node}) {
            if (!nodesHistory.has(node)) {
                nodesHistory.set(node, []);
            }
            return nodesHistory.get(node);
        }
    };
}