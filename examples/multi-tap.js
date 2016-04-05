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
            {type: 'Count', constraints:[1,1], duration: [1/30]},
            {type: 'Count', constraints:[0,0], duration: [200, 1/30]},
            {type: 'Count', constraints:[1,1], duration: [400, 200]},
            {type: 'Count', constraints:[0,0], duration: [600, 400]},
            {type: 'Count', constraints:[1,1], duration: [800, 600]},
            {type: 'Count', constraints:[0,0], duration: [1200, 800]}
        ]
    });
    
    gispl.addGesture({
        name: doubleTap,
        flags: 'oneshot',
        features: [
            {type: 'Count', constraints:[1,1], duration: [1/30]},
            {type: 'Count', constraints:[0,0], duration: [200, 1/30]},
            {type: 'Count', constraints:[1,1], duration: [400, 200]},
            {type: 'Count', constraints:[0,0], duration: [800, 400]},
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
    
    gispl(document).on(doubleTap, function() {
        eventBox.append('<div>double tap</div>');
    });
    
    gispl(document).on(tripleTap, function() {
        eventBox.append('<div>triple tap</div>');
    });

    gispl.initTuio({
        host: 'ws://localhost:8080'
    });
});
