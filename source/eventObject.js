export function createEventObject(params = {}) {
    let {inputObjects} = params,
        featureValues = eventFeatures();
    
    return {
        input: inputObjects,
        featureValues
    };
}

function eventFeatures() {
    return {
        scale: undefined,
        motion: undefined,
        path: undefined,
        count: undefined,
        rotation: undefined
    };
}