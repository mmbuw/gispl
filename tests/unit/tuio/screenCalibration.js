import screenCalibration from "../../../source/tuio/screenCalibration";

describe('screenCalibration', () => {

    let calibration,
        clock,
        helper = {
            dispatchMouseOver: function(params) {
                document.dispatchEvent(new MouseEvent('mouseover', params));
            },
            dispatchAfterTime: function(callback, params, time) {

                clock.tick(time);
                callback.call(undefined, params);
            }
        };

    beforeEach(() => {
        clock = sinon.useFakeTimers();
        calibration = screenCalibration();
    });

    afterEach(() => {
        clock.restore();
    });

    it('should indicate the browser viewport position on the screen', () => {

        let event = new MouseEvent('mouseover', {
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
                new MouseEvent('mouseover'),
                {
                    clientX: 0,
                    clientY: 0,
                    screenX: 0,
                    screenY: 0
                },
            ];
        expect(eventsThatWillCauseException[0]).to.be.undefined;

        eventsThatWillCauseException.forEach((mouseEvent) => {
            //on construction
            expect(function() {
                screenCalibration({mouseEvent});
            }).to.throw();
            //on add
            expect(function() {
                calibration.mouseEvent(mouseEvent);
            }).to.throw();
        });

        eventsThatWillNotCauseException.forEach((mouseEvent) => {
            expect(function() {
                calibration.mouseEvent(mouseEvent);
            }).to.not.throw();
        });

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
            clientX = screenX - (event.screenX - event.clientX),
            clientY = screenY - (event.screenY - event.clientY);

        calibration.mouseEvent(event);
        expect(calibration.screenToBrowserCoordinates({screenX, screenY})).
                to.deep.equal({clientX, clientY});
    });

    it('should attach a mouseover event listener for document on creation to capture a mouse event', () => {
        let mouseEvent = new MouseEvent('mouseover', {
            clientX: 0, clientY: 0,
            screenX: 199, screenY: 199
        });

        document.dispatchEvent(mouseEvent);
        expect(calibration.viewportPosition()).to.deep.equal({top: 199, left: 199});
    });

    it('should immediately remove the mouseover listener once the mouse event is captured', () => {

        let params = {
            clientX: 0, clientY: 0,
            screenX: 199, screenY: 199
        };
        let mouseEvent = new MouseEvent('mouseover', params);

        document.dispatchEvent(mouseEvent);
        // dispatch a different mouseover
        // should be ignored
        params.screenY = 100;
        mouseEvent = new MouseEvent('mouseover', params);
        document.dispatchEvent(mouseEvent);

        expect(calibration.viewportPosition()).to.deep.equal({top: 199, left: 199});
    });

    it('should continuously use mouse events every two seconds (default) to recalibrate if needed', () => {

        let params = {
            screenX: 50,
            screenY: 50,
            clientX: 0,
            clientY: 0
        };

        helper.dispatchMouseOver(params);

        params.screenX = 100;
        params.screenY = 100;
        helper.dispatchAfterTime(helper.dispatchMouseOver, params, 2000);

        expect(calibration.viewportPosition()).to.deep.equal({
            top: 100,
            left: 100
        });

        params.screenX = 200;
        params.screenY = 200;
        helper.dispatchAfterTime(helper.dispatchMouseOver, params, 2000);

        expect(calibration.viewportPosition()).to.deep.equal({
            top: 200,
            left: 200
        });
    });

    it('should not attach multiple listeners every two seconds if previous was not cleared', () => {

        let addingEvent = sinon.spy(document, 'addEventListener'),
            pause = 2000,
            calibration = screenCalibration({pause}),
            params = {
                screenX: 50,
                screenY: 50,
                clientX: 0,
                clientY: 0
            };

        helper.dispatchAfterTime(helper.dispatchMouseOver, params, 2000);
        clock.tick(2000);

        expect(addingEvent.callCount).to.equal(1);

        addingEvent.restore();
    });

    it('should indicate if the screen has been calibrated', () => {

        expect(calibration.isScreenUsable()).to.equal(false);

        calibration.mouseEvent({
            screenX: 0, clientX: 0, screenY: 0, clientY: 0
        });
        expect(calibration.isScreenUsable()).to.equal(true);
    });
    
    // it('should ', () => {
        
    // });
});
