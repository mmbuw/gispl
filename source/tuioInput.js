import {eventTrigger} from './domCollectionEvents';
import TuioClient from 'tuio/src/TuioClient';

export default function tuioInput(params = {}) {
    let inputApi = {},
        {tuio} = params;
    
    // listen to tuio
    tuio.connect();
    tuio.on('refresh', () => {
        let pointers = tuio.getTuioPointers();
    });
    //
    inputApi.emit = eventTrigger;
    
    return inputApi;
}