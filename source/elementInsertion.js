function assureSelectionIsArrayLike(selection = []) {
    if (selection === null) {
        selection = [];
    }
    return typeof selection.length === 'undefined' ?
                                        [selection] :
                                        selection;
}

export default function elementInsertion(object) {
    let elementCollection = new WeakSet();

    if (typeof object.length === 'undefined') {
        object.length = 0;
    }

    return {
        append(selection) {
            if (typeof selection === 'string') {
                selection = document.querySelectorAll(selection);
            }

            if (typeof selection !== 'undefined') {
                let elements = assureSelectionIsArrayLike(selection);

                [].forEach.call(elements, (element, index) => {
                    if (!elementCollection.has(element) &&
                            element !== null) {
                        object[object.length] = elements[index];
                        object.length += 1;
                        elementCollection.add(element);
                    }
                });
            }
        }
    };
}
