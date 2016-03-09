import {featureFactory} from '../../../source/feature';

describe('feature', () => {
    
    describe('delay', () => {
        
        it('should construct', () => {
            let type = 'delay',
                delayFeature = featureFactory({type});
            
            expect(delayFeature).to.be.an('object');
            expect(delayFeature.type()).to.equal('Delay');
        });
    });
});