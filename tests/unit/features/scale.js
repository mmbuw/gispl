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
                the lower limit constraint`, () => {
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
                the lower limit constraint`, () => {
            let params = {
                    type,
                    constraints: [2]
                },
                scaleFeature = featureFactory(params),
                belowMinScaleInput = buildInputFromPointer({x: 0.4, y: 0.4}),
                secondInput = buildInputFromPointer({x: 0.6, y: 0.6});
            
            belowMinScaleInput.moveTo({x: 0.35, y: 0.35});
            secondInput.moveTo({x: 0.7, y: 0.7});
            
            let inputObjects = [
                belowMinScaleInput.finished(),
                secondInput.finished()
            ];
            
            expect(
                scaleFeature.load({inputObjects})
            ).to.equal(false);
        });
        
        it(`should recognize the feature if two points satisfy
                the upper limit constraint`, () => {
            let params = {
                    type,
                    constraints: [0, 2]
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
                the upper limit constraint`, () => {
            let params = {
                    type,
                    constraints: [1, 2]
                },
                scaleFeature = featureFactory(params),
                firstInput = buildInputFromPointer({x: 0.4, y: 0.4}),
                aboveMaxScaleInput = buildInputFromPointer({x: 0.6, y: 0.6});
            
            firstInput.moveTo({x: 0.3, y: 0.3});
            aboveMaxScaleInput.moveTo({x: 0.71, y: 0.71});
            
            let inputObjects = [
                firstInput.finished(),
                aboveMaxScaleInput.finished()
            ];
            
            expect(
                scaleFeature.load({inputObjects})
            ).to.equal(false);
        });
    });
});