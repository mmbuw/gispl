import $ from 'jquery';
import elementSelector from '../../source/elementSelector';

describe('ElementSelector', () => {
    
    let selector,
        appendedTestElements = [],
        helper = {
            appendElement: function (options = {}) {
                let {
                    type = 'div',
                    parent = 'body',
                    marginLeft = 0,
                    marginTop = 0,
                    position = 'static',
                    left = 0,
                    top = 0
                } = options;
                
                let element = $(`<${type} style="
                            width: 10px;
                            height: 10px;
                            margin-left: ${marginLeft}px;
                            margin-top: ${marginTop}px;
                            position: ${position};
                            left: ${left}px;
                            top: ${top}px;"></${type}>`).appendTo(parent);
        
                appendedTestElements.push(element);
                
                return element[0];
            },
            assertNodesExpectation: function (foundNodes, expectedNodes) {
                expect(foundNodes.length).to.equal(expectedNodes.length);
                expectedNodes.forEach((expectedNode, index) => {
                    let nodeName = this.tagName(foundNodes[index]);
                    expect(nodeName).to.equal(expectedNode);
                });
            },
            tagName: function (node) {
                return node.nodeName.toLowerCase();
            }
        };
    
    beforeEach(function() {
        selector = elementSelector();
        $('body').css({
            padding: 0,
            margin: 0
        });
    });
    
    afterEach(function() {
        appendedTestElements.forEach(function(element) {
            element.remove();
        });
        appendedTestElements = [];
    });
    
    it('should return at least the root if no other elements contain the point', () => {
        
        helper.appendElement({
            marginLeft: 10,
            marginTop: 10
        });
        let x = 0, y = 0;
        let foundNodes = selector.find({x, y});
        
        expect(helper.tagName(foundNodes[0])).to.equal('html');
    });
    
    it('should return the element if it contains the point', () => {
        
        helper.appendElement({
            marginLeft: 10,
            marginTop: 10
        });
        let x = 15, y = 15;
        let foundNodes = selector.find({x, y});
        expect(helper.tagName(foundNodes[0])).to.equal('div');
    });
    
    it('should return all elements that contain the point, and can usually attach listeners to',
       () => {
        
        helper.appendElement({
            marginLeft: 10,
            marginTop: 10
        });
        let x = 10, y = 10;
        let foundNodes = selector.find({x, y});
        let expectedNodes = ['div', 'body', 'html', '#document'];
        
        helper.assertNodesExpectation(foundNodes, expectedNodes);
    });
    
    it('should ignore elements that are overlapped by other elements', () => {
        
        helper.appendElement();
        //overlap another one over it
        let element2 = helper.appendElement({
            position: 'absolute',
            left: 10,
            top: 10
        });
        let x = 15, y = 15;
        let foundNodes = selector.find({x, y});
        expect(foundNodes[0]).to.equal(element2);
    });
    
    it('should ignore parent elements that do not actually contain the point', () => {
        
        let parent = helper.appendElement();
        helper.appendElement({
                parent: parent,
                position: 'absolute',
                left: 100,
                top: 100
            });
        let x = 105, y = 105;
        let foundNodes = selector.find({x, y});
        // body has height of parent element, should not be in
        let expectedNodes = ['div', '#document'];
        
        helper.assertNodesExpectation(foundNodes, expectedNodes);
    });
    
    it('should return nothing when not supplying coordinates to the find method', () => {
        
        let foundNodes = selector.find();
        expect(foundNodes.length).to.equal(0);
    });
    
});