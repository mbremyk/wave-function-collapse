/**
 * Shamelessly stolen from https://stackoverflow.com/a/424445
 * This is not my code, but it is borrowed and modified in good faith.
 * I guess it goes under whatever license stackoverflow answers use?
 */

function RNG(seed) {
    // LCG using GCC's constants
    this.m = 0x80000000; // 2**31;
    this.a = 1103515245;
    this.c = 12345;

    this.state = typeof seed === 'number' && isFinite(seed) ? seed : Math.floor(Math.random() * (this.m - 1));
    this.seed = this.state;
}
RNG.prototype.nextInt = function () {
    this.state = (this.a * this.state + this.c) % this.m;
    return this.state;
};
RNG.prototype.nextFloat = function () {
    // returns in range [0,1]
    return this.nextInt() / (this.m - 1);
};
RNG.prototype.nextRange = function (start, end) {
    // returns in range [start, end): including start, excluding end
    // can't modulu nextInt because of weak randomness in lower bits
    var rangeSize = end - start;
    var randomUnder1 = this.nextInt() / this.m;
    return start + Math.floor(randomUnder1 * rangeSize);
};
RNG.prototype.choice = function (array, startOffset = 0, endOffset = 0) {
    if (startOffset < 0 || endOffset < 0) throw "Offsets have to be non-negative";
    if (startOffset + endOffset >= array.length) return undefined;
    return array[this.nextRange(0 + startOffset, array.length - endOffset)];
};
RNG.prototype.setSeed = function (seed, random = false) {
    this.state = typeof seed === 'number' && isFinite(seed) ? seed : (random ? Math.floor(Math.random() * (this.m - 1)) : this.state);
    this.seed = this.state;
};