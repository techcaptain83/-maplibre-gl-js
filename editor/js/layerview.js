function LayerView(layer, bucket, style) {
    var view = this;
    this.layer = layer;
    this.bucket = bucket;
    this.style = style;


    this.root = $('<li class="layer">').attr('data-id', layer.id);
    var header = $('<div class="header">').appendTo(this.root);
    this.body = $('<div class="body">').appendTo(this.root);
    var handle = $('<div class="icon handle-icon">');
    var type = $('<div class="tab tab-type"><div class="type">');
    var color = $('<div class="tab tab-color"><div class="color">');
    var name = $('<div class="tab tab-name"><div class="name">');
    var symbol = $('<div class="tab tab-symbol"><div class="sprite-icon symbol">');
    var count = this.count = $('<span class="feature-count">').text(0);
    var hide = $('<div class="icon hide-icon">');
    var remove = $('<div class="icon remove-icon">');

    if (bucket.type == 'background') {
        this.root.addClass('background');
        name.find('.name').text('Background');
        header.append(type.find('.type'), color, name);
    } else if (bucket.type == 'fill' || bucket.type == 'line') {
        name.find('.name').text(layer.data.bucket + (layer.data.name ? ('/' + layer.data.name) : ''));
        header.append(handle, type, color, name, count, remove, hide);
    } else if (bucket.type == 'point') {
        name.find('.name').text(layer.data.bucket + (layer.data.name ? ('/' + layer.data.name) : ''));
        header.append(handle, type, symbol, name, count, remove, hide);
        style.on('change:sprite', function() {
            view.updateImage();
        });
    }

    function update() {
        view.updateType();
        if (layer.data.color) view.updateColor();
        if (layer.data.image) view.updateImage();
    }

    layer.on('change', update);
    update();

    if (this.layer.data.hidden) {
        this.root.addClass('hidden');
    }

    this.addEffects();

    this.root.click(function() { return false; });
    header.click(this.activate.bind(this));
    remove.click(this.remove.bind(this));
    hide.click(this.hide.bind(this));
}

llmr.evented(LayerView);

LayerView.prototype.addEffects = function() {
    var view = this;
    this.root.find('.name').hover(function(e) {
        var newLayer = null;
        if (e.type == 'mouseenter') {
            var data = util.clone(view.layer.data);
            data.color = '#FF0000';
            data.pulsating = 1000;
            data.hidden = false;
            newLayer = new llmr.StyleLayer(data, view.style);
        }

        view.style.highlight(newLayer, null);
    });
};

LayerView.prototype.setCount = function(count) {
    this.count.text(count);
    this.root.toggleClass('empty', count === 0);
};

LayerView.prototype.deactivate = function() {
    this.root.removeClass('active');
    this.root.removeClass('tab-color tab-name tab-type tab-symbol');
    this.fire('deactivate');
    this.tab = null;
    this.body.empty();
};

LayerView.prototype.updateType = function() {
    var bucket = this.bucket;
    this.root.find('.type').addClass('icon').addClass(bucket.type + '-icon').attr('title', titlecase(bucket.type));
};

LayerView.prototype.updateColor = function() {
    var layer = this.layer.data;
    this.root.find('.color')
        .css("background", layer.color)
        .toggleClass('dark', llmr.chroma(layer.color).luminance() < 0.075);
};

LayerView.prototype.updateImage = function() {
    var layer = this.layer.data;
    var sprite = this.style.sprite;
    if (sprite.loaded) {
        var position = sprite.data[layer.image].sizes[18];
        this.root.find('.symbol')
            .removeClass(function (i, css) { return (css.match(/\bsprite-icon-\S+\b/g) || []).join(' '); })
            .addClass('sprite-icon-' + layer.image + '-18');
    }
};

LayerView.prototype.activate = function(e) {
    var self = this;

    var tab = null;
    if (typeof e === 'object' && e.toElement) {
        var target = $(e.toElement);
        if (target.is('.color')) { tab = 'color'; }
        else if (target.is('.name')) { tab = 'name'; }
        else if (target.is('.type') && this.bucket.type != 'background') { tab = 'type'; }
        else if (target.is('.symbol')) { tab = 'symbol'; }
    } else if (typeof e === 'string') {
        tab = e;
    }

    if (tab === this.tab || !tab) {
        if (this.root.is('.active')) {
            this.deactivate();
        }
        return;
    }


    this.tab = tab;
    this.body.empty();
    this.root.addClass('active');
    if (tab) {
        this.root.removeClass('tab-color tab-name tab-type tab-symbol').addClass('tab-' + tab);
    }
    this.fire('activate');

    var bucket = this.bucket;
    var layer = this.layer;

    if (tab === 'color') {
        var picker = $("<div class='colorpicker'></div>");
        var hsv = llmr.chroma(layer.data.color).hsv();
        new Color.Picker({
            hue: (hsv[0] || 0),
            sat: hsv[1] * 100,
            val: hsv[2] * 100,
            element: picker[0],
            callback: function(hex) {
                layer.setColor('#' + hex);
                // self.fire('update');
            }
        });
        this.body.append(picker);
    }
    else if (tab === 'width') {
        var stops = layer.width.slice(1);
        var widget = new LineWidthWidget(stops);
        widget.on('stops', function(stops) {
            layer.setWidth(['stops'].concat(stops));
            self.fire('update');
        });

        // this.app.map.on('zoom', function(e) {
        //     widget.setPivot(self.app.map.transform.z + 1);
        // });

        // widget.setPivot(self.app.map.transform.z + 1);

        widget.canvas.appendTo(this.body[0]);
    }
    else if (tab === 'type') {
        this.body.append($('<div>').text("TODO: select type"));
    }
    else if (tab === 'symbol') {
        var sprite = this.style.sprite;
        var symbols = {};

        var container = $('<div class="icons">').appendTo(self.body);

        Object.keys(sprite.data).forEach(function(key) {
            var icon = sprite.data[key];
            var symbol = $('<div>')
                .attr('title', icon.name)
                .addClass('sprite-icon sprite-icon-' + key + '-18')
                .appendTo(container)
                .click(function() {
                    $(this).addClass('selected').siblings('.selected').removeClass('selected');
                    layer.setImage(key);
                });

            if (key === layer.data.image) {
                symbol.addClass('selected');
            }
            symbols[key] = symbol;
        });

        var input = $('<div class="icon-filter"><input type="search" placeholder="Enter Keywords…"></div>').prependTo(self.body).find('input');
        input
            .focus()
            .on('input paste click', function() {
                var text = input.val();
                if (text.length) {
                    container.addClass('dim');
                    var keys = sprite.search(input.val());
                    for (var key in symbols) {
                        symbols[key].toggleClass('highlighted', keys.indexOf(key) >= 0);
                    }
                } else {
                    container.removeClass('dim');
                }
            });

    }
    else if (tab === 'name') {
        var view = this;
        var input = $('<input type="text" placeholder="(optional)">');
        input.val(view.layer.data.name || '');
        input.keyup(function() {
            view.layer.setName(input.val());
            view.layer.name = input.val();
            view.root.find('.name').text(view.layer.data.bucket + (view.layer.data.name ? ('/' + view.layer.data.name) : ''));
        });
        this.body.append(input);
        input.wrap('<div class="border"><label> Name: </label></div>');
    }

    return false;
};

LayerView.prototype.hide = function() {
    this.layer.toggleHidden();
    this.root.toggleClass('hidden', this.layer.data.hidden);
    this.fire('update');
    return false;
};

LayerView.prototype.remove = function() {
    this.root.remove();
    this.layer.fire('remove');
    this.fire('remove');
};
