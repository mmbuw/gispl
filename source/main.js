import nodeSearch from './nodeSearch';
import screenCalibration from './screenCalibration';
import TuioClient from 'tuio/src/TuioClient';

let calibration = screenCalibration();
let findNodes = nodeSearch({calibration});
let client = new TuioClient({
    host: 'ws://localhost:8080'
});
let element = document.getElementById('element');

client.connect();

client.on('refresh', function() {
    
    if (!calibration.isScreenUsable()) {
        return;
    }
    
    let pointers = client.getTuioPointers();
    
    if(pointers.length === 0) {
        element.style.backgroundColor = 'black';
    }
    
    pointers.forEach((pointer) => {
        let screenX = pointer.getScreenX(window.screen.width),
            screenY = pointer.getScreenY(window.screen.height);
        
        let foundNodes = findNodes.fromPoint({screenX, screenY});
        if (foundNodes.shift() === element) {
            element.style.backgroundColor = 'red';
        }
        else {
            element.style.backgroundColor = 'black';
        }
    });
});
