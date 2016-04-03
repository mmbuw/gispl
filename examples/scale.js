import gispl from '../source/gispl';
import $ from 'jquery';

$(document).ready(() => {
    let enlarge = 'scale-enlarge';
    
    gispl.addGesture({
        name: enlarge,
        features: [
            {type: 'Count', constraints: [2,2]},
            {type: 'Scale', constraints:[]},
            {type: 'Motion', constraints: [[-1,-1], [1, 1]]}
        ]
    });
    
    let images$ = $('img');
    
    let lastScaleFactors = {},
        useScaleFactors = {},
        lastIdentifiers = {},
        drawing = false,
        imageScales = new WeakMap();
        
    images$.each(function(index, element) {
        imageScales.set(element, 1);
    });
    
    gispl(images$).on(enlarge, function(event) {
        let image$ = $(this),
            {input} = event,
            identifier = input[input.length-1].identifier,
            scaleValue = event.featureValues.scale,
            key = image$.attr('src');
            
        let lastScaleFactor = lastScaleFactors[key] ? lastScaleFactors[key] : 1,
            useScaleFactor = useScaleFactors[key] ? useScaleFactors[key] : 1,
            lastIdentifier = lastIdentifiers[key] ? lastIdentifiers[key] : 0;
            
        if (identifier !== lastIdentifier) {
            useScaleFactor = useScaleFactors[key] = lastScaleFactor;
        }
            
        let scaleFactor = scaleValue * useScaleFactor;
        imageScales.set(this, scaleFactor);
    
        lastScaleFactors[key] = scaleFactor;
        lastIdentifiers[key] = identifier;
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
                scale = imageScales.get(element);
            element.style.transform = `scale(${scale})`;
        }
        drawing = false;
    }

    gispl.initTuio({
        host: 'ws://localhost:8080'
    });
});
