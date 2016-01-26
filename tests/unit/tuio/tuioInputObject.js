import {tuioInputObject,
        inputObjectFromTuio} from '../../../source/tuio/tuioInputObject';
import {buildPointer} from '../../helpers/pointer';

describe('tuioInputObject', () => {

    it('should have a session identifier', () => {
        let sessionId = 10,
            pointer = buildPointer({sessionId}).finished(),
            input = inputObjectFromTuio({
                tuioComponent: pointer
            });

        expect(input.identifier).to.equal(sessionId);
    });

    it('should have a type identifier', () => {
        let typeId = 5,
            pointer = buildPointer({typeId}).finished(),
            input = inputObjectFromTuio({
                tuioComponent: pointer
            });

        expect(input.type).to.equal(typeId);
    });

    it('should have screen position information', () => {
        let x = 0.5,
            y = 0.5,
            pointer = buildPointer({x, y}).finished(),
            input = inputObjectFromTuio({
                tuioComponent: pointer
            });

        expect(input.screenX).to.equal(x*window.screen.width);
        expect(input.screenY).to.equal(y*window.screen.height);
    });

    it('should have position information related to the browser', () => {
        let x = 0.5,
            y = 0.5,
            clientX = 100,
            clientY = 100,
            browserPositionOnScreen = {x: 100, y: 100},
            pointer = buildPointer({x, y}).finished(),
            calibration = {
                screenToViewportCoordinates: () => ({
                    x: clientX,
                    y: clientY
                })
            },
            input = inputObjectFromTuio({
                tuioComponent: pointer,
                calibration
            });

        expect(input.clientX).to.equal(100);
        expect(input.clientY).to.equal(100);
    });

    it('should have a path property of all the previous points', () => {

        let movingPointer = buildPointer({x: 0, y: 0})
                                            .moveTo({x: 0.5, y: 0.5})
                                            .finished(),
            path = [
                {screenX: 0, screenY: 0},
                {screenX: 0.5*window.screen.width, screenY: 0.5*window.screen.height}
            ],
            clientX = 100,
            clientY = 100,
            calibration = {
                screenToViewportCoordinates: () => ({
                    x: clientX,
                    y: clientY
                })
            },
            inputWithHistory = inputObjectFromTuio({
                tuioComponent: movingPointer,
                calibration});

        expect(inputWithHistory.path.length).to.deep.equal(path.length);
        expect(inputWithHistory.path[0].screenX).to.equal(path[0].screenX);
        expect(inputWithHistory.path[0].screenY).to.equal(path[0].screenY);
        expect(inputWithHistory.path[0].clientX).to.equal(clientX);
        expect(inputWithHistory.path[0].clientY).to.equal(clientY);
        expect(inputWithHistory.path[1].screenX).to.equal(path[1].screenX);
        expect(inputWithHistory.path[1].screenY).to.equal(path[1].screenY);
        expect(inputWithHistory.path[1].clientX).to.equal(clientX);
        expect(inputWithHistory.path[1].clientY).to.equal(clientY);
    });

});
