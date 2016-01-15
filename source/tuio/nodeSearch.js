import screenCalibration from './screenCalibration';

export default function nodeSearch(params = {}) {

    let searchApi = {},
        {calibration = screenCalibration()} = params;

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

    searchApi.fromPoint = function nodeSearchFromPoint(params = {}) {
        let nodes = [],
            {x, y} = coordinatesFromParams(params);

        if (typeof x !== 'undefined' &&
                typeof y !== 'undefined') {
            let foundFromPoint = elementChain(document.elementFromPoint(x, y));
            while (foundFromPoint.exists()) {
                if (foundFromPoint.isRoot() ||
                        foundFromPoint.containsPoint({x, y})) {
                    nodes.push(foundFromPoint.currentNode());
                }
                foundFromPoint.moveToParentNode();
            }
        }

        return nodes;
    };

    searchApi.find = searchApi.fromPoint;

    return searchApi;
}


function elementChain(topNode) {
    let elementApi = {};

    let node = topNode;

    elementApi.currentNode = function elementCurrentNode() {
        return node;
    };

    elementApi.exists = function elementExists() {
        return node !== null;
    };

    elementApi.moveToParentNode = function elementParentNode() {
        node = node.parentNode;
        return this;
    };

    elementApi.containsPoint = function elementContainsPoint(point) {

        if (!this.exists()) {
            return false;
        }

        let {x, y} = point;

        let elementGeometry = node.getBoundingClientRect();

        return (elementGeometry.left <= x &&
                    x < elementGeometry.right &&
                    elementGeometry.top <= y &&
                    y < elementGeometry.bottom);
    };

    elementApi.isRoot = function elementIsRoot() {
        return node === document;
    };

    return elementApi;
}
