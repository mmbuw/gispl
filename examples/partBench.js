import gispl from '../source/gispl';
import $ from 'jquery';

$(document).ready(() => {
    let stamp = 'stamp',
        washingMachine = 'washing-machine',
        washingTokenId = 3,
        stampTokenId = 0,
        distanceTokenId1 = 1,
        distanceTokenId2 = 2,
        distanceAsGroup = 'distance-group';
    
    gispl.addGesture({
        name: stamp,
        flags: 'oneshot',
        features: [
            {type: 'Count', constraints: [1, 1]},
            {type: 'ObjectId', constraints: [
                stampTokenId, stampTokenId
            ]}
        ]
    });
    
    gispl.addGesture({
        name: washingMachine,
        features: [
            {type: 'Rotation'},
            {type: 'ObjectId', constraints: [
                washingTokenId, washingTokenId
            ]}
        ]
    });
    
    gispl.addGesture({
        name: distanceAsGroup,
        features: [
            {type: 'ObjectGroup', constraints: [2, 2, window.screen.width]},
            {type: 'ObjectId', constraints: [
                distanceTokenId1, distanceTokenId2
            ]}
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
    
    gispl(canvas)
        .on(stamp, function onStamp(event) {
            let touchPosition = event.input[0];
            stampPosition.pageX = touchPosition.pageX;
            stampPosition.pageY = touchPosition.pageY;
            requestDraw();
        })
        .on(washingMachine, function onWashingMachine(event) {
            washingRotation = event.featureValues.rotation.objects[washingTokenId] * 180 / Math.PI;
            washingRotation = washingRotation % 360;
            requestDraw();
        })
        .on(distanceAsGroup, function onDistanceAsGroup(event) {
            distanceRadius = event.featureValues.objectgroup.radius;
            requestDraw();
        })
        .on('inputend', function onInputEnd(event) {
            let {input} = event,
                washingTokensOnScreen = 0,
                distanceTokensOnScreen = 0;
            for (let i = 0; i < input.length; i += 1) {
                let componentId = input[i].componentId;
                if (componentId === washingTokenId) {
                    washingTokensOnScreen += 1;
                }
                else if (componentId === distanceTokenId1 ||
                            componentId === distanceTokenId2) {
                    distanceTokensOnScreen += 1;
                }
            }
            if (washingTokensOnScreen === 0) {
                washingRotation = 0;
            }
            if (distanceTokensOnScreen !== 2) {
                distanceRadius = 0;
            }
        });
    
    function requestDraw() {
        if (!drawing) {
            requestAnimationFrame(draw);
            drawing = true;
        }
    }
    
    function drawStamp() {
        let {pageX, pageY} = stampPosition;
        
        if (typeof pageX !== 'undefined' &&
            typeof pageY !== 'undefined') {
            ctx.fillStyle = 'red';
            ctx.beginPath();
            ctx.arc(pageX, pageY, 55, 0, 2 * Math.PI);
            ctx.fill();
            ctx.closePath();
        }
    }
    
    function drawWashingMachine() {
        // all values totally scientific
        ctx.clearRect(0, 0, 280, 50);
        ctx.fillStyle = 'black';
        ctx.font = '40px sans-serif';
        ctx.textBaseline = 'top';
        ctx.fillText(`Washing: ${Math.round(washingRotation)}`, 10, 10);
    }
    
    function drawDistanceAsRadius() {
        let left = 10,
            top = canvas.height - 50;
        ctx.clearRect(left, top, 420, 50);
        ctx.fillStyle = 'black';
        ctx.font = '40px sans-serif';
        ctx.textBaseline = 'top';
        // 146 is the distance between the markers when they touch
        let adjustedDistance = Math.round(distanceRadius) * 2 - 146;
        adjustedDistance = (adjustedDistance < 0) ? 0 : adjustedDistance;
        ctx.fillText( `Radius distance: ${adjustedDistance}`, left, top);
    }
    
    function draw() {
        drawStamp();
        drawWashingMachine();
        drawDistanceAsRadius();
        drawing = false;
    }
    requestDraw();

    gispl.initTuio({
        host: 'ws://localhost:8080'
    });
});
