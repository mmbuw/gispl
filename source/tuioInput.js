export default function tuioInput(params = {}) {
    let {tuioClient,
            findNodes,
            screenWidth = window.screen.width,
            screenHeight = window.screen.height} = params,
        inputApi = {},
        listeners = new Set();
    
    inputApi.listen = function inputListen(callback) {
        if (typeof callback !== 'function') {
            throw new Error(`Attempting to register a listener that
                                is not a function`);
        }
        listeners.add(callback);
    };
    
    inputApi.notify = function inputNotify(...args) {
        listeners.forEach(callback => {
            callback(...args);
        });
    };
    
    // listen to tuio/websocket
    tuioClient.connect();
    tuioClient.on('refresh', () => {
        let pointers = tuioClient.getTuioPointers(),
            regions = new Map();
        
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
    });
    
    return inputApi;
}