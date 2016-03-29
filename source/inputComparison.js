// compares if an array (of identifiers) is equal to another
// [1,2,3] equals [1,2,3]
// but also [3,2,1]
export function compareInput(first, second) {
    let equalLength = first.length === second.length,
        secondContainsAllOfFirst = true;
        
    for (let i = 0; i < first.length; i += 1) {
        let item = first[i];
        if (second.indexOf(item) === -1) {
            secondContainsAllOfFirst = false;
            break;
        }
    }

    return equalLength && secondContainsAllOfFirst;
}

export function inputComparison() {

    let currentInputIds = [],
        matchedInputIds = [],
        previousInputIds = [],
        currentInputPreviouslyMatched,
        currentInputPreviouslyUsed;
        
    // returns an array of identifiers [1,2,...]
    // from an array of inputObjects
    // [{identifier: 1,...}, {identifier: 2,...},...}
    function extractIdentifiersFrom(inputObjects = []) {
        currentInputIds.length = 0;
        for (let i = 0; i < inputObjects.length; i += 1) {
            let inputObject = inputObjects[i];
            if (inputObject) {
                currentInputIds.push(inputObject.identifier);
            }
        }
    }
    
    function setSecondAsFirst(first, second) {
        first.length = 0;
        for (let i = 0; i < second.length; i += 1) {
            first.push(second[i]);
        }
    }

    return {
        use(inputObjects) {
            extractIdentifiersFrom(inputObjects);
            //
            currentInputPreviouslyMatched = compareInput(currentInputIds,
                                                            matchedInputIds);
            //
            currentInputPreviouslyUsed = compareInput(currentInputIds,
                                                        previousInputIds);
            // save for the next time the .load method is called
            setSecondAsFirst(previousInputIds, currentInputIds);
        },
        matched() {
            setSecondAsFirst(matchedInputIds, currentInputIds);
        },
        previouslyMatched() {
            return currentInputPreviouslyMatched;
        },
        previouslyUsed() {
            return currentInputPreviouslyUsed;
        }
    };
}
