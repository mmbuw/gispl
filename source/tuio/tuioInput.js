export default function tuioInput(params = {}) {
    let {tuioClient,
            findNodes,
            screenWidth = window.screen.width,
            screenHeight = window.screen.height} = params,
        inputApi = {},
        listeners = [];

    function onTuioRefresh() {
        let pointers = tuioClient.getTuioPointers(),
            regions = new Map();

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
                    if (!regions.has(node)) {
                        regions.set(node, []);
                    }
                    regions.get(node).push(pointer);
                });
        });

        inputApi.notify(regions);
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
