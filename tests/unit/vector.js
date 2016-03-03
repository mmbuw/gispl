import {vector,
            vectorException} from '../../source/vector';

describe('vector', () => {

    it('should initialize x and y coordinates to 0 0 if not specified', () => {
        let nullVector = vector();
        expect(nullVector.x).to.equal(0);
        expect(nullVector.y).to.equal(0);

        let vectorWithX = vector({x: 1});
        expect(vectorWithX.x).to.equal(1);
        expect(vectorWithX.y).to.equal(0);

        let vectorWithY = vector({y: 1});
        expect(vectorWithY.x).to.equal(0);
        expect(vectorWithY.y).to.equal(1);
    });

    it('should initialize x and y coordinates to the specified values', () => {
        let x = 1,
            y = 2,
            someVector = vector({x, y});

        expect(someVector.x).to.equal(1);
        expect(someVector.y).to.equal(2);
    });

    it('should not allow coordinates to be modified from the outside', () => {
        let x = 2,
            y = 1,
            someVector = vector({x, y});

        expect(function() {
            someVector.x += 1;
        }).to.throw();
        expect(function() {
            someVector.y += 1;
        }).to.throw();
    });

    it('should throw when constructing from incorrect coordinates', () => {

        expect(function() {
            vector({x: '1'})
        }).to.throw(Error, new RegExp(vectorException.ILLEGAL_COORDINATES));

        expect(function() {
            vector({y: '1'})
        }).to.throw(Error, new RegExp(vectorException.ILLEGAL_COORDINATES));
    })

    it('should support vector addition', () => {
        let x = 10,
            y = 20,
            someVector = vector(); //0, 0

        someVector.add({x, y});
        expect(someVector.x).to.equal(10);
        expect(someVector.y).to.equal(20);
    });

    it('should throw when trying to add a non-vector', () => {
        let nullVector = vector();

        expect(function() {
            nullVector.add();
        }).to.throw(Error, new RegExp(vectorException.ILLEGAL_ADD));

        expect(function() {
            nullVector.add({});
        }).to.throw();

        expect(function() {
            nullVector.add({x: 1});
        }).to.throw();

        expect(function() {
            nullVector.add({y: 1});
        }).to.throw();

        expect(function() {
            nullVector.add({x: '1', y: 1});
        }).to.throw();

        expect(function() {
            nullVector.add({x: 1, y: '1'});
        }).to.throw();
    });

    it('should support multiplication with a scalar value', () => {
        let multiplyTwo = 2,
            divideTwo = 1/multiplyTwo,
            x = 5,
            y = 5,
            someVector = vector({x, y});

        someVector.scaleWith(multiplyTwo)
        expect(someVector.x).to.equal(x*multiplyTwo);
        expect(someVector.y).to.equal(y*multiplyTwo);

        someVector.scaleWith(divideTwo);
        expect(someVector.x).to.equal(x);
        expect(someVector.y).to.equal(y);
    });
    
    it('should support scaling individual components', () => {
        let multiplyThree = 3,
            x = 5,
            y = 5,
            someVector = vector({x, y});

        someVector.scaleX(multiplyThree)
        expect(someVector.x).to.equal(x*multiplyThree);

        someVector.scaleY(multiplyThree)
        expect(someVector.y).to.equal(y*multiplyThree);
    });

    it('should throw when trying to multiply with a non-number as scalar', () => {
        let nullVector = vector();

        expect(function() {
            nullVector.scaleWith();
        }).to.throw(Error, new RegExp(vectorException.ILLEGAL_SCALAR));

        expect(function() {
            nullVector.scaleWith('1');
        }).to.throw(Error, new RegExp(vectorException.ILLEGAL_SCALAR));
    });

    it('should support vector length calculation', () => {
        let nullVector = vector();
        expect(nullVector.length()).to.equal(0);

        let unitVector = vector({x: 1, y: 0});
        expect(unitVector.length()).to.equal(1);

        let vectorOfLength5 = vector({x: 3, y: 4});
        expect(vectorOfLength5.length()).to.equal(5);
    });
    
    it('should support dot product', () => {
        let first = vector({x: 1, y: 1}),
            second = vector({x: 10, y: 10}),
            expectedValue = 20;
        
        expect(first.dot(second)).to.equal(expectedValue);
        expect(second.dot(first)).to.equal(expectedValue);
        
        expect(function () {
            let invalidVector = {};
            first.dot(invalidVector);
        }).to.throw(Error, new RegExp(vectorException.INVALID_VECTOR));
    });
});
