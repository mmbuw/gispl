import tuioInput from '../../source/tuioInput';
import gispl from '../../source/gispl';
import {WebMocket, MocketServer} from 'webmocket';
import TuioClient from 'tuio/src/TuioClient';
import {sendPointerBundle} from '../helpers/osc';

describe('tuioInput', () => {
    
    let server,
        tuio,
        tuioSpy,
        input,
        connectionUrl = 'test-url';
    
    beforeEach(() => {
        window.WebSocket = WebMocket;
        server = new MocketServer(connectionUrl);
        
        let host = connectionUrl;        
        tuio = new TuioClient({host});
        tuioSpy = sinon.spy(tuio, 'getTuioPointers');
        input = tuioInput({tuio});
    });
    
    afterEach(() => {
        server.close();
        tuioSpy.reset();
    });
    
    it('should be able to emit gispl events on dom nodes and pass data', () => {
        let spy = sinon.spy(),
            gestureName = 'gesture';
        
        gispl(document).on(gestureName, spy);
        
        let gestureData = {data: 1};
        input.emit(document, gestureName);
        expect(spy.callCount).to.equal(1);
        
        input.emit(document, gestureName, gestureData, gestureData);
        expect(spy.callCount).to.equal(2);
        expect(spy.lastCall.args.length).to.equal(2);
        expect(spy.lastCall.args[0]).to.deep.equal(gestureData);
        expect(spy.lastCall.args[1]).to.deep.equal(gestureData);
    });
    
    it('should check for tuio pointers when pointers received', (asyncDone) => {
        
        let sessionId = 10,
            frameId = 1,
            alive = [sessionId],
            tuioPointer = {
                sessionId, alive, frameId
            };
        
        setTimeout(() => {
            sendPointerBundle(server, tuioPointer);
            expect(tuioSpy.callCount).to.equal(1);
            let pointers = tuioSpy.returnValues[0];
            expect(pointers[0].getSessionId()).to.equal(sessionId);
            asyncDone();
        }, 0);        
    });

});