import gispl from '../source/gispl';
import $ from 'jquery';

function getRandomBlue() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 4; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    color += "ff";
    return color;
}

let blackSquare = document.getElementById('element'),
    isRed = false;

$(document).ready(() => {
    let swipe = 'two-or-three-finger-to-right-swipe',
        trianglePath = 'clockwise-square-path',
        host = 'ws://localhost:8080';

    gispl.addGesture({
        name: swipe,
        features: [
            {type:"Motion", constraints: [[5, -1], [500, 1]]},
            {type:"Count", constraints: [2,3]}
        ]
    });

    gispl.addGesture({
        name: trianglePath,
        features: [
            {type:"Path", constraints: [
                [0, 0], [0, 100], [100, 100], [0,0]
            ]},
            {type:"Count", constraints: [1,3]}
        ]
    });

    gispl(document).on(swipe, () => {
        document.body.style.background = getRandomBlue();
    });

    gispl(blackSquare).on(trianglePath, () => {
        blackSquare.style.background = (isRed) ? 'black' : 'red';
        isRed = !isRed;
    });

    gispl.initTuio({host});
});
