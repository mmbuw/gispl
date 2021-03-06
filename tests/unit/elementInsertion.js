import gispl from '../../source/gispl';
import $ from 'jquery';

describe('elementInsertion', () => {

    let testGispl;

    beforeEach(() => {
        testGispl = gispl(document);
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

    it('should not throw when passing null as element', () => {
       expect(function() {
           gispl(null);
       }).to.not.throw();
       expect(function() {
           gispl([null]);
       }).to.not.throw();
    });
});
