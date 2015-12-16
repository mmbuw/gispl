export default function gispl(params) {
    
    let gisplApi = {};
    
    function addElementsToGispl(params, gisplIndex = 0) {
        let elements = assureParamsAreArrayLike(params),
            length = elements.length;
        
        for (let i = 0; i < length; i += 1, gisplIndex += 1) {
            gisplApi[gisplIndex] = elements[i];
            gisplApi.length += 1;
        }
    }
    
    gisplApi.length = 0;
    
    if (typeof params === 'string') {
        params = document.querySelectorAll(params);
    }
    
    if (typeof params !== 'undefined') {
        addElementsToGispl(params);
    }
    
    gisplApi.add = function gisplAddElements(params = {}) {
        let gisplIndex = gisplApi.length;
        if (typeof params === 'string') {
            params = document.querySelectorAll(params);
        }
        addElementsToGispl(params, gisplIndex);
    }
    
    return gisplApi;
}
    
function assureParamsAreArrayLike(params) {
    return typeof params[0] === 'undefined' ?
                                    [params] :
                                    params;
}