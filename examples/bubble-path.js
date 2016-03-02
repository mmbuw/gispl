import gispl from '../source/gispl';
import $ from 'jquery';

$(document).ready(() => {
    let bubbleTrianglePath = 'bubble-triangle-path';
    
    gispl.addGesture({
        name: bubbleTrianglePath,
        flags: 'bubble',
        duration: [2],
        features: [
            {
                type: "Path",
                constraints: [
                    [0, 100], [0,0], [100, 100], [0, 100]
                ]
            },
            {
                type: "Count",
                constraints: [1, 1]
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
    
    gispl(images$).on(bubbleTrianglePath, function(event) {
        let image$ = $(this);
        
        image$.fadeOut(() => {
            image$.remove();
        });
    });

    gispl.initTuio({
        host: 'ws://localhost:8080'
    });
});
