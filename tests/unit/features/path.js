import {featureFactory} from '../../../source/feature';

describe('feature', () => {
    describe('path', () => {

        let type = 'path';

        it('should construct', () => {
            let pathFeature = featureFactory({type});
            expect(pathFeature).to.be.an('object');
            expect(pathFeature.type()).to.equal('Path');
        });
    });
});
