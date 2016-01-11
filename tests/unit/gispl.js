import gispl from '../../source/gispl';
import $ from 'jquery';
import {gestureException} from '../../source/gesture';
import tuioInput from '../../source/tuioInput';
import screenCalibration from '../../source/screenCalibration';
import nodeSearch from '../../source/nodeSearch';
import {WebMocket, MocketServer} from 'webmocket';
import {sendPointerBundle} from '../helpers/osc';

describe('gispl', () => {
    
    let testGispl;
    
    beforeEach(() => {
        testGispl = gispl(document);
    });
    
    afterEach(() => {
        gispl.clearGestures();
    });
    
    it('should construct without parameter', () => {
        expect(gispl()).to.be.an('object');
        expect(gispl().length).to.equal(0);
    });
    
    it('should have basic event on/off/emit capabilities on passed elements', () => {
        let spy = sinon.spy();
        testGispl.on('custom-event', spy);
        testGispl.emit('custom-event');
        testGispl.trigger('custom-event');
        expect(spy.callCount).to.equal(2);
    });
    
    it('should trigger events on selected dom elements', () => {
        let selectedElement = document,
            spy = sinon.spy();
        gispl(document).on('custom-event', spy);
        gispl(document).emit('custom-event');
        expect(spy.callCount).to.equal(1);
    });
    
    it('should accept gestures as javascript objects', () => {
        let gesture = {
            name: 'someGestureName',
            flags: 'sticky',
            filters: 1,
            features: [
                {type:"Count", constraints:[0,0], duration:[150,100], result:[] }
            ]
        };
        
        gispl.addGesture(gesture);
        expect(gispl.gesture('someGestureName').definition()).to.deep.equal(gesture);
    });
    
    it('should throw when adding gestures without required parameters', () => {
        let baseGesture = {
            flags: 'sticky',
            filters: 1,
        };
        
        expect(function() {
            gispl.addGesture();
        }).to.throw(Error, new RegExp(gestureException.EMPTY));
        
        expect(function() {
            gispl.addGesture({});
        }).to.throw(Error, new RegExp(gestureException.EMPTY));
        
        
        let gestureWithoutName = $.extend({
                features: [
                    {type:"Count", constraints:[0,0], duration:[150,100], result:[] }
                ]
            }, baseGesture);
        expect(function() {
            gispl.addGesture(gestureWithoutName);
        }).to.throw(Error, new RegExp(gestureException.NO_NAME));
        
        let gestureWithoutFeatures = $.extend({
            name: 'someGestureName'
        }, baseGesture);
        expect(function() {
            gispl.addGesture(gestureWithoutFeatures);
        }).to.throw(Error, new RegExp(gestureException.NO_FEATURES));
        
        let gestureWithEmptyFeatures = $.extend({
            features: [],
        }, gestureWithoutFeatures);
        expect(function() {
            gispl.addGesture(gestureWithEmptyFeatures);
        }).to.throw(Error, new RegExp(gestureException.NO_FEATURES));
        
        let gestureWithIncorrectFeaturesCollection = $.extend({
            features: {}
        }, gestureWithoutFeatures);
        expect(function() {
            gispl.addGesture(gestureWithIncorrectFeaturesCollection);
        }).to.throw(Error, new RegExp(gestureException.NO_FEATURES));
    });
    
    it('should throw when adding gestures with names that already exist', () => {
        let gesture = {
            name: 'someGestureName',
            features: [
                {type:"Count", constraints:[0,0], duration:[150,100], result:[] }
            ]
        };
        
        gispl.addGesture(gesture);
        expect(function() {
            gispl.addGesture(gesture);
        }).to.throw(Error, new RegExp(gestureException.DUPLICATE));
    });
    
    it('should accept gestures as JSON', () => {
        let gesture = {
            name: 'someGestureName',
            features: [
                {type:"Count", constraints:[0,0], duration:[150,100], result:[] }
            ]
        };
        gispl.addGesture(JSON.stringify(gesture));
        
        expect(gispl.gesture('someGestureName').definition()).to.deep.equal(gesture);
    });
    
    it('should recognize a simple motion gesture', (assyncDone) => {
        let spy = sinon.spy(),
            motionName = 'motion',
            sessionId = 10,
            xPos = 0,
            yPos = 0,
            frameId = 1,
            host = 'test-socket-url';
        
        gispl.addGesture({
            name: motionName,
            features: [
                {type:"Motion"}
            ]
        });
        gispl(document).on(motionName, spy);
        window.WebSocket = WebMocket;
        
        let calibration = {
            screenToViewportCoordinates: function() {
                return {
                    x: 0,
                    y: 0
                };
            },
            isScreenUsable: function() {
                return true;
            }
        };
        gispl.initTuio({host, calibration});
        
        let server = new MocketServer(host);
        
        setTimeout(() => {
            sendPointerBundle(server, {sessionId, xPos, yPos});
            expect(spy.callCount).to.equal(0);
            //move pointer
            xPos += 0.5;
            yPos += 0.5;
            frameId += 1;
            sendPointerBundle(server, {sessionId, xPos, yPos});
            
            expect(spy.callCount).to.equal(1);
            
            server.close();
            assyncDone();
        }, 0);
    });
});