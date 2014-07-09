'use strict';

var test = require('tape').test;
var createContext = require('./lib/gl.js');
var glutil = require('../js/render/glutil.js');

test('GLUtil', function(t) {
    t.test('extend', function(t) {
        var gl = createContext();
        glutil.extend(gl);
        t.ok(gl.getShader);
        t.ok(gl.initializeShader);
        t.ok(gl.switchShader);
        t.end();
    });
});
