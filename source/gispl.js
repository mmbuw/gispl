import eventEmitter from './eventEmitter';

export default function gispl(selection) {
    
    let gisplApi = {},
        selectionInsertion = elementInsertion(gisplApi);
    
    // extend with event emitting
    eventEmitter(gisplApi);
    
    //initial selection insertion as gispl[index]
    selectionInsertion.append(selection);
    
    //iterate over the selection collection
    gisplApi.forEach = function gisplForEach(...args) {
        [].forEach.apply(this, args);
    };
    
    //additional elements
    gisplApi.add = selectionInsertion.append;
    
    return gisplApi;
}

let elementInsertion = (function () {
    
    function assureSelectionIsArrayLike(selection = []) {
        return typeof selection.length === 'undefined' ?
                                        [selection] :
                                        selection;
    }
    
    return function elementInsertion(object) {
        let elementCollection = new WeakSet(),
            insertionApi = {};

        if (typeof object.length === 'undefined') {
            object.length = 0;
        }
        
        insertionApi.append = function(selection) {
            if (typeof selection === 'string') {
                selection = document.querySelectorAll(selection);
            }

            if (typeof selection !== 'undefined') {
                let elements = assureSelectionIsArrayLike(selection);

                [].forEach.call(elements, (element, index) => {
                    if (!elementCollection.has(element)) {
                        object[object.length] = elements[index];
                        object.length += 1;
                        elementCollection.add(element);
                    }
                });
            }
        };
        
        return insertionApi;
    };
})();