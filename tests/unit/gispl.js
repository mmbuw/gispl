import gispl from '../../source/gispl';
import $ from 'jquery';

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
        expect(spy.callCount).to.equal(1);
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
        expect(gispl.gesture('someGestureName')).to.deep.equal(gesture);
    });
    
    it('should throw when adding gestures without required parameters', () => {
        let baseGesture = {
            flags: 'sticky',
            filters: 1,
        };
        
        expect(function() {
            gispl.addGesture();
        }).to.throw();
        
        expect(function() {
            gispl.addGesture({});
        }).to.throw();
        
        
        let gestureWithoutName = $.extend({
                features: [
                    {type:"Count", constraints:[0,0], duration:[150,100], result:[] }
                ]
            }, baseGesture);
        expect(function() {
            gispl.addGesture(gestureWithoutName);
        }).to.throw();
        
        let gestureWithoutFeatures = $.extend({
            name: 'someGestureName'
        }, baseGesture);
        expect(function() {
            gispl.addGesture(gestureWithoutFeatures);
        }).to.throw();
        
        let gestureWithEmptyFeatures = $.extend({
            features: [],
        }, gestureWithoutFeatures);
        expect(function() {
            gispl.addGesture(gestureWithEmptyFeatures);
        }).to.throw();
        
        let gestureWithIncorrectFeaturesCollection = $.extend({
            features: {}
        }, gestureWithoutFeatures);
        expect(function() {
            gispl.addGesture(gestureWithIncorrectFeaturesCollection);
        }).to.throw();
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
        }).to.throw();
    });
    
    it('should accept gestures as JSON', () => {
        let gesture = {
            name: 'someGestureName',
            features: [
                {type:"Count", constraints:[0,0], duration:[150,100], result:[] }
            ]
        };
        gispl.addGesture(JSON.stringify(gesture));
        
        expect(gispl.gesture('someGestureName')).to.deep.equal(gesture);
    });
    
    it('should have access to one TuioClient');
    it('should listen to TUIO refresh events');
    
    describe('selecting elements to trigger events on', () => {
    
        it('should accept a DOM element as parameter and make it accesible over indices', () => {
            expect(testGispl[0]).to.equal(document);
        });

        it('should return an array like object containing the element', () => {
            expect(testGispl.length).to.equal(1);
        });

        it('should accept additional elements to the object', () => {
            let additionalElements = ['div', 'span', 'ul']
                                        .map(tag => document.createElement(tag));

            additionalElements.forEach((element, index) => {
                testGispl.add(element);
                expect(testGispl[index+1]).to.equal(element);
            });

            expect(testGispl.length).to.equal(4);
        });

        it('should do nothing when adding no additional elements', () => {

            testGispl.add();
            expect(testGispl.length).to.equal(1);
        });

        it('should accept an iterable collection of elements', () => {
            let elements = ['div', 'div'].map(tag => document.createElement(tag));
            expect(elements.length).to.equal(2);

            let testGispl = gispl(elements);
            expect(testGispl.length).to.equal(2);
        });

        it('should accept an iterable collection as additional elements', () => {
            let additionalElements = ['div', 'div'].map(tag => document.createElement(tag));

            testGispl.add(additionalElements);
            expect(testGispl[1]).to.equal(additionalElements[0]);
            expect(testGispl[2]).to.equal(additionalElements[1]);
            expect(testGispl.length).to.equal(3);

            let jqueryElements = $('<div></div><div></div>');

            testGispl.add(jqueryElements);
            expect(testGispl[3]).to.equal(jqueryElements[0]);
            expect(testGispl[4]).to.equal(jqueryElements[1]);
            expect(testGispl.length).to.equal(5);

            let nodeList = document.querySelectorAll('body');

            testGispl.add(nodeList);
            expect(testGispl[5]).to.equal(nodeList[0]);
            expect(testGispl.length).to.equal(6);
        });

        it('should accept a string to be used with queryselectorall', () => {
            let elements = $('<div class="first"></div><div class="second"></div>')
                                    .appendTo('body');

            testGispl = gispl('div.second');
            expect(testGispl[0]).to.equal(elements[1]);
            expect(testGispl.length).to.equal(1);

            testGispl = gispl('div');
            expect(testGispl[0]).to.equal(elements[0]);
            expect(testGispl[1]).to.equal(elements[1]);
            expect(testGispl.length).to.equal(2);

            elements.remove();
        });

        it('should accept a string for selecting additional elements', () => {
            let elements = $(`<div class="first"
                                ></div><div class="second"
                                ></div><span class="third"></span>`).appendTo('body');

            testGispl.add('div');
            expect(testGispl[1]).to.equal(elements[0]);
            expect(testGispl[2]).to.equal(elements[1]);
            expect(testGispl.length).to.equal(3);

            testGispl.add('.third');
            expect(testGispl[3]).to.equal(elements[2]);
            expect(testGispl.length).to.equal(4);

            elements.remove();
        });

        it('should return length 0 when no elements found', () => {
            testGispl = gispl();
            expect(testGispl.length).to.equal(0);
            testGispl.add('div');
            expect(testGispl.length).to.equal(0);
        });
        
        it('should not accept duplicate values for selection elements', () => {
            
            testGispl.add(document);
            testGispl.add(document);
            expect(testGispl.length).to.equal(1);
        });
    });
});