import gispl from '../source/gispl';
import $ from 'jquery';

$(document).ready(() => {
    let triangle = 'triangle',
        twoTouchTriangle = 'two-touch-triangle',
        rectangle = 'rectangle';
    
    gispl.addGesture({
        name: triangle,
        flags: 'oneshot',
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
    
    gispl.addGesture({
        name: twoTouchTriangle,
        flags: 'oneshot',
        features: [
            {
                type: "Path",
                constraints: [
                    [0, 100], [0,0], [100, 100], [0, 100]
                ]
            },
            {
                type: "Count",
                constraints: [2, 2]
            }
        ]
    });
    
    gispl.addGesture({
        name: rectangle,
        flags: 'oneshot',
        features: [
            {
                type: "Path",
                constraints: [
                    [0, 100], [0,0], [100, 0], [100, 100], [0, 100]
                ]
            },
            {
                type: "Count",
                constraints: [1, 2]
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
    
    gispl(images$).on(triangle, function(inputState) {
        let image$ = $(this);
        
        image$.fadeOut(() => {
            image$.remove();
        });
    });
    
    gispl(images$).on(twoTouchTriangle, function(inputState) {
        let image$ = $('img'),
            offset = image.offset();

            $('<img style="display: none" src=' + image$.attr('src') + '/>')
                .appendTo('body')
                .css({
                    position: 'absolute',
                    left: offset.left + image$.width(),
                    top: offset.top
                }).fadeIn();
    });
    
    gispl(images$).on(rectangle, function(inputState) {
        images$.fadeOut(() => {
            images$.remove();
        });
    });

    gispl.initTuio({
        host: 'ws://localhost:8080'
    });
});
