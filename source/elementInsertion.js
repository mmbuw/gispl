function selectionToArray(selection = []) {
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

const gisplObjects = new WeakMap();

export default function elementInsertion(object) {
    gisplObjects.set(object, new WeakSet());

    if (typeof object.length === 'undefined') {
        object.length = 0;
    }

    function isNodeValid(node) {
        return node !== null &&
                !gisplObjects.get(object).has(node);
    }

    function addNodeToObject(node) {
        object[object.length] = node;
        object.length += 1;
        gisplObjects.get(object).add(node);
    }

    return {
        append(selection) {
            const
                nodesToAdd = selectionToArray(selection);
            nodesToAdd
                .filter(isNodeValid)
                .forEach(addNodeToObject);
        }
    };
}
