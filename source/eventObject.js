import * as features from './features';

let propagationStopped = new WeakMap();

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
    stopPropagation() {
        propagationStopped.set(this, true);
    }
}

export function eventPropagates(eventObject) {
    return !propagationStopped.get(eventObject);
}

export function createEventObject(inputObjects, originalNode, gesture) {
    return new EventObject(inputObjects, originalNode, gesture);
}

function EventFeatures() {
    for (let key in features) {
        this[key] = undefined;
    }
}