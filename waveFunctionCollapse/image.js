class TileImage {
    constructor (path, sides, rotation = 0, enabled = true) {
        this.image = new Image();
        this.image.src = path;
        this.sides = sides;
        this.rotation = rotation;
        this.enabled = enabled;
    }

    draw(context, x, y, width, height) {
        context.save();
        context.setTransform(1, 0, 0, 1, x + width / 2, y + height / 2);
        context.rotate(this.rotation);
        context.drawImage(this.image, -width / 2, -height / 2, width, height);
        context.restore();
    }

    clone() {
        return new TileImage(this.image.src, this.sides, this.rotation);
    }
}