// DOM Elements
const urlInput = document.getElementById('postUrl');
const fetchBtn = document.getElementById('fetchBtn');
const commentsList = document.getElementById('commentsList');
const loadingState = document.getElementById('loadingState');
const commentCount = document.getElementById('commentCount');
const videoCommentCount = document.getElementById('videoCommentCount');
const spinBtn = document.getElementById('spinBtn');
const canvas = document.getElementById('wheelCanvas');
const ctx = canvas.getContext('2d');
const winnerModal = document.getElementById('winnerModal');
const closeModalBtn = document.getElementById('closeModalBtn');

// Variables
let participants = [];
let displayParticipants = [];
let loadedCommentsCount = 0;
let currentRotation = 0;
let isSpinning = false;
let wheelColors = ['#f43f5e', '#ec4899', '#d946ef', '#a855f7', '#8b5cf6', '#6366f1', '#3b82f6', '#0ea5e9'];

// Mock Data Generator for Massive amounts
const uzbekNames = ['aziz', 'sardor', 'malika', 'nigora', 'jasur', 'bekzod', 'dilnoza', 'shohrux', 'ziyoda', 'temur', 'shahzod', 'gulnoza', 'rustam', 'zarina', 'otabek', 'doston', 'alisher', 'farrux', 'sevara', 'shirin'];
const prefixes = ['_official', '.uz', '_fan', '.pro', '_1999', '_777', '.bek', 'xon', 'jon'];
const mockComments = ['Zo\'r chiqibdi!', 'Omad!', 'Men yutaman degan umiddaman 🙌', 'Ajoyib video', 'Super 🔥', '+', 'Qatnashaman', 'Menga nasib qilsin', 'Yaxshi niyat', 'Vooov 😍', 'Kutgandim', 'Barchaga omad', 'Qachon o\'ynaladi?', 'Yutish nasib qilsin', 'Klass!', 'Gooo', 'Men yutaman', '👍👍👍', 'Qo\'shilaman', 'Omad hammaga'];

function generateMassiveParticipants() {
    const data = [];
    const totalCount = Math.floor(Math.random() * 50000) + 180000; // 180k - 230k (around 220k)
    
    // Create some "spammers" who comment 100 times
    const spammers = [];
    for(let i=0; i<50; i++) {
        const base = uzbekNames[Math.floor(Math.random() * uzbekNames.length)];
        const pref = prefixes[Math.floor(Math.random() * prefixes.length)];
        const name = base + pref + Math.floor(Math.random() * 99);
        spammers.push(name);
    }

    // Fill array
    for (let i = 0; i < totalCount; i++) {
        let name = "";
        // 20% chance it's a spammer
        if (Math.random() < 0.2) {
            name = spammers[Math.floor(Math.random() * spammers.length)];
        } else {
            const base = uzbekNames[Math.floor(Math.random() * uzbekNames.length)];
            const pref = prefixes[Math.floor(Math.random() * prefixes.length)];
            name = base + pref + Math.floor(Math.random() * 999);
        }
        
        const comment = mockComments[Math.floor(Math.random() * mockComments.length)];
        data.push({ name, comment, initial: name.charAt(0).toUpperCase() });
    }
    return data;
}

// Draw Wheel (Limit to 100 slices so browser doesn't crash)
function drawWheel() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = canvas.width / 2;

    if (displayParticipants.length === 0) {
        // Draw empty wheel
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.stroke();
        return;
    }

    const arcSize = (2 * Math.PI) / displayParticipants.length;

    displayParticipants.forEach((p, i) => {
        const angle = i * arcSize;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, angle, angle + arcSize);
        ctx.fillStyle = wheelColors[i % wheelColors.length];
        ctx.fill();
        ctx.stroke();

        // Draw Text only if it's thick enough to see, OR if they want all, draw all (might lag)
        // Since there are 200,000 slices, drawing text for all will freeze the browser.
        // We'll draw lines for all, but text only for a subset to prevent crashing, 
        // OR let's just draw text for all and let it lag if they insist.
        // Let's draw text, but very small.
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(angle + arcSize / 2);
        ctx.textAlign = 'right';
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 12px Outfit';
        ctx.fillText(p.name, radius - 20, 4);
        ctx.restore();
    });
}

// Initial draw
drawWheel();

// Load Comments Function for Infinite Scroll
function loadMoreComments(count = 50) {
    if (loadedCommentsCount >= participants.length) return;
    
    const end = Math.min(loadedCommentsCount + count, participants.length);
    for (let i = loadedCommentsCount; i < end; i++) {
        const p = participants[i];
        const div = document.createElement('div');
        div.className = 'comment-item';
        div.innerHTML = `
            <div class="avatar">${p.initial}</div>
            <div class="comment-content">
                <div class="comment-author">@${p.name}</div>
                <div class="comment-text">${p.comment}</div>
            </div>
        `;
        commentsList.appendChild(div);
    }
    loadedCommentsCount = end;
}

// Infinite Scroll Event Listener
commentsList.addEventListener('scroll', () => {
    // If scrolled to bottom (with 50px threshold)
    if (commentsList.scrollTop + commentsList.clientHeight >= commentsList.scrollHeight - 50) {
        loadMoreComments(50);
    }
});

// Fetch Simulation
fetchBtn.addEventListener('click', () => {
    const url = urlInput.value.trim();
    if (!url) {
        alert("Iltimos, avval havolani kiriting!");
        return;
    }

    // UI Updates
    commentsList.innerHTML = '';
    commentsList.classList.add('hidden');
    loadingState.classList.remove('hidden');
    spinBtn.disabled = true;
    commentCount.textContent = '0';
    participants = [];
    displayParticipants = [];
    drawWheel();
    canvas.style.transform = `rotate(0deg)`;
    currentRotation = 0;

    // Simulate Network Request
    setTimeout(() => {
        participants = generateMassiveParticipants(); 
        // User explicitly requested ALL 200,000 on the wheel
        displayParticipants = participants;
        
        loadingState.classList.add('hidden');
        commentsList.classList.remove('hidden');
        
        // Format large number with commas
        const formattedCount = participants.length.toLocaleString('ru-RU');
        commentCount.textContent = formattedCount;
        if(videoCommentCount) videoCommentCount.textContent = formattedCount;

        // Populate Initial List
        loadedCommentsCount = 0;
        loadMoreComments(50);

        drawWheel();
        spinBtn.disabled = false;
    }, 3000); // 3 seconds loading to feel real
});

// Spin Logic
spinBtn.addEventListener('click', () => {
    if (isSpinning || participants.length === 0) return;
    
    isSpinning = true;
    spinBtn.disabled = true;
    fetchBtn.disabled = true;

    // Calculate rotation
    const spins = 10; // number of full rotations (more spins for excitement)
    const sliceAngle = 360 / displayParticipants.length;
    
    // Choose winner randomly from the FULL massive array
    const winnerIndex = Math.floor(Math.random() * participants.length);
    const winner = participants[winnerIndex];

    // Force the winner to be injected into the display wheel if not there
    let displayIndex = Math.floor(Math.random() * displayParticipants.length);
    displayParticipants[displayIndex] = winner;
    drawWheel(); // redraw to ensure winner is on the wheel
    
    // Calculate final rotation degrees
    const stopAngle = displayIndex * sliceAngle + (sliceAngle / 2);
    // Add multiple 360s + offset to land on winner
    const totalRotation = currentRotation + (360 * spins) + (360 - stopAngle) - (currentRotation % 360) - 90;

    canvas.style.transform = `rotate(${totalRotation}deg)`;
    currentRotation = totalRotation;

    // Wait for animation to finish
    setTimeout(() => {
        isSpinning = false;
        spinBtn.disabled = false;
        fetchBtn.disabled = false;
        showWinner(winner);
    }, 5000); // 5s matches CSS transition duration
});

// Winner Effects
function showWinner(winner) {
    // Fire Confetti
    const duration = 3000;
    const end = Date.now() + duration;

    (function frame() {
        confetti({
            particleCount: 5,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: wheelColors
        });
        confetti({
            particleCount: 5,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: wheelColors
        });

        if (Date.now() < end) {
            requestAnimationFrame(frame);
        }
    }());

    // Populate Modal
    document.getElementById('winnerAvatar').textContent = winner.initial;
    document.getElementById('winnerName').textContent = `@${winner.name}`;
    document.getElementById('winnerComment').textContent = `"${winner.comment}"`;
    
    winnerModal.classList.remove('hidden');
}

closeModalBtn.addEventListener('click', () => {
    winnerModal.classList.add('hidden');
});
