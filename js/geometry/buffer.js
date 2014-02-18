'use strict';

// a simple wrapper around a single arraybuffer

module.exports = Buffer;

function Buffer(buffer) {
    if (!buffer) {
        this.array = new ArrayBuffer(this.defaultLength);
        this.length = this.defaultLength;
        this.setupViews();

    } else {
        this.array = buffer.array;
        this.pos = buffer.pos;
    }
}

Buffer.prototype = {
    pos: 0,
    itemSize: 4,
    defaultLength: 8192,
    arrayType: 'ARRAY_BUFFER',

    get index() {
        return this.pos / this.itemSize;
    },

    setupViews: function() {
        this.ubytes = new Uint8Array(this.array);
        this.bytes = new Int8Array(this.array);
        this.ushorts = new Uint16Array(this.array);
        this.shorts = new Int16Array(this.array);
    },

    // binds the buffer to a webgl context
    bind: function(gl) {
        var type = gl[this.arrayType];
        if (!this.buffer) {
            this.buffer = gl.createBuffer();
            gl.bindBuffer(type, this.buffer);
            gl.bufferData(type, this.array.slice(0, this.pos), gl.STATIC_DRAW);

            // dump array buffer once it's bound to gl
            this.array = null;
        } else {
            gl.bindBuffer(type, this.buffer);
        }
    },

    // increase the buffer size by at least /required/ bytes.
    resize: function(required) {
        if (this.length < this.pos + required) {
            while (this.length < this.pos + required) {
                // increase the length 1.5x times but keep it even
                this.length = Math.round(this.length * 1.5 / 2) * 2;
            }

            this.array = new ArrayBuffer(this.length);

            var ubytes = new Uint8Array(this.array);
            ubytes.set(this.ubytes);

            this.setupViews();
        }
    }
};
