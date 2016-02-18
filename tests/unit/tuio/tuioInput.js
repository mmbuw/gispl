import tuioInput, {tuioObjectStore} from '../../../source/tuio/tuioInput';
import gispl from '../../../source/gispl';
import screenCalibration from '../../../source/tuio/screenCalibration';
import nodeSearch from '../../../source/tuio/nodeSearch';
import {WebMocket, MocketServer} from 'webmocket';
import TuioClient from 'tuio/src/TuioClient';
import {sendPointerBundle} from '../../helpers/osc';
import $ from 'jquery';
import {buildPointer} from '../../helpers/pointer'

describe('tuioInput', () => {

    let server,
        tuioClient,
        tuioSpy,
        connectionUrl = 'test-url',
        calibration,
        coordinatesStub,
        screenUsableStub,
        findNode,
        sessionId = 10,
        sessionId2 = 11;

    beforeEach(() => {
        window.WebSocket = WebMocket;
        server = new MocketServer(connectionUrl);

        let host = connectionUrl;
        tuioClient = new TuioClient({host});

        calibration = screenCalibration();
        coordinatesStub = sinon.stub(calibration, 'screenToViewportCoordinates')
                            .returns({x: 0, y: 0});
        screenUsableStub = sinon.stub(calibration, 'isScreenUsable')
                            .returns(true);
        findNode = nodeSearch({calibration});
        $('body').css({
            padding: 0,
            margin: 0
        });
    });

    afterEach(() => {
        server.close();
        coordinatesStub.restore();
        screenUsableStub.restore();
        // cleanup any attached nodes
        $('body').children().remove();
        expect($('body').children().length).to.equal(0);
    });

    it('should allow callbacks to be registered and notified', () => {
        let input = tuioInput({tuioClient, findNode}),
            spy = sinon.spy(),
            param = 1;

        input.listen(spy);

        input.notify();
        expect(spy.callCount).to.equal(1);

        input.notify(param);
        expect(spy.callCount).to.equal(2);
        expect(spy.lastCall.args[0]).to.equal(param);

        input.notify(param, param);
        expect(spy.callCount).to.equal(3);
        expect(spy.lastCall.args.length).to.equal(2);
        expect(spy.lastCall.args[0]).to.equal(param);
        expect(spy.lastCall.args[1]).to.equal(param);

        input.notify([param]);
        expect(spy.callCount).to.equal(4);
        expect(spy.lastCall.args[0]).to.deep.equal([param]);

        input.notify({param});
        expect(spy.callCount).to.equal(5);
        expect(spy.lastCall.args[0]).to.deep.equal({param});
    });

    it('should allow only functions to be registered as callbacks', () => {
        let input = tuioInput({tuioClient, findNode});

        expect(function() {
            input.listen();
        }).to.throw();

        expect(function() {
            input.listen({});
        }).to.throw();

        expect(function() {
            input.listen([]);
        }).to.throw();
    });

    it('should notify listeners when input received and nodes found', (asyncDone) => {
        let spy = sinon.spy(),
            examplePointer = {},
            input = tuioInput({tuioClient, findNode});

        input.listen(spy);

        setTimeout(() => {
            sendPointerBundle(server, examplePointer);
            expect(spy.callCount).to.equal(1);
            asyncDone();
        });
    });

    it('should notify listeners with the node and point information', (asyncDone) => {
        let tuioPointer = {
                sessionId
            },
            spy = sinon.spy(),
            input = tuioInput({tuioClient, findNode});

        input.listen(spy);

        setTimeout(() => {
            sendPointerBundle(server, tuioPointer);
            let regions = spy.getCall(0).args[0];
            //html root is the only node found
            //check calibration stub, returns 0, 0
            let htmlRoot = document.documentElement;
            expect(regions.has(htmlRoot)).to.equal(true);
            //only one input object ->  tuioPointer
            expect(regions.get(htmlRoot).length).to.equal(1);
            expect(regions.get(htmlRoot)[0].identifier).to.equal(sessionId);
            asyncDone();
        });
    });

    it('should notify listeners with the correct multiple point information', (asyncDone) => {
        let tuioPointer1 = {
                sessionId
            },
            tuioPointer2 = {
                sessionId: sessionId2
            },
            spy = sinon.spy(),
            input = tuioInput({tuioClient, findNode});

        input.listen(spy);

        setTimeout(() => {
            sendPointerBundle(server, tuioPointer1, tuioPointer2);
            let regions = spy.getCall(0).args[0];
            let htmlRoot = document.documentElement;
            expect(regions.get(htmlRoot).length).to.equal(2);
            expect(regions.get(htmlRoot)[0].identifier).to.equal(sessionId);
            expect(regions.get(htmlRoot)[1].identifier).to.equal(sessionId2);
            asyncDone();
        });
    });

    it(`should notify listeners with the correct multiple element,
            multiple point information`, (asyncDone) => {
        let tuioPointer1 = {
                sessionId
            },
            tuioPointer2 = {
                sessionId: sessionId2
            },
            spy = sinon.spy();

        coordinatesStub.restore();
        coordinatesStub = sinon.stub(calibration, 'screenToViewportCoordinates');

        let element1 = $(`<div style="
                            position: absolute; top: 0; left: 0;
                            width: 10px;
                            height: 10px;"></div>`).appendTo('body');
        //ensure first search finds element1
        coordinatesStub.onCall(0).returns({x:0, y:0});

        let element2 = $(`<div style="
                            width: 10px;
                            height: 10px;
                            margin-left: 95px;"></div>`).appendTo('body');
        //ensure second search finds element2
        coordinatesStub.onCall(1).returns({x:100, y:0});

        let input = tuioInput({tuioClient, findNode});
        input.listen(spy);

        setTimeout(() => {
            sendPointerBundle(server, tuioPointer1, tuioPointer2);
            let regions = spy.getCall(0).args[0];
            // element1 contains the first point
            expect(regions.has(element1[0])).to.equal(true);
            expect(regions.get(element1[0]).length).to.equal(1);
            expect(regions.get(element1[0])[0].identifier).to.equal(sessionId);
            // element2 the second
            expect(regions.has(element2[0])).to.equal(true);
            expect(regions.get(element2[0]).length).to.equal(1);
            expect(regions.get(element2[0])[0].identifier).to.equal(sessionId2);
            asyncDone();
        });
    });

    it('should allow a listener to be removed', (asyncDone) => {
        let spy = sinon.spy(),
            examplePointer = {},
            input = tuioInput({tuioClient, findNode});

        input.listen(spy);
        input.mute(spy);

        setTimeout(() => {
            sendPointerBundle(server, examplePointer);
            expect(spy.callCount).to.equal(0);
            asyncDone();
        });
    });

    it('should allow the input to be disabled', (asyncDone) => {
        let tuioRefreshSpy = sinon.spy(tuioClient, 'off'),
            examplePointer = {},
            spy = sinon.spy();

        let input = tuioInput({tuioClient, findNode});

        input.listen(spy);
        input.disable();

        expect(tuioRefreshSpy.callCount).to.equal(1);
        expect(tuioRefreshSpy.calledWith('refresh')).to.equal(true);
        expect(tuioRefreshSpy.getCall(0).args[1]).to.be.a('function');

        setTimeout(() => {
            sendPointerBundle(server, examplePointer);
            expect(spy.callCount).to.equal(0);
            asyncDone();
        });
    });

    it('should allow the input to be reenabled', (asyncDone) => {
        let spy = sinon.spy(),
            examplePointer = {};

        let input = tuioInput({tuioClient, findNode});

        input.listen(spy);
        input.disable();
        input.enable();

        setTimeout(() => {
            sendPointerBundle(server, examplePointer);
            expect(spy.callCount).to.equal(1);
            asyncDone();
        });
    });

    it('should not enable twice, e.g. if already enabled', () => {
        let spy = sinon.spy(tuioClient, 'on');

        let input = tuioInput({tuioClient, findNode});
        input.enable();

        expect(spy.callCount).to.equal(1);

        spy.restore();
    });

    it('should not disable twice, e.g. if already disabled', () => {
        let spy = sinon.spy(tuioClient, 'off');

        let input = tuioInput({tuioClient, findNode});
        input.disable();
        input.disable();

        expect(spy.callCount).to.equal(1);

        spy.restore();
    });
    
    it('should create and update the same tuio object, not create new ones', (asyncDone) => {
        let tuioPointer1 = {
                sessionId
            },
            spy = sinon.spy();

        let input = tuioInput({tuioClient, findNode});
        input.listen(spy);

        setTimeout(() => {
            sendPointerBundle(server, tuioPointer1);
            let regions = spy.getCall(0).args[0],
                pointers = regions.get(document.documentElement),
                pointerOnFirstUpdate = pointers[0];
                
            sendPointerBundle(server, tuioPointer1);
            regions = spy.getCall(1).args[0];
            pointers = regions.get(document.documentElement);
            
            let pointerOnSecondUpdate = pointers[0];
            
            expect(pointerOnFirstUpdate).to.equal(pointerOnSecondUpdate);
            asyncDone();
        });
    });
    
    it(`should not store more than the specified number of old tuio objects,
            removing the older ones once limit reached`, () => {
        let storedTuioInput = tuioObjectStore({storeLimit: 10}),
            sessionIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
            tuioComponents = sessionIds.map(sessionId => {
                return buildPointer({sessionId}).finished();
            });
        
        storedTuioInput.store({tuioComponents, calibration});
        expect(storedTuioInput.objects().length).to.equal(10);
        
        let moreTuioComponents = [buildPointer({sessionId: 11}).finished()];
        storedTuioInput.store({tuioComponents: moreTuioComponents, calibration});
        expect(storedTuioInput.objects().length).to.equal(10);
        expect(storedTuioInput.objects()[0].identifier).to.equal(sessionIds[1]);
    });

});
