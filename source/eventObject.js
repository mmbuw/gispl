class EventObject {
    constructor(input, node, gesture) {
        this.input = input;
        this.target = node;
        this.currentTarget = node;
        this.featureValues = eventFeatures();
        if (typeof gesture === 'object') {
            gesture.featureValuesToObject(this.featureValues);
        }
    }
}

export function createEventObject(inputObjects, originalNode, gesture) {
    return new EventObject(inputObjects, originalNode, gesture);
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