import gispl from '../source/gispl';
import $ from 'jquery';

$(document).ready(() => {
    let scaling = 'scale-enlarge',
        fingerRotation = 'finger-rotation';
    
    gispl.addGesture({
        name: scaling,
        features: [
            {type: 'Count', constraints: [2,2]},
            {type: 'Scale', constraints:[]}
        ]
    });
    
    gispl.addGesture({
        name: fingerRotation,
        features: [
            {type: 'Rotation'},
            {type: 'Count', constraints: [2,2]}
        ]
    });
    
    let images$ = $('img'),
        imageRotations = new WeakMap(),
        imageScales = new WeakMap(),
        currentTranslations = new WeakMap(),
        drawing = false;
        
    images$.each(function(index, element) {
        imageScales.set(element, 1);
        imageRotations.set(element, 0);
        currentTranslations.set(element, {translateX: 0, translateY: 0});
    });
    
    gispl(images$).on(fingerRotation, function fingerRotationCallback(event) {
        let rotation = event.featureValues.rotation.touches,
            degrees = rotation / Math.PI * 180;
        let previousDegrees = imageRotations.get(this);
        imageRotations.set(this, previousDegrees + degrees);
        requestDraw();
    });
    
    gispl(images$).on(scaling, function(event) {
        let scale = event.featureValues.scale;
        let previousScale = imageScales.get(this);
        imageScales.set(this, scale * previousScale);
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
                scale = imageScales.get(element),
                degrees = imageRotations.get(element),
                {translateX, translateY} = currentTranslations.get(element);
            element.style.transform = `scale(${scale})
                                        rotate(${degrees}deg)
                                        translate(${translateX}px, ${translateY}px)`;
        }
        drawing = false;
    }

    gispl.initTouch();
});
