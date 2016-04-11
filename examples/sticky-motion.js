import gispl from '../source/gispl';
import $ from 'jquery';

$(document).ready(() => {
    let anyMotion = 'any-motion',
        stickyMotion = 'sticky-motion';


    
    gispl.addGesture({
        name: stickyMotion,
        flags: 'sticky',
        features: [
            {type: 'Motion'},
            {type: 'Count', constraints: [1,1]}
        ]
    });

    let images$ = $('img');

    let zIndex = 1,
        currentIdentifiers = [],
        inImagePositions = {};

    gispl(images$).on(anyMotion, function(event) {
        let this$ = $(this),
            {input:inputState} = event,
            input = inputState[0],
            {identifier,
                clientX,
                clientY} = input,
            unknownIdentifier = currentIdentifiers.indexOf(identifier) === -1;
        
        if (unknownIdentifier) {
            let nodePosition = this.getBoundingClientRect();
            let x = clientX - nodePosition.left,
                y = clientY - nodePosition.top;
            inImagePositions[identifier] = {x, y};
            currentIdentifiers.push(identifier);
        }

        let left = clientX - inImagePositions[identifier].x,
            top = clientY - inImagePositions[identifier].y;

        this$.css({zIndex, left, top});

        zIndex += 1;
    });
    
    let relativeOriginalTouchPositions = new WeakMap(),
        touchPositionInImage = new WeakMap(),
        currentTranslations = new WeakMap(),
        translating = false;
        
    images$.each(function(index, element) {
        if (!currentTranslations.has(element)) {
            currentTranslations.set(element, {translateX: 0, translateY: 0});
        }
    });
    
    gispl(images$).on(stickyMotion, function(event) {
        let input = event.input[0],
            {clientX,
                clientY} = input;
        
        let originalPosition = relativeOriginalTouchPositions.get(this);
        
        let current = currentTranslations.get(this);
        current.translateX = clientX - originalPosition.clientX;
        current.translateY = clientY - originalPosition.clientY;
        requestTranslation();
    }).on('inputstart', function(event) {
        let input = event.input[0],
            {clientX,
                clientY} = input;
        
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
        
        $(this).css('z-index', zIndex);
        zIndex += 1;
    });
    
    function requestTranslation() {
        if (!translating) {
            requestAnimationFrame(translate);
            translating = true;
        }
    }
    
    function translate() {
        images$.each(function(index, element) {
            let {translateX, translateY} = currentTranslations.get(element);
            images$.eq(index).css({
                transform: `translate(${translateX}px, ${translateY}px)`
            });
        });
        translating = false;
    }

    gispl.initTuio({
        host: 'ws://localhost:8080'
    });
});
