import gispl from '../source/gispl';
import $ from 'jquery';

$(document).ready(() => {
    let radius150 = 'r-150';
    
    gispl.addGesture({
        name: radius150,
        features: [
            {type: 'ObjectGroup', constraints: [2, 5, 150]}
        ]
    });
    
    let canvas = document.getElementById("canvas"),
        ctx = canvas.getContext("2d");
    
    canvas.width = document.body.clientWidth;
    canvas.height = document.body.clientHeight;
    
    gispl(canvas).on(radius150, function(event) {
        let radius = event.featureValues.objectgroup.radius,
            center = event.featureValues.objectgroup.midpoint;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        ctx.beginPath();
        ctx.arc(center.pageX, center.pageY, radius, 0, 2 * Math.PI);
        ctx.fillStyle = 'green';
        ctx.fill();
        ctx.closePath();
        
        ctx.beginPath();
        ctx.arc(center.pageX, center.pageY, 150, 0, 2 * Math.PI);
        ctx.fillStyle = 'black';
        ctx.stroke();
        ctx.closePath();
    });

    gispl.initTuio({
        host: 'ws://localhost:8080'
    });
});
