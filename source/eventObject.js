export function createEventObject(params = {}) {
    let {inputState = {},
            gesture} = params,
        {inputObjects,
            allCurrentInput} = inputState,
        featureValues = eventFeatures();
    
    if (typeof gesture !== 'undefined') {
        gesture.featureValuesToObject(featureValues);   
    }
    
    return {
        input: inputObjects,
        touches: allCurrentInput,
        featureValues
    };
}

function eventFeatures() {
    return {
        scale: undefined,
        motion: undefined,
        path: undefined,
        count: undefined,
        rotation: undefined,
        delay: undefined,
        objectid: undefined,
        objectparent: undefined
    };
}