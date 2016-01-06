import tuioInput from '../../source/tuioInput';
import gispl from '../../source/gispl';
import {events} from '../../source/events';
import {WebMocket, MocketServer} from 'webmocket';
import TuioClient from 'tuio/src/TuioClient';
import {sendPointerBundle} from '../helpers/osc';

describe('tuioInput', () => {
    
    let server,
        tuioClient,
        tuioSpy,
        eventSpy,
        input,
        connectionUrl = 'test-url';
    
    beforeEach(() => {
        window.WebSocket = WebMocket;
        server = new MocketServer(connectionUrl);
        
        let host = connectionUrl;        
        tuioClient = new TuioClient({host});
        tuioSpy = sinon.spy(tuioClient, 'getTuioPointers');
        eventSpy = sinon.spy(events, 'emit');
        input = tuioInput({tuioClient, events});
    });
    
    afterEach(() => {
        server.close();
        tuioSpy.restore();
        eventSpy.restore();
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