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
    let gestureName = 'two-finger-drag',
        host = 'ws://localhost:8080';
        
    gispl.addGesture({
        name: gestureName,
        features: [
            {type:"Motion", constraints: [[5, -1], [500, 1]]},
            {type:"Count", constraints: [2,3]}
        ]
    });
    
    gispl(document).on(gestureName, () => {
        document.body.style.background = getRandomBlue();
    });
    
    gispl(blackSquare).on(gestureName, () => {
        blackSquare.style.background = (isRed) ? 'black' : 'red';
        isRed = !isRed;
    });
    
    gispl.initTuio({host});
});
