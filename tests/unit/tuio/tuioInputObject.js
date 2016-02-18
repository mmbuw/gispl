import {inputObjectFromTuio} from '../../../source/tuio/tuioInputObject';
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
    
    it('should have relative (original) position information', () => {
        let x = Math.random(),
            y = Math.random(),
            pointer = buildPointer({x, y}).finished(),
            input = inputObjectFromTuio({
                tuioComponent: pointer
            });
        
        expect(input.relativeScreenX).to.equal(x);
        expect(input.relativeScreenY).to.equal(y);
    });

    it('should have position information related to the browser viewport', () => {
        let x = null,
            y = null,
            clientX = 100,
            clientY = 100,
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

        expect(input.clientX).to.equal(clientX);
        expect(input.clientY).to.equal(clientY);
    });
    
    it('should have position information related to the page origin', () => {
        let x = null,
            y = null,
            clientX = 100,
            clientY = 100,
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
        // exactly how it is implemented,
        // maybe irrelevant test
        expect(input.pageX).to.equal(clientX + window.pageXOffset);
        expect(input.pageY).to.equal(clientY + window.pageYOffset);
    });
    
    it(`should have undefined browser and page position information,
            if no calibration object`, () => {
        let x = null,
            y = null,
            pointer = buildPointer({x, y}).finished(),
            calibration,
            input = inputObjectFromTuio({
                tuioComponent: pointer,
                calibration
            });
        expect(input.clientX).to.be.an('undefined');
        expect(input.clientY).to.be.an('undefined');
        expect(input.pageX).to.be.an('undefined');
        expect(input.pageY).to.be.an('undefined');
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
    
    it('should have the time information in the point path', () => {
        let startingTime = 300,
            timeAfterOneSecond = startingTime + 1000,
            movingPointer = buildPointer({time: startingTime})
                                .moveTo({time: timeAfterOneSecond})
                                .finished(),
            input = inputObjectFromTuio({
                tuioComponent: movingPointer
            }),
            path = input.path;
        
        expect(path[0].time).to.equal(startingTime);
        expect(path[1].time).to.equal(timeAfterOneSecond);
    });

});
