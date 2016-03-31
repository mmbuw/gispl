import gispl from '../source/gispl';
import $ from 'jquery';

$(document).ready(() => {
    let fingerRotation = 'finger-rotation',
        objectRotation = 'object-rotation';
    
    gispl.addGesture({
        name: fingerRotation,
        features: [
            {type: 'Rotation'}
        ]
    });
    
    let images$ = $('img'),
        imageRotations = new WeakMap(),
        drawing = false;
    
    images$.each(function(index, element) {
        imageRotations.set(element, 0);
    });
    
    gispl(images$).on(fingerRotation, function(event) {
        let rotation = event.featureValues.rotation.touches,
            degrees = rotation / Math.PI * 180;
        
        imageRotations.set(this, degrees);
        requestDraw();
    });
    
    gispl(images$).on(objectRotation, function(event) {
        let objects = event.featureValues.rotation.objects,
            rotation = 0;
            
        for (var key in objects) {
            rotation = objects[key];
            break;
        }
        let degrees = rotation / Math.PI * 180;
        
        imageRotations.set(this, degrees);
        requestDraw();
    });
    
    function requestDraw() {
        if (!drawing) {
            requestAnimationFrame(draw);
            drawing = true;
        }
    }
    
    function draw() {
        for (let i = 0; i < images$.length; i += 1) {
            let element = images$[i],
                degrees = imageRotations.get(element);
            element.style.transform = `rotate(${degrees}deg)`;
        }
        drawing = false;
    }


    gispl.initTuio({
        host: 'ws://localhost:8080'
    });
});
