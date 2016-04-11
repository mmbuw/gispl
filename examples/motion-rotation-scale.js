import gispl from '../source/gispl';
import $ from 'jquery';

$(document).ready(() => {
    let scaling = 'scale-enlarge',
        fingerRotation = 'finger-rotation',
        stickyMotion = 'any-motion';
    
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
    
    gispl.addGesture({
        name: stickyMotion,
        features: [
            {type: 'Motion'},
            {type: 'Count', constraints: [2,2]}
        ]
    });
    
    let images$ = $('img'),
        imageRotations = new WeakMap(),
        imageScales = new WeakMap(),
        relativeOriginalTouchPositions = new WeakMap(),
        touchPositionInImage = new WeakMap(),
        currentTranslations = new WeakMap(),
        zIndex = 1,
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
    
    gispl(images$).on(stickyMotion, function(event) {
        let {input} = event,
            clientX = 0,
            clientY = 0;
        
        for (let i = 0; i < input.length; i += 1) {
            clientX += input[i].clientX;
            clientY += input[i].clientY;
        }
        
        clientX = Math.floor(clientX / input.length);
        clientY = Math.floor(clientY / input.length);
        
        let originalPosition = relativeOriginalTouchPositions.get(this);
        
        let current = currentTranslations.get(this);
        current.translateX = clientX - originalPosition.clientX;
        current.translateY = clientY - originalPosition.clientY;
        requestDraw();
    }).on('inputstart', function(event) {
        let {input} = event,
            clientX = 0,
            clientY = 0;
        
        for (let i = 0; i < input.length; i += 1) {
            clientX += input[i].clientX;
            clientY += input[i].clientY;
        }
        
        clientX = Math.floor(clientX / input.length);
        clientY = Math.floor(clientY / input.length);
        
        // init original position with current values if not set 
        if (!relativeOriginalTouchPositions.has(this)) {
            relativeOriginalTouchPositions.set(this, {clientX, clientY});
        }
        // current position with respect to image
        let {left, top} = this.getBoundingClientRect(),
            currentPositionInImage = {
                imageX: clientX - left,
                imageY: clientY - top
            };
        
        // init 
        if (!touchPositionInImage.has(this)) {
            touchPositionInImage.set(this, currentPositionInImage);
        }
        // adjust original position if the position within image on next touch
        // is not the same
        let previousPositionInImage = touchPositionInImage.get(this);
        let inImageOffset = {
            x: currentPositionInImage.imageX - previousPositionInImage.imageX,
            y: currentPositionInImage.imageY - previousPositionInImage.imageY
        };
        
        let originalPosition = relativeOriginalTouchPositions.get(this);
        originalPosition.clientX += inImageOffset.x;
        originalPosition.clientY += inImageOffset.y;
        touchPositionInImage.set(this, currentPositionInImage);
        
        this.style.zIndex = zIndex;
        zIndex += 1;
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

    gispl.initTuio({
        host: 'ws://localhost:8080'
    });
});
