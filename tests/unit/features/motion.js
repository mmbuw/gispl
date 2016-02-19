import {featureFactory} from '../../../source/feature';
import {buildInputFromPointer} from '../../helpers/pointer';
import TuioCursor from 'tuio/src/TuioCursor';
import {inputObjectFromTuio} from '../../../source/tuio/tuioInputObject';

describe('feature', () => {
    describe('motion', () => {

        let type = 'motion',
            motion;

        beforeEach(() => {
            motion = featureFactory({type});
        });

        it('should recognize motion of inputs with at least two known points', () => {
            let movingPointer = buildInputFromPointer({
                x: 0.5, y: 0.5
            }).moveTo({x: 0.6, y: 0.6}).finished();

            let inputObjects = [[movingPointer]];
            expect(motion.load({inputObjects})).to.equal(true);
        });

        it('should not recognize motion of inputs with only one known point', () => {
            let inputObjects = [[buildInputFromPointer().finished()]];
            expect(motion.load({inputObjects})).to.equal(false);
        });

        it('should not recognize motion of input that moved, but stopped', () => {
            let stoppedPointer = buildInputFromPointer({x: 0.1, y: 0.1})
                                    .moveTo({x: 0.5, y: 0.5})
                                    .moveTo({x: 0.1, y: 0.1})
                                    .moveTo({x: 0.1, y: 0.1})
                                    .finished();

            let inputObjects = [[stoppedPointer]];
            expect(motion.load({inputObjects})).to.equal(false);
        });

        it(`should recognize motion of several pointers,
                at least one of which is moving`, () => {
            let movingPointer = buildInputFromPointer({x: 0.5, y: 0.5})
                                    .moveTo({x: 0.6, y: 0.6})
                                    .finished();
            let staticPointer = buildInputFromPointer({x: 0.1, y: 0.2})
                                    .finished();

            let inputObjects = [[
                movingPointer,
                staticPointer
            ]];

            expect(motion.load({inputObjects})).to.equal(true);
        });

        it(`should not recognize motion of several pointers,
                    none of which is moving`, () => {
            let staticPointer = buildInputFromPointer({x: 0.5, y: 0.6})
                                    .finished();
            let staticPointer2 = buildInputFromPointer({x: 0.1, y: 0.2})
                                    .finished();
            let inputObjects = [[
                staticPointer,
                staticPointer2
            ]];
            expect(motion.load({inputObjects})).to.equal(false);
        });
        
        it('should recognize motion, even if the relative movement is very small', () => {
            let movingPointer = buildInputFromPointer({x: 0.5, y: 0.5})
                                    .moveTo({x: 0.5001, y: 0.5001})
                                    .finished();

            let inputObjects = [[
                movingPointer
            ]];

            expect(motion.load({inputObjects})).to.equal(true);
        });

        it(`should not recognize the feature if the input does not match
                the defined filter`, () => {
            let tuioRightThumbFinger = 5,
                tuioRightIndexFinger = 1,
                filters = 0b10000, //5th bit
                filteredMotion = featureFactory({type, filters});

            let movingPointer = buildInputFromPointer(
                                    {x: 0.1, y: 0.2, typeId: tuioRightIndexFinger}
                                ).moveTo({x: 0.4, y: 0.1}).finished(),
                inputObjects = [[
                    movingPointer
                ]];

            expect(filteredMotion.load({inputObjects})).to.equal(false);
        });

        it('should match feature if feature filter matches the input type', () => {
            let tuioRightThumbFingerId = 5,
                filters = 0b10000, //5th bit set equals id 5
                filteredMotion = featureFactory({type, filters});

            let movingPointer = buildInputFromPointer(
                                    {x: 0.1, y: 0.2, typeId: tuioRightThumbFingerId}
                                ).moveTo({x: 0.4, y: 0.1}).finished(),
                inputObjects = [[
                    movingPointer
                ]];

            expect(filteredMotion.load({inputObjects})).to.equal(true);
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

            let inputObjects = [[
                inputObjectFromTuio({
                    tuioComponent: movingCursor
                })
            ]];

            expect(filteredMotion.load({inputObjects})).to.equal(false);
        });

        it(`should match the feature if direction constraints are defined,
                and movement matches the constraints`, () => {
                // constraints vectors -> origin is bottom left
            let matchIfDiagonalTopRight = [[1, 0], [window.screen.width, window.screen.height]],
                constrainedMotion = featureFactory({
                    type, constraints: matchIfDiagonalTopRight
                }),
                // tuio origin is top left
                movingPointer = buildInputFromPointer({x: 1, y: 1})
                                    .moveTo({x: 0.5, y: 0.5});

            let inputObjects = [[
                movingPointer.finished()
            ]];
            expect(constrainedMotion.load({inputObjects})).to.equal(false);

            movingPointer.moveTo({x: 1, y: 1});
            inputObjects = [[
                movingPointer.finished()
            ]];
            expect(constrainedMotion.load({inputObjects})).to.equal(false);

            movingPointer.moveTo({x: 0, y: 1});
            inputObjects = [[
                movingPointer.finished()
            ]];
            expect(constrainedMotion.load({inputObjects})).to.equal(false);

            movingPointer.moveTo({x: 0, y: 1});
            inputObjects = [[
                movingPointer.finished()
            ]];
            expect(constrainedMotion.load({inputObjects})).to.equal(false);

            movingPointer.moveTo({x: 0, y: 0});
            inputObjects = [[
                movingPointer.finished()
            ]];
            expect(constrainedMotion.load({inputObjects})).to.equal(false);

            movingPointer.moveTo({x: 0.5, y: 0.5});
            inputObjects = [[
                movingPointer.finished()
            ]];
            expect(constrainedMotion.load({inputObjects})).to.equal(false);

            movingPointer.moveTo({x: 1, y: 0});
            inputObjects = [[
                movingPointer.finished()
            ]];
            expect(constrainedMotion.load({inputObjects})).to.equal(true);
        });
    });
});
