let lastRender = 0;
let ctx;
let density = 20;
let images;
let tiles;
const width = 800;
const height = 800;
let tileWidth;
let tileHeight;
let stop = true;
let empty = true;

// HTML objects
let canvas;
let btnStart;
let btnStop;
let btnReset;

const Directions = {
    NONE: 0,
    UP: 1,
    RIGHT: 2,
    DOWN: 4,
    LEFT: 8
};

const TileTypes = {
    EMPTY: [0, 0, 0, 0],
    T_JUNCTION: [1, 1, 0, 1],
    LINE: [0, 1, 0, 1],
    CORNER: [1, 1, 0, 0],
    DEAD_END: [1, 0, 0, 0],
    CROSS: [1, 1, 1, 1],
    rotate: (type, times) => {
        if (!(Array.isArray(type) && type.length == 4 && typeof times == 'number' && times >= 0)) throw 'Something wrong here';
        return [type[type.length - 1]].concat(type.slice(0, type.length - 1));
    },
    type: t => {
        let sum = t.reduce((p, s) => p + s, 0) == 0;
        switch (sum) {
            case 0: return 'EMPTY';
            case 1: return 'DEAD_END';
            case 2: {
                if (t[0] == t[2]) return 'LINE';
                return 'CORNER';
            }
            case 3: return 'T_JUNCTION';
            case 4: return 'CROSS';
            default: return 'MALFORMED';
        }
    }
};

const sideList = [
    // Empty
    [0, 0, 0, 0],

    // T junction
    [1, 1, 0, 1],
    [1, 1, 1, 0],
    [0, 1, 1, 1],
    [1, 0, 1, 1],

    // Line
    [0, 1, 0, 1],
    [1, 0, 1, 0],

    // Corner
    [1, 1, 0, 0],
    [0, 1, 1, 0],
    [0, 0, 1, 1],
    [1, 0, 0, 1],

    // Dead end
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1],

    // Cross
    [1, 1, 1, 1]
];

function setup() {
    prepareFields();

    prepareCanvas();
    resetCanvas();

    tileWidth = width / density;
    tileHeight = height / density;

    setupImages();
    setupTiles();

    canvas.addEventListener('click', handleStart);
    //window.requestAnimationFrame(loop);
}

function prepareFields() {
    btnStart = document.getElementById('btnStart');
    btnStop = document.getElementById('btnStop');
    btnReset = document.getElementById('btnReset');
    txtSeed = document.getElementById('txtSeed');
}

function prepareCanvas() {
    let topLevel = document.getElementById('canvas');
    canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    canvas.style = 'border: 1px solid black';
    topLevel.appendChild(canvas);
    ctx = canvas.getContext('2d');
}

function resetCanvas() {
    ctx.fillStyle = 'grey';
    ctx.fillRect(0, 0, 800, 800);
}

function loop(timestamp) {
    if (stop || tiles.every(tile => tile.isCollapsed())) return;
    let delta = timestamp - lastRender;
    update(delta);
    draw();
    if (!stop && tiles.some(tile => !tile.isCollapsed()))
        window.requestAnimationFrame(loop);
}

function update(delta) {
    const min = Math.min(...tiles.filter(tile => !tile.isCollapsed()).map(tile => tile.possibleValues.length));
    const filtered = tiles.filter(tile => !tile.isCollapsed() && tile.possibleValues.length == min);
    const filteredIndex = rng.nextRange(0, filtered.length);
    const tile = filtered[filteredIndex];
    checkNeighbours(tile, true);
    tile.collapse();
    evaluateNeighbours(tile);
}

function draw() {
    for (let i = 0; i < density; ++i) {
        for (let j = 0; j < density; ++j) {
            if (tiles[i * density + j].isCollapsed()) {
                //console.log(JSON.stringify(tiles[i * density + j]));
                let image = images[tiles[i * density + j].value];
                image.draw(ctx, j * tileWidth, i * tileHeight, tileWidth, tileHeight);
            }
        }
    }
}

function setupImages() {
    images = [];

    images.push(new TileImage(`images/${0}.png`, TileTypes.EMPTY));

    images.push(new TileImage(`images/${1}.png`, TileTypes.T_JUNCTION));
    for (let i = 0; i < 3; ++i) {
        let image = images[images.length - 1].clone();
        image.rotation += Math.PI / 2;
        image.sides = TileTypes.rotate(image.sides, 1);
        images.push(image);
    }

    images.push(new TileImage(`images/${2}.png`, TileTypes.LINE));
    images.push(images[images.length - 1].clone());
    images[images.length - 1].rotation += Math.PI / 2;
    images[images.length - 1].sides = TileTypes.rotate(images[images.length - 1].sides, 1);

    images.push(new TileImage(`images/${3}.png`, TileTypes.CORNER));
    for (let i = 0; i < 3; ++i) {
        let image = images[images.length - 1].clone();
        image.rotation += Math.PI / 2;
        image.sides = TileTypes.rotate(image.sides, 1);
        images.push(image);
    }

    images.push(new TileImage(`images/${4}.png`, TileTypes.DEAD_END));
    for (let i = 0; i < 3; ++i) {
        let image = images[images.length - 1].clone();
        image.rotation += Math.PI / 2;
        image.sides = TileTypes.rotate(image.sides, 1);
        images.push(image);
    }

    images.push(new TileImage(`images/${5}.png`, TileTypes.CROSS));
}

function setupTiles() {
    tiles = new Array(density ** 2);
    for (let i = 0; i < density ** 2; ++i) {
        tiles[i] = new Tile(i);
    }
}

function checkNeighbours(tile, recurse = false) {

    // dfs to find a point with only one possibility and use that as a basline?

    if (tile.index / density >= 1) {
        let neighbour = tiles[tile.index - density];
        if (!neighbour.isCollapsed()) {
            let possibleValues = tile.possibleValues;
            if (neighbour.possibleValues.length == 1) {
                for (let value of [...possibleValues]) {
                    value = parseInt(value);
                    if (images[neighbour.possibleValues[0]].sides[2] != images[value].sides[0]) {
                        possibleValues.splice(possibleValues.indexOf(value), 1);
                    }
                }
            }
        }
    }

    if (tile.index % density < density - 1) {
        let neighbour = tiles[tile.index + 1];
        if (!neighbour.isCollapsed()) {
            let possibleValues = tile.possibleValues;
            if (neighbour.possibleValues.length == 1) {
                for (let value of [...possibleValues]) {
                    value = parseInt(value);
                    if (images[neighbour.possibleValues[0]].sides[3] != images[value].sides[1]) {
                        possibleValues.splice(possibleValues.indexOf(value), 1);
                    }
                }
            }
        }
    }

    if (tile.index / density < density - 1) {
        let neighbour = tiles[tile.index + density];
        if (!neighbour.isCollapsed()) {
            let possibleValues = tile.possibleValues;
            if (neighbour.possibleValues.length == 1) {
                for (let value of [...possibleValues]) {
                    value = parseInt(value);
                    if (images[neighbour.possibleValues[0]].sides[0] != images[value].sides[2]) {
                        possibleValues.splice(possibleValues.indexOf(value), 1);
                    }
                }
            }
        }
    }

    if (tile.index % density > 0) {
        let neighbour = tiles[tile.index - 1];
        if (!neighbour.isCollapsed()) {
            let possibleValues = tile.possibleValues;
            if (neighbour.possibleValues.length == 1) {
                for (let value of [...possibleValues]) {
                    value = parseInt(value);
                    if (images[neighbour.possibleValues[0]].sides[1] != images[value].sides[3]) {
                        possibleValues.splice(possibleValues.indexOf(value), 1);
                    }
                }
            }
        }
    }
}

function evaluateNeighbours(tile) {
    const sides = images[tile.value].sides;

    if (tile.index / density >= 1) {
        let neighbour = tiles[tile.index - density];
        if (!neighbour.isCollapsed()) {
            let possibleValues = neighbour.possibleValues;
            for (let value of [...possibleValues]) {
                value = parseInt(value);
                if (sides[0] != images[value].sides[2]) {
                    possibleValues.splice(possibleValues.indexOf(value), 1);
                }
            }
            checkNeighbours(neighbour);
        }
    }

    if (tile.index % density < density - 1) {
        let neighbour = tiles[tile.index + 1];
        if (!neighbour.isCollapsed()) {
            let possibleValues = neighbour.possibleValues;
            for (let value of [...possibleValues]) {
                value = parseInt(value);
                if (sides[1] != images[value].sides[3]) {
                    possibleValues.splice(possibleValues.indexOf(value), 1);
                }
            }
            checkNeighbours(neighbour);
        }
    }

    if (tile.index / density < density - 1) {
        let neighbour = tiles[tile.index + density];
        if (!neighbour.isCollapsed()) {
            let possibleValues = neighbour.possibleValues;
            for (let value of [...possibleValues]) {
                value = parseInt(value);
                if (sides[2] != images[value].sides[0]) {
                    possibleValues.splice(possibleValues.indexOf(value), 1);
                }
            }
            checkNeighbours(neighbour);
        }
    }

    if (tile.index % density > 0) {
        let neighbour = tiles[tile.index - 1];
        if (!neighbour.isCollapsed()) {
            let possibleValues = neighbour.possibleValues;
            for (let value of [...possibleValues]) {
                value = parseInt(value);
                if (sides[3] != images[value].sides[1]) {
                    possibleValues.splice(possibleValues.indexOf(value), 1);
                }
            }
            checkNeighbours(neighbour);
        }
    }
}

function handleStart() {
    if (stop && tiles.some(tile => !tile.isCollapsed())) {
        btnStart.disabled = true;
        btnStop.disabled = false;
        btnReset.disabled = false;
        setSeed();
        stop = false;
        empty = false;
        window.requestAnimationFrame(loop);
    }
}

function handleStop() {
    stop = true;
    btnStop.disabled = true;
    btnStart.disabled = false;
    btnReset.disabled = false;
}

function handleReset() {
    handleStop();
    resetCanvas();
    setupTiles();
    setupImages();
    empty = true;
    setSeed();
}

function setSeed() {
    if (empty) {
        if(!isNaN(txtSeed.value) && txtSeed.value.length > 0)
            rng = new RNG(Math.abs(parseInt(txtSeed.value)));
        else
            rng = new RNG();
    }
}

window.onload = setup;