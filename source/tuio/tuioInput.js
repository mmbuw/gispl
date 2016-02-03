import {inputObjectFromTuio} from './tuioInputObject';

export default function tuioInput(params = {}) {
    let {tuioClient,
            findNode,
            calibration,
            screenWidth = window.screen.width,
            screenHeight = window.screen.height} = params,
        listeners = [],
        enabled = false;

    function onTuioRefresh() {
        let pointers = tuioClient.getTuioPointers(),
            nodesWithInput = new Map();

        if (pointers.length === 0) {
            let cursors = tuioClient.getTuioCursors();
            for (var key in cursors) {
                pointers.push(cursors[key]);
            }
        }

        pointers.forEach(pointer => {
            let screenX = pointer.getScreenX(screenWidth),
                screenY = pointer.getScreenY(screenHeight);
            
            let node = findNode.fromPoint({screenX, screenY});
            if (!nodesWithInput.has(node)) {
                nodesWithInput.set(node, []);
            }
            let inputObject = inputObjectFromTuio({
                tuioComponent: pointer,
                calibration
            });
            nodesWithInput.get(node).push(inputObject);
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
