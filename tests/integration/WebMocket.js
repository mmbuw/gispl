import {WebMocket, MocketServer} from 'webmocket';

describe('Integration: WebMocket', () => {

    var realWebSocket,
        serverInstance,
        clientInstance;

    
    beforeEach(() => {
        var connectionUrl = "test-url";
        // replace WebSocket constructor for each test
        realWebSocket = WebSocket;
        window.WebSocket = WebMocket;
        // setup
        serverInstance = new MocketServer(connectionUrl);
        clientInstance = new WebSocket(connectionUrl); 
    });
    
    afterEach(() => {
        //
        WebSocket = realWebSocket;
        // shutdown server
        serverInstance.close();
    });

    it("MockWebSocket and MockServer available in tests", () => {

        expect(WebMocket).to.be.a('function');
        expect(MocketServer).to.be.a('function');
    });

    it("Mocked WebSocket replaces WebSocket constructor", () => {
        
        expect(WebMocket).to.equal(WebSocket);
    });

    it("Mocked WebSocket has open readyState", asyncDone => {
        setTimeout(() => {
            expect(clientInstance.readyState, realWebSocket.OPEN, "mocked WebSocket connection not open" );
            asyncDone();
        }, 0);
    });

    it("Mocked WebSocket can receive messages from MockServer", () => {

        clientInstance.onmessage = function(event) {
            expect(event.data).to.equal(1);
        };

        serverInstance.send(1);
    });

    it("Mocked WebSocket can receive ArrayBuffer data", () => {

        var binaryDataBuffer = new ArrayBuffer(1),
            binaryDataArray = new Uint8Array(binaryDataBuffer);

        clientInstance.onmessage = function(event) {
            var data = new Uint8Array(event.data);
            expect(data[0]).to.equal(1);
        };

        binaryDataArray[0] = 1;
        serverInstance.send(binaryDataBuffer);
    });
});