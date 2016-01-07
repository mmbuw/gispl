export let userDefinedGestures = new Map();

export function createGesture(definition) {
    let gestureApi = {};
    
    isValidGesture(definition);
    
    gestureApi.definition = function gestureDefinition() {
        return definition;
    };
    
    return gestureApi;
}
    

function isValidGesture(definition) {
    if (typeof definition === 'undefined') {
        throw new Error('Attempting to define a gesture without passing a gesture');
    }
    
    let {name, features} = definition;
    
    if (typeof name === 'undefined') {
        throw new Error('Attempting to define a gesture without name');
    }
    if (typeof features === 'undefined' ||
            typeof features.length === 'undefined' ||
            features.length === 0) {
        throw new Error('Attempting to define a gestures without features');
    }
    if (userDefinedGestures.has(name)) {
        throw new Error('Attempting to define a gesture that already exists');
    }
}