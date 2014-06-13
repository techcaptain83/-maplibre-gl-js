'use strict';

var ElementGroups = require('./elementgroups.js');

module.exports = FillBucket;

function FillBucket(info, buffers, placement, elementGroups) {
    this.info = info;
    this.buffers = buffers;
    this.elementGroups = elementGroups || new ElementGroups(buffers.fillVertex, buffers.fillElement);
}

FillBucket.prototype.addFeature = function(lines) {
    for (var i = 0; i < lines.length; i++) {
        this.addFill(lines[i]);
    }
};


FillBucket.prototype.addFill = function(vertices) {
    if (vertices.length < 3) {
        console.warn('a fill must have at least three vertices');
        return;
    }

    // Calculate the total number of vertices we're going to produce so that we
    // can resize the buffer beforehand, or detect whether the current line
    // won't fit into the buffer anymore.
    // In order to be able to use the vertex buffer for drawing the antialiased
    // outlines, we separate all polygon vertices with a degenerate (out-of-
    // viewplane) vertex.

    var len = vertices.length;

    // Check whether this geometry buffer can hold all the required vertices.
    this.elementGroups.makeRoomFor(len + 1);
    var elementGroup = this.elementGroups.current;

    var fillVertex = this.buffers.fillVertex;
    var fillElement = this.buffers.fillElement;

    // Start all lines with a degenerate vertex
    fillVertex.addDegenerate();
    elementGroup.vertexLength++;

    // We're generating triangle fans, so we always start with the first coordinate in this polygon.
    var firstIndex = fillVertex.index - elementGroup.vertexStartIndex,
        prevIndex, currentIndex, currentVertex;

    for (var i = 0; i < vertices.length; i++) {
        currentIndex = fillVertex.index - elementGroup.vertexStartIndex;
        currentVertex = vertices[i];

        fillVertex.add(currentVertex.x, currentVertex.y);
        elementGroup.vertexLength++;

        // Only add triangles that have distinct vertices.
        if (i >= 2 && (currentVertex.x !== vertices[0].x || currentVertex.y !== vertices[0].y)) {
            fillElement.add(firstIndex, prevIndex, currentIndex);
            elementGroup.elementLength++;
        }

        prevIndex = currentIndex;
    }
};

FillBucket.prototype.toJSON = function() {
    return {
        indices: this.elementGroups
    };
};
