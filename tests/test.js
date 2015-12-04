import value from "../source/main";

describe("project setup", () => {
     
    it("should use mocha with chai for testing and transpile es6 to es5",
        () => expect(value).to.equal(1));
});