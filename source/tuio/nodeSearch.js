export default function nodeSearch(params = {}) {

    let {calibration} = params,
        result = [];

    function coordinatesFromParams(params = {}) {
        let {clientX, clientY, screenX, screenY} = params;

        if (typeof screenX !== 'undefined' &&
                typeof screenY !== 'undefined' &&
                calibration.isScreenUsable()) {
            let adjustedPoints = calibration.screenToBrowserCoordinates(screenX, screenY);
            ({clientX, clientY} = adjustedPoints);
        }

        return {clientX, clientY};
    }

    return {
        fromPoint(params = {}) {
            // elementFromPoint returns null when nothing found
            // e.g. looking outside of the viewport
            let foundElement = null,
                {clientX, clientY} = coordinatesFromParams(params);

            if (typeof clientX !== 'undefined' &&
                    typeof clientY !== 'undefined') {
                foundElement = document.elementFromPoint(clientX, clientY);
            }

            return foundElement;
        },
        parentsOf(node) {
            let nextParent = node.parentNode;
            result.length = 0;
                
            while (nextParent) {
                result[result.length] = nextParent;
                nextParent = nextParent.parentNode;
            }
            
            return result;
        }
    };
}