import gispl from '../source/gispl';
import $ from 'jquery';

$(document).ready(() => {
    let rotate = 'rotate';
    
    gispl.addGesture({
        name: rotate,
        features: [
            {type: 'Count', constraints: [2,2]},
            {type: 'Rotation', constraints:[Math.PI / 4]},
        ]
    });
    
    gispl('img').on(rotate, function(event) {
        let image$ = $(this),
            rotation = event.featureValues.rotation.touches;
            
        let degrees = rotation / Math.PI * 180;
            
        image$.css({
            transform: `rotate(${degrees}deg)`
        });
    });

    gispl.initTuio({
        host: 'ws://localhost:8080'
    });
});
