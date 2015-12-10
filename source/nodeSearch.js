export default function nodeSearch(params = {}) {
    
    let searchApi = {},
        {calibration} = params;
    
    function coordinatesFromParams(params = {}) {
        let {x, y, screenX, screenY} = params;
        
        if (typeof screenX !== 'undefined' &&
                typeof screenY !== 'undefined') {
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
                    nodes.push(topElement.node);
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
    
    elementApi.node = paramNode;
    
    elementApi.exists = function elementExists() {
        return this.node !== null;
    };
    
    elementApi.moveToParent = function elementParent() {
        this.node = this.node.parentNode;
        return this;
    };
    
    elementApi.containsPoint = function elementContainsPoint(point) {
        let elementGeometry,
            {x, y} = point;
        
        if (this.node.getBoundingClientRect) {
            elementGeometry = this.node.getBoundingClientRect();
        }
        return (elementGeometry.left <= x &&
                    x < elementGeometry.right &&
                    elementGeometry.top <= y &&
                    y < elementGeometry.bottom);
    };
    
    elementApi.isDocument = function elementIsDocument() {
        return this.node === document;
    };
    
    return elementApi;
}
