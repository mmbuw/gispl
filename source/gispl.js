import {domCollectionEvents} from './events';
import elementInsertion from './elementInsertion';
import {createGesture,
            userDefinedGestures} from './gesture';
import TuioClient from 'tuio/src/TuioClient';
import nodeSearch from './tuio/nodeSearch';
import tuioInput from './tuio/tuioInput';
import screenCalibration from './tuio/screenCalibration';
import {gestureEmition} from './gestureEmit';

export default function gispl(selection) {

    let gisplApi = {},
        selectionInsertion = elementInsertion(gisplApi);

    domCollectionEvents(gisplApi);

    //initial selection insertion as gispl[index]
    selectionInsertion.append(selection);

    //iterate over the selection collection
    gisplApi.forEach = function gisplForEach(...args) {
        [].forEach.apply(this, args);
    };

    //additional elements
    // the registered callbacks up to this point
    // won't be applied to the new elements
    gisplApi.add = selectionInsertion.append;

    //event method aliases
    gisplApi.trigger = gisplApi.emit;

    return gisplApi;
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

    tuioInput({tuioClient,
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