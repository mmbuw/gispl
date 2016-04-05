import gispl from '../source/gispl';
import $ from 'jquery';

$(document).ready(() => {
    let doubleTap = 'double-tap',
        fasterDoubleTap = 'faster-double-tap',
        superFastDoubleTap = 'super-fast-double-tap',
        singleTap = 'single-tap';
    
    gispl.addGesture({
        name: superFastDoubleTap,
        flags: 'oneshot',
        features: [
            {type: 'Count', constraints:[1,1], duration: [16]},
            {type: 'Count', constraints:[0,0], duration: [50, 16]},
            {type: 'Count', constraints:[1,1], duration: [100, 50]},
            {type: 'Count', constraints:[0,0], duration: [200, 100]}
        ]
    });
    
    gispl.addGesture({
        name: fasterDoubleTap,
        flags: 'oneshot',
        features: [
            {type: 'Count', constraints:[1,1], duration: [16]},
            {type: 'Count', constraints:[0,0], duration: [100, 16]},
            {type: 'Count', constraints:[1,1], duration: [200, 100]},
            {type: 'Count', constraints:[0,0], duration: [400, 200]}
        ]
    });
    
    gispl.addGesture({
        name: doubleTap,
        flags: 'oneshot',
        features: [
            {type: 'Count', constraints:[1,1], duration: [16]},
            {type: 'Count', constraints:[0,0], duration: [200, 16]},
            {type: 'Count', constraints:[1,1], duration: [400, 200]},
            {type: 'Count', constraints:[0,0], duration: [800, 400]}
        ]
    });
    
    gispl.addGesture({
        name: singleTap,
        flags: 'oneshot',
        features: [
            {type: 'Count', constraints:[1,1], duration: [16]},
            {type: 'Count', constraints:[0,0], duration: [400, 16]}
        ]
    });
    
    let eventBox = $('#events');
    
    gispl(document).on(singleTap, function() {
        eventBox.append('<div>single tap</div>');
    });
    
    gispl(document).on(doubleTap, function() {
        eventBox.append('<div>double tap</div>');
    });
    
    gispl(document).on(fasterDoubleTap, function() {
        eventBox.append('<div>faster double tap</div>');
    });
    
    gispl(document).on(superFastDoubleTap, function() {
        eventBox.append('<div>super fast double tap</div>');
    });

    gispl.initTuio({
        host: 'ws://localhost:8080'
    });
});
