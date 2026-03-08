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
const resetBtn = document.getElementById("reset-btn"); // เชื่อมกับ ID ใน HTML และ CSS

function initGame() {
    gardenData.fill(null);
    score = 0;
    scoreEl.innerText = score;
    prepareNext();
    createGrid();
    spawnInitialFlowers();
}

function spawnInitialFlowers() {
    for (let i = 0; i < 3; i++) {
        let emptyTiles = gardenData.map((v, i) => v === null ? i : null).filter(v => v !== null);
        if (emptyTiles.length > 0) {
            let randomIndex = Math.floor(Math.random() * emptyTiles.length);
            gardenData[emptyTiles[randomIndex]] = flowers[Math.floor(Math.random() * flowers.length)];
        }
    }
    render();
}

function createGrid() {
    gardenEl.innerHTML = "";
    gardenData.forEach((_, i) => {
        const tile = document.createElement("div");
        tile.className = "plot";
        tile.onclick = () => handleTileClick(i);
        gardenEl.appendChild(tile);
    });
    render();
}

function prepareNext() {
    nextSpawn = Array(3).fill().map(() => {
        return Math.random() < 0.1 ? wildcard : flowers[Math.floor(Math.random() * flowers.length)];
    });
    nextEl.innerText = nextSpawn.join(" ");
}

function spawnFlowers() {
    let emptyTiles = gardenData.map((v, i) => v === null ? i : null).filter(v => v !== null);
    for (let i = 0; i < 3 && emptyTiles.length > 0; i++) {
        let randomIndex = Math.floor(Math.random() * emptyTiles.length);
        let tileIndex = emptyTiles.splice(randomIndex, 1)[0];
        gardenData[tileIndex] = nextSpawn[i];
    }
    checkMatches();
    prepareNext();
    render();
    if (gardenData.every(v => v !== null)) alert("สวนเต็มแล้ว! คะแนน: " + score);
}

function handleTileClick(i) {
    if (gardenData[i]) {
        selectedIndex = i;
    } else if (selectedIndex !== null) {
        // ตรวจสอบว่าช่องที่จะย้ายไปว่างหรือไม่
        if (!gardenData[i]) {
            gardenData[i] = gardenData[selectedIndex];
            gardenData[selectedIndex] = null;
            selectedIndex = null;
            if (!checkMatches()) spawnFlowers();
        } else {
            selectedIndex = i; // เปลี่ยนตัวเลือกถ้ากดโดนดอกไม้อื่น
        }
    }
    render();
}

// ฟังก์ชันหลักที่แก้ให้ทำแนวทแยง
function checkMatches() {
    let toRemove = new Set();
    const isMatch = (arr) => {
        let first = arr.find(f => f !== null && f !== wildcard);
        if (!first) return arr.every(f => f === wildcard && f !== null);
        return arr.every(f => f !== null && (f === first || f === wildcard));
    };

    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            let idx = r * size + c;
            if (!gardenData[idx]) continue;

            // ตรวจสอบ 4 ทิศทาง: นอน, ตั้ง, ทแยงลงขวา, ทแยงลงซ้าย
            const directions = [
                { dr: 0, dc: 1 }, // Horizontal
                { dr: 1, dc: 0 }, // Vertical
                { dr: 1, dc: 1 }, // Diagonal Down-Right ↘️
                { dr: 1, dc: -1 } // Diagonal Down-Left ↙️
            ];

            directions.forEach(({ dr, dc }) => {
                let matchArr = [];
                for (let i = 0; i < 5; i++) {
                    let nr = r + (dr * i);
                    let nc = c + (dc * i);
                    if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
                        matchArr.push(nr * size + nc);
                    }
                }

                if (matchArr.length === 5) {
                    let flowersInLine = matchArr.map(index => gardenData[index]);
                    if (isMatch(flowersInLine)) {
                        matchArr.forEach(index => toRemove.add(index));
                    }
                }
            });
        }
    }

    if (toRemove.size > 0) {
        toRemove.forEach(i => gardenData[i] = null);
        score += toRemove.size * 10;
        scoreEl.innerText = score;
        return true;
    }
    return false;
}

function render() {
    const tiles = document.querySelectorAll(".plot");
    tiles.forEach((tile, i) => {
        const flower = gardenData[i];
        tile.innerText = flower || "";
        tile.classList.remove("selected");
        if (selectedIndex === i) tile.classList.add("selected");
    });
}

// แก้ไขปุ่มเริ่มใหม่ให้เสถียรขึ้น
if (resetBtn) {
    resetBtn.addEventListener("click", () => {
        if(confirm("เริ่มเกมใหม่ใช่ไหม? คะแนนปัจจุบันของคุณจะหายไปนะ")) {
            initGame();
        }
    });
}

initGame();
