var test = require('tap').test;
var spec = require('./');

for (var v in spec) test(v, function(t) {
    for (var k in spec[v]) {
        // Exception for version.
        if (k === '$version') {
            t.equal(typeof spec[v].$version, 'number', '$version (number)');
        } else {
            validSchema(k, t, spec[v][k], spec[v]);
        }
    }
    t.end();
});

function validSchema(k, t, obj, ref) {
    var scalar = ['boolean','string','number'];
    var types = Object.keys(ref).concat(['boolean','string','number','array','enum','color','*']);
    var keys = [
        'default',
        'doc',
        'function',
        'required',
        'transition',
        'type',
        'value',
        'values'
    ];

    // Schema object.
    if (Array.isArray(obj.type) || typeof obj.type === 'string') {
        // schema must have only known keys
        for (var attr in obj)
            t.ok(keys.indexOf(attr) !== -1, k + '.' + attr);

        // schema type must be js native, 'color', or present in ref root object.
        t.ok(types.indexOf(obj.type) !== -1, k + '.type (' + obj.type + ')');

        // schema type is an enum, it must have 'values' and they must be scalars.
        if (obj.type === 'enum') t.ok(Array.isArray(obj.values) && obj.values.every(function(v) {
            return scalar.indexOf(typeof v) !== -1;
        }), k + '.values [' + obj.values +']');

        // schema type is array, it must have 'value' and it must be a type.
        if (obj.value !== undefined)
            t.ok(types.indexOf(obj.value) !== -1, k + '.value (' + obj.value + ')');

        // schema key type checks
        if (obj.doc !== undefined)
            t.equal('string', typeof obj.doc, k + '.doc (string)');
        if (obj.function !== undefined)
            t.equal('boolean', typeof obj.function, k + '.function (boolean)');
        if (obj.required !== undefined)
            t.equal('boolean', typeof obj.required, k + '.required (boolean)');
        if (obj.transition !== undefined)
            t.equal('boolean', typeof obj.transition, k + '.transition (boolean)');
    // Array of schema objects or references.
    } else if (Array.isArray(ref[k])) {
        obj.forEach(function(child, j) {
            validSchema(k + '[' + j + ']', t, typeof child === 'object' ? child : ref[child], ref);
        });
    // Container object.
    } else if (typeof obj === 'object') {
        for (var j in obj) validSchema(k + '.' + j, t, obj[j], ref);
    // Invalid ref object.
    } else {
        t.ok(false, 'Invalid: ' + k);
    }
}

