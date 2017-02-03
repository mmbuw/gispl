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

    return {
        append(selection) {
            const
                nodesToAdd = selectionToArray(selection),
                existingNodes = gisplObjects.get(object);
            nodesToAdd.filter(function useNewOnly(node) {
                return node !== null &&
                        !existingNodes.has(node);
            }).forEach(function addNodeToExisting(node) {
                object[object.length] = node;
                object.length += 1;
                existingNodes.add(node);
            });
        }
    };
}
