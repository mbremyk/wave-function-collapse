let rng = new RNG(2);

class Tile {
    constructor (index) {
        this.index = index;
        this.possibleValues = [0, 1, 2, 3, 4];
        this.collapsed = false;
        this.value;
    }

    collapse() {
        this.value = rng.choice(this.possibleValues);
        this.possibleValues = [this.value];  //[this.possibleValues[Math.floor(Math.random() * this.possibleValues.length)]];
        this.collapsed = true;
    }

    isCollapsed() {
        return this.collapsed;
    }
}