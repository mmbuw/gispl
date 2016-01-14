import {DollarRecognizer,
            Point} from '../../source/libs/dollar';

describe('dollar recognizer', () => {

    it('should construct', () => {
        expect(new DollarRecognizer()).to.be.an('object');
    });

    it('should recognize rectangle path', () => {
        let rectangleDrawnFromTopLeft = [];

        rectangleDrawnFromTopLeft.push(new Point(50,50));
        rectangleDrawnFromTopLeft.push(new Point(50,55));
        rectangleDrawnFromTopLeft.push(new Point(50,60));
        rectangleDrawnFromTopLeft.push(new Point(55,60));
        rectangleDrawnFromTopLeft.push(new Point(60,60));
        rectangleDrawnFromTopLeft.push(new Point(65,60));
        rectangleDrawnFromTopLeft.push(new Point(70,60));
        rectangleDrawnFromTopLeft.push(new Point(70,55));
        rectangleDrawnFromTopLeft.push(new Point(70,50));
        rectangleDrawnFromTopLeft.push(new Point(65,50));
        rectangleDrawnFromTopLeft.push(new Point(60,50));
        rectangleDrawnFromTopLeft.push(new Point(55,50));

        let $r = new DollarRecognizer(),
            result = $r.Recognize(rectangleDrawnFromTopLeft, true);
        expect(result.Name).to.equal('rectangle');
    });
});
