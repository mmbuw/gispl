import {featureFactory} from '../../../source/feature';
import {buildInputFromPointer} from '../../helpers/pointer';

describe('feature', () => {
    describe('objectGroup', () => {
        
        it('should recognize the feature if input within constraints', () => {
            // centroid is 0.5, 0.5
            let firstInput = buildInputFromPointer({x: 0.4, y: 0.4})
                                .finished(),
                secondInput = buildInputFromPointer({x: 0.6, y: 0.4})
                                .finished(),
                inputObjects = [firstInput, secondInput],
                // both points will be in
                radius = Math.abs((firstInput.screenX - secondInput.screenX) / 2);
                
            let type = 'objectGroup',
                count = inputObjects.length,
                constraints = [count, count, radius],
                objectGroupFeature = featureFactory({type, constraints});
            
            expect(objectGroupFeature.load({inputObjects})).to.equal(true);
        });
        
        it(`should not recognize the feature if input objects not within
                the defined radius`, () => {
            // centroid is 0.5, 0.5
            let firstInput = buildInputFromPointer({x: 0.4, y: 0.4})
                                .finished(),
                secondInput = buildInputFromPointer({x: 0.6, y: 0.4})
                                .finished(),
                inputObjects = [firstInput, secondInput],
                // both points will be out
                radius = Math.abs((firstInput.screenX - secondInput.screenX) / 2) - 1;
                console.log(radius);
                
            let type = 'objectGroup',
                count = inputObjects.length,
                constraints = [count, count, radius],
                objectGroupFeature = featureFactory({type, constraints});
            
            expect(objectGroupFeature.load({inputObjects})).to.equal(false);
        });
        
        it(`should not recognize the feature if input objects within
                the defined radius, but below lower limit`, () => {
            // centroid is 0.5, 0.5
            let firstInput = buildInputFromPointer({x: 0.4, y: 0.4})
                                .finished(),
                secondInput = buildInputFromPointer({x: 0.6, y: 0.4})
                                .finished(),
                inputObjects = [firstInput, secondInput],
                // both points will be out
                radius = Math.abs((firstInput.screenX - secondInput.screenX) / 2) + 100;
                console.log(radius);
                
            let type = 'objectGroup',
                count = inputObjects.length + 1,
                constraints = [count, count, radius],
                objectGroupFeature = featureFactory({type, constraints});
            
            expect(objectGroupFeature.load({inputObjects})).to.equal(false);
        });
        
        it(`should not recognize the feature if input objects within
                the defined radius, but above upper limit`, () => {
            // centroid is 0.5, 0.5
            let firstInput = buildInputFromPointer({x: 0.4, y: 0.4})
                                .finished(),
                secondInput = buildInputFromPointer({x: 0.6, y: 0.4})
                                .finished(),
                inputObjects = [firstInput, secondInput],
                // both points will be out
                radius = Math.abs((firstInput.screenX - secondInput.screenX) / 2) + 100;
                console.log(radius);
                
            let type = 'objectGroup',
                count = inputObjects.length - 1,
                constraints = [count, count, radius],
                objectGroupFeature = featureFactory({type, constraints});
            
            expect(objectGroupFeature.load({inputObjects})).to.equal(false);
        });
    });
});