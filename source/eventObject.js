import * as features from './features';

class EventObject {
    constructor(input, node, gesture) {
        this.input = input;
        this.target = node;
        this.currentTarget = node;
        this.featureValues = new EventFeatures();
        if (typeof gesture === 'object') {
            gesture.featureValuesToObject(this.featureValues);
        }
    }
}

export function createEventObject(inputObjects, originalNode, gesture) {
    return new EventObject(inputObjects, originalNode, gesture);
}

function EventFeatures() {
    for (let key in features) {
        this[key] = undefined;
    }
}