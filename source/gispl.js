import {domCollectionEvents} from './events';
import elementInsertion from './elementInsertion';
import {createGesture,
            userDefinedGestures} from './gesture';

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

gispl.addGesture = function gisplAddGesture(gestureDefinition) {
    if (typeof gestureDefinition === 'string') {
        gestureDefinition = JSON.parse(gestureDefinition);
    }
    
    let gesture = createGesture(gestureDefinition),
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
