import {vector} from '../../source/vector';

describe('vector', () => {
    
    let instance;
    
    beforeEach(() => {
        instance = vector();
    });

    it('should initialize x and y coordinates to 0 0 if not specified', () => {
        let nullVector = vector();
        expect(nullVector.x).to.equal(0);
        expect(nullVector.y).to.equal(0);

        let vectorWithX = vector(1);
        expect(vectorWithX.x).to.equal(1);
        expect(vectorWithX.y).to.equal(0);

        let vectorWithY = vector(undefined, 1);
        expect(vectorWithY.x).to.equal(0);
        expect(vectorWithY.y).to.equal(1);
    });

    it('should initialize x and y coordinates to the specified values', () => {
        let x = 1,
            y = 2,
            someVector = vector(x, y);

        expect(someVector.x).to.equal(1);
        expect(someVector.y).to.equal(2);
    });

    it('should throw when constructing from incorrect coordinates', () => {

        expect(function() {
            vector('1');
        }).to.throw(Error, new RegExp(instance.exceptions.ILLEGAL_COORDINATES));

        expect(function() {
            vector(1, '1');
        }).to.throw(Error, new RegExp(instance.exceptions.ILLEGAL_COORDINATES));
    });

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
        }).to.throw(Error, new RegExp(instance.exceptions.ILLEGAL_ADD));

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
            someVector = vector(x, y);

        someVector.scaleWith(multiplyTwo);
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
            someVector = vector(x, y);

        someVector.scaleX(multiplyThree);
        expect(someVector.x).to.equal(x*multiplyThree);

        someVector.scaleY(multiplyThree);
        expect(someVector.y).to.equal(y*multiplyThree);
    });

    it('should throw when trying to multiply with a non-number as scalar', () => {
        let nullVector = vector();

        expect(function() {
            nullVector.scaleWith();
        }).to.throw(Error, new RegExp(instance.exceptions.ILLEGAL_SCALAR));

        expect(function() {
            nullVector.scaleWith('1');
        }).to.throw(Error, new RegExp(instance.exceptions.ILLEGAL_SCALAR));
    });

    it('should support vector length calculation', () => {
        let nullVector = vector();
        expect(nullVector.length()).to.equal(0);

        let unitVector = vector(1, 0);
        expect(unitVector.length()).to.equal(1);

        let vectorOfLength5 = vector(3, 4);
        expect(vectorOfLength5.length()).to.equal(5);
    });
    
    it('should support dot product', () => {
        let first = vector(1, 1),
            second = vector(10, 10),
            expectedValue = 20;
        
        expect(first.dot(second)).to.equal(expectedValue);
        expect(second.dot(first)).to.equal(expectedValue);
        
        expect(function () {
            let invalidVector = {};
            first.dot(invalidVector);
        }).to.throw(Error, new RegExp(instance.exceptions.INVALID_VECTOR));
    });
    
    it('should be able to reset coordinates to 0, 0', () => {
        let someVector = vector(1, 1);
        someVector.setCoordinates();
        expect(someVector.x).to.equal(0);
        expect(someVector.y).to.equal(0);
    });
    
    it('should be able to set coordinates to any value', () => {
        let someVector = vector(2, 2);
        someVector.setCoordinates(1, 1);
        expect(someVector.x).to.equal(1);
        expect(someVector.y).to.equal(1);
    });
    
    it('should have a pool of 100 reusable vector objects', () => {
        let vectorCount = 101,
            vectors = [],
            x = 1, y = 1;
        
        for (let i = 0; i < vectorCount; i += 1) {
            if (i+1 === vectorCount) {
                x = 10, y = 10;
            }
            vectors.push(vector(x, y));
        }
        
        expect(vectors[0]).to.equal(vectors[100]);
        expect(vectors[100].x).to.equal(10);
        expect(vectors[100].y).to.equal(10);
    });
});
