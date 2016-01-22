import {tuioInputObject,
        inputObjectFromTuio} from '../../../source/tuio/tuioInputObject';
import {buildPointer} from '../../helpers/pointer';

describe('tuioInputObject', () => {

    it('should have a session identifier', () => {
        let sessionId = 10,
            pointer = buildPointer({sessionId}).finished(),
            input = inputObjectFromTuio(pointer);

        expect(input.identifier).to.equal(sessionId);
    });

    it('should have an immutable type identifier', () => {
        let typeId = 5,
            pointer = buildPointer({typeId}).finished(),
            input = inputObjectFromTuio(pointer);

        expect(input.type).to.equal(typeId);
    });

    it('should have immutable screen position information', () => {
        let x = 0.5,
            y = 0.5,
            pointer = buildPointer({x, y}).finished(),
            input = inputObjectFromTuio(pointer);

        expect(input.screenX).to.equal(x*window.screen.width);
        expect(input.screenY).to.equal(y*window.screen.height);
    });

    it('should have a path property of all the previous points', () => {

        let movingPointer = buildPointer({x: 0, y: 0})
                                            .moveTo({x: 0.5, y: 0.5})
                                            .finished(),
            path = [
                {screenX: 0, screenY: 0},
                {screenX: 0.5*window.screen.width, screenY: 0.5*window.screen.height}
            ],
            inputWithHistory = inputObjectFromTuio(movingPointer);

        expect(inputWithHistory.path).to.deep.equal(path);
    });

    it('should have read-only values as enumerable properties', () => {
        let pointer = buildPointer({x: 0, y: 0, typeId: 1, sessionId: 2}).finished();
        expect(Object.keys(inputObjectFromTuio(pointer)).length).to.equal(5);
    });
});
