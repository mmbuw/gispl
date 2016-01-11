import {featureBase,
        lowerUpperLimit} from '../feature';

export default function count(params) {
    let countApi = {},
        baseApi = featureBase(),
        {constraints} = params;
    
    let limit = lowerUpperLimit(constraints);
    
    countApi.type = function countType() {
        return 'Count';
    };
    
    countApi.load = function countLoad(inputState) {
        if (!baseApi.load(inputState)) {
            return false;
        }
        let match = inputState.length >= limit.lower;
        if (typeof constraints[1] !== 'undefined') {
            match = match && (inputState.length <= limit.upper);
        }
        
        return match;
    };
    
    return countApi;
}