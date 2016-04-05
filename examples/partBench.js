import gispl from '../source/gispl';
import $ from 'jquery';

$(document).ready(() => {
    let stamp = 'stamp',
        washingMachine = 'washing-machine',
        distanceAsGroup = 'distance-group';
    
    gispl.addGesture({
        name: stamp,
        flags: 'oneshot',
        features: [
            {type: 'Count', constraints: [1, 1]},
            //{type: 'ObjectId', constraints: []}
        ]
    });
    
    gispl.addGesture({
        name: washingMachine,
        features: [
            {type: 'Rotation'},
            //{type: 'ObjectId', constraints: []}
        ]
    });
    
    gispl.addGesture({
        name: distanceAsGroup,
        features: [
            {type: 'ObjectGroup', constraints: [2, 2, window.screen.width]},
            //{type: 'ObjectId', constraints: []}
        ]
    });
    
    let canvas = document.getElementById('canvas'),
        ctx = canvas.getContext('2d'),
        stampPosition = {pageX: undefined, pageY: undefined},
        washingRotation = 0,
        distanceRadius = 0,
        drawing = false;
    
    canvas.width = document.body.clientWidth;
    canvas.height = document.body.clientHeight;
    
    gispl(canvas).on(stamp, function(event) {
        let touchPosition = event.input[0];
        stampPosition.pageX = touchPosition.pageX;
        stampPosition.pageY = touchPosition.pageY;
        requestDraw();
    });
    
    gispl(canvas).on(washingMachine, function(event) {
        let rotation = event.featureValues.rotation.touches * 180 / Math.PI;
        washingRotation += rotation;
        washingRotation = washingRotation % 360;
        requestDraw();
    });
    
    gispl(canvas).on(distanceAsGroup, function(event) {
        distanceRadius = event.featureValues.objectgroup.radius;
        requestDraw();
    });
    
    function requestDraw() {
        if (!drawing) {
            requestAnimationFrame(draw);
            drawing = true;
        }
    }
    
    function drawStamp() {
        let width = 50,
            height = 50,
            {pageX, pageY} = stampPosition;
        
        if (typeof pageX !== 'undefined' &&
            typeof pageY !== 'undefined') {
            ctx.fillRect(stampPosition.pageX, stampPosition.pageY, width, height);   
        }
    }
    
    function drawWashingMachine() {
        // all values totally scientific
        ctx.clearRect(0, 0, 280, 50);
        ctx.font = '40px sans-serif';
        ctx.textBaseline = 'top';
        ctx.fillText( `Washing: ${Math.round(washingRotation)}`, 10, 10);
    }
    
    function drawDistanceAsRadius() {
        let left = 10,
            top = canvas.height - 50;
        ctx.clearRect(left, top, 420, 50);
        ctx.font = '40px sans-serif';
        ctx.textBaseline = 'top';
        ctx.fillText( `Radius distance: ${Math.round(distanceRadius) * 2}`, left, top);
    }
    
    function draw() {
        drawStamp();
        drawWashingMachine();
        drawDistanceAsRadius();
        drawing = false;
    }

    gispl.initTuio({
        host: 'ws://localhost:8080'
    });
});
