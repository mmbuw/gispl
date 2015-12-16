export default function gispl(params) {
    
    let gisplApi = {};
    
    function insertElements(params, gisplIndex = 0) {
        let elements = assureParamsAreArrayLike(params),
            length = elements.length;
        
        for (let i = 0; i < length; i += 1, gisplIndex += 1) {
            gisplApi[gisplIndex] = elements[i];
            gisplApi.length += 1;
        }
    }
    
    function addElementsToGispl(params) {
    
        if (typeof params === 'string') {
            params = document.querySelectorAll(params);
        }

        if (typeof params !== 'undefined') {
            insertElements(params, gisplApi.length);
        }
    }
    
    gisplApi.length = 0;
    
    addElementsToGispl(params);
    
    gisplApi.add = addElementsToGispl;
    
    return gisplApi;
}
    
function assureParamsAreArrayLike(params) {
    return typeof params[0] === 'undefined' ?
                                    [params] :
                                    params;
}