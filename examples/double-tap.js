import gispl from '../source/gispl';
import $ from 'jquery';

$(document).ready(() => {
    let doubleTap = 'double-tap',
        tripleTap = 'triple-tap',
        singleTap = 'single-tap';
    
    gispl.addGesture({
        name: tripleTap,
        flags: 'oneshot',
        features: [
            {type: 'Count', constraints:[1,1], duration: [1/60]},
            {type: 'Count', constraints:[0,0], duration: [0.2, 1/30]},
            {type: 'Count', constraints:[1,1], duration: [0.4, 0.2]},
            {type: 'Count', constraints:[0,0], duration: [0.6, 0.4]},
            {type: 'Count', constraints:[1,1], duration: [0.8, 0.6]},
            {type: 'Count', constraints:[0,0], duration: [1.2, 0.8]}
        ]
    });
    
    gispl.addGesture({
        name: doubleTap,
        flags: 'oneshot',
        features: [
            {type: 'Count', constraints:[1,1], duration: [1/60]},
            {type: 'Count', constraints:[0,0], duration: [0.2, 1/30]},
            {type: 'Count', constraints:[1,1], duration: [0.4, 0.2]},
            {type: 'Count', constraints:[0,0], duration: [0.8, 0.4]},
        ]
    });
    
    gispl.addGesture({
        name: singleTap,
        flags: 'oneshot',
        features: [
            {type: 'Count', constraints:[1,1], duration: [1/30]}
        ]
    });
    
    let eventBox = $('#events');
    
    gispl(document).on(doubleTap, function(event) {
        eventBox.append('<div>double tap</div>');
    });
    
    gispl(document).on(tripleTap, function(event) {
        eventBox.append('<div>triple tap</div>');
    });

    gispl.initTuio({
        host: 'ws://localhost:8080'
    });
});
