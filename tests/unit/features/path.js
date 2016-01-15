import {featureFactory} from '../../../source/feature';
import {pathFeatureException} from '../../../source/features/path';
import TuioPointer from 'tuio/src/TuioPointer';

describe('feature', () => {
    describe('path', () => {

        function buildPointer(params = {}) {
            let {x:xp, y:yp,
                    typeId} = params;

            let pointer = new TuioPointer({xp, yp});

            //not very clean
            if (typeof typeId !== 'undefined') {
                pointer.typeId = typeId;
            }

            return {
                moveTo: function(params) {
                    let {x:xp, y:yp} = params;
                    pointer.update({xp, yp});
                    return this;
                },
                finished: function() {
                    return pointer;
                }
            };
        }

        let type = 'path',
            constraints = [[0,0]];

        it('should construct', () => {
            let pathFeature = featureFactory({type, constraints});
            expect(pathFeature).to.be.an('object');
            expect(pathFeature.type()).to.equal('Path');
        });

        it('should return false when passed no, empty, or invalid object', () => {
            let pathFeature = featureFactory({type, constraints});
            expect(pathFeature.load()).to.equal(false);
            expect(pathFeature.load([])).to.equal(false);
            expect(pathFeature.load({})).to.equal(false);
        });

        it('should throw if missing constraints', () => {
            expect(function() {
                featureFactory({type});
            }).to.throw(Error, new RegExp(pathFeatureException.NO_CONSTRAINTS));
        });

        it(`should recognize if the point in inputState roughly match
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
                rectangleMovingPointersCounterClockwise = buildPointer({
                    x: 0.5, y: 0.5
                }).moveTo({
                    x: 0.5, y: 0.7
                }).moveTo({
                    x: 0.8, y: 0.7
                }).moveTo({
                    x: 0.8, y: 0.45
                }).moveTo({
                    x: 0.5, y: 0.5
                }).finished();

            let inputState = [rectangleMovingPointersCounterClockwise];

            expect(rectanglePath.load(inputState)).to.equal(true);
        });

        it(`should recognize if the point in inputState does not match
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
                rectangleMovingPointersClockwise = buildPointer({
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

            let inputState = [rectangleMovingPointersClockwise];

            expect(rectanglePath.load(inputState)).to.equal(false);
        });

        it(`should recognize if the points in inputState do not match
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
                rectangleMovingPointersCounterClockwise = buildPointer({
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
                rectangleMovingPointersClockwise = buildPointer({
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

            let inputState = [
                rectangleMovingPointersCounterClockwise,
                rectangleMovingPointersClockwise
            ];

            expect(rectanglePath.load(inputState)).to.equal(false);
        });
    });
});
