export default function elementSelector() {
    
    let selectorApi = {};
    
    selectorApi.find = function selectorFind(params = {}) {
        let nodes = [],
            {x, y} = params;
        
        if (typeof x !== 'undefined' &&
                typeof y !== 'undefined') {
            let topElement = element(document.elementFromPoint(x, y));
            while (topElement.exists()) {
                if (topElement.containsPoint({x, y})) {
                    nodes.push(topElement.node);
                }
                topElement.parent();
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
    
    elementApi.parent = function elementParent() {
        this.node = this.node.parentNode;
    };
    
    elementApi.containsPoint = function elementContainsPoint(point) {
        let elementGeometry,
            {x, y} = point;
        
        if (this.node.getBoundingClientRect) {
            elementGeometry = this.node.getBoundingClientRect();
        }
        return (this.node === document || (
                    elementGeometry.left <= x &&
                    x < elementGeometry.right &&
                    elementGeometry.top <= y &&
                    y < elementGeometry.bottom));
    };
    
    return elementApi;
}
