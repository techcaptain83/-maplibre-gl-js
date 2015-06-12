'use strict';

module.exports = create;

module.exports['interpolated'] = create;

module.exports['piecewise-constant'] = function (parameters) {
    if (parameters.stops || parameters.range) {
        parameters = clone(parameters);
        parameters.rounding = 'floor';
    }

    return create(parameters);
}

function create(parameters) {

    // If the scale doesn't define a range or stops, no interpolation will
    // occur and the output value is a constant.
    if (!(parameters.stops) && !(parameters.range)) {
        assert(parameters.rounding === undefined);
        return function() { return parameters; }
    }

    // START BACKWARDS COMPATIBILITY TRANSFORMATIONS

    // If parameters.stops is specified, deconstruct it into a domain and range.
    if (parameters.stops) {
        parameters.domain = [];
        parameters.range = [];

        for (var i = 0; i <parameters.stops.length; i++) {
            parameters.domain.push(parameters.stops[i][0]);
            parameters.range.push(parameters.stops[i][1]);
        }
    }

    // END BACKWARDS COMPATIBILTY TRANSFORMATIONS

    return function(zoom, attributes) {
        assert(!attributes || typeof(attributes) === 'object');

        assert(parameters.range.length === parameters.domain.length);

        if (parameters.property === undefined) parameters.property = '$zoom';
        if (parameters.rounding === undefined) parameters.rounding = 'none';
        if (parameters.base === undefined) parameters.base = 1;

        assert(parameters.domain);
        assert(parameters.range);
        assert(parameters.domain.length === parameters.range.length);

        var input = parameters.property === '$zoom' ? zoom : attributes[parameters.property];

        // Find the first domain value larger than input
        var i = 0;
        while (true) {
            if (i >= parameters.domain.length) break;
            else if (input < parameters.domain[i]) break;
            else if (parameters.rounding === 'ceiling' && input === parameters.domain[i]) break;
            else i++;
        }

        // Interpolate to get the output
        if (i === 0 || (parameters.rounding === 'ceiling' && i < parameters.range.length)) {
            return parameters.range[i];

        } else if (i === parameters.range.length || parameters.rounding === 'floor') {
            return parameters.range[i - 1];

        } else if (parameters.rounding === 'none') {
            return interpolate(
                input,
                parameters.base,
                parameters.domain[i - 1],
                parameters.domain[i],
                parameters.range[i - 1],
                parameters.range[i]
            );

        } else {
            assert('false');
        }
    }
}

function interpolate(input, base, inputLower, inputUpper, outputLower, outputUpper) {
    if (outputLower.length) {
        return interpolateArray.apply(this, arguments);
    } else {
        return interpolateNumber.apply(this, arguments);
    }
}

function interpolateNumber(input, base, inputLower, inputUpper, outputLower, outputUpper) {
    var difference =  inputUpper - inputLower;
    var progress = input - inputLower;

    var ratio;
    if (base === 1) {
        ratio = progress / difference;
    } else {
        ratio = (Math.pow(base, progress) - 1) / (Math.pow(base, difference) - 1);
    }

    return (outputLower * (1 - ratio)) + (outputUpper * ratio);
}

function interpolateArray(input, base, inputLower, inputUpper, outputLower, outputUpper) {
    var output = [];
    for (var i = 0; i < outputLower.length; i++) {
        output[i] = interpolateNumber(input, base, inputLower, inputUpper, outputLower[i], outputUpper[i]);
    }
    return output;
}

function clone(input) {
    if (input === null || typeof(input) !== 'object') return input;

    var output = input.constructor();

    for (var key in input) {
        if (Object.prototype.hasOwnProperty.call(input, key)) {
            output[key] = clone(input[key]);
        }
    }

    return output;
}

function assert(predicate, message) {
    if (!predicate) {
        throw new Error(message || 'Assertion failed');
    }
}
