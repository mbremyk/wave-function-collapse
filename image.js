class TileImage {
    constructor (path, rotation = 0) {
        this.image = new Image();
        this.image.src = path;
        this.rotation = rotation;
    }

    draw(context, x, y, width, height) {
        context.save();
        context.setTransform(1, 0, 0, 1, x + width / 2, y + height / 2);
        context.rotate(this.rotation);
        context.drawImage(this.image, -width / 2, -height / 2, width, height);
        context.restore();
    }

    clone() {
        return new TileImage(this.image.src, this.rotation);
    }
}