let lastRender = 0;
let ctx;
let density = 20;
var images;
let tiles;
const width = 800;
const height = 800;
let tileWidth;
let tileHeight;
let stop = true;
let empty = true;
var rng = new RNG();
let test = false;

// HTML objects
let canvas;
let btnStart;
let btnStop;
let btnReset;
let txtSeed;
let tileList;
let lstCheckBoxes = [];
let txtCurrentSeed;
let txtDensity;

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
    },
    get: s => {
        switch (s.toUpperCase()) {
            case 'EMPTY':
                return EMPTY;
            case 'DEAD_END':
                return DEAD_END;
            case 'LINE':
                return LINE;
            case 'CORNER':
                return CORNER;
            case 'T_JUNCTION':
                return T_JUNCTION;
            case 'CROSS':
                return CROSS;
            default:
                return undefined;
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

//const possibleValues = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

function setup() {
    prepareFields();

    prepareCanvas();
    resetCanvas();

    setTileSize();

    setupImages();
    prepareTileList();
    setupTiles();

    canvas.addEventListener('click', handleStart);
    //window.requestAnimationFrame(loop);
}

function prepareFields() {
    btnStart = document.getElementById('btnStart');
    btnStop = document.getElementById('btnStop');
    btnReset = document.getElementById('btnReset');
    txtSeed = document.getElementById('txtSeed');
    tileList = document.getElementById('tile-list');
    txtCurrentSeed = document.getElementById('current-seed');
    txtDensity = document.getElementById('txt-density');
}

function prepareCanvas() {
    let topLevel = document.getElementById('canvas');
    canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    canvas.style = 'border: 1px solid #404040';
    topLevel.appendChild(canvas);
    ctx = canvas.getContext('2d');
}

function resetCanvas() {
    ctx.fillStyle = 'grey';
    ctx.fillRect(0, 0, 800, 800);
}

function setTileSize() {
    density = parseInt(txtDensity.value);
    tileWidth = width / density;
    tileHeight = height / density;
}

function prepareTileList() {
    for (let image in images) {
        let img = document.createElement('img');
        img = images[image].image;
        img.style.transform = `rotate(${images[image].rotation}rad)`;
        tileList.appendChild(img);
        let sides = document.createElement('div');
        for (let i of images[image].sides) {
            let side = document.createElement('input');
            side.type = 'text';
            side.height = '50px';
            side.size = "2";
            side.value = i;
            sides.appendChild(side);
        }
        sides.index = image;
        tileList.appendChild(sides);
        let check = document.createElement('input');
        check.type = 'checkbox';
        check.checked = images[image].enabled;
        check.index = image;
        check.onchange = handleToggleTile;
        lstCheckBoxes.push(check);
        tileList.appendChild(check);
    }
}

function handleToggleTile(e) {
    images[e.target.index].enabled = e.target.checked;
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

    for (let i in lstCheckBoxes) {
        images[i].enabled = lstCheckBoxes[i].checked;
    }
}

function setupTiles() {
    let possibleValues = [];
    for (let i in images) {
        if (images[i].enabled) {
            possibleValues.push(parseInt(i));
        }
    }
    tiles = new Array(density ** 2);
    for (let i = 0; i < density ** 2; ++i) {
        tiles[i] = new Tile(i, possibleValues.slice());
    }
    if(test) {
        for(let i = 0; i < density; ++i) {
            tiles[i].possibleValues = [0];
            tiles[tiles.length - i - 1].possibleValues = [0];
            tiles[i * density].possibleValues = [0];
            tiles[tiles.length - 1 - i * density].possibleValues = [0];
        }
        tiles[1].possibleValues = [6];
        tiles[tiles.length - 2].possibleValues = [6];
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
        setTileSize();
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
    setTileSize();
    setupImages();
    setupTiles();
    empty = true;
    setSeed();
}

function setSeed() {
    if (empty) {
        rng.setSeed(parseInt(txtSeed.value), true);
        txtCurrentSeed.innerText = rng.seed;
    }
}

function handleDensity() {
    if (stop && empty) {
        setTileSize();
        setupImages();
        setupTiles();
    }
}

window.onload = setup;