import {events} from './events';

export default function tuioInput(params = {}) {
    let inputApi = {},
        {tuioClient} = params;
    
    // listen to tuio/websocket
    tuioClient.connect();
    tuioClient.on('refresh', () => {
        let pointers = tuioClient.getTuioPointers();
    });
    //
    inputApi.emit = events.emit;
    
    return inputApi;
}