export default function tuioInput(params = {}) {
    let {tuioClient,
            events} = params;
    
    // listen to tuio/websocket
    tuioClient.connect();
    tuioClient.on('refresh', () => {
        let pointers = tuioClient.getTuioPointers();
        events.emit(document, 'gesture');
    });
}