import gispl from '../source/gispl';
import $ from 'jquery';

$(document).ready(() => {
    let anyMotion = 'any-motion';

    gispl.addGesture({
        name: anyMotion,
        features: [
            {type: "Motion"},
            {type: "Count", constraints: [2,3]}
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

    let zIndex = 1;

    gispl(images$).on(anyMotion, function(inputState) {
        let this$ = $(this),
            nodePosition = {
                left: 200,
                top: 200
            },
            input = inputState[0],
            originX = window.screenLeft + window.outerWidth - window.innerWidth,
            originY = window.screenTop + window.outerHeight - window.innerHeight;

        let left = input.screenX - originX - nodePosition.left,
            top = input.screenY - originY - nodePosition.top;

        this$.css({zIndex, left, top});

        zIndex += 1;
    });

    gispl.initTuio({
        host: 'ws://localhost:8080'
    });
});
