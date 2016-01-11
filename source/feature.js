import motion from './features/motion';
import count from './features/count';

export function featureFactory(params = {}) {
    
    let {type = ''} = params;
    
    switch (type.toLowerCase()) {
    case 'motion':
        return motion(params);
    case 'count':
        return count(params);
    default:
        throw new Error(`${featureException.NONEXISTING} ${type}`);
    }
}
    
export function featureBase() {
    let featureApi = {};
    
    featureApi.load = function featureLoad(inputState = []) {
        return !!inputState.length;
    };
    
    return featureApi;
}
    
export let featureException = {
    NONEXISTING: 'Trying to add a gesture with a non-existing feature:'
};