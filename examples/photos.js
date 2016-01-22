import gispl from '../source/gispl';
import $ from 'jquery';

$(document).ready(() => {
    let anyMotion = 'any-motion';

    gispl.addGesture({
        name: anyMotion,
        features: [
            {
                type: "Motion"
            }
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
            input = inputState[0],
            originX = window.screenLeft,
            originY = window.screenTop + window.outerWidth - window.innerWidth;

        let left = input.screenX - originX,
            top = input.screenY - originY;

        $this.css({zIndex, left, top});

        zIndex += 1;
    });
});
