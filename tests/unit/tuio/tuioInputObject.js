import {inputObjectFromTuio,
            inputType,
            tuioObjectUpdate} from '../../../source/tuio/tuioInputObject';
import {buildPointer} from '../../helpers/pointer';
import TuioPointer from 'tuio/src/TuioPointer';
import TuioCursor from 'tuio/src/TuioCursor';
import TuioToken from 'tuio/src/TuioToken';
import TuioObject from 'tuio/src/TuioObject';

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

        let movingPointer = buildPointer({x: 0, y: 0}),
            path = [
                {screenX: 0, screenY: 0}
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
                tuioComponent: movingPointer.finished(),
                calibration});

        expect(inputWithHistory.path.length).to.deep.equal(path.length);
        expect(inputWithHistory.path[0].screenX).to.equal(path[0].screenX);
        expect(inputWithHistory.path[0].screenY).to.equal(path[0].screenY);
        expect(inputWithHistory.path[0].clientX).to.equal(clientX);
        expect(inputWithHistory.path[0].clientY).to.equal(clientY);
                
        movingPointer.moveTo({x: 0.5, y: 0.5});
        path.push(
                {screenX: 0.5*window.screen.width, screenY: 0.5*window.screen.height}
        );
        tuioObjectUpdate({
            tuioComponent: movingPointer.finished(),
            inputObject: inputWithHistory,
            calibration
        });
        
        expect(inputWithHistory.path.length).to.equal(path.length);
        expect(inputWithHistory.path[1].screenX).to.equal(path[1].screenX);
        expect(inputWithHistory.path[1].screenY).to.equal(path[1].screenY);
        expect(inputWithHistory.path[1].clientX).to.equal(clientX);
        expect(inputWithHistory.path[1].clientY).to.equal(clientY);
    });
    
    it('should update the path when new points added', () => {
        
        let movingPointer = buildPointer({x: 0, y: 0}),
            inputObject = inputObjectFromTuio({
                tuioComponent: movingPointer.finished()
            });
        expect(inputObject.path.length).to.equal(1);
        
        let x = 0.1, y = 0.1;
        movingPointer.moveTo({x, y});
        tuioObjectUpdate({
            inputObject, tuioComponent: movingPointer.finished()
        });
        expect(inputObject.path.length).to.equal(2);
        expect(inputObject.path[1].relativeScreenX).to.equal(x);
        expect(inputObject.path[1].relativeScreenY).to.equal(y);
    });
    
    it('should update the path property with new points, not create new path', () => {
        
        let movingPointer = buildPointer({x: 0, y: 0}),
            inputObject = inputObjectFromTuio({
                tuioComponent: movingPointer.finished()
            });
        
        let firstPointInPath = inputObject.path[0];
        
        movingPointer.moveTo({x: 0.5, y: 0.4});
        tuioObjectUpdate({
            inputObject,
            tuioComponent: movingPointer.finished()
        });
        
        expect(firstPointInPath).to.equal(inputObject.path[0]);
    });
    
    it('should have the time information in the point path', () => {
        let startingTime = 300,
            timeAfterOneSecond = startingTime + 1000,
            movingPointer = buildPointer({time: startingTime}),
            inputObject = inputObjectFromTuio({
                tuioComponent: movingPointer.finished()
            }),
            path = inputObject.path;
        
        expect(path[0].tuioTime).to.equal(startingTime);
        
        movingPointer.moveTo({time: timeAfterOneSecond});
        tuioObjectUpdate({
            tuioComponent: movingPointer.finished(),
            inputObject
        })
        
        expect(path[1].tuioTime).to.equal(timeAfterOneSecond);
    });
    
    it('should have the starting time information', () => {
        let realTime = new Date().getTime(),
            tuioTime = 1000,
            clock = sinon.useFakeTimers(realTime),
            pointer = buildPointer({time: tuioTime}).finished(),
            input = inputObjectFromTuio({
                tuioComponent: pointer
            });
            
        expect(input.startingTime).to.equal(realTime);
        
        clock.restore();
    });
    
    it('should have the starting time information in the path', () => {
        let startingTime = new Date().getTime(),
            tuioTime = 1000,
            clock = sinon.useFakeTimers(startingTime),
            pointer = buildPointer({x: 0, y: 0, time: tuioTime}),
            inputObject = inputObjectFromTuio({
                tuioComponent: pointer.finished()
            });
            
        expect(inputObject.path[0].startingTime).to.equal(startingTime);
        
        let elapsedTime = 100;
        tuioTime += elapsedTime;
        pointer.moveTo({x: 0.5, y: 0.5, time: tuioTime});
        clock.tick(elapsedTime);
        
        tuioObjectUpdate({
            tuioComponent: pointer.finished(),
            inputObject
        });
        expect(inputObject.path[1].startingTime).to.equal(startingTime + elapsedTime);
        
        clock.restore();
    });
    
    it('should keep the correct starting time after update', () => {
        let startingTime = new Date().getTime(),
            tuioTime = 1000,
            clock = sinon.useFakeTimers(startingTime),
            pointer = buildPointer({x: 0, y: 0, time: tuioTime}),
            inputObject = inputObjectFromTuio({
                tuioComponent: pointer.finished()
            });
        
        expect(inputObject.startingTime).to.equal(startingTime);
        
        let elapsedTime = 100;
        tuioTime += elapsedTime;
        pointer.moveTo({x: 0.5, y: 0.5, time: tuioTime});
        clock.tick(elapsedTime);
        
        tuioObjectUpdate({
            tuioComponent: pointer.finished(),
            inputObject
        });
        
        expect(inputObject.startingTime).to.equal(startingTime);
        clock.restore();
    });
    
    it('should contain tuio component information', () => {
        let pointer = new TuioPointer(),
            objectFromPointer = inputObjectFromTuio({
                tuioComponent: pointer
            });
        expect(objectFromPointer.componentType).to.equal(inputType.POINTER);
        
        let cursor = new TuioCursor({}),
            objectFromCursor = inputObjectFromTuio({
                tuioComponent: cursor
            });
        expect(objectFromCursor.componentType).to.equal(inputType.CURSOR);
        
        let object = new TuioObject({}),
            objectFromObject = inputObjectFromTuio({
                tuioComponent: object
            });
        expect(objectFromObject.componentType).to.equal(inputType.OBJECT);
        
        let token = new TuioToken(),
            objectFromToken = inputObjectFromTuio({
                tuioComponent: token
            });
        expect(objectFromToken.componentType).to.equal(inputType.TOKEN);
    });
    
    it('should contain angle information if present', () => {
        let angle = Math.PI, 
            object = new TuioObject({a: angle});
        
        let inputObject = inputObjectFromTuio({tuioComponent: object});
        expect(inputObject.angle).to.equal(angle);
        
        let cursor = new TuioCursor({});
        let inputObjectFromPointer = inputObjectFromTuio({tuioComponent: cursor});
        expect(inputObjectFromPointer.angle).to.be.an('undefined');
    });
    
    it('should contain angle information in path', () => {
        let angle = Math.PI, 
            object = new TuioObject({a: angle});
        
        let inputObject = inputObjectFromTuio({tuioComponent: object});
        
        object.update({a: angle+1});
        tuioObjectUpdate({tuioComponent: object, inputObject});
        
        expect(inputObject.path.length).to.equal(2);
        expect(inputObject.path[0].angle).to.equal(angle);
        expect(inputObject.path[1].angle).to.equal(angle + 1);
    });
}); 
