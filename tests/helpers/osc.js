import osc from 'osc/dist/osc-browser';

export function sendPointerBundle(server, ...pointers) {

    server.send(getFrameBuffer());

    let alive = [],
        defaultSessionId = 1;

    pointers.forEach(params => {
        let sessionId = params.sessionId || defaultSessionId,
            xPos = params.xPos,
            yPos = params.yPos,
            xSpeed = params.xSpeed,
            ySpeed = params.ySpeed,
            pressureSpeed = params.pressureSpeed,
            pressureAccel = params.pressureAccel,
            motionAccel = params.motionAccel;

        defaultSessionId = sessionId + 1;

        server.send(getPointerBuffer({
            sessionId: sessionId,
            xPos: xPos,
            yPos: yPos,
            xSpeed: xSpeed,
            ySpeed: ySpeed,
            pressureSpeed: pressureSpeed,
            motionAccel: motionAccel,
            pressureAccel: pressureAccel
        }));

        alive.push(sessionId);
    });
    
    if (alive.length !== 0) {
        server.send(getAliveBuffer(alive));        
    }
}

function getFrameBuffer(params) {
    params = params || {};
    var time = params.time || new Date().getTime(),
        frameId = typeof params.frameId === "undefined" ? 1 : params.frameId,
        source = params.source || "name:1@address";

    return writeOscMessage("/tuio2/frm", [
        // frame id
        {type: "i", value: frameId},
        // time
        {type: "t", value: time},
        // dimension 640x480
        {type: "i", value: 41943520},
        // source string
        {type: "s", value: source}
    ]);
}

function getPointerBuffer(params) {
    params = params || {};
    var sessionId = params.sessionId || 1,
        xPos = (typeof params.xPos !== 'undefined') ? params.xPos : 5,
        yPos = (typeof params.yPos !== 'undefined') ? params.yPos : 6,
        messageParams = [
            //session id
            {type: "i", value: sessionId},
            //tu_id, two 16-bit values
            //t_id => 15, u_id => 7
            // 0x00 0x0f 0x00 0x07 => big endian 983047
            {type: "i", value: 983047},
            // component id
            {type: "i", value: 4},
            // x_pos
            {type: "f", value: xPos},
            // y_pos
            {type: "f", value: yPos},
            // angle
            {type: "f", value: 7},
            // shear
            {type: "f", value: 8},
            // radius
            {type: "f", value: 9},
            // pressure
            {type: "f", value: 10},
        ],
        optionalMessageParams = [
            params.xSpeed,
            params.ySpeed,
            params.pressureSpeed,
            params.motionAccel,
            params.pressureAccel
        ];

    optionalMessageParams.forEach(function(optionalParam){
        if (typeof optionalParam !== "undefined") {
            messageParams.push({
                type: "f",
                value: optionalParam
            });
        }
    });

    return writeOscMessage("/tuio2/ptr", messageParams);
}

function getAliveBuffer(sessionIds) {
    var oscArgs = sessionIds.map(function(id) {
        return {
            type: "i",
            value: id
        };
    });

    return writeOscMessage("/tuio2/alv", oscArgs);
}

function writeOscMessage(address, args) {

    var arrayBuffer = new ArrayBuffer(1000),
        bufferView = new DataView(arrayBuffer),
        index = 0,
        args = args || [];

    function writeString(characters) {
        var ui8View = new Uint8Array(arrayBuffer);

        for (var i = 0; i < characters.length; i+=1) {
            ui8View[index] = characters[i].charCodeAt();
            index += 1;
        }
        //null delimiter
        ui8View[index] = 0;
        index += 1;
        // Round to the nearest 4-byte block. //osc.js
        index = (index + 3) & ~0x03;
    }

    // write address
    writeString(address);

    if (args.length !== 0) {

        var typeTags = args.map(function(arg){
            return arg.type;
        });
        typeTags.unshift(",");
        writeString(typeTags.join(""));

        for( var i = 0; i < args.length; i += 1) {
            var type = args[i].type,
                value = args[i].value,
                time;

            switch(type) {
                case "s":
                    writeString(value);
                    break;
                case "i":
                    bufferView.setUint32(index, value);
                    index += 4;
                    break;
                case "f":
                    bufferView.setFloat32(index, value);
                    index += 4;
                    break;
                case "t":
                    time = osc.writeTimeTag({native: value});
                    [].forEach.call(time, function(byte) {
                        bufferView.setUint8(index, byte);
                        index += 1;
                    });
            }
        }
    }

    return arrayBuffer;
}

describe('osc helper', () => {

    it("should write correct osc data", function() {
        var arrayBuffer = writeOscMessage("/tuio/2Dcur", [
            {type: "s", value: "set"},
            {type: "i", value: 1},
            {type: "f", value: 5},
            {type: "f", value: 6},
            {type: "f", value: 7},
            {type: "f", value: 8},
            {type: "f", value: 9},
        ]),
            bufferView = new DataView(arrayBuffer);

        expect(bufferView.getUint8(0)).to.equal("/".charCodeAt());
        expect(bufferView.getUint8(1)).to.equal("t".charCodeAt());
        expect(bufferView.getUint8(2)).to.equal("u".charCodeAt());
        expect(bufferView.getUint8(3)).to.equal("i".charCodeAt());
        expect(bufferView.getUint8(4)).to.equal("o".charCodeAt());
        expect(bufferView.getUint8(5)).to.equal("/".charCodeAt());
        expect(bufferView.getUint8(6)).to.equal("2".charCodeAt());
        expect(bufferView.getUint8(7)).to.equal("D".charCodeAt());
        expect(bufferView.getUint8(8)).to.equal("c".charCodeAt());
        expect(bufferView.getUint8(9)).to.equal("u".charCodeAt());
        expect(bufferView.getUint8(10)).to.equal("r".charCodeAt());
        expect(bufferView.getUint8(11)).to.equal(0);
        expect(bufferView.getUint8(12)).to.equal(",".charCodeAt());
        expect(bufferView.getUint8(13)).to.equal("s".charCodeAt());
        expect(bufferView.getUint8(14)).to.equal("i".charCodeAt());
        expect(bufferView.getUint8(15)).to.equal("f".charCodeAt());
        expect(bufferView.getUint8(16)).to.equal("f".charCodeAt());
        expect(bufferView.getUint8(17)).to.equal("f".charCodeAt());
        expect(bufferView.getUint8(18)).to.equal("f".charCodeAt());
        expect(bufferView.getUint8(19)).to.equal("f".charCodeAt());
        expect(bufferView.getUint8(20)).to.equal(0);
        expect(bufferView.getUint8(21)).to.equal(0);
        expect(bufferView.getUint8(22)).to.equal(0);
        expect(bufferView.getUint8(23)).to.equal(0);
        expect(bufferView.getUint8(24)).to.equal("s".charCodeAt());
        expect(bufferView.getUint8(25)).to.equal("e".charCodeAt());
        expect(bufferView.getUint8(26)).to.equal("t".charCodeAt());
        expect(bufferView.getUint8(27)).to.equal(0);
        expect(bufferView.getUint32(28)).to.equal(1);
        expect(bufferView.getFloat32(32)).to.equal(5);
        expect(bufferView.getFloat32(36)).to.equal(6);
        expect(bufferView.getFloat32(40)).to.equal(7);
        expect(bufferView.getFloat32(44)).to.equal(8);
        expect(bufferView.getFloat32(48)).to.equal(9);
    });
});
