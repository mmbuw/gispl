import gispl from '../../source/gispl';
import $ from 'jquery';

describe('gispl', () => {
    
    let testGispl;
    
    beforeEach(() => {
        testGispl = gispl(document);
    });
    
    it('should construct without parameter', () => {
        expect(gispl()).to.be.an('object');
        expect(gispl().length).to.equal(0);
    });
    
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
    });
});