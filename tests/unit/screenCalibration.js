import screenCalibration from "../../source/screenCalibration";

describe('screenCalibration', () => {
    
    let calibration;
    
    beforeEach(() => {
        calibration = screenCalibration();
    });
    
    it('should indicate the browser viewport position on the screen', () => {
        
        let event = new MouseEvent('mouseenter', {
                screenX: 150,
                screenY: 150,
                clientX: 10,
                clientY: 10
            });
        
        calibration.mouseEvent(event);
        let viewportPosition = calibration.viewportPosition();
        expect(viewportPosition.top).to.equal(140);
        expect(viewportPosition.left).to.equal(140);
    });
    
    it('should throw an error if passed a mouseevent without required parameters', () => {
        
        let eventsThatWillCauseException = [
                , //undefined
                {clientX: 100, clientY: 200, screenX: 100},
                {clientX: 100, clientY: 200, screenY: 100},
            ],
            eventsThatWillNotCauseException = [
                new MouseEvent('mouseenter'),
                {
                    clientX: 0,
                    clientY: 0,
                    screenX: 0,
                    screenY: 0
                },
            ];
        expect(eventsThatWillCauseException[0]).to.be.undefined;
        
        eventsThatWillCauseException.forEach((event) => {
            expect(function() {
                calibration.mouseEvent(event);
            }).to.throw(); 
        });
        
        eventsThatWillNotCauseException.forEach((event) => {
            expect(function() {
                calibration.mouseEvent(event);
            }).to.not.throw(); 
        });
        
        //TODO
        //on construction
    });
    
    it('should throw an error if trying to access viewport position without passing a mouse event', () => {
        
        expect(calibration.viewportPosition).to.throw();
    });
    
    it('should adapt passed screen point to a point in viewport coordinates', () => {
        
        let event = {
            screenX: 50,
            screenY: 50,
            clientX: 0,
            clientY: 0
        },
            screenX = 300,
            screenY = 400,
            // this is also exactly like it is implemented
            // possibly useless test
            x = screenX - (event.screenX - event.clientX),
            y = screenY - (event.screenY - event.clientY);
        
        calibration.mouseEvent(event);
        expect(calibration.screenToViewportCoordinates({screenX, screenY})).
                to.deep.equal({x, y});
    });
});