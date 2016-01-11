import $ from 'jquery';
import nodeSearch from '../../source/nodeSearch';
import screenCalibration from '../../source/screenCalibration';

describe('nodeSearch', () => {
    
    let findNodes,
        appendedTestElements = [],
        helper = {
            appendElement: function (options = {}) {
                let {
                    type = 'div',
                    parent = 'body',
                    width = 10,
                    height = 10,
                    marginLeft = 0,
                    marginTop = 0,
                    position = 'static',
                    left = 0,
                    top = 0
                } = options;
                
                let element = $(`<${type} style="
                            width: ${width}px;
                            height: ${height}px;
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
        findNodes = nodeSearch();
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
        let foundNodes = findNodes.fromPoint({x, y});
        
        expect(helper.tagName(foundNodes[0])).to.equal('html');
    });
    
    it('should return the element if it contains the point', () => {
        
        helper.appendElement({
            marginLeft: 10,
            marginTop: 10
        });
        let x = 15, y = 15;
        let foundNodes = findNodes.fromPoint({x, y});
        expect(helper.tagName(foundNodes[0])).to.equal('div');
    });
    
    it('should return all elements that contain the point, and can usually attach listeners to',
       () => {
        
        helper.appendElement({
            marginLeft: 10,
            marginTop: 10
        });
        let x = 10, y = 10;
        let foundNodes = findNodes.fromPoint({x, y});
        let expectedNodes = ['div', 'body', 'html', '#document'];
        
        helper.assertNodesExpectation(foundNodes, expectedNodes);
    });
    
    it('should treat right and bottom dom element boundary as point non inclusive', () => {
        
        let x = 20, y = 15;
        helper.appendElement({
            width: x,
            height: y
        });
        let foundNodes = findNodes.fromPoint({x, y});
        
        expect(foundNodes.length).to.equal(1);
        expect(helper.tagName(foundNodes[0])).to.equal('#document');        
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
        let foundNodes = findNodes.fromPoint({x, y});
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
        let foundNodes = findNodes.fromPoint({x, y});
        // body has height of parent element, should not be in
        let expectedNodes = ['div', '#document'];
        
        helper.assertNodesExpectation(foundNodes, expectedNodes);
    });
    
    it('should return nothing when not supplying coordinates to the find method', () => {
        
        let foundNodes = findNodes.fromPoint();
        expect(foundNodes.length).to.equal(0);
    });
    
    it('should return nothing when the screen is not calibrated', () => {
        
        let foundNodes = findNodes.fromPoint({screenX: 10, screenY: 10});
        expect(foundNodes.length).to.equal(0);
    });
    
    it('should find elements based on their screen size', () => {
        
        // a bit tricky
        // actual screen values depend on where the browser running the test is positioned
        // and how it looks like - address bar, tabs, etc. influence the browser height
        // so the test is possibly useless because the values are constructed
        // findNodes will use similar methods to construct its own results
        let clientX = 0, clientY = 0,
            // approximations - make actual element large, especially for height
            screenX = window.screenX, 
            screenY = window.screenY + window.outerHeight - window.innerHeight;
        
        let mockCalibration = screenCalibration().mouseEvent({
            clientX, clientY, screenX, screenY
        });
        let findNodes = nodeSearch({
            calibration: mockCalibration
        });
        let element = helper.appendElement({
            width: 100,
            height: 300
        });
        
        screenX = window.screenX + 50;
        screenY = window.screenY + 200;
        let foundNodes = findNodes.fromPoint({screenX, screenY});
        
        expect(foundNodes[0]).to.equal(element);
    });
    
});