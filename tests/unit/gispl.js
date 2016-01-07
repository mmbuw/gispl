import gispl from '../../source/gispl';
import $ from 'jquery';
import {gestureException} from '../../source/gesture';

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
        }).to.throw(gestureException.EMPTY);
        
        expect(function() {
            gispl.addGesture({});
        }).to.throw(gestureException.EMPTY);
        
        
        let gestureWithoutName = $.extend({
                features: [
                    {type:"Count", constraints:[0,0], duration:[150,100], result:[] }
                ]
            }, baseGesture);
        expect(function() {
            gispl.addGesture(gestureWithoutName);
        }).to.throw(gestureException.NO_NAME);
        
        let gestureWithoutFeatures = $.extend({
            name: 'someGestureName'
        }, baseGesture);
        expect(function() {
            gispl.addGesture(gestureWithoutFeatures);
        }).to.throw(gestureException.NO_FEATURES);
        
        let gestureWithEmptyFeatures = $.extend({
            features: [],
        }, gestureWithoutFeatures);
        expect(function() {
            gispl.addGesture(gestureWithEmptyFeatures);
        }).to.throw(gestureException.NO_FEATURES);
        
        let gestureWithIncorrectFeaturesCollection = $.extend({
            features: {}
        }, gestureWithoutFeatures);
        expect(function() {
            gispl.addGesture(gestureWithIncorrectFeaturesCollection);
        }).to.throw(gestureException.NO_FEATURES);
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
        }).to.throw(gestureException.DUPLICATE);
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
    
});