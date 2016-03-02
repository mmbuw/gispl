import gispl from '../source/gispl';
import $ from 'jquery';

$(document).ready(() => {
    let anyMotion = 'any-motion',
        triangle = 'triangle',
        stickyMotion = 'sticky-motion';

    gispl.addGesture({
        name: anyMotion,
        features: [
            {type: "Motion"},
            {type: "Count", constraints: [2,3]}
        ]
    });
    
    gispl.addGesture({
        name: stickyMotion,
        flags: 'sticky',
        features: [
            {type: "Motion"},
            {type: "Count", constraints: [1,1]}
        ]
    });

    let images$ = $('img'),
        offsets = $.map($.makeArray(images$), (element, index) => {
            let offset = $(element).offset(),
                left = offset.left,
                top = offset.top;

            return {left, top};
        });

    images$ = images$.each((index, element) => {
        let element$ = $(element),
            offset = offsets[index];

        element$.css({
            position: 'absolute',
            top: offset.top,
            left: offset.left
        });
    });

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
            inImagePositions[identifier] = {};
            inImagePositions[identifier].x = clientX - nodePosition.left;
            inImagePositions[identifier].y = clientY - nodePosition.top;
            currentIdentifiers.push(identifier);
        }

        let left = clientX - inImagePositions[identifier].x,
            top = clientY - inImagePositions[identifier].y;

        this$.css({zIndex, left, top});

        zIndex += 1;
    });
    
    let originalPositions = {};
    
    gispl(images$).on(stickyMotion, function(event) {
        let this$ = $(this),
            imageKey = this$.attr('src'),
            {input:inputState} = event,
            input = inputState[0],
            {identifier,
                clientX,
                clientY} = input,
            unknownIdentifier = currentIdentifiers.indexOf(identifier) === -1;
        
        if (unknownIdentifier) {
            let nodePosition = this.getBoundingClientRect(),
                left = nodePosition.left,
                top = nodePosition.top;
            inImagePositions[identifier] = {};
            inImagePositions[identifier].x = clientX - left;
            inImagePositions[identifier].y = clientY - top;
            
            originalPositions[imageKey] = {left, top}
            
            currentIdentifiers.push(identifier);
        }

        let left = clientX - inImagePositions[identifier].x,
            top = clientY - inImagePositions[identifier].y;
        
        let originalLeft = originalPositions[imageKey].left,
            originalTop = originalPositions[imageKey].top;

        this$.css({zIndex,
            left: originalLeft - (left - originalLeft),
            top: originalTop - (top - originalTop)
        });

        zIndex += 1;
    });

    gispl.initTuio({
        host: 'ws://localhost:8080'
    });
});
