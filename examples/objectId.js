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
    
    let images$ = $('img'),
        drawing = false,
        imageRotations = new WeakMap();
    
    images$.each(function(index, element) {
        imageRotations.set(element, 0);
    });
    
    function updateRotation(element, addedRotation) {
        let currentRotation = imageRotations.get(element) + addedRotation;                
        imageRotations.set(element, currentRotation);
    }
    
    function radToDeg(angle) {
        return angle / Math.PI * 180;
    }
    
    gispl(images$).on(rotation0, function(event) {
        let angle = event.featureValues.rotation.objects[0],
            degrees = radToDeg(angle);
            
        updateRotation(this, degrees);
        requestDraw();
    });
    
    gispl(document).on(rotation3, function(event) {
        let angle = event.featureValues.rotation.objects[3],
            degrees = radToDeg(angle);
        
        for (let i = 0; i < images$.length; i += 1) {
            updateRotation(images$[i], degrees);
        }
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
