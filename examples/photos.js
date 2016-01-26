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
        currentIdentifiers = [],
        inImagePositions = {},
        inImagePositionX, inImagePositionY;

    gispl(images$).on(anyMotion, function(inputState) {
        let this$ = $(this),
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

    gispl.initTuio({
        host: 'ws://localhost:8080'
    });
});
