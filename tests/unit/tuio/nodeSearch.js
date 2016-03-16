import $ from 'jquery';
import nodeSearch from '../../../source/tuio/nodeSearch';
import screenCalibration from '../../../source/tuio/screenCalibration';

describe('nodeSearch', () => {

    let findNode,
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
            assertNodesExpectation: function (foundNode, expectedNodes) {
                expect(foundNode.length).to.equal(expectedNodes.length);
                expectedNodes.forEach((expectedNode, index) => {
                    let nodeName = this.tagName(foundNode[index]);
                    expect(nodeName).to.equal(expectedNode);
                });
            },
            tagName: function (node) {
                return node.nodeName.toLowerCase();
            }
        };

    beforeEach(function() {
        findNode = nodeSearch();
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
        let clientX = 0, clientY = 0;
        let foundNode = findNode.fromPoint({clientX, clientY});

        expect(helper.tagName(foundNode)).to.equal('html');
    });

    it('should return the element if it contains the point', () => {

        helper.appendElement({
            marginLeft: 10,
            marginTop: 10
        });
        let clientX = 15, clientY = 15;
        let foundNode = findNode.fromPoint({clientX, clientY});
        expect(helper.tagName(foundNode)).to.equal('div');
    });

    it('should treat right and bottom dom element boundary as point non inclusive', () => {

        let clientX = 20, clientY = 15;
        let element = helper.appendElement({
            width: clientX,
            height: clientY
        });
        let foundNode = findNode.fromPoint({clientX, clientY});

        expect(foundNode).to.not.equal(element);
    });

    it('should ignore elements that are overlapped by other elements', () => {

        helper.appendElement();
        //overlap another one over it
        let element2 = helper.appendElement({
            position: 'absolute',
            left: 10,
            top: 10
        });
        let clientX = 15, clientY = 15;
        let foundNode = findNode.fromPoint({clientX, clientY});
        expect(foundNode).to.equal(element2);
    });

    it('should return nothing when not supplying coordinates to the find method', () => {

        let foundNode = findNode.fromPoint();
        expect(foundNode).to.equal(null);
    });

    it('should return nothing when the screen is not calibrated', () => {
        let findNode = nodeSearch({
            calibration: {
                isScreenUsable: () => false
            }
        });
        let foundNode = findNode.fromPoint({screenX: 10, screenY: 10});
        expect(foundNode).to.equal(null);
    });

    it('should find elements based on their screen size', () => {

        // a bit tricky
        // actual screen values depend on where the browser running the test is positioned
        // and how it looks like - address bar, tabs, etc. influence the browser height
        // so the test is possibly useless because the values are constructed
        // findNode will use similar methods to construct its own results
        let clientX = 0, clientY = 0,
            // approximations - make actual element large, especially for height
            screenX = window.screenX,
            screenY = window.screenY + window.outerHeight - window.innerHeight;

        let mockCalibration = screenCalibration().mouseEvent({
            clientX, clientY, screenX, screenY
        });
        let findNode = nodeSearch({
            calibration: mockCalibration
        });
        let element = helper.appendElement({
            width: 100,
            height: 300
        });

        screenX = window.screenX + 50;
        screenY = window.screenY + 200;
        let foundNode = findNode.fromPoint({screenX, screenY});

        expect(foundNode).to.equal(element);
    });
});
