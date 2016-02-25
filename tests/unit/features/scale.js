import {featureFactory} from '../../../source/feature';
import {buildInputFromPointer} from '../../helpers/pointer';

describe('feature', () => {
    describe('scale', () => {
        
        let type = 'scale';
        
        it('should construct', () => {
            let scaleFeature = featureFactory({type});
                
            expect(scaleFeature).to.be.an('object');
            expect(scaleFeature.type()).to.equal('Scale');
            expect(scaleFeature.load).to.be.a('function');
        });
        
        it(`should recognize the feature if two points satisfy
                the lower bound constraint`, () => {
            let params = {
                    type,
                    constraints: [2]
                },
                scaleFeature = featureFactory(params),
                firstInput = buildInputFromPointer({x: 0.4, y: 0.4}),
                secondInput = buildInputFromPointer({x: 0.6, y: 0.6});
            
            firstInput.moveTo({x: 0.30, y: 0.30});
            secondInput.moveTo({x: 0.7, y: 0.7});
            
            let inputObjects = [
                firstInput.finished(),
                secondInput.finished()
            ];
            
            expect(
                scaleFeature.load({inputObjects})
            ).to.equal(true);
        });
        
        it(`should not recognize the feature if two points do not satisfy
                the lower bound constraint`, () => {
            let params = {
                    type,
                    constraints: [2]
                },
                scaleFeature = featureFactory(params),
                invalidScaleInput = buildInputFromPointer({x: 0.4, y: 0.4}),
                secondInput = buildInputFromPointer({x: 0.6, y: 0.6});
            
            invalidScaleInput.moveTo({x: 0.35, y: 0.35});
            secondInput.moveTo({x: 0.7, y: 0.7});
            
            let inputObjects = [
                invalidScaleInput.finished(),
                secondInput.finished()
            ];
            
            expect(
                scaleFeature.load({inputObjects})
            ).to.equal(false);
        });
    });
});