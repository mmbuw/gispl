import {featureFactory} from '../../../source/feature';

describe('feature', () => {
    describe('motion', () => {
        it('should construct', () => {
            let motion = featureFactory('Motion');
            expect(motion).to.be.an('object');
            expect(motion.type()).to.equal('Motion');
        });
    });
});