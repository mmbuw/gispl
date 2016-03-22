// compares if an array (of identifiers) is equal to another
// [1,2,3] equals [1,2,3]
// but also [3,2,1]
export function compareInput(first, second) {
    let equalLength = first.length === second.length,
        secondContainsAllOfFirst = first.every(
            item => second.indexOf(item) !== -1
        );

    return equalLength && secondContainsAllOfFirst;
}
// returns an array of identifiers [1,2,...]
// from an array of inputObjects
// [{identifier: 1,...}, {identifier: 2,...},...}
function extractIdentifiersFrom(inputObjects = []) {
    return inputObjects
        .filter(inputObject => !!inputObject)
        .map(inputObject => inputObject.identifier);
}

export function inputComparison() {

    let currentInputIds,
        matchedInputIds = [],
        previousInputIds = [],
        currentInputPreviouslyMatched,
        currentInputPreviouslyUsed;

    return {
        use(inputObjects) {
            currentInputIds = extractIdentifiersFrom(inputObjects);
            //
            currentInputPreviouslyMatched = compareInput(currentInputIds,
                                                            matchedInputIds);
            //
            currentInputPreviouslyUsed = compareInput(currentInputIds,
                                                        previousInputIds);
            // save for the next time the .load method is called
            previousInputIds = currentInputIds;
        },
        matched() {
            matchedInputIds = currentInputIds;
        },
        previouslyMatched() {
            return currentInputPreviouslyMatched;
        },
        previouslyUsed() {
            return currentInputPreviouslyUsed;
        }
    };
}
