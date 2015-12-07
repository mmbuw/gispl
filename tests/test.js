import TuioClient from "tuio/src/TuioClient";

describe("project setup", () => {    
    
    it("should have a TuioClient instance available", () => {
        let client = new TuioClient({
            host: "ws://localhost"
        });
        expect(client.getTuioPointers).to.be.a("function");
    })
});