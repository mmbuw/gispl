import tuioInput from '../../../source/tuio/tuioInput';
import gispl from '../../../source/gispl';
import screenCalibration from '../../../source/tuio/screenCalibration';
import nodeSearch from '../../../source/tuio/nodeSearch';
import {WebMocket, MocketServer} from 'webmocket';
import TuioClient from 'tuio/src/TuioClient';
import {sendPointerBundle} from '../../helpers/osc';

describe('tuioInput', () => {

    let server,
        tuioClient,
        tuioSpy,
        connectionUrl = 'test-url',
        calibration,
        coordinatesStub,
        screenUsableStub,
        findNodes,
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
        findNodes = nodeSearch({calibration});
    });

    afterEach(() => {
        server.close();
        coordinatesStub.restore();
        screenUsableStub.restore();
    });

    it('should allow callbacks to be registered and notified', () => {
        let input = tuioInput({tuioClient, findNodes}),
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
        let input = tuioInput({tuioClient, findNodes});

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
            input = tuioInput({tuioClient, findNodes});

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
            input = tuioInput({tuioClient, findNodes});

        input.listen(spy);

        setTimeout(() => {
            sendPointerBundle(server, tuioPointer);
            let regions = spy.getCall(0).args[0];
            //document is the only node found
            //check calibration stub, retunrns 0, 0
            expect(regions.size).to.equal(1);
            expect(regions.has(document)).to.equal(true);
            //only one input object ->  tuioPointer
            expect(regions.get(document).length).to.equal(1);
            expect(regions.get(document)[0].identifier).to.equal(sessionId);
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
            input = tuioInput({tuioClient, findNodes});

        input.listen(spy);

        setTimeout(() => {
            sendPointerBundle(server, tuioPointer1, tuioPointer2);
            let regions = spy.getCall(0).args[0];
            expect(regions.get(document).length).to.equal(2);
            expect(regions.get(document)[0].identifier).to.equal(sessionId);
            expect(regions.get(document)[1].identifier).to.equal(sessionId2);
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
        coordinatesStub.onCall(0).returns({x:0, y:0});

        let element = $(`<div style="
                            width: 10px;
                            height: 10px;
                            margin-left: 95px;"></div>`).appendTo('body')[0];
        //ensure second search finds the appended element
        coordinatesStub.onCall(1).returns({x:100, y:0});

        let input = tuioInput({tuioClient, findNodes});
        input.listen(spy);

        setTimeout(() => {
            sendPointerBundle(server, tuioPointer1, tuioPointer2);
            let regions = spy.getCall(0).args[0];
            //document contains both pointers
            expect(regions.get(document).length).to.equal(2);
            //element only one
            expect(regions.get(element).length).to.equal(1);
            expect(regions.get(element)[0].identifier).to.equal(sessionId2);
            asyncDone();
        });
    });

    it('should allow a listener to be removed', (asyncDone) => {
        let spy = sinon.spy(),
            examplePointer = {},
            input = tuioInput({tuioClient, findNodes});

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

        let input = tuioInput({tuioClient, findNodes});

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

        let input = tuioInput({tuioClient, findNodes});

        input.listen(spy);
        input.disable();
        input.enable();

        setTimeout(() => {
            sendPointerBundle(server, examplePointer);
            expect(spy.callCount).to.equal(1);
            asyncDone();
        });
    });

});
