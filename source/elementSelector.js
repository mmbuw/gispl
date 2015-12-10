export default function elementSelector(params = {}) {
    
    let selectorApi = {},
        {calibration} = params;
    
    selectorApi.find = function selectorFind(params = {}) {
        let nodes = [],
            {x, y, screenX, screenY} = params;
        
        if (typeof screenX !== 'undefined' &&
                typeof screenY !== 'undefined') {
            let adjustedPoints = calibration.screenToViewportCoordinates({
                screenX, screenY
            });
            x = adjustedPoints.x;
            y = adjustedPoints.y;
        }
        
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
    
    return selectorApi;
}


function element(paramNode) {
    let elementApi = {};
    
    elementApi.node = paramNode;
    
    elementApi.exists = function elementExists() {
        return this.node !== null;
    };
    
    elementApi.moveToParent = function elementParent() {
        this.node = this.node.parentNode;
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
