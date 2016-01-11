import {featureFactory} from './feature';

export let userDefinedGestures = new Map();

export function createGesture(definition) {
    let gestureApi = {},
        features = [];
    
    isValidGesture(definition);
    
    definition.features.forEach(feature => {
        features.push(featureFactory(feature.type));
    });
    
    gestureApi.definition = function gestureDefinition() {
        return definition;
    };
    
    gestureApi.features = function gestureFeatures() {
        return features;
    };
    
    gestureApi.load = function gestureLoad(inputState) {
        return features.every(feature => feature.load(inputState));
    };
    
    return gestureApi;
}
    
export let gestureException = {
    EMPTY: `Attempting to define a gesture without
                        passing a gesture`,
    NO_NAME: 'Attempting to define a gesture without name',
    NO_FEATURES: 'Attempting to define a gestures without features',
    DUPLICATE: 'Attempting to define a gesture that already exists'
};
    

function isValidGesture(definition) {
    if (typeof definition === 'undefined' ||
            Object.keys(definition).length === 0) {
        throw new Error(gestureException.EMPTY);
    }
    
    let {name, features} = definition;
    
    if (typeof name === 'undefined') {
        throw new Error(gestureException.NO_NAME);
    }
    if (typeof features === 'undefined' ||
            typeof features.length === 'undefined' ||
            features.length === 0) {
        throw new Error(gestureException.NO_FEATURES);
    }
    if (userDefinedGestures.has(name)) {
        throw new Error(gestureException.DUPLICATE);
    }
}