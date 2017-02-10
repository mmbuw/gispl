import * as features from './features';

let eventControls = new WeakMap();

class EventFeatures {
    constructor() {
        for (const key in features) {
            this[key] = undefined;
        }
    }
}

class EventObject {
    constructor(input, target, gesture) {
        this.input = input;
        this.target = target;
        this.currentTarget = target;
        this.featureValues = new EventFeatures();
        eventControls.set(this, {
            stop: false,
            stopImmediately: false
        });
        if (typeof gesture === 'object') {
            gesture.featureValuesToObject(this.featureValues);
        }
    }
    stopPropagation() {
        let eventControl = eventControls.get(this);
        eventControl.stop = true;
        return this;
    }
    stopImmediatePropagation() {
        let eventControl = eventControls.get(this);
        eventControl.stopImmediately = true;
        return this;
    }
}

export function eventPropagates(eventObject) {
    let eventControl = eventControls.get(eventObject);
    return !eventControl.stop;
}

export function eventPropagatesImmediately(eventObject) {
    let propagates = true;
    let eventControl = eventControls.get(eventObject);
    if (eventControl) {
        propagates = !eventControl.stopImmediately; 
    }
    return propagates;
}

export function createEventObject(nodes = [], targetNode, inputObjects, gesture) {
    let eventObject = new EventObject(inputObjects, targetNode, gesture);
    if (nodes.length > 1) {
        eventObject.target = nodes;
    }
    return eventObject;
}
