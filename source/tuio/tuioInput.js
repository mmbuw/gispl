import {inputObjectFromTuio,
            tuioObjectPath} from './tuioInputObject';

export default function tuioInput(params = {}) {
    let {tuioClient,
            findNode,
            calibration} = params,
        listeners = [],
        knownTuioInput = tuioObjectStore(),
        enabled = false;

    function onTuioRefresh() {
        let tuioComponents = tuioClient.getTuioPointers(),
            nodesWithInput = new Map();

        if (tuioComponents.length === 0) {
            let cursors = tuioClient.getTuioCursors();
            for (var key in cursors) {
                tuioComponents.push(cursors[key]);
            }
        }
        
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

        notify(nodesWithInput);
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
                    // update path of already known object
                    inputObject.path = tuioObjectPath({tuioComponent, calibration});
                }
                return inputObject;
            });
        }
    };
}
