import screenCalibration from './screenCalibration';

export default function nodeSearch(params = {}) {

    let {calibration = screenCalibration()} = params;

    function coordinatesFromParams(params = {}) {
        let {clientX, clientY, screenX, screenY} = params;

        if (typeof screenX !== 'undefined' &&
                typeof screenY !== 'undefined' &&
                calibration.isScreenUsable()) {
            let adjustedPoints = calibration.screenToViewportCoordinates(params);
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
        }
    };
}
