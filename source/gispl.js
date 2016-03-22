import {domCollectionEvents,
            events} from './events';
import elementInsertion from './elementInsertion';
import {createGesture,
            userDefinedGestures} from './gesture';
import TuioClient from 'tuio/src/TuioClient';
import nodeSearch from './tuio/nodeSearch';
import tuioInput from './tuio/tuioInput';
import screenCalibration from './tuio/screenCalibration';
import {createEventObject} from './eventObject';
import {compareInput} from './inputComparison';

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

let allPreviousInput = [];
let findNode,
    defaultCalibration = screenCalibration();
    
function builtInEvents(allCurrentInput) {    
    function triggerOnLastKnownNode(inputObjects, event) {
        let lastKnownInputObject = inputObjects[0];
            
        let foundNode = findNode.fromPoint(lastKnownInputObject);
        findNode.withParentsOf(foundNode).forEach(
            node => events.emit(node, event)
        );
    }
    
    if (allCurrentInput.length !== 0 &&
        allPreviousInput.length === 0) {
        triggerOnLastKnownNode(allCurrentInput, 'inputstart');
    }
    else if (allCurrentInput.length === 0 &&
        allPreviousInput.length !== 0) {
        triggerOnLastKnownNode(allPreviousInput, 'inputend');
    }
    else if (!compareInput(allCurrentInput,
                                    allPreviousInput)) {
        events.emit(document, 'inputchange');
    }
    
    allPreviousInput = allCurrentInput;
}

function handleInput(nodesInput, nodesInputHistory, allCurrentInput) {
    
    builtInEvents(allCurrentInput);
    
    nodesInput.forEach((inputObjects, node) => {
        userDefinedGestures.forEach(gesture => {
            let inputHistory = nodesInputHistory.get(node),
                inputState = {inputObjects, inputHistory, node},
                nodesToEmitOn = gesture.load(inputState);
            
            if (nodesToEmitOn.length !== 0) {
                let eventName = gesture.name(),
                    eventObject = createEventObject({
                        inputState, gesture
                    });
                                    
                nodesToEmitOn.forEach(nodeToEmitOn => {
                    events.emit(nodeToEmitOn, eventName, eventObject);
                });   
            }
        });
    });
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
            propagation,
            calibration = defaultCalibration} = params;

    let tuioClient = new TuioClient({host});
    findNode = nodeSearch({calibration, propagation});

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