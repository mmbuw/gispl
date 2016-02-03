import screenCalibration from './screenCalibration';

export default function nodeSearch(params = {}) {

    let {calibration = screenCalibration()} = params;

    function coordinatesFromParams(params = {}) {
        let {x, y, screenX, screenY} = params;

        if (typeof screenX !== 'undefined' &&
                typeof screenY !== 'undefined' &&
                calibration.isScreenUsable()) {
            let adjustedPoints = calibration.screenToViewportCoordinates({
                screenX, screenY
            });
            x = adjustedPoints.x;
            y = adjustedPoints.y;
        }

        return {x, y};
    }

    return {
        fromPoint(params = {}) {
            // elementFromPoint returns null when nothing found
            // e.g. looking outside of the viewport
            let foundElement = null,
                {x, y} = coordinatesFromParams(params);
                

            if (typeof x !== 'undefined' &&
                    typeof y !== 'undefined') {
                foundElement = document.elementFromPoint(x, y);
            }

            return foundElement;
        }
    };
}
