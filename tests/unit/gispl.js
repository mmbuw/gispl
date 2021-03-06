import gispl from '../../source/gispl';
import $ from 'jquery';
import {gestureException} from '../../source/gesture';
import {WebMocket, MocketServer} from 'webmocket';
import {sendPointerBundle} from '../helpers/osc';
import {getCalibrationMock} from '../helpers/calibration';
import {events} from '../../source/events';

describe('gispl', () => {

    let testGispl,
        calibration = getCalibrationMock();

    beforeEach(() => {
        testGispl = gispl(document);
        $('body').css({
            padding: 0,
            margin: 0
        });
    });

    afterEach(() => {
        gispl.clearGestures();
        events.clearGlobalEventsCache();
        // cleanup any appended nodes
        $('body').children().remove();
        expect($('body').children().length).to.equal(0);
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
        gispl(selectedElement).on('custom-event', spy);
        gispl(selectedElement).emit('custom-event');
        expect(spy.callCount).to.equal(1);
    });

    it('should bind the >this< value in the event callback to the current element', (asyncDone) => {
        let element = $('<div></div>').appendTo('body');
        gispl(element).on('custom-event', function() {
            expect(this).to.equal(element[0]);
            element.remove();
            asyncDone();
        });
        gispl(element).emit('custom-event');
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

    it('should recognize a simple motion gesture', (asyncDone) => {
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
                {type:'Motion'}
            ]
        });
        gispl(document).on(motionName, spy);
        window.WebSocket = WebMocket;
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
            asyncDone();
        }, 0);
    });

    it(`should pass the input state as argument in the gesture callback`, (asyncDone) => {
        let spy = sinon.spy(),
            motionName = 'motion',
            sessionId = 10,
            xPos = 0.2,
            yPos = 0.2,
            frameId = 1,
            host = 'test-socket-url';

        gispl.addGesture({
            name: motionName,
            features: [
                {type:'Motion'}
            ]
        });
        gispl(document).on(motionName, spy);
        window.WebSocket = WebMocket;
        gispl.initTuio({host, calibration});

        let server = new MocketServer(host);

        setTimeout(() => {
            sendPointerBundle(server, {sessionId, xPos, yPos});
            //move pointer
            xPos += 0.5;
            yPos += 0.5;
            frameId += 1;
            sendPointerBundle(server, {sessionId, xPos, yPos});
            let callbackArgs = spy.lastCall.args;
            expect(callbackArgs.length).to.equal(1);

            let eventObject = callbackArgs[0],
                {input} = eventObject;
            expect(input.length).to.equal(1);

            let pointer = input[0];
            expect(pointer.identifier).to.equal(sessionId);

            server.close();
            asyncDone();
        }, 0);
    });

    it(`should pass the feature values in the gesture callback`, (asyncDone) => {
        let spy = sinon.spy(),
            motionName = 'motion',
            sessionId = 10,
            xPos = 0.2,
            yPos = 0.2,
            host = 'test-socket-url';

        gispl.addGesture({
            name: motionName,
            features: [
                {type:'Motion'}
            ]
        });
        gispl(document).on(motionName, spy);
        window.WebSocket = WebMocket;
        gispl.initTuio({host, calibration});

        let server = new MocketServer(host);

        setTimeout(() => {
            sendPointerBundle(server, {sessionId, xPos, yPos});
            //move pointer
            xPos += 0.5;
            yPos += 0.5;
            sendPointerBundle(server, {sessionId, xPos, yPos});
            let callbackArgs = spy.lastCall.args;
            expect(callbackArgs.length).to.equal(1);

            let eventObject = callbackArgs[0],
                {featureValues} = eventObject;
            
            expect(featureValues).to.be.an('object');
            expect(featureValues.motion).to.be.an('object');

            server.close();
            asyncDone();
        }, 0);
    });

    it(`should pass the feature values in the gesture callback`, (asyncDone) => {
        let spy = sinon.spy(),
            motionName = 'motion',
            sessionId = 10,
            xPos = 0.2,
            yPos = 0.2,
            host = 'test-socket-url';

        gispl.addGesture({
            name: motionName,
            features: [
                {type:'Motion'}
            ]
        });
        gispl(document).on(motionName, spy);
        window.WebSocket = WebMocket;
        gispl.initTuio({host, calibration});

        let server = new MocketServer(host);

        setTimeout(() => {
            sendPointerBundle(server, {sessionId, xPos, yPos});
            //move pointer
            xPos += 0.5;
            yPos += 0.5;
            sendPointerBundle(server, {sessionId, xPos, yPos});
            let callbackArgs = spy.lastCall.args;
            expect(callbackArgs.length).to.equal(1);

            let eventObject = callbackArgs[0],
                {featureValues} = eventObject;
            
            expect(featureValues).to.be.an('object');
            expect(featureValues.motion).to.be.an('object');

            server.close();
            asyncDone();
        }, 0);
    });

    it(`should contain target and currentTarget information`, (asyncDone) => {
        let spy = sinon.spy(),
            motionName = 'motion',
            sessionId = 10,
            xPos = 0.2,
            yPos = 0.2,
            host = 'test-socket-url';

        gispl.addGesture({
            name: motionName,
            features: [
                {type:'Motion'}
            ]
        });
        gispl(document).on(motionName, spy);
        window.WebSocket = WebMocket;
        gispl.initTuio({host, calibration});

        let server = new MocketServer(host);

        setTimeout(() => {
            sendPointerBundle(server, {sessionId, xPos, yPos});
            //move pointer
            xPos += 0.5;
            yPos += 0.5;
            sendPointerBundle(server, {sessionId, xPos, yPos});
            let callbackArgs = spy.lastCall.args,
                eventObject = callbackArgs[0],
                {target,
                    currentTarget} = eventObject;
            
            // gesture triggered on html root
            expect(target.nodeName).to.equal(document.documentElement.nodeName);
            // but called on document node
            expect(currentTarget.nodeName).to.equal(document.nodeName);
            server.close();
            asyncDone();
        }, 0);
    });
    
    it('should contain correct target information for bubble gestures', (asyncDone) => {
        let documentSpy = sinon.spy(),
            bodySpy = sinon.spy(),
            motionName = 'motion',
            sessionId = 10,
            xPos = 0.2,
            yPos = 0.2,
            host = 'test-socket-url';

        gispl.addGesture({
            name: motionName,
            flags: 'bubble',
            features: [
                {type:'Motion'}
            ]
        });
        gispl(document).on(motionName, documentSpy);
        gispl(document.body).on(motionName, bodySpy);
        window.WebSocket = WebMocket;
        gispl.initTuio({host, calibration});

        let server = new MocketServer(host);

        setTimeout(() => {
            // will hit 'body'
            let bodyHtml$ = $('body, html');
            bodyHtml$.css({width: '100%', height: '100%'});
            sendPointerBundle(server, {sessionId, xPos, yPos});
            //move pointer
            xPos += 0.1;
            yPos += 0.1;
            sendPointerBundle(server, {sessionId, xPos, yPos});
            let callbackArgs = documentSpy.lastCall.args,
                eventObject = callbackArgs[0];
            expect(eventObject.target).to.equal(document.body);
            expect(eventObject.currentTarget).to.equal(document);
            //move pointer
            // will hit 'html'
            bodyHtml$.removeAttr('style');
            xPos += 0.1;
            yPos += 0.1;
            sendPointerBundle(server, {sessionId, xPos, yPos});
            // check body spy
            callbackArgs = bodySpy.lastCall.args;
            eventObject = callbackArgs[0];
            // target is now an array containing [body, html]
            // it's a bubble gesture
            expect(eventObject.target.length).to.equal(2);
            expect(eventObject.target[0]).to.equal(document.body);
            expect(eventObject.target[1]).to.equal(document.documentElement);
            // current target is not an array
            expect(eventObject.currentTarget.nodeName).to.equal(document.body.tagName); 
            
            server.close();
            asyncDone();
        }, 0);
    });
    
    it('should propagate to parents of bubble gesture targets only once', (asyncDone) => {
        let documentSpy = sinon.spy(),
            motionName = 'motion',
            sessionId = 10,
            xPos = 0.2,
            yPos = 0.2,
            host = 'test-socket-url';

        gispl.addGesture({
            name: motionName,
            flags: 'bubble',
            features: [
                {type:'Motion'}
            ]
        });
        gispl(document).on(motionName, documentSpy);
        window.WebSocket = WebMocket;
        gispl.initTuio({host, calibration});

        let server = new MocketServer(host);

        setTimeout(() => {
            // will hit 'body'
            let bodyHtml$ = $('body, html');
            bodyHtml$.css({width: '100%', height: '100%'});
            sendPointerBundle(server, {sessionId, xPos, yPos});
            //move pointer, validates calls spy
            xPos += 0.1;
            yPos += 0.1;
            sendPointerBundle(server, {sessionId, xPos, yPos});
            //move pointer, validates calls spy
            // will hit 'html'
            bodyHtml$.removeAttr('style');
            xPos += 0.1;
            yPos += 0.1;
            sendPointerBundle(server, {sessionId, xPos, yPos});
            
            expect(documentSpy.callCount).to.equal(2);
            
            server.close();
            asyncDone();
        }, 0);
    });

    it(`should allow a callback to prevent the gesture from bubbling to parents`, (asyncDone) => {
        let spy = sinon.spy(),
            motionName = 'motion',
            sessionId = 10,
            xPos = 0.2,
            yPos = 0.2,
            host = 'test-socket-url';

        gispl.addGesture({
            name: motionName,
            features: [
                {type:'Motion'}
            ]
        });
        // calling stopPropagation will prevent the event from bubbling
        // to document
        gispl(document.documentElement).on(motionName, function(event) {
            event.stopPropagation();
        });
        // spy should not be called
        gispl(document).on(motionName, spy);
        window.WebSocket = WebMocket;
        gispl.initTuio({host, calibration});

        let server = new MocketServer(host);

        setTimeout(() => {
            sendPointerBundle(server, {sessionId, xPos, yPos});
            //move pointer
            xPos += 0.5;
            yPos += 0.5;
            sendPointerBundle(server, {sessionId, xPos, yPos});
            
            expect(spy.callCount).to.equal(0);

            server.close();
            asyncDone();
        }, 0);
    });

    it(`should allow a callback on a parent to prevent the gesture from bubbling further`, (asyncDone) => {
        let spy = sinon.spy(),
            motionName = 'motion',
            sessionId = 10,
            xPos = 0.2,
            yPos = 0.2,
            host = 'test-socket-url';

        gispl.addGesture({
            name: motionName,
            features: [
                {type:'Motion'}
            ]
        });
        // ensure hitting body
        let body$ = $('body, html');
        body$.css({
            width: '100%',
            height: '100%'
        });
        // calling stopPropagation will prevent the event from bubbling
        // to document
        gispl(document.body).on(motionName, function(event) {
            event.stopPropagation();
        });
        // spy should not be called
        gispl(document).on(motionName, spy);
        window.WebSocket = WebMocket;
        gispl.initTuio({host, calibration});

        let server = new MocketServer(host);

        setTimeout(() => {
            sendPointerBundle(server, {sessionId, xPos, yPos});
            //move pointer
            xPos += 0.5;
            yPos += 0.5;
            sendPointerBundle(server, {sessionId, xPos, yPos});
            
            expect(spy.callCount).to.equal(0);
            
            body$.removeAttr('style');
            server.close();
            asyncDone();
        }, 0);
    });
        
    it(`should allow a callback to prevent all other callbacks from being executed`, (asyncDone) => {
        let spy = sinon.spy(),
            motionName = 'motion',
            sessionId = 10,
            xPos = 0.2,
            yPos = 0.2,
            host = 'test-socket-url';

        gispl.addGesture({
            name: motionName,
            features: [
                {type:'Motion'}
            ]
        });
        // ensure hitting body
        let body$ = $('body, html');
        body$.css({
            width: '100%',
            height: '100%'
        });
        // calling stopPropagation will prevent the event from bubbling
        // to document
        gispl(document.body).on(motionName, function(event) {
            event.stopImmediatePropagation();
        });
        // spy should not be called
        gispl(document.body).on(motionName, spy);
        window.WebSocket = WebMocket;
        gispl.initTuio({host, calibration});

        let server = new MocketServer(host);

        setTimeout(() => {
            sendPointerBundle(server, {sessionId, xPos, yPos});
            //move pointer
            xPos += 0.5;
            yPos += 0.5;
            sendPointerBundle(server, {sessionId, xPos, yPos});
            body$.removeAttr('style');
            
            expect(spy.callCount).to.equal(0);
            
            server.close();
            asyncDone();
        }, 0);
    });
        
    it(`should allow a callback to prevent all other callbacks from being executed,
        including parents`, (asyncDone) => {
        let spy = sinon.spy(),
            motionName = 'motion',
            sessionId = 10,
            xPos = 0.2,
            yPos = 0.2,
            host = 'test-socket-url';

        gispl.addGesture({
            name: motionName,
            features: [
                {type:'Motion'}
            ]
        });
        // ensure hitting body
        let body$ = $('body, html');
        body$.css({
            width: '100%',
            height: '100%'
        });
        // calling stopPropagation will prevent the event from bubbling
        // to document
        gispl(document.body).on(motionName, function(event) {
            event.stopImmediatePropagation();
        });
        // spy should not be called
        gispl(document).on(motionName, spy);
        window.WebSocket = WebMocket;
        gispl.initTuio({host, calibration});

        let server = new MocketServer(host);

        setTimeout(() => {
            sendPointerBundle(server, {sessionId, xPos, yPos});
            //move pointer
            xPos += 0.5;
            yPos += 0.5;
            sendPointerBundle(server, {sessionId, xPos, yPos});
            body$.removeAttr('style');
            
            expect(spy.callCount).to.equal(0);
            
            server.close();
            asyncDone();
        }, 0);
    });

    it('should return feature filter array as bitmask (helper method)', () => {
        expect(gispl.filterBitmask()).to.equal(0);
        expect(gispl.filterBitmask([1])).to.equal(0b1);
        expect(gispl.filterBitmask([1,1])).to.equal(0b1);
        expect(gispl.filterBitmask([1,2])).to.equal(0b11);
        expect(gispl.filterBitmask([1,2,3])).to.equal(0b111);
        expect(gispl.filterBitmask([4,1,2,3])).to.equal(0b1111);
        expect(gispl.filterBitmask([4])).to.equal(0b1000);
        expect(gispl.filterBitmask([5,13,11])).to.equal(0b1010000010000);
    });
    
    it('should support event method chaining', () => {
        let spy = sinon.spy(),
            event = 'event';
        
        gispl(document).on(event, spy).off(event, spy);
        
        gispl(document).trigger(event);
        
        expect(spy.callCount).to.equal(0);
    });
    
    it(`should contain a built in inputend event when
                all input ends`, (asyncDone) => {
        let spy = sinon.spy(),
            sessionId = 10,
            host = 'test-socket-url';
            
        gispl(document).on('inputend', spy);
        window.WebSocket = WebMocket;
        gispl.initTuio({host, calibration});
        let server = new MocketServer(host);

        setTimeout(() => {
            sendPointerBundle(server, {sessionId});
            expect(spy.callCount).to.equal(0);
            
            sendPointerBundle(server);
            expect(spy.callCount).to.equal(1);
            
            server.close();
            asyncDone();
        }, 0);
    });
    
    it(`should contain a built in inputstart event when
                input initially starts after no input`, (asyncDone) => {
        let spy = sinon.spy(),
            sessionId = 10,
            host = 'test-socket-url';
            
        gispl(document).on('inputstart', spy);
        window.WebSocket = WebMocket;
        gispl.initTuio({host, calibration});
        let server = new MocketServer(host);

        setTimeout(() => {
            sendPointerBundle(server);
            expect(spy.callCount).to.equal(0); // no input
            
            sendPointerBundle(server, {sessionId});
            expect(spy.callCount).to.equal(1);
            
            sessionId += 1;
            sendPointerBundle(server, {sessionId});
            expect(spy.callCount).to.equal(1); // different input does not count
            
            sendPointerBundle(server); // clear input
            
            server.close();
            asyncDone();
        }, 0);
    });
    
    it(`should contain a built in inputchange event when
            input changes, but not when it starts or ends`, (asyncDone) => {
        let spy = sinon.spy(),
            sessionId = 10,
            host = 'test-socket-url';
            
        gispl(document).on('inputchange', spy);
        window.WebSocket = WebMocket;
        gispl.initTuio({host, calibration});
        let server = new MocketServer(host);

        setTimeout(() => {
            sendPointerBundle(server, {sessionId});
            expect(spy.callCount).to.equal(0); // input start
            
            sessionId += 1;
            sendPointerBundle(server, {sessionId});
            expect(spy.callCount).to.equal(1); // changes
            
            sendPointerBundle(server, {sessionId});
            expect(spy.callCount).to.equal(1); // stays the same
            
            sendPointerBundle(server);
            expect(spy.callCount).to.equal(1); // ends
            
            server.close();
            asyncDone();
        }, 0);
    });
    
    it(`should trigger inputstart on the node where
            the first inputobject was placed`, (asyncDone) => {
        let spy = sinon.spy(),
            sessionId = 10,
            host = 'test-socket-url';
        
        // for now just test that it's working on other than document
        gispl(document.documentElement).on('inputstart', spy);
        gispl(document).on('inputstart', spy);
        
        window.WebSocket = WebMocket;
        gispl.initTuio({host, calibration});
        let server = new MocketServer(host);

        setTimeout(() => {
            
            sendPointerBundle(server, {sessionId});
            expect(spy.callCount).to.equal(2);
            
            server.close();
            asyncDone();
        }, 0);
    });
    
    it(`should trigger inputend on the node where
            the last inputobject was placed`, (asyncDone) => {
        let spy = sinon.spy(),
            sessionId = 10,
            host = 'test-socket-url';
        
        // for now just test that it's working on other than document
        gispl(document.documentElement).on('inputend', spy);
        gispl(document).on('inputend', spy);
        
        window.WebSocket = WebMocket;
        gispl.initTuio({host, calibration});
        let server = new MocketServer(host);

        setTimeout(() => {
            
            sendPointerBundle(server, {sessionId});            
            sendPointerBundle(server);
            
            expect(spy.callCount).to.equal(2);
            
            server.close();
            asyncDone();
        }, 0);
    });
});
