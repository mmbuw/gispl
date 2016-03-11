import {featureFactory} from '../../../source/feature';
import {buildInputFromPointer} from '../../helpers/pointer';
import {objectGroupException} from '../../../source/features/objectGroup';

describe('feature', () => {
    describe('objectGroup', () => {
        
        let type = 'objectGroup';
        
        it('should recognize the feature if input within constraints', () => {
            // centroid is 0.5, 0.5
            let firstInput = buildInputFromPointer({x: 0.4, y: 0.4})
                                .finished(),
                secondInput = buildInputFromPointer({x: 0.6, y: 0.4})
                                .finished(),
                inputObjects = [firstInput, secondInput],
                // both points will be in
                radius = Math.abs((firstInput.screenX - secondInput.screenX) / 2);
                
            let count = inputObjects.length,
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
                
            let count = inputObjects.length,
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
                
            let count = inputObjects.length + 1,
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
                
            let count = inputObjects.length - 1,
                constraints = [count, count, radius],
                objectGroupFeature = featureFactory({type, constraints});
            
            expect(objectGroupFeature.load({inputObjects})).to.equal(false);
        });
        
        it('should not recognize the feature when using just one point', () => {
            let firstInput = buildInputFromPointer({x: 0.4, y: 0.4})
                                .finished(),
                inputObjects = [firstInput],
                radius = 1000;
                
            let count = inputObjects.length,
                constraints = [count, count, radius],
                objectGroupFeature = featureFactory({type, constraints});
            
            expect(objectGroupFeature.load({inputObjects})).to.equal(false);
        });

        it(`should not recognize the feature if the input does not match
                the defined filter`, () => {
            let tuioRightThumbFinger = 0b10000,
                tuioRightIndexFinger = 1,
                tuioRightMiddleFinger = 2,
                firstInvalidInput = buildInputFromPointer({
                        x: 0.4, y: 0.4, typeId: tuioRightIndexFinger
                    }).finished(),
                secondInvalidInput = buildInputFromPointer({
                        x: 0.6, y: 0.4, typeId: tuioRightMiddleFinger
                    }).finished(),
                inputObjects = [firstInvalidInput,secondInvalidInput],
                radius = 10000;
           
            let count = inputObjects.length,
                constraints = [count, count, radius],
                filteredObjectGroup = featureFactory({
                    type,
                    filters: tuioRightThumbFinger,
                    constraints
                });

            expect(
                filteredObjectGroup.load({inputObjects})
            ).to.equal(false);
        });
        
        it('should be able to set its last known value in the feature values object', () => {
            // centroid is 0.5, 0.5
            let firstInput = buildInputFromPointer({x: 0.4, y: 0.4})
                                .finished(),
                secondInput = buildInputFromPointer({x: 0.6, y: 0.4})
                                .finished(),
                inputObjects = [firstInput, secondInput],
                // both points will be in
                radius = Math.abs((firstInput.screenX - secondInput.screenX) / 2);
                
            let count = inputObjects.length,
                constraints = [count, count, radius],
                objectGroupFeature = featureFactory({type, constraints});
            
            expect(objectGroupFeature.load({inputObjects})).to.equal(true);
            objectGroupFeature.load({inputObjects});
            
            let featureValues = {},
                expectedValue = radius;
            objectGroupFeature.setValueToObject(featureValues);
            
            expect(featureValues.objectgroup).to.be.above(expectedValue - 0.01);
            expect(featureValues.objectgroup).to.be.below(expectedValue + 0.01);
        });
        
        it('should throw when defining the feature without valid constraints', () => {
            expect(() => {
                featureFactory({type});
            }).to.throw(Error, new RegExp(objectGroupException.NO_CONSTRAINTS));
            
            expect(() => {
                let constraints = {};
                featureFactory({type, constraints});
            }).to.throw(Error, new RegExp(objectGroupException.INVALID_CONSTRAINTS));
            
            expect(() => {
                let constraints = [];
                featureFactory({type, constraints});
            }).to.throw(Error, new RegExp(objectGroupException.INVALID_CONSTRAINTS));
            
            expect(() => {
                let constraints = [0];
                featureFactory({type, constraints});
            }).to.throw(Error, new RegExp(objectGroupException.INVALID_CONSTRAINTS));
            
            expect(() => {
                let constraints = [0, 1];
                featureFactory({type, constraints});
            }).to.throw(Error, new RegExp(objectGroupException.INVALID_CONSTRAINTS));
            
            expect(() => {
                let constraints = [0, 1, '2'];
                featureFactory({type, constraints});
            }).to.throw(Error, new RegExp(objectGroupException.INVALID_CONSTRAINTS));
        });
    });
});