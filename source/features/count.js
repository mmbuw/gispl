import {featureBase} from '../feature';

export default function count(params) {
    let countApi = {},
        baseApi = featureBase(),
        {constraints} = params;
    
    countApi.type = function countType() {
        return 'Count';
    };
    
    countApi.load = function countLoad(inputState) {
        if (!baseApi.load(inputState)) {
            return false;
        }
        let match = inputState.length >= constraints[0];
        if (typeof constraints[1] !== 'undefined') {
            match = match && (inputState.length <= constraints[1]);
        }
        
        return match;
    };
    
    return countApi;
}