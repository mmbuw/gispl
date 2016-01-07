export let userDefinedGestures = new Map();

export function createGesture(definition) {
    let gestureApi = {};
    
    isValidGesture(definition);
    
    gestureApi.definition = function gestureDefinition() {
        return definition;
    };
    
    return gestureApi;
}
    
export let gestureException = {
    EMPTY: new Error(`Attempting to define a gesture without
                        passing a gesture`),
    NO_NAME: new Error('Attempting to define a gesture without name'),
    NO_FEATURES: new Error('Attempting to define a gestures without features'),
    DUPLICATE: new Error('Attempting to define a gesture that already exists')
};
    

function isValidGesture(definition) {
    if (typeof definition === 'undefined' ||
            Object.keys(definition).length === 0) {
        throw gestureException.EMPTY;
    }
    
    let {name, features} = definition;
    
    if (typeof name === 'undefined') {
        throw gestureException.NO_NAME;
    }
    if (typeof features === 'undefined' ||
            typeof features.length === 'undefined' ||
            features.length === 0) {
        throw gestureException.NO_FEATURES;
    }
    if (userDefinedGestures.has(name)) {
        throw gestureException.DUPLICATE;
    }
}