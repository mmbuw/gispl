import tuioInput from '../../source/tuioInput';
import gispl from '../../source/gispl';
import screenCalibration from '../../source/screenCalibration';
import nodeSearch from '../../source/nodeSearch';
import {WebMocket, MocketServer} from 'webmocket';
import TuioClient from 'tuio/src/TuioClient';
import {sendPointerBundle} from '../helpers/osc';

describe('tuioInput', () => {
    
    let server,
        tuioClient,
        tuioSpy,
        connectionUrl = 'test-url',
        calibration,
        calibrationStub,
        findNodes;
    
    beforeEach(() => {
        window.WebSocket = WebMocket;
        server = new MocketServer(connectionUrl);
        
        let host = connectionUrl;        
        tuioClient = new TuioClient({host});
        
        calibration = screenCalibration();
        calibrationStub = sinon.stub(calibration, 'screenToViewportCoordinates')
                            .returns({x: 0, y: 0});
        findNodes = nodeSearch({calibration});
    });
    
    afterEach(() => {
        server.close();
        calibrationStub.restore();
    });
    
    it('should check for tuio pointers when pointers received', (asyncDone) => {
        
        let sessionId = 10,
            tuioPointer = {
                sessionId
            },
            tuioSpy = sinon.spy(tuioClient, 'getTuioPointers');
        
        tuioInput({tuioClient, findNodes});
        
        setTimeout(() => {
            sendPointerBundle(server, tuioPointer);
            expect(tuioSpy.callCount).to.equal(1);
            
            let pointers = tuioSpy.returnValues[0];
            expect(pointers[0].getSessionId()).to.equal(sessionId);
            
            tuioSpy.restore();
            asyncDone();
        }, 0);
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
        let sessionId = 10,
            tuioPointer = {
                sessionId
            },
            spy = sinon.spy(),
            input = tuioInput({tuioClient, findNodes});
        
        input.listen(spy);
        
        setTimeout(() => {
            sendPointerBundle(server, tuioPointer);
            expect(spy.callCount).to.equal(1);
            asyncDone();
        });
    });
    
    it('should notify listeners with the node and points information', (asyncDone) => {
        let sessionId = 10,
            tuioPointer = {
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
            expect(regions.get(document)[0].getSessionId()).to.equal(sessionId);
            asyncDone();
        });
    });

});