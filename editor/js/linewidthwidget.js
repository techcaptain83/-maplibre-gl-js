$.fn.drag = function(down, move, up) {
    return $(this).on('mousedown', function(e) {
        if (down(e)) {
            $(window)
                .on('mousemove', move)
                .one('mouseup', function(e) {
                    $(window).off('mousemove', move);
                    if (up) up(e);
                });
        }
    });
};

function formatNumber(num, maxdecimals) {
    maxdecimals = +maxdecimals;
    if (typeof maxdecimals !== 'number') maxdecimals = 0;
    var factor = Math.pow(10, maxdecimals);
    return (Math.round(num * factor) / factor).toFixed(maxdecimals).replace(/\.?0+$/, '');
}

function clamp(val, min, max) {
    return val > max ? max : val < min ? min : val;
}


module.exports = LineWidthWidget;
llmr.evented(LineWidthWidget);
function LineWidthWidget(stops) {
    var widget = this;

    this.pivot = null;
    this.stops = stops;

    this.clickTargetSize = 10;
    this.width = 255;
    this.height = 250;
    this.padding = {
        left: 44,
        top: 10,
        bottom: 35,
        right: 10
    };

    // setup Canvas.
    this.canvas = $('<canvas>').addClass('linewidth');
    this.resize();
    this.ctx = this.canvas.get(0).getContext('2d');
    this.ctx.scale(devicePixelRatio, devicePixelRatio);

    this.setupFocus();
    this.setupInteractivity();

    this.draw();
}

LineWidthWidget.prototype.snapZ = function(z) {
    // Find an existing stop that is close to the currently focused value
    // and snap to it.
    for (var i = 0; i < this.stops.length; i++) {
        if (Math.abs(this.stops[i].z - z) < 0.4) {
            return this.stops[i].z;
            break;
        }
    }
    return z;
};

LineWidthWidget.prototype.setupFocus = function() {
    var widget = this;
    this.canvas.on('mousemove', function(e) {
        var x = e.pageX - e.target.offsetLeft;
        var y = e.pageY - e.target.offsetTop;

        var z = clamp(widget.reverseX(x), 0, 20);
        widget.focus = widget.snapZ(z);
        widget.fire('focus', [ widget.focus ]);
        widget.draw();
    });

    this.canvas.on('contextmenu', function(e) {
        e.preventDefault();
    });

    this.canvas.on('mouseout', function() {
        widget.focus = undefined;
        widget.draw();
    });
};

LineWidthWidget.prototype.setupInteractivity = function() {
    var widget = this;
    var stop = null;
    this.canvas.drag(function down(e) {
        var offset = widget.canvas.offset();
        var x = e.pageX - offset.left;
        var y = e.pageY - offset.top;

        stop = widget.stopAtPosition(x, y);

        var rightClick = e.which == 3;

        if (stop && rightClick) {
            // Remove stops when right-clicking
            var i = widget.stops.indexOf(stop);
            widget.stops.splice(i, 1);
            e.preventDefault();
        }
        else if (!stop && !rightClick) {
            // Ad a new stop when clicking at an inactive region.
            stop = { z: widget.reverseX(x), val: widget.reverseY(y) };
            widget.stops.push(stop);
        }

        widget.updateStops();
        widget.draw();

        // Stop other interactions from happening on this canvas.
        e.stopPropagation();
        return stop;
    }, function move(e) {
        if (stop) {
            var offset = widget.canvas.offset();
            stop.val = widget.reverseY(e.pageY - offset.top);

            // Force to zoom level to remain the same when pressing Cmd.
            if (!e.metaKey) {
                stop.z = clamp(widget.reverseX(e.pageX - offset.left), 0, 20);
            } else {
                widget.focus = stop.z;
            }

            widget.updateStops();
            widget.draw();
            e.stopPropagation();
        }
    });
};

LineWidthWidget.prototype.stopAtPosition = function(x, y) {
    var r = this.clickTargetSize * this.clickTargetSize;
    var stop = null;
    for (var i = 0; i < this.transformedStops.length; i++) {
        var transformedStop = this.transformedStops[i];
        var dx = transformedStop.x - x;
        var dy = transformedStop.y - y;
        if (dx * dx + dy * dy < r) {
            stop = this.stops[i];
        }
    }
    return stop;
};

LineWidthWidget.prototype.updateStops = function() {
    this.stops.sort(function(a, b) {
        return a.z - b.z;
    });
    var parsers = llmr.StyleDeclaration.functionParsers;
    this.fn = parsers.stops.apply(parsers, this.stops);

    this.transformedStops = [];
    for (var i = 0; i < this.stops.length; i++) {
        var x = this.convertX(this.stops[i].z);
        var y = this.convertY(this.stops[i].val);

        this.transformedStops.push({ x: x, y: y });
    }

    this.fire('stops', [this.stops]);
};

LineWidthWidget.prototype.resize = function() {
    this.zfactor = Math.floor((this.width - this.padding.left - this.padding.right) / 20);
    this.yfactor = Math.floor((this.height - this.padding.top - this.padding.bottom) / 5);


    this.updateStops();

    this.canvas
        .attr({
            width: this.width * devicePixelRatio,
            height: this.height * devicePixelRatio
        })
        .css({
            width: this.width + 'px',
            height: this.height + 'px'
        });
};

// Converts the line width value to y pixel coordinates in this canvas.
LineWidthWidget.prototype.convertY = function(val) {
    return this.height - this.padding.bottom - this.yfactor * (Math.log(val) / Math.log(10) + 2) - 0.5;
};

// Converts y coordinates to to the line width.
LineWidthWidget.prototype.reverseY = function(val) {
    return Math.pow(10, (val - this.height + this.padding.bottom + 0.5) / -this.yfactor - 2);
};

// Converts the zoom level to the x pixel coordinate.
LineWidthWidget.prototype.convertX = function(val) {
    return this.padding.left + val * this.zfactor;
}

// Converst the x coordinate to the zoom level.
LineWidthWidget.prototype.reverseX = function(val) {
    return (val - this.padding.left) / this.zfactor;
};



LineWidthWidget.prototype.draw = function() {
    var ctx = this.ctx;
    var width = this.width;
    var height = this.height;
    var padding = this.padding;
    var stops = this.stops;
    var transformedStops = this.transformedStops;

    ctx.clearRect(0, 0, width, height);

    ctx.font = '10px Open Sans';
    ctx.lineWidth = 1;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';

    // horizontal lines
    ctx.textAlign = 'right';
    for (var y = 0.01; y <= 1000; y *= 10) {
        ctx.beginPath();
        ctx.fillText(formatNumber(y, 2), this.convertX(0) - 4, this.convertY(y) + 2);
        ctx.moveTo(this.convertX(0) - 1, this.convertY(y));
        ctx.lineTo(this.convertX(20), this.convertY(y));
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.stroke();

        ctx.beginPath();
        for (var i = 2; i < 10; i++) {
            ctx.moveTo(this.convertX(0) - 1, this.convertY(y * i));
            ctx.lineTo(this.convertX(20), this.convertY(y * i));
            }
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.stroke();
    }

    // vertical lines
    ctx.textAlign = 'right';
    ctx.beginPath();
    for (var z = 0; z <= 20; z++) {
        ctx.moveTo(this.convertX(z) - 0.5, this.convertY(1000));
        ctx.lineTo(this.convertX(z) - 0.5, this.convertY(0.01));

        ctx.save();
        ctx.translate(this.convertX(z), this.convertY(0.01) + 4);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText(z, 0, 3);
        ctx.restore();
    }
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.stroke();


    // Draw reference lines that show exponential width.
    ctx.beginPath();
    for (var i = 0; i < stops.length; i++) {
        var y1 = Math.pow(2, stops[i].z - 2) * (stops[i].val / Math.pow(2, stops[i].z));
        ctx.moveTo(this.convertX(stops[i].z - 2), this.convertY(y1));
        var y2 = Math.pow(2, stops[i].z + 2) * (stops[i].val / Math.pow(2, stops[i].z));
        ctx.lineTo(this.convertX(stops[i].z + 2), this.convertY(y2));
    }


    if (ctx.setLineDash) ctx.setLineDash([1, 2]);
    ctx.strokeStyle = '#888';
    ctx.lineWidth = 1;
    ctx.stroke();

    if (ctx.setLineDash) ctx.setLineDash([]);

    // Draw the actual curve.
    ctx.beginPath();
    // ctx.moveTo(this.convertX(0), this.convertY(Math.pow(2, 0) * (stops[0].val / Math.pow(2, stops[0].z))));

    for (var i = 0; i < transformedStops.length; i++) {
        ctx.lineTo(transformedStops[i].x, transformedStops[i].y);
    }
    // ctx.lineTo(this.convertX(20), this.convertY(Math.pow(2, 20) * (stops[i - 1].val / Math.pow(2, stops[i - 1].z))));

    ctx.strokeStyle = '#FFF';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    for (var i = 0; i < stops.length; i++) {
        ctx.beginPath();
        var x = this.convertX(stops[i].z);
        var y = this.convertY(stops[i].val);
        ctx.arc(x, y, 6, 0, Math.PI * 2, false);
        ctx.fill();
    }

    // Draw the red pivot marker indicating the current zoom level.
    if (typeof this.pivot === 'number' && !isNaN(this.pivot)) {
        this.drawMarker(this.pivot);
    }

    // Draw the gray focus marker indicating the mouse position's zoom level.
    if (typeof this.focus === 'number' && !isNaN(this.focus)) {
        this.drawMarker(this.focus, '#CCC');
    }
};

LineWidthWidget.prototype.drawMarker = function(pivot, color) {
    var ctx = this.ctx;

    if (!color) color = '#F00';

    ctx.beginPath();
    ctx.moveTo(Math.round(this.convertX(pivot)) - 0.5, this.convertY(1000));
    ctx.lineTo(Math.round(this.convertX(pivot)) - 0.5, this.convertY(0.01) + 16);
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = color;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(this.convertX(pivot) - 0.5, this.convertY(1000) - 3, 3, 0, Math.PI * 2, false)
    ctx.stroke();

    var y = this.fn(pivot - 1);
    var num = formatNumber(y, 2);
    ctx.textAlign = 'left';
    ctx.font = 'bold 10px Open Sans';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 3;

    var textSide = pivot >= 10 ? -1 : 1;

    var textX, textY;
    if (pivot >= 10) {
        textX = this.convertX(pivot) - 4;
        textY = this.convertY(y) - 2;
        ctx.textAlign = 'right';
    } else {
        textX = this.convertX(pivot) + 4;
        textY = this.convertY(y) + 10;
        ctx.textAlign = 'left';
    }
    ctx.strokeText(num, textX, textY);
    ctx.fillStyle = 'white';
    ctx.fillText(num, textX, textY);

    ctx.textAlign = 'center';
    ctx.font = 'bold 12px Open Sans';
    ctx.strokeText('z=' + (+pivot).toFixed(2), Math.round(this.convertX(pivot)) - 0.5, this.convertY(0.01) + 28);
    ctx.fillText('z=' + (+pivot).toFixed(2), Math.round(this.convertX(pivot)) - 0.5, this.convertY(0.01) + 28);
};

LineWidthWidget.prototype.setPivot = function(val) {
    this.pivot = val;
    this.draw();
};
