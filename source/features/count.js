import {featureBase,
        lowerUpperLimit} from '../feature';

export default function count(params) {
    let countApi = {},
        baseApi = featureBase(),
        limit = lowerUpperLimit(params.constraints);
    
    countApi.type = function countType() {
        return 'Count';
    };
    
    countApi.load = function countLoad(inputState) {
        if (!baseApi.load(inputState)) {
            return false;
        }
        let match = inputState.length >= limit.lower;
        if (typeof limit.upper !== 'undefined') {
            match = match && (inputState.length <= limit.upper);
        }
        
        return match;
    };
    
    return countApi;
}