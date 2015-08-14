'use strict';

module.exports = LngLatBounds;

var LngLat = require('./lng_lat');

/**
 * Creates a bounding box from the given pair of points. If parameteres are omitted, a `null` bounding box is created.
 *
 * @class LngLatBounds
 * @classdesc A representation of rectangular box on the earth, defined by its southwest and northeast points in longitude and latitude.
 * @param {LngLat} sw southwest
 * @param {LngLat} ne northeast
 * @example
 * var sw = new mapboxgl.LngLat(0, 0);
 * var ne = new mapboxgl.LngLat(-10, 10);
 * var bounds = new mapboxgl.LngLatBounds(sw, ne);
 *
 */
function LngLatBounds(sw, ne) {
    if (!sw) return;

    var lnglats = ne ? [sw, ne] : sw;

    for (var i = 0, len = lnglats.length; i < len; i++) {
        this.extend(lnglats[i]);
    }
}

LngLatBounds.prototype = {

    /**
     * Extend the bounds to include a given LngLat or LngLatBounds.
     *
     * @param {LngLat|LngLatBounds} obj object to extend to
     * @returns {LngLatBounds} `this`
     */
    extend: function(obj) {
        var sw = this._sw,
            ne = this._ne,
            sw2, ne2;

        if (obj instanceof LngLat) {
            sw2 = obj;
            ne2 = obj;

        } else if (obj instanceof LngLatBounds) {
            sw2 = obj._sw;
            ne2 = obj._ne;

            if (!sw2 || !ne2) return this;

        } else {
            return obj ? this.extend(LngLat.convert(obj) || LngLatBounds.convert(obj)) : this;
        }

        if (!sw && !ne) {
            this._sw = new LngLat(sw2.lng, sw2.lat);
            this._ne = new LngLat(ne2.lng, ne2.lat);

        } else {
            sw.lng = Math.min(sw2.lng, sw.lng);
            sw.lat = Math.min(sw2.lat, sw.lat);
            ne.lng = Math.max(ne2.lng, ne.lng);
            ne.lat = Math.max(ne2.lat, ne.lat);
        }

        return this;
    },

    /**
     * Get the point equidistant from this box's corners
     * @returns {LngLat} centerpoint
     * @example
     * var bounds = new mapboxgl.LngLatBounds(
     *   new mapboxgl.LngLat(10, 10),
     *   new mapboxgl.LngLat(-10, -10);
     * bounds.getCenter(); // equals mapboxgl.LngLat(0, 0)
     */
    getCenter: function() {
        return new LngLat((this._sw.lng + this._ne.lng) / 2, (this._sw.lat + this._ne.lat) / 2);
    },

    /**
     * Get southwest corner
     * @returns {LngLat} southwest
     */
    getSouthWest: function() { return this._sw; },

    /**
     * Get northeast corner
     * @returns {LngLat} northeast
     */
    getNorthEast: function() { return this._ne; },

    /**
     * Get northwest corner
     * @returns {LngLat} northwest
     */
    getNorthWest: function() { return new LngLat(this.getWest(), this.getNorth()); },

    /**
     * Get southeast corner
     * @returns {LngLat} southeast
     */
    getSouthEast: function() { return new LngLat(this.getEast(), this.getSouth()); },

    /**
     * Get west edge longitude
     * @returns {number} west
     */
    getWest:  function() { return this._sw.lng; },

    /**
     * Get south edge latitude
     * @returns {number} south
     */
    getSouth: function() { return this._sw.lat; },

    /**
     * Get east edge longitude
     * @returns {number} east
     */
    getEast:  function() { return this._ne.lng; },

    /**
     * Get north edge latitude
     * @returns {number} north
     */
    getNorth: function() { return this._ne.lat; }
};

/**
 * constructs LngLatBounds from an array if necessary
 * @param {LngLatBounds|*} a any input
 * @returns {LngLatBounds|false}
 * @example
 * // calls LngLat.convert internally to
 * // support arrays as lnglat values
 * LngLatBounds.convert([[-10, -10], [10, 10]]);
 */
LngLatBounds.convert = function (a) {
    if (!a || a instanceof LngLatBounds) return a;
    return new LngLatBounds(a);
};
