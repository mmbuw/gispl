import gispl from '../source/gispl';
import $ from 'jquery';

$(document).ready(() => {
    let doubleTap = 'double-tap',
        tripleTap = 'triple-tap';
    
    gispl.addGesture({
        name: doubleTap,
        features: [
            {type: 'Count', constraints:[1,2], duration: [0.2, 0.6]},
            {type: 'Count', constraints:[0,0], duration: [0.01, 0.2]},
            {type: 'Count', constraints:[1,2], duration: [0, 0.01]}
        ]
    });
    
    gispl.addGesture({
        name: tripleTap,
        features: [
            {type: 'Count', constraints:[1,2], duration: [0.45, 0.80]},
            {type: 'Count', constraints:[0,0], duration: [0.3, 0.45]},
            {type: 'Count', constraints:[1,2], duration: [0.15, 0.3]},
            {type: 'Count', constraints:[0,0], duration: [0.01, 0.15]},
            {type: 'Count', constraints:[1,2], duration: [0, 0.01]}
        ]
    });
    
    let eventBox = $('#events');
    
    gispl(document).on(doubleTap, function(inputState) {
        eventBox.append('<div>double tap</div>');
    });
    
    gispl(document).on(tripleTap, function(inputState) {
        eventBox.append('<div>triple tap</div>');
    });

    gispl.initTuio({
        host: 'ws://localhost:8080'
    });
});
