import screenCalibration from './screenCalibration';

export default function nodeSearch(params = {}) {

    let {calibration = screenCalibration(),
            bubble = true} = params;

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
            let nodes = [],
                {x, y} = coordinatesFromParams(params);

            if (typeof x !== 'undefined' &&
                    typeof y !== 'undefined') {
                let foundElement = document.elementFromPoint(x, y);
                if (bubble) {
                    let elementPath = nodePathFrom(foundElement);
                    while (elementPath.exists()) {
                        nodes.push(elementPath.currentNode());
                        elementPath.moveToParentNode();
                    }
                }
                else if (foundElement.nodeName !== 'HTML') {
                    nodes.push(foundElement);
                }
            }

            return nodes;
        }
    };
}


function nodePathFrom(topNode) {
    let node = topNode;

    return {
        currentNode() {
            return node;
        },

        exists() {
            return node !== null;
        },

        moveToParentNode() {
            node = node.parentNode;
            return this;
        },

        //this is unused atm
        containsPoint(point) {

            if (!this.exists()) {
                return false;
            }

            let {x, y} = point;

            let elementGeometry = node.getBoundingClientRect();

            return (elementGeometry.left <= x &&
                        x < elementGeometry.right &&
                        elementGeometry.top <= y &&
                        y < elementGeometry.bottom);
        },
        // this too
        isRoot() {
            return node === document;
        }
    };
}
