import {featureFactory,
            featureException} from '../../source/feature';

describe('feature', () => {
    
    it('should return a concrete feature based on feature name', () => {
        let motion = featureFactory({type: 'Motion'});
        expect(motion).to.be.an('object');
        expect(motion.type()).to.equal('Motion');
    });
    
    it('should return a concrete feature with anycase name', () => {
        let motion = featureFactory({type: 'motion'});
        expect(motion).to.be.an('object');
        expect(motion.type()).to.equal('Motion');
    });
    
    it('should throw when feature not found', () => {
        expect(function() {
            let motion = featureFactory({type: 'non-existing'});
        }).to.throw(Error, new RegExp(featureException.NONEXISTING));
    });
});