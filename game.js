const size = 7;
const flowers = ["🌹", "🌻", "🌷", "🌼", "🌸", "🌺"];
const wildcard = "🌈";
let score = 0;
let gardenData = Array(size * size).fill(null);
let selectedIndex = null;
let nextSpawn = [];

const gardenEl = document.getElementById("garden");
const scoreEl = document.getElementById("score");
const nextEl = document.getElementById("next-flowers");

function initGame() {
    gardenData.fill(null);
    score = 0;
    scoreEl.innerText = score;
    prepareNext();
    createGrid();
    spawnFlowers();
}

function createGrid() {
    gardenEl.innerHTML = "";
    for (let i = 0; i < size * size; i++) {
        const tile = document.createElement("div");
        tile.className = "plot";
        tile.onclick = () => handleTileClick(i);
        gardenEl.appendChild(tile);
    }
    render();
}

function prepareNext() {
    nextSpawn = Array(3).fill().map(() => Math.random() < 0.1 ? wildcard : flowers[Math.floor(Math.random() * flowers.length)]);
    nextEl.innerText = nextSpawn.join(" ");
}

function spawnFlowers() {
    let empty = gardenData.map((v, i) => v === null ? i : null).filter(v => v !== null);
    for (let i = 0; i < 3 && empty.length > 0; i++) {
        let idx = empty.splice(Math.floor(Math.random() * empty.length), 1)[0];
        gardenData[idx] = nextSpawn[i];
    }
    checkMatches();
    prepareNext();
    render();
    if (gardenData.every(v => v !== null)) alert("สวนเต็มแล้ว! คะแนนของคุณ: " + score);
}

function handleTileClick(i) {
    if (gardenData[i]) {
        selectedIndex = i;
    } else if (selectedIndex !== null) {
        gardenData[i] = gardenData[selectedIndex];
        gardenData[selectedIndex] = null;
        selectedIndex = null;
        if (!checkMatches()) spawnFlowers();
    }
    render();
}

function checkMatches() {
    let removeSet = new Set();
    const isMatch = (arr) => {
        let first = arr.find(f => f && f !== wildcard);
        return first ? arr.every(f => f === first || f === wildcard) : arr.every(f => f === wildcard);
    };

    for (let r = 0; r < size; r++) {
        for (let c = 0; c <= size - 5; c++) {
            let idx = r * size + c;
            let slice = gardenData.slice(idx, idx + 5);
            if (slice[0] && isMatch(slice)) for (let i = 0; i < 5; i++) removeSet.add(idx + i);
        }
    }

    for (let c = 0; c < size; c++) {
        for (let r = 0; r <= size - 5; r++) {
            let idx = r * size + c;
            let slice = [0,1,2,3,4].map(i => gardenData[idx + i * size]);
            if (slice[0] && isMatch(slice)) for (let i = 0; i < 5; i++) removeSet.add(idx + i * size);
        }
    }

    if (removeSet.size > 0) {
        removeSet.forEach(i => gardenData[i] = null);
        score += removeSet.size * 10;
        scoreEl.innerText = score;
        return true;
    }
    return false;
}

function render() {
    const tiles = document.querySelectorAll(".plot");
    tiles.forEach((tile, i) => {
        const flower = gardenData[i];
        if (tile.innerText !== (flower || "")) {
            tile.innerText = flower || "";
            if (flower) tile.classList.add("flower-pop");
        }
        tile.classList.toggle("selected", selectedIndex === i);
    });
}

initGame();