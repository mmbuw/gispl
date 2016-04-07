import {featureFactory} from '../../../source/feature';
import {pathFeatureException} from '../../../source/features/path';
import {buildInputFromPointer} from '../../helpers/pointer';

describe('feature', () => {
    describe('path', () => {

        let type = 'path',
            constraints = [[0,0], [1, 1]];

        it('should construct', () => {
            let pathFeature = featureFactory({type, constraints});
            expect(pathFeature).to.be.an('object');
            expect(pathFeature.type()).to.equal('Path');
        });

        it('should throw if missing constraints', () => {
            expect(function() {
                featureFactory({type});
            }).to.throw(Error, new RegExp(pathFeatureException.NO_CONSTRAINTS));
        });

        it('should throw if constraints contain less than two points', () => {
            expect(function() {
                featureFactory({type, constraints: [[0, 0]]});
            }).to.throw(Error, new RegExp(pathFeatureException.INVALID_CONSTRAINTS));
        });

        it('should throw if constraints contain less than two points', () => {
            expect(function() {
                featureFactory({type, constraints: [[0], [0, 0]]});
            }).to.throw(Error, new RegExp(pathFeatureException.INVALID_CONSTRAINTS_POINT));
            expect(function() {
                featureFactory({type, constraints: [
                    [0,0], [0, 0], [0]
                ]});
            }).to.throw(Error, new RegExp(pathFeatureException.INVALID_CONSTRAINTS_POINT));
        });

        it(`should recognize if the point in inputObjects roughly match
                the points in constraints`, () => {
            // origin is bottom left
            let drawRectangleFromTopLeftCounterClockwise = [
                    [0, 100],
                    [0, 0],
                    [100, 0],
                    [100, 100],
                    [0, 100]
                ],
                rectanglePath = featureFactory({
                    type,
                    constraints: drawRectangleFromTopLeftCounterClockwise
                }),
                // tuio is with origin top left
                rectangleMovingPointersCounterClockwise = buildInputFromPointer({
                    x: 0.5, y: 0.5
                }).moveTo({
                    x: 0.49, y: 0.78
                }).moveTo({
                    x: 0.66, y: 0.81
                }).moveTo({
                    x: 0.64, y: 0.52
                }).moveTo({
                    x: 0.53, y: 0.51
                }).finished();

            let inputObjects = [rectangleMovingPointersCounterClockwise];

            expect(rectanglePath.load({inputObjects})).to.equal(true);
        });

        it(`should recognize if the point in inputObjects does not match
                the points in constraints`, () => {
            // origin is bottom left
            let drawRectangleFromTopLeftCounterClockwise = [
                    [0, 100],
                    [0, 0],
                    [100, 0],
                    [100, 100],
                    [0, 100]
                ],
                rectanglePath = featureFactory({
                    type,
                    constraints: drawRectangleFromTopLeftCounterClockwise
                }),
                // tuio is with origin top left
                rectangleMovingPointersClockwise = buildInputFromPointer({
                    x: 0.8, y: 0.45
                }).moveTo({
                    x: 0.8, y: 0.7
                }).moveTo({
                    x: 0.5, y: 0.7
                }).moveTo({
                    x: 0.5, y: 0.5
                }).moveTo({
                    x: 0.8, y: 0.45
                }).finished();

            let inputObjects = [rectangleMovingPointersClockwise];

            expect(rectanglePath.load({inputObjects})).to.equal(false);
        });

        it(`should recognize if the points in inputObjects do not match
                the points in constraints`, () => {
            // origin is bottom left
            let drawRectangleFromTopLeftCounterClockwise = [
                    [0, 100],
                    [0, 0],
                    [100, 0],
                    [100, 100],
                    [0, 100]
                ],
                rectanglePath = featureFactory({
                    type,
                    constraints: drawRectangleFromTopLeftCounterClockwise
                }),
                //should match
                rectangleMovingPointersCounterClockwise = buildInputFromPointer({
                    x: 0.5, y: 0.5
                }).moveTo({
                    x: 0.5, y: 0.7
                }).moveTo({
                    x: 0.8, y: 0.7
                }).moveTo({
                    x: 0.8, y: 0.45
                }).moveTo({
                    x: 0.5, y: 0.5
                }).finished(),
                // should not match
                rectangleMovingPointersClockwise = buildInputFromPointer({
                    x: 0.8, y: 0.45
                }).moveTo({
                    x: 0.8, y: 0.7
                }).moveTo({
                    x: 0.5, y: 0.7
                }).moveTo({
                    x: 0.5, y: 0.5
                }).moveTo({
                    x: 0.8, y: 0.45
                }).finished();

            let inputObjects = [
                rectangleMovingPointersCounterClockwise,
                rectangleMovingPointersClockwise
            ];

            expect(rectanglePath.load({inputObjects})).to.equal(false);
        });

        it(`should not recognize the feature if the input does not match
                the defined filter`, () => {
            // origin is bottom left
            let drawRectangleFromTopLeftCounterClockwise = [
                    [0, 100],
                    [0, 0],
                    [100, 0],
                    [100, 100],
                    [0, 100]
                ],
                tuioRightThumbFinger = 0b10000,
                tuioRightIndexFinger = 0b1,
                filteredPath = featureFactory({
                    type,
                    constraints: drawRectangleFromTopLeftCounterClockwise,
                    filters: tuioRightThumbFinger
                }),
                // tuio is with origin top left
                rectangleMovingPointersCounterClockwise = buildInputFromPointer({
                    x: 0.5, y: 0.5,
                    typeId: tuioRightIndexFinger
                }).moveTo({
                    x: 0.49, y: 0.78
                }).moveTo({
                    x: 0.66, y: 0.81
                }).moveTo({
                    x: 0.64, y: 0.52
                }).moveTo({
                    x: 0.53, y: 0.51
                }).finished();

            let inputObjects = [rectangleMovingPointersCounterClockwise];

            expect(filteredPath.load({inputObjects})).to.equal(false);
        });
        
        it('should be able to set its last known value in the feature values object', () => {
            // origin is bottom left
            let drawRectangleFromTopLeftCounterClockwise = [
                    [0, 100],
                    [0, 0],
                    [100, 0],
                    [100, 100],
                    [0, 100]
                ],
                rectanglePath = featureFactory({
                    type,
                    constraints: drawRectangleFromTopLeftCounterClockwise
                }),
                // tuio is with origin top left
                rectangleMovingPointersCounterClockwise = buildInputFromPointer({
                    x: 0.5, y: 0.5
                }).moveTo({
                    x: 0.49, y: 0.78
                }).moveTo({
                    x: 0.66, y: 0.81
                }).moveTo({
                    x: 0.64, y: 0.52
                }).moveTo({
                    x: 0.53, y: 0.51
                }).finished();

            let inputObjects = [rectangleMovingPointersCounterClockwise],
                expectedValue = 2,
                featureValues = {};

            rectanglePath.load({inputObjects});
            rectanglePath.setValueToObject(featureValues);
            expect(featureValues.path).to.be.above(expectedValue);
        });
    });
});
