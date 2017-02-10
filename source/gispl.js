import {events} from './events';
import {createGesture,
            userDefinedGestures} from './gesture';
import TuioClient from 'tuio/src/TuioClient';
import nodeSearch from './tuio/nodeSearch';
import tuioInput from './tuio/tuioInput';
import screenCalibration from './tuio/screenCalibration';
import {gestureEmition} from './gestureEmit';

const gisplObjects = new WeakMap();
class GISpL {
    constructor(selection) {
        gisplObjects.set(this, new WeakSet());
        this.length = 0;
        this.append(selection);
        this.add = this.append;
        this.trigger = this.emit;
    }
    forEach(...args) {
        [].forEach.apply(this, args);
        return this;
    }
    on(event, listener) {
        this.forEach(node => events.on(node,
                                            event,
                                            listener));
        return this;
    }
    off(event, listener) {
        this.forEach(node => events.off(node,
                                            event,
                                            listener));
        return this;
    }
    emit(event, ...args) {
        this.forEach(node => events.emit(node,
                                                event,
                                                ...args));
        return this;
    }
    append(selection) {
        const nodesToAdd = nodeSelectionToArray(selection);
        const object = this;
        nodesToAdd
            .filter(function isNodeValid(node) {
                return node !== null &&
                        !gisplObjects.get(object).has(node);
            })
            .forEach(function addNodeToObject(node) {
                object[object.length] = node;
                object.length += 1;
                gisplObjects.get(object).add(node);
            });
        return this;
    }
}

export default function gispl(selection) {
    return new GISpL(selection);
}

function nodeSelectionToArray(selection = []) {
    if (selection === null) {
        selection = [];
    }
    if (typeof selection === 'string') {
        selection = document.querySelectorAll(selection);
    }
    return typeof selection.length === 'undefined' ?
                                        [selection] :
                                        [...selection];
}

let emitGesture;
let findNode,
    defaultCalibration = screenCalibration();

function handleInput(nodesInput, nodesInputHistory, allCurrentInput) {
    if (typeof emitGesture === 'undefined') {
        emitGesture = gestureEmition({findNode});
    }
    
    emitGesture.builtIn(allCurrentInput);
    emitGesture.userDefined(nodesInput, nodesInputHistory);
}

gispl.addGesture = function gisplAddGesture(gestureDefinition) {
    if (typeof gestureDefinition === 'string') {
        gestureDefinition = JSON.parse(gestureDefinition);
    }

    let gesture = createGesture(gestureDefinition, findNode),
        {name} = gestureDefinition;

    userDefinedGestures.set(name, gesture);
    return gispl;
};

gispl.clearGestures = function gisplClearGestures() {
    userDefinedGestures.clear();
    return gispl;
};

gispl.gesture = function gisplGesture(gestureName) {
    return userDefinedGestures.get(gestureName);
};

gispl.initTuio = function gisplInitTuio(params) {
    let {host,
            calibration = defaultCalibration} = params;

    let tuioClient = new TuioClient({host});
    findNode = nodeSearch({calibration});

    tuioInput({
        tuioClient,
        findNode,
        calibration}).listen(handleInput);
};

gispl.filterBitmask = function gisplFilterBitmask(filters = []) {
    let bitmaskFilter = 0;
    if (filters.length) {
        filters.forEach(filter => {
            bitmaskFilter = bitmaskFilter | (1<<(filter-1));
        });
    }
    return bitmaskFilter;
};