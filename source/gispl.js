export default function gispl(selection) {
    
    let gisplApi = {};
    
    function addElementsToGispl(selection) {
        elementInsertion(gisplApi, selection);
    }
    
    addElementsToGispl(selection);
    
    gisplApi.add = addElementsToGispl;
    
    return gisplApi;
}

let elementInsertion = (function () {
    
    function assureSelectionAreArrayLike(selection) {
        return typeof selection[0] === 'undefined' ?
                                        [selection] :
                                        selection;
    }
    
    function modifyObject(arrayLike, selection) {
        let elements = assureSelectionAreArrayLike(selection),
            gisplIndex = arrayLike.length, 
            length = elements.length;

        for (let i = 0; i < length; i += 1, gisplIndex += 1) {
            arrayLike[gisplIndex] = elements[i];
            arrayLike.length += 1;
        }
    }
    
    return function elementInsertion(arrayLike = {}, selection) {

        if (typeof arrayLike.length === 'undefined') {
            arrayLike.length = 0;
        }

        if (typeof selection === 'string') {
            selection = document.querySelectorAll(selection);
        }

        if (typeof selection !== 'undefined') {
            modifyObject(arrayLike, selection);
        }   
    };
})();