function assureSelectionIsArray(selection = []) {
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

export default function elementInsertion(object) {
    let elementCollection = new WeakSet();

    if (typeof object.length === 'undefined') {
        object.length = 0;
    }

    return {
        append(selection) {
            const elements = assureSelectionIsArray(selection);

            elements.forEach((element, index) => {
                if (!elementCollection.has(element) &&
                        element !== null) {
                    object[object.length] = elements[index];
                    object.length += 1;
                    elementCollection.add(element);
                }
            });
        }
    };
}
