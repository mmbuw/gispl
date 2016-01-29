import screenCalibration from './screenCalibration';

export default function nodeSearch(params = {}) {

    let {calibration = screenCalibration(),
            bubble = false} = params;

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
                let elementFromPoint = document.elementFromPoint(x, y);
                if (elementFromPoint) {
                    nodes.push(elementFromPoint);
                }
                if (bubble) {
                    let elementParent = elementChain(elementFromPoint);
                    while (elementParent.moveToParentNode() &&
                            elementParent.exists()) {
                        nodes.push(elementParent.currentNode());
                    }   
                }
                if (nodes.indexOf(document) === -1) {
                    nodes.push(document);
                }
            }

            return nodes;
        }
    };
}


function elementChain(topNode) {
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
