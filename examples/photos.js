import gispl from '../source/gispl';
import $ from 'jquery';

$(document).ready(() => {
    let anyMotion = 'any-motion';

    gispl.addGesture({
        name: anyMotion,
        features: [
            {type: "Motion"},
            {type: "Count", constraints: [1,3]}
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
        currentIdentifier = 0,
        inImagePositionX, inImagePositionY;

    gispl(images$).on(anyMotion, function(inputState) {
        let this$ = $(this),
            input = inputState[0],
            {clientX,
                clientY} = input;
        
        if (input.identifier !== currentIdentifier) {
            let nodePosition = this.getBoundingClientRect();
            inImagePositionX = clientX - nodePosition.left;
            inImagePositionY = clientY - nodePosition.top;
            currentIdentifier = input.identifier;
        }

        let left = clientX - inImagePositionX,
            top = clientY - inImagePositionY;

        this$.css({zIndex, left, top});

        zIndex += 1;
    });

    gispl.initTuio({
        host: 'ws://localhost:8080'
    });
});
