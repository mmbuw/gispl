import {DollarRecognizer,
            Point} from '../../source/libs/dollar';

describe('dollar recognizer', () => {

    let $r = new DollarRecognizer();

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

        $r.AddGesture('rectangle', [
            new Point(0, 100),
            new Point(0, 0),
            new Point(100, 0),
            new Point(100, 100),
            new Point(0, 100)
        ]);

        let result = $r.Recognize(rectangleDrawnFromTopLeft, true);
        expect(result.Name).to.equal('rectangle');
    });

    it('should recognize triangle path', () => {

        let triangleDrawnFromTopToLeft = [];

        triangleDrawnFromTopToLeft.push(new Point(100, 100));
        triangleDrawnFromTopToLeft.push(new Point(0, 200));
        triangleDrawnFromTopToLeft.push(new Point(200, 200));
        triangleDrawnFromTopToLeft.push(new Point(90, 90));

        $r.AddGesture('triangle', [
            new Point(200, 200),
            new Point(100, 100),
            new Point(300, 100),
            new Point(200, 200)
        ]);

        let result = $r.Recognize(triangleDrawnFromTopToLeft, true);

        expect(result.Name).to.equal('triangle');
    });
});
