import {eventTrigger} from './domCollectionEvents';

export default function tuioInput() {
    let inputApi = {};
    
    inputApi.emit = eventTrigger;
    
    return inputApi;
}