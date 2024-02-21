let lastRender = 0;
let canvas;
let ctx;
const density = 30;
let images;
let tiles;
const width = 800;
const height = 800;
let tileWidth;
let tileHeight;

const sideList = [
    [0, 0, 0, 0],
    [1, 1, 0, 1],
    [1, 1, 1, 0],
    [0, 1, 1, 1],
    [1, 0, 1, 1]
];

function setup() {

    tileWidth = width / density;
    tileHeight = height / density;
    let topLevel = document.getElementById('topLevel');
    canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    canvas.style = "border: 1px solid black";
    topLevel.appendChild(canvas);
    ctx = canvas.getContext('2d');
    ctx.fillStyle = "grey";
    ctx.fillRect(0, 0, 800, 800);
    setupImages();
    setupTiles();

    canvas.addEventListener("click", startLoop);
    //window.requestAnimationFrame(loop);
}

function startLoop() {
    canvas.removeEventListener("click", startLoop);
    window.requestAnimationFrame(loop);
}

function loop(timestamp) {
    let delta = timestamp - lastRender;
    update(delta);
    draw();
    if (tiles.some(tile => !tile.isCollapsed()))
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
                console.log(JSON.stringify(tiles[i * density + j]));
                let image = images[tiles[i * density + j].value];
                image.draw(ctx, j * tileWidth, i * tileHeight, tileWidth, tileHeight);
            }
        }
    }
}

function setupImages() {
    images = [];
    for (let i = 0; i < 2; ++i) {
        let image = new TileImage(`images/${i}.png`);
        images.push(image);
    }
    for (let i = 0; i < 3; ++i) {
        let image = images[images.length - 1].clone();
        image.rotation += Math.PI / 2;
        images.push(image);
    }
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
                    if (sideList[neighbour.possibleValues[0]][2] != sideList[value][0]) {
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
                    if (sideList[neighbour.possibleValues[0]][3] != sideList[value][1]) {
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
                    if (sideList[neighbour.possibleValues[0]][0] != sideList[value][2]) {
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
                    if (sideList[neighbour.possibleValues[0]][1] != sideList[value][3]) {
                        possibleValues.splice(possibleValues.indexOf(value), 1);
                    }
                }
            }
        }
    }
}

function evaluateNeighbours(tile) {
    const sides = sideList[tile.value];

    if (tile.index / density >= 1) {
        let neighbour = tiles[tile.index - density];
        if (!neighbour.isCollapsed()) {
            let possibleValues = neighbour.possibleValues;
            for (let value of [...possibleValues]) {
                value = parseInt(value);
                if (sides[0] != sideList[value][2]) {
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
                if (sides[1] != sideList[value][3]) {
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
                if (sides[2] != sideList[value][0]) {
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
                if (sides[3] != sideList[value][1]) {
                    possibleValues.splice(possibleValues.indexOf(value), 1);
                }
            }
            checkNeighbours(neighbour);
        }
    }
}

window.onload = setup;