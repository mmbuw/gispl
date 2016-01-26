import {inputObjectFromTuio} from './tuioInputObject';

export default function tuioInput(params = {}) {
    let {tuioClient,
            findNodes,
            calibration,
            screenWidth = window.screen.width,
            screenHeight = window.screen.height} = params,
        listeners = [];

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

            findNodes
                .fromPoint({screenX, screenY})
                .forEach(node => {
                    if (!nodesWithInput.has(node)) {
                        nodesWithInput.set(node, []);
                    }
                    let inputObject = inputObjectFromTuio({
                        tuioComponent: pointer,
                        calibration
                    });
                    nodesWithInput.get(node).push(inputObject);
                });
        });

        notify(nodesWithInput);
    }

    function enable() {
        tuioClient.on('refresh', onTuioRefresh);
    }

    function notify(...args) {
        listeners.forEach(callback => {
            callback(...args);
        });
    }

    // listen to tuio/websocket
    tuioClient.connect();
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

        // doesn't remove the listener
        disable() {
            tuioClient.off('refresh', onTuioRefresh);
        }
    };
}
