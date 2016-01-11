import {featureBase} from '../feature';

export default function count() {
    let countApi = {},
        baseApi = featureBase();
    
    countApi.type = function countType() {
        return 'Count';
    };
    
    countApi.load = function countLoad(inputState) {
        if (!baseApi.load(inputState)) {
            return false;
        }
    };
    
    return countApi;
}