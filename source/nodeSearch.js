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
            let topElement = element(document.elementFromPoint(x, y));
            while (topElement.exists()) {
                if (topElement.isDocument() ||
                        topElement.containsPoint({x, y})) {
                    nodes.push(topElement.node());
                }
                topElement.moveToParent();
            }
        }
        
        return nodes;
    };
    
    searchApi.find = searchApi.fromPoint;
    
    return searchApi;
}


function element(paramNode) {
    let elementApi = {};
    
    let node = paramNode;
    
    elementApi.node = function elementNode() {
        return node;
    };
    
    elementApi.exists = function elementExists() {
        return node !== null && //document.parentNode === null
                    typeof node !== 'undefined'; // node is undefined
    };
    
    elementApi.moveToParent = function elementParent() {
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
    
    elementApi.isDocument = function elementIsDocument() {
        return node === document;
    };
    
    return elementApi;
}
