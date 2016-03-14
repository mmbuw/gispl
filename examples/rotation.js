import gispl from '../source/gispl';
import $ from 'jquery';

$(document).ready(() => {
    let fingerRotation = 'finger-rotation',
        objectRotation = 'object-rotation';
    
    gispl.addGesture({
        name: fingerRotation,
        features: [
            {type: 'Count', constraints: [2,4]},
            {type: 'Rotation'},
        ]
    });
    
    gispl.addGesture({
        name: objectRotation,
        features: [
            {type: 'Count', constraints: [1,1]},
            {type: 'Rotation'},
        ]
    });
    
    gispl('img').on(fingerRotation, function(event) {
        let image$ = $(this),
            rotation = event.featureValues.rotation.touches;
            
        let degrees = rotation / Math.PI * 180;
            
        image$.css({
            transform: `rotate(${degrees}deg)`
        });
    });
    
    gispl('img').on(objectRotation, function(event) {
        let image$ = $(this),
            objects = event.featureValues.rotation.objects,
            objectsKeys = Object.keys(objects),
            key = objectsKeys[objectsKeys.length-1],
            rotation = objects[key];
            
        let degrees = rotation / Math.PI * 180;
            
        image$.css({
            transform: `rotate(${degrees}deg)`
        });
    });

    gispl.initTuio({
        host: 'ws://localhost:8080'
    });
});
