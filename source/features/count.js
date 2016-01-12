import {featureBase,
        lowerUpperLimit} from '../feature';

export default function count(params) {
    
    isValidCountFeature(params);
    
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
    
function isValidCountFeature(countFeature) {
    if (typeof countFeature.constraints === 'undefined'
            || ! countFeature.constraints.length) {
        throw new Error(countFeatureException.NO_CONSTRAINTS);
    }
}
    
export let countFeatureException = {
    NO_CONSTRAINTS: `Attempting to add a count feature with no constraints; i.e. number of contact points`
};