import {featureFactory} from '../../../source/feature';
import {buildInputFromPointer} from '../../helpers/pointer';
import {objectParentException} from '../../../source/features/objectParent';

describe('feature', () => {
    describe('objectParent', () => {
        
        let type = 'objectParent';
        
        it(`should recognize the feature if the input comes from a user,
                whose id matches the defined range`, () => {
            let userId = 10,
                constraints = [userId, userId],
                objectParentFeature = featureFactory({type, constraints}),
                inputObject = buildInputFromPointer({userId});
            
            let inputObjects = [inputObject.finished()];
            expect(objectParentFeature.load({inputObjects})).to.equal(true);
        });
        
        it(`should not recognize the feature if the input comes from a user,
                whose id does not match the defined range`, () => {
            let userId = 10,
                constraints = [userId+1, userId+2],
                objectParentFeature = featureFactory({type, constraints}),
                inputObject = buildInputFromPointer({userId});
            
            let inputObjects = [inputObject.finished()];
            expect(objectParentFeature.load({inputObjects})).to.equal(false);
        });
        
        it('should throw when defining the feature without valid constraints', () => {
            expect(() => {
                featureFactory({type});
            }).to.throw(Error, new RegExp(objectParentException.NO_CONSTRAINTS));
            
            expect(() => {
                let constraints = {};
                featureFactory({type, constraints});
            }).to.throw(Error, new RegExp(objectParentException.INVALID_CONSTRAINTS));
            
            expect(() => {
                let constraints = [];
                featureFactory({type, constraints});
            }).to.throw(Error, new RegExp(objectParentException.INVALID_CONSTRAINTS));
            
            expect(() => {
                let constraints = [0];
                featureFactory({type, constraints});
            }).to.throw(Error, new RegExp(objectParentException.INVALID_CONSTRAINTS));
            
            expect(() => {
                let constraints = [0, 1, 2];
                featureFactory({type, constraints});
            }).to.throw(Error, new RegExp(objectParentException.INVALID_CONSTRAINTS));
            
            expect(() => {
                let constraints = ['0', '1'];
                featureFactory({type, constraints});
            }).to.throw(Error, new RegExp(objectParentException.INVALID_CONSTRAINTS));
        });

        it(`should not recognize the feature if the input does not match
                the defined filter`, () => {
            let tuioRightThumbFinger = 0b10000,
                tuioRightIndexFinger = 1,
                userId = 10,
                anyUserId = [0, +Infinity],
                filteredObjectParent = featureFactory({
                    type,
                    constraints: anyUserId,
                    filters: tuioRightThumbFinger
                });
                
            let inputObject = buildInputFromPointer({
                    userId,
                    typeId: tuioRightIndexFinger
                }).finished(),
                inputObjects = [inputObject];

            expect(filteredObjectParent.load({inputObjects})).to.equal(false);
        });

        it('should allow multiple filters to be set as bitmask', () => {
            let tuioRightIndexFinger = 1,
                filters = 0b10000 | 0b1,
                userId = 11,
                anyUserId = [0, +Infinity],
                filteredObjectParent = featureFactory({
                    type,
                    constraints: anyUserId,
                    filters
                });
                
            let inputObject = buildInputFromPointer({
                    userId,
                    typeId: tuioRightIndexFinger
                }).finished(),
                inputObjects = [inputObject];

            expect(filteredObjectParent.load({inputObjects})).to.equal(true);
        });
        
        it('should be able to set its last known value in the feature values object', () => {
            let userId = 10,
                constraints = [userId, userId],
                objectParentFeature = featureFactory({type, constraints}),
                inputObject = buildInputFromPointer({userId});
            
            let inputObjects = [inputObject.finished()];
            objectParentFeature.load({inputObjects});
            
            let featureValues = {},
                expectedObjectParentValue = [userId];
            
            objectParentFeature.setValueToObject(featureValues);
            
            expect(featureValues.objectparent).to.deep.equal(expectedObjectParentValue);
        });
    });
});