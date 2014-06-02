'use strict';
var test = require('tape').test;
var getRanges = require('../js/text/ranges.js');

function mockFeature(obj) {
    obj.loadGeometry = function() { return {}; };
    return obj;
}

test('getRanges', function(t) {
    // Latin ranges.
    // Skips feature without text field.
    t.deepEqual({
        ranges: ['0-255'],
        text_features: [
            { geometry: {}, text: 'Pennsylvania Ave NW DC' },
            { geometry: {}, text: 'Baker St' },
            { geometry: {}, text: '14 St NW' }
        ],
        codepoints: [ 32, 49, 52, 65, 66, 67, 68, 78, 80, 83, 87, 97, 101, 105, 107, 108, 110, 114, 115, 116, 118, 121 ]
    }, getRanges([
        mockFeature({ 'name': 'Pennsylvania Ave NW DC' }),
        mockFeature({ 'name': 'Baker St' }),
        mockFeature({}),
        mockFeature({ 'name': '14 St NW' })
    ], {
        'text-field': 'name'
    }));

    // Non-latin ranges.
    t.deepEqual({
        ranges: [ '48128-48383', '49408-49663', '49664-49919', '50688-50943', '53760-54015' ],
        text_features: [
            { geometry: {}, text: '서울특별시' }
        ],
        codepoints: [ 48324, 49436, 49884, 50872, 53945 ]
    }, getRanges([
        mockFeature({ 'city': '서울특별시' })
    ], {
        'text-field': 'city'
    }));

    // Excludes unicode beyond 65533.
    t.deepEqual({
        ranges: [ '65280-65533' ],
        text_features: [
            { geometry: {}, text: '\ufff0' }
        ],
        codepoints: [ 65520 ]
    }, getRanges([
        mockFeature({ 'text': '\ufff0' }), // included
        mockFeature({ 'text': '\uffff' })  // excluded
    ], {
        'text-field': 'text'
    }));

    t.end();
});
