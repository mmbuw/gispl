import gispl from '../source/gispl';
import $ from 'jquery';

$(document).ready(() => {
    let enlarge = 'scale-enlarge';
    
    gispl.addGesture({
        name: enlarge,
        features: [
            {type: 'Count', constraints: [2,2]},
            {type: 'Scale', constraints:[]}
        ]
    });
    
    let images$ = $('img');
    
    let drawing = false,
        scaleChanges = new WeakMap();
        
    images$.each(function(index, element) {
        scaleChanges.set(element, 1);
    });
    
    gispl(images$).on(enlarge, function(event) {
        let scale = event.featureValues.scale;
        let previousScale = scaleChanges.get(this);
        scaleChanges.set(this, scale * previousScale);
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
                scale = scaleChanges.get(element);
            element.style.transform = `scale(${scale})`;
        }
        drawing = false;
    }

    gispl.initTuio({
        host: 'ws://localhost:8080'
    });
});
