import motion from './features/motion';

export function featureFactory(name) {
    
    switch (name.toLowerCase()) {
    case 'motion':
        return motion();
    default:
        throw new Error(`${featureException.NONEXISTING} name`);
    }
}
    
export function createFeature(params = {}) {
    let {name} = params;
    
    return {
        name
    };
}
    
export let featureException = {
    NONEXISTING: 'Trying to add a gesture with a non-existing feature: '
};