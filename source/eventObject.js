export function createEventObject(inputObjects, originalNode, gesture) {
    let featureValues = eventFeatures();
    
    if (typeof gesture === 'object') {
        gesture.featureValuesToObject(featureValues);
    }
    
    let target,
        currentTarget;
    if (typeof originalNode !== 'undefined') {
        target = originalNode;
    }
    
    return {
        input: inputObjects,
        featureValues,
        target,
        currentTarget
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