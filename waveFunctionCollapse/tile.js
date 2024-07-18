class Tile {
    constructor (index, possibleValues=undefined) {
        this.index = index;
        this.possibleValues = possibleValues ? possibleValues : [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];//[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
        this.collapsed = false;
        this.value;
    }

    collapse() {
        this.value = this.possibleValues.includes(15) ? rng.choice(this.possibleValues, 0, 1) : rng.choice(this.possibleValues);
        if (this.value == undefined) this.value = this.possibleValues[this.possibleValues.length - 1];
        this.possibleValues = [this.value];  //[this.possibleValues[Math.floor(Math.random() * this.possibleValues.length)]];
        this.collapsed = true;
    }

    isCollapsed() {
        return this.collapsed;
    }
}