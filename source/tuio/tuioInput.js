import {inputObjectFromTuio} from './tuioInputObject';

export default function tuioInput(params = {}) {
    let {tuioClient,
            findNodes,
            screenWidth = window.screen.width,
            screenHeight = window.screen.height} = params,
        inputApi = {},
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
                    let inputObject = inputObjectFromTuio(pointer);
                    nodesWithInput.get(node).push(inputObject);
                });
        });

        inputApi.notify(nodesWithInput);
    }

    inputApi.listen = function inputListen(callback) {
        if (typeof callback !== 'function') {
            throw new Error(`Attempting to register a listener that
                                is not a function`);
        }
        listeners.push(callback);
    };

    inputApi.notify = function inputNotify(...args) {
        listeners.forEach(callback => {
            callback(...args);
        });
    };

    inputApi.mute = function inputMute(callback) {
        let callbackIndex = listeners.indexOf(callback);
        if (callbackIndex !== -1) {
            listeners.splice(callbackIndex, 1);
        }
    };

    // doesn't remove the listener
    inputApi.disable = function inputDisable() {
        tuioClient.off('refresh', onTuioRefresh);
    };

    inputApi.enable = function inputEnable() {
        tuioClient.on('refresh', onTuioRefresh);
    };

    // listen to tuio/websocket
    tuioClient.connect();
    inputApi.enable();

    return inputApi;
}
