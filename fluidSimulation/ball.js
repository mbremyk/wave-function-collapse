class Ball {
    constructor (x, y, r, colour) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.vx = 0;
        this.vy = 0;
        this.colour = colour ? colour : 'blue';
    }

    equals(ball) {
        if (this == ball) return true;
        if (this.x == ball.x && this.y == ball.y) return true;
        return false;
    }

    dist(ball) {
        let x = ball.x - this.x;
        let y = ball.y - this.y;
        return Math.sqrt(x ** 2 + y ** 2);
    }

    draw(ctx) {
        let circle = new Path2D();
        circle.arc(this.x, this.y, this.r, 0, 2 * Math.PI, false);

        ctx.fillStyle = this.colour;
        ctx.fill(circle);
    }

    move(delta) {
        this.x += this.vx / delta;
        this.y += this.vy / delta;
    }
}