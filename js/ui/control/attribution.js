'use strict';

var Control = require('./control.js'),
    DOM = require('../../util/dom.js'),
    util = require('../../util/util.js');

module.exports = Attribution;

function Attribution() {}

Attribution.prototype = util.inherit(Control, {
    onAdd: function(map) {
        var className = 'mapboxgl-ctrl-attrib',
            container = this._container = DOM.create('div', className, map.container);

        this._update();
        map.on('source.add', this._update.bind(this));
        map.on('moveend', this._updateEditLink.bind(this));

        return container;
    },

    _update: function() {
        var attributions = [];
        for (var id in this._map.sources) {
            var source = this._map.sources[id];
            if (source.tileJSON && source.tileJSON.attribution) {
                attributions.push(source.tileJSON.attribution);
            }
        }
        this._container.innerHTML = attributions.join(' | ');
        this._editLink = this._container.getElementsByClassName('mapbox-improve-map')[0];
        this._updateEditLink();
    },

    _updateEditLink: function() {
        if (this._editLink) {
            var center = this._map.getCenter();
            this._editLink.href = 'https://www.mapbox.com/map-feedback/#/' +
                    center.lng + '/' + center.lat + '/' + Math.round(this._map.getZoom() + 1);
        }
    }
});
