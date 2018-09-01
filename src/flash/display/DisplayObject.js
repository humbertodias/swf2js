/**
 * @constructor
 */
var DisplayObject = function ()
{
    EventDispatcher.call(this);

    // origin param
    this._$id          = null;
    this._$characterId = null;
    this._$stageId     = null;
    this._$containerId = null;
    this._$parent      = null;
    this._$variables   = {};
    this._$poolContext = null;


    // controller
    this._$index           = 0;
    this._$startFrame      = 1;
    this._$endFrame        = 0;


    // clip
    this._$clipDepth = 0;

    // property
    this._$accessibilityProperties = new AccessibilityProperties();
    this._$name                    = "";
    this._$transform               = new Transform(this);

};

/**
 * extends
 * @type {EventDispatcher}
 */
DisplayObject.prototype = Object.create(EventDispatcher.prototype);
DisplayObject.prototype.constructor = DisplayObject;

/**
 * properties
 */
Object.defineProperties(DisplayObject.prototype, {
    id: {
        /**
         * @returns {number}
         */
        get: function () {
            return this._$id;
        },
        /**
         * @param {number} id
         */
        set: function (id) {
            if (typeof id === "number") {
                this._$id = id;
            }
        }
    },
    characterId: {
        /**
         * @returns {number}
         */
        get: function () {
            return this._$characterId;
        },
        /**
         * @param {number} character_id
         */
        set: function (character_id) {
            if (typeof character_id === "number") {
                this._$characterId = character_id;
            }
        }
    },
    container: {
        /**
         * @returns {Stage}
         */
        get: function () {
            return (this._$containerId !== null) ? this.$stages[this._$containerId] : this._$containerId;
        },
        /**
         * @param {Stage} stage
         */
        set: function (stage) {
            if (this._$containerId === null && stage instanceof Stage) {
                this._$containerId = stage.id;
            }
        }
    },
    stage: {
        /**
         * @returns {Stage}
         */
        get: function () {
            return (this._$stageId !== null) ? this.$stages[this._$stageId] : this._$stageId;
        },
        /**
         * @param {Stage} stage
         */
        set: function (stage) {
            if (this._$stageId === null && stage instanceof Stage) {
                this._$stageId = stage.id;
            }
        }
    },
    parent: {
        /**
         * @returns {DisplayObject}
         */
        get: function () {
            return this._$parent;
        },
        /**
         * @param {DisplayObject} parent
         */
        set: function (parent) {
            if (parent instanceof DisplayObject) {
                this._$parent = parent;
            }
        }
    },
    root: {
        /**
         * @returns {MainTimeline}
         */
        get: function () {
            return this.stage._root;
        },
        /**
         * readonly
         */
        set: function () {}
    },
    accessibilityProperties: {
        /**
         * @returns {AccessibilityProperties}
         */
        get: function () {
            return this._$accessibilityProperties;
        },
        /**
         * @param {AccessibilityProperties} accessibility_properties
         */
        set: function (accessibility_properties) {
            if (accessibility_properties instanceof AccessibilityProperties) {
                this._$accessibilityProperties = accessibility_properties;
            }
        }
    },
    blendMode: {
        /**
         * @return {string}
         */
        get: function () {

            if (this.transform._$blendMode) {

                return this.transform._$blendMode;

            }

            var placeObject = this._$getPlaceObject();
            if (placeObject) {

                return placeObject.blendMode;

            }

            this.transform._$transform();
            return this.transform._$blendMode;

        },
        /**
         * @param  {string|number} blend_mode
         * @return void
         */
        set: function (blend_mode) {
            this.transform._$transform(null, null, null, blend_mode);
        }
    },
    name: {
        /**
         * @returns {string}
         */
        get: function () {
            return this._$name + "";
        },
        /**
         * @param {string} name
         */
        set: function (name) {
            this._$name = name + "";
        }
    },
    filters: {
        /**
         * @return {string}
         */
        get: function () {

            if (this.transform._$filters) {

                return this.transform._$filters;

            }

            var placeObject = this._$getPlaceObject();
            if (placeObject) {

                return placeObject.filters;

            }

            this.transform._$transform();
            return this.transform._$filters;

        },
        /**
         * @param  {array} filters
         * @return void
         */
        set: function (filters) {
            this.transform._$transform(null, null, filters, null);
        }
    },
    transform: {
        /**
         * @returns {Transform}
         */
        get: function () {
            return this._$transform;
        },
        /**
         * @param   {Transform} transform
         * @returns void
         */
        set: function (transform) {
            if (transform instanceof Transform) {
                this._$transform = transform;
            }
        }
    }
});

/**
 * @return {PlaceObject|null}
 */
DisplayObject.prototype._$getPlaceObject = function ()
{
    var parent = this.parent;
    if (!parent) {
        return null;
    }

    var frame = parent.currentFrame|0;
    if (!(frame in parent._$placeController)) {
        return null;
    }

    var id = parent._$placeController[frame][this._$index];

    return parent._$placeObjects[id];
};

/**
 * @param   {MovieClip} parent
 * @param   {object}    tag
 * @returns void
 */
DisplayObject.prototype._$commonBuild = function (parent, tag)
{
    // set param
    this._$index = tag.Depth|0;

    if ("StartFrame" in tag) {
        this._$startFrame = tag.StartFrame|0;
    }

    if ("EndFrame" in tag) {
        this._$endFrame = tag.EndFrame|0;
    }
};

/**
 * @param  {array} matrix
 * @return {array}
 */
DisplayObject.prototype._$preDraw = function (matrix)
{
    if (this.filters.length || this.blendMode !== BlendMode.NORMAL) {

        this._$poolContext = this.stage.player._$preContext;

        // reset
        this.stage.player._$preContext = null;

        var player = this.stage.player;
        var xScale = +(player.scale * player.ratio);
        var yScale = +(player.scale * player.ratio);

        var bounds = this._$getBounds(null);
        var xMax   = +bounds.xMax;
        var xMin   = +bounds.xMin;
        var yMax   = +bounds.yMax;
        var yMin   = +bounds.yMin;

        var width  = this.$abs(this.$ceil((xMax - xMin) * xScale))|0;
        var height = this.$abs(this.$ceil((yMax - yMin) * yScale))|0;

        // start canvas
        var canvas    = this.$cacheStore.getCanvas();
        canvas.width  = width;
        canvas.height = height;

        // start context
        var context = canvas.getContext("2d");

        var x = xMin * xScale;
        var y = yMin * yScale;

        // offset
        context._$offsetX = 0;
        context._$offsetY = 0;
        context._$dx      = x;
        context._$dy      = y;

        this.stage.player._$preContext = context;

        return [matrix[0], matrix[1], matrix[2], matrix[3], -x, -y];

    }

    return matrix;
};

/**
 * @param  {array} matrix
 * @param  {array} color_transform
 * @return void
 */
DisplayObject.prototype._$postDraw = function (matrix, color_transform)
{
    if (this._$poolContext) {

        var ctx    = this.stage.player._$preContext;
        var width  = ctx.canvas.width|0;
        var height = ctx.canvas.height|0;

        // filter
        var length = this.filters.length;
        if (length) {
            var idx = 0;
            while (length > idx) {

                var filter = this.filters[idx];

                ctx = filter._$applyFilter(ctx, color_transform, this.stage.player);

                idx = (idx + 1)|0;
            }
        }

        // blend
        if (this.blendMode !== BlendMode.NORMAL) {

            ctx.setTransform(1, 0, 0, 1, 0, 0);

            var operation = "source-over";
            switch (this.blendMode) {

                case BlendMode.MULTIPLY:
                    operation = BlendMode.MULTIPLY;
                    break;

                case BlendMode.SCREEN:
                    operation = BlendMode.SCREEN;
                    break;

                case BlendMode.LIGHTEN:
                    operation = BlendMode.LIGHTEN;
                    break;

                case BlendMode.DARKEN:
                    operation = BlendMode.DARKEN;
                    break;

                case BlendMode.DIFFERENCE:
                    operation = BlendMode.DIFFERENCE;
                    break;

                case BlendMode.ADD:
                    operation = "lighter";
                    break;

                case BlendMode.SUBTRACT:

                    ctx.globalCompositeOperation = BlendMode.DIFFERENCE;
                    ctx.fillStyle = "rgb(255,255,255)";
                    ctx.fillRect(0, 0, width, height);

                    ctx.globalCompositeOperation = BlendMode.DARKEN;
                    ctx.fillStyle = "rgb(255,255,255)";
                    ctx.fillRect(0, 0, width, height);

                    operation = "color-burn";
                    break;

                case BlendMode.INVERT:

                    ctx.globalCompositeOperation = BlendMode.DIFFERENCE;
                    ctx.fillStyle = "rgb(255,255,255)";
                    ctx.fillRect(0, 0, width, height);

                    ctx.globalCompositeOperation = "lighter";
                    ctx.fillStyle = "rgb(255,255,255)";
                    ctx.fillRect(0, 0, width, height);

                    operation = BlendMode.DIFFERENCE;
                    break;

                case BlendMode.ALPHA:
                    operation = "source-over";
                    break;

                case BlendMode.ERASE:
                    operation = "destination-out";
                    break;

                case BlendMode.OVERLAY:
                    operation = BlendMode.OVERLAY;
                    break;

                case BlendMode.HARDLIGHT:
                    operation = "hard-light";
                    break;

                default:
                    break;

            }

            ctx.globalAlpha = 1;
            ctx.globalCompositeOperation = operation;

        }

        var m = this.$multiplicationMatrix([1, 0, 0, 1, ctx._$dx, ctx._$dy], matrix);

        this._$poolContext.setTransform(1, 0, 0, 1, m[4], m[5]);
        this._$poolContext.drawImage(ctx.canvas, 0, 0, width, height);

        this.stage.player._$preContext = this._$poolContext;

        // reset
        this._$poolContext = null;
    }
};