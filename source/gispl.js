import eventEmitter from './eventEmitter';

export default function gispl(selection) {
    
    let gisplApi = {},
        selectionInsertion = elementInsertion(gisplApi);
    
    // extend with event emitting
    eventEmitter(gisplApi);
    
    //initial selection insertion as gispl[index]
    selectionInsertion.insert(selection);
    
    //iterate over the selection collection
    gisplApi.forEach = function gisplForEach(...args) {
        [].forEach.apply(this, args);
    };
    
    //additional elements
    gisplApi.add = selectionInsertion.insert;
    
    return gisplApi;
}

let elementInsertion = (function () {
    
    function assureSelectionAreArrayLike(selection = []) {
        return typeof selection.length === 'undefined' ?
                                        [selection] :
                                        selection;
    }
    
    function modifyObject(arrayLike, currentSet, selection) {
        let elements = assureSelectionAreArrayLike(selection),
            gisplIndex = arrayLike.length, 
            length = elements.length;

        for (let i = 0; i < length; i += 1) {
            let element = elements[i];
            if (!currentSet.has(element)) {
                arrayLike[gisplIndex] = elements[i];
                arrayLike.length += 1;
                gisplIndex += 1;
                currentSet.add(element);
            } 
        }
    }
    
    return function elementInsertion(object) {
        let currentSet = new WeakSet(),
            insertionApi = {};

        if (typeof object.length === 'undefined') {
            object.length = 0;
        }
        
        insertionApi.insert = function(selection) {

            if (typeof selection === 'string') {
                selection = document.querySelectorAll(selection);
            }

            if (typeof selection !== 'undefined') {
                modifyObject(object, currentSet, selection);
            }
        };
        
        return insertionApi;
    };
})();