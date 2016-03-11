import gispl from '../source/gispl';
import $ from 'jquery';

$(document).ready(() => {
    let rotation0 = 'id-0',
        rotation3 = 'id-3';
    
    gispl.addGesture({
        name: rotation0,
        features: [
            {type: 'Rotation'},
            {type: 'ObjectID', constraints: [0, 0]}
        ]
    });
    
    gispl.addGesture({
        name: rotation3,
        features: [
            {type: 'Rotation'},
            {type: 'ObjectID', constraints: [3, 3]}
        ]
    });
    
    let images$ = $('img');
    
    gispl(images$).on(rotation0, function(event) {
        let image$ = $(this),
            objects = event.featureValues.rotation.objects,
            rotation = objects[0];
            
        let degrees = rotation / Math.PI * 180;
            
        image$.css({
            transform: `rotate(${degrees}deg)`
        });
    });
    
    gispl(document).on(rotation3, function(event) {
        let objects = event.featureValues.rotation.objects,
            rotation = objects[3];
            
        let degrees = rotation / Math.PI * 180;
            
        images$.css({
            transform: `rotate(${degrees}deg)`
        });
    });

    gispl.initTuio({
        host: 'ws://localhost:8080'
    });
});
