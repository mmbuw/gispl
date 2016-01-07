import {domCollectionEvents} from './events';
import elementInsertion from './elementInsertion';

export default function gispl(selection) {
    
    let gisplApi = {},
        selectionInsertion = elementInsertion(gisplApi),
        events = domCollectionEvents();
    
    //initial selection insertion as gispl[index]
    selectionInsertion.append(selection);
    
    //iterate over the selection collection
    gisplApi.forEach = function gisplForEach(...args) {
        [].forEach.apply(this, args);
    };
    
    //additional elements
    gisplApi.add = selectionInsertion.append;
    
    //add event options
    Object.keys(events).forEach(key => {
        gisplApi[key] = events[key];
    });
    //event method aliases
    gisplApi.trigger = events.emit;
    
    return gisplApi;
}
   
let userDefinedGestures = new Map();

function gestureObjectCheck(gesture) {
    if (typeof gesture === 'undefined') {
        throw new Error('Attempting to define a gesture without passing a gesture');
    }
    
    let {name, features} = gesture;
    
    if (typeof name === 'undefined') {
        throw new Error('Attempting to define a gesture without name');
    }
    if (typeof features === 'undefined' ||
            typeof features.length === 'undefined' ||
            features.length === 0) {
        throw new Error('Attempting to define a gestures without features');
    }
    if (userDefinedGestures.has(name)) {
        throw new Error('Attempting to define a gesture that already exists');
    }
}

gispl.addGesture = function gisplAddGesture(gesture) {
    if (typeof gesture === 'string') {
        gesture = JSON.parse(gesture);
    }
    gestureObjectCheck(gesture);
    
    let {name} = gesture;
    userDefinedGestures.set(name, gesture);
    return gispl;
};

gispl.clearGestures = function gisplClearGestures() {
    userDefinedGestures = new Map();
    return gispl;
};

gispl.gesture = function gisplGesture(gestureName) {
    return userDefinedGestures.get(gestureName);
};
