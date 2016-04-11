import gispl from '../source/gispl';
import $ from 'jquery';

$(document).ready(() => {
    let radius250 = 'r-radius',
        definedRadius = 250;
    
    gispl.addGesture({
        name: radius250,
        features: [
            {type: 'ObjectGroup', constraints: [2, 5, definedRadius]}
        ]
    });
    
    let canvas = document.getElementById('canvas'),
        ctx = canvas.getContext('2d'),
        drawing = false,
        center,
        radius;
    
    canvas.width = document.body.clientWidth;
    canvas.height = document.body.clientHeight;
    
    gispl(canvas)
        .on(radius250, function(event) {
            radius = event.featureValues.objectgroup.radius,
            center = event.featureValues.objectgroup.midpoint;
            requestDraw();
        })
        .on('inputend', function() {
            clear();
        });
    
    function requestDraw() {
        if (!drawing) {
            requestAnimationFrame(draw);
            drawing = true;
        }
    }
    
    function clear() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    
    function draw() {
        
        clear();
                
        ctx.beginPath();
        ctx.arc(center.pageX, center.pageY, radius, 0, 2 * Math.PI);
        ctx.fillStyle = 'green';
        ctx.fill();
        ctx.closePath();
        
        ctx.beginPath();
        ctx.arc(center.pageX, center.pageY, definedRadius, 0, 2 * Math.PI);
        ctx.fillStyle = 'black';
        ctx.stroke();
        ctx.closePath();
        
        drawing = false;
    }

    gispl.initTuio({
        host: 'ws://localhost:8080'
    });
});
