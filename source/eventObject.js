import * as features from './features';

let eventControls = new WeakMap();

class EventObject {
    constructor(input, target, gesture) {
        this.input = input;
        this.target = target;
        this.currentTarget = target;
        this.featureValues = new EventFeatures();
        eventControls.set(this, {
            stopped: false
        });
        if (typeof gesture === 'object') {
            gesture.featureValuesToObject(this.featureValues);
        }
    }
    stopPropagation() {
        let eventControl = eventControls.get(this);
        eventControl.stopped = true;
        return this;
    }
}

export function eventPropagates(eventObject) {
    let eventControl = eventControls.get(eventObject);
    return !eventControl.stopped;
}

export function createEventObject(nodes = [], targetNode, inputObjects, gesture) {
    let eventObject = new EventObject(inputObjects, targetNode, gesture);
    if (nodes.length > 1) {
        eventObject.target = nodes;
    }
    return eventObject;
}

function EventFeatures() {
    for (let key in features) {
        this[key] = undefined;
    }
}