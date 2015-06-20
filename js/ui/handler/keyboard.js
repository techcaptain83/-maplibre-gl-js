'use strict';

module.exports = Keyboard;


var panDelta = 80,
    rotateDelta = 2;


function Keyboard(map) {
    this._map = map;
    this._el = map.getCanvasContainer();

    this._onKeyDown = this._onKeyDown.bind(this);
}

Keyboard.prototype = {
    enable: function () {
        this._el.addEventListener('keydown', this._onKeyDown, false);
    },

    disable: function () {
        this._el.removeEventListener('keydown', this._onKeyDown);
    },

    _onKeyDown: function (e) {
        if (e.altKey || e.ctrlKey || e.metaKey) return;

        var map = this._map;

        switch (e.keyCode) {
        case 61:
        case 107:
        case 171:
        case 187:
            map.zoomTo(Math.round(map.getZoom()) + (e.shiftKey ? 2 : 1));
            break;

        case 189:
        case 109:
        case 173:
            map.zoomTo(Math.round(map.getZoom()) - (e.shiftKey ? 2 : 1));
            break;

        case 37:
            if (e.shiftKey) {
                map.setBearing(map.getBearing() - rotateDelta);
            } else {
                map.panBy([-panDelta, 0]);
            }
            break;

        case 39:
            if (e.shiftKey) {
                map.setBearing(map.getBearing() + rotateDelta);
            } else {
                map.panBy([panDelta, 0]);
            }
            break;

        case 38:
            map.panBy([0, -panDelta]);
            break;

        case 40:
            map.panBy([0, panDelta]);
            break;
        }
    }
};
