import {featureFactory} from '../../../source/feature';
import TuioPointer from 'tuio/src/TuioPointer';
import TuioCursor from 'tuio/src/TuioCursor';

describe('feature', () => {
    describe('motion', () => {

        let type = 'motion',
            motion;

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

        beforeEach(() => {
            motion = featureFactory({type});
        });

        it('should return false when passed no, empty, or invalid object', () => {
            expect(motion.load()).to.equal(false);
            expect(motion.load([])).to.equal(false);
            expect(motion.load({})).to.equal(false);
        });

        it('should recognize motion of inputs with at least two known points', () => {
            let movingPointer = buildPointer({x: 0.5, y: 0.5})
                                    .moveTo({x: 0.6, y: 0.6})
                                    .finished();
            let inputState = [movingPointer];
            expect(motion.load(inputState)).to.equal(true);
        });

        it('should not recognize motion of inputs with only one known point', () => {
            let inputState = [new TuioPointer()];
            expect(motion.load(inputState)).to.equal(false);
        });

        it('should not recognize motion of input that moved, but stopped', () => {
            let stoppedPointer = buildPointer({x: 0.1, y: 0.1})
                                    .moveTo({x: 0.5, y: 0.5})
                                    .moveTo({x: 0.1, y: 0.1})
                                    .moveTo({x: 0.1, y: 0.1})
                                    .finished();

            let inputState = [stoppedPointer];
            expect(motion.load(inputState)).to.equal(false);
        });

        it(`should recognize motion of several pointers,
                at least one of which is moving`, () => {
            let movingPointer = buildPointer({x: 0.5, y: 0.5})
                                    .moveTo({x: 0.6, y: 0.6})
                                    .finished();
            let staticPointer = buildPointer({x: 0.1, y: 0.2})
                                    .finished();

            let inputState = [movingPointer, staticPointer];

            expect(motion.load(inputState)).to.equal(true);
        });

        it(`should not recognize motion of several pointers,
                    none of which is moving`, () => {
            let staticPointer = buildPointer({x: 0.5, y: 0.6})
                                    .finished();
            let staticPointer2 = buildPointer({x: 0.1, y: 0.2})
                                    .finished();
            let inputState = [staticPointer, staticPointer2];

            expect(motion.load(inputState)).to.equal(false);
        });

        it(`should not recognize the feature if the input does not match
                the defined filter`, () => {
            let tuioRightThumbFinger = 5,
                tuioRightIndexFinger = 1,
                filters = 0b10000, //5th bity
                filteredMotion = featureFactory({type, filters});

            let movingPointer = buildPointer({x: 0.1, y: 0.2, typeId: tuioRightIndexFinger})
                                    .moveTo({x: 0.4, y: 0.1})
                                    .finished(),
                inputState = [movingPointer];

            expect(filteredMotion.load(inputState)).to.equal(false);
        });

        it('should match feature if feature filter matches the input type', () => {
            let tuioRightThumbFingerId = 5,
                filters = 0b10000, //5th bit set equals id 5
                filteredMotion = featureFactory({type, filters});

            let movingPointer = buildPointer({x: 0.1, y: 0.2,
                                                typeId: tuioRightThumbFingerId})
                                    .moveTo({x: 0.4, y: 0.1})
                                    .finished(),
                inputState = [movingPointer];

            expect(filteredMotion.load(inputState)).to.equal(true);
        });

        it('should not match with feature filter and tuio v1 input, e.g. cursor', () => {
            let tuioRightThumbFinger = 5,
                filters = 0b1, //not 5th bit
                filteredMotion = featureFactory({type, filters});

            let xp = 0, yp = 0,
                movingCursor = new TuioCursor({xp, yp});

            movingCursor.typeId = tuioRightThumbFinger;
            xp += 0.2;
            yp += 0.2;
            movingCursor.update({xp, yp});

            let inputState = [movingCursor];

            expect(filteredMotion.load(inputState)).to.equal(false);
        });

        it(`should match the feature if direction constraints are defined,
                and movement matches the constraints`, () => {
                // constraints vectors -> origin is bottom left
            let matchIfDiagonalTopRight = [[1, 0], [window.screen.width, window.screen.height]],
                constrainedMotion = featureFactory({
                    type, constraints: matchIfDiagonalTopRight
                }),
                // tuio origin is top left
                movingPointer = buildPointer({x: 1, y: 1})
                                    .moveTo({x: 0.5, y: 0.5});

            let inputState = [movingPointer.finished()];
            expect(constrainedMotion.load(inputState)).to.equal(false);

            movingPointer.moveTo({x: 1, y: 1});
            inputState = [movingPointer.finished()];
            expect(constrainedMotion.load(inputState)).to.equal(false);

            movingPointer.moveTo({x: 0, y: 1});
            inputState = [movingPointer.finished()];
            expect(constrainedMotion.load(inputState)).to.equal(false);

            movingPointer.moveTo({x: 0, y: 1});
            inputState = [movingPointer.finished()];
            expect(constrainedMotion.load(inputState)).to.equal(false);

            movingPointer.moveTo({x: 0, y: 0});
            inputState = [movingPointer.finished()];
            expect(constrainedMotion.load(inputState)).to.equal(false);

            movingPointer.moveTo({x: 0.5, y: 0.5});
            inputState = [movingPointer.finished()];
            expect(constrainedMotion.load(inputState)).to.equal(false);

            movingPointer.moveTo({x: 1, y: 0});
            inputState = [movingPointer.finished()];
            expect(constrainedMotion.load(inputState)).to.equal(true);
        });
    });
});
