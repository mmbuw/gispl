import eventEmitter from './eventEmitter';

export default function gispl(selection) {
    
    let gisplApi = {},
        selectionSet = new WeakSet();
    
    // extend with event emitting
    eventEmitter(gisplApi);
    
    //initial selection insertion as gispl[index]
    elementInsertion(gisplApi, selectionSet, selection);
    
    //iterate over the selection collection
    gisplApi.forEach = function gisplForEach(callback) {
        [].forEach.call(this, callback);
    };
    
    //additional elements
    gisplApi.add = elementInsertion.bind(undefined, gisplApi, selectionSet);
    
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
    
    return function elementInsertion(arrayLike = {}, currentSet, selection) {

        if (typeof arrayLike.length === 'undefined') {
            arrayLike.length = 0;
        }

        if (typeof selection === 'string') {
            selection = document.querySelectorAll(selection);
        }

        if (typeof selection !== 'undefined') {
            modifyObject(arrayLike, currentSet, selection);
        }   
    };
})();