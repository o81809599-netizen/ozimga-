// DOM Elements
const urlInput = document.getElementById('postUrl');
const fetchBtn = document.getElementById('fetchBtn');
const commentsList = document.getElementById('commentsList');
const loadingState = document.getElementById('loadingState');
const commentCount = document.getElementById('commentCount');
const spinBtn = document.getElementById('spinBtn');
const canvas = document.getElementById('wheelCanvas');
const ctx = canvas.getContext('2d');
const winnerModal = document.getElementById('winnerModal');
const closeModalBtn = document.getElementById('closeModalBtn');

// Variables
let participants = [];
let currentRotation = 0;
let isSpinning = false;
let wheelColors = ['#f43f5e', '#ec4899', '#d946ef', '#a855f7', '#8b5cf6', '#6366f1', '#3b82f6', '#0ea5e9'];

// Mock Data Generator
const uzbekNames = ['Aziz', 'Sardor', 'Malika', 'Nigora', 'Jasur', 'Bekzod', 'Dilnoza', 'Shohrux', 'Ziyoda', 'Temur', 'Shahzod', 'Gulnoza', 'Rustam', 'Zarina', 'Otabek'];
const mockComments = ['Zo\'r chiqibdi!', 'Omad!', 'Men yutaman degan umiddaman 🙌', 'Ajoyib video', 'Super 🔥', '+', 'Qatnashaman', 'Menga nasib qilsin', 'Yaxshi niyat', 'Vooov 😍', 'Kutgandim', 'Barchaga omad', 'Qachon o\'ynaladi?', 'Yutish nasib qilsin', 'Klass!'];

function generateMockParticipants(count = 20) {
    const data = [];
    for (let i = 0; i < count; i++) {
        const name = uzbekNames[Math.floor(Math.random() * uzbekNames.length)] + '_' + Math.floor(Math.random() * 999);
        const comment = mockComments[Math.floor(Math.random() * mockComments.length)];
        data.push({ name, comment, initial: name.charAt(0).toUpperCase() });
    }
    return data;
}

// Draw Wheel
function drawWheel() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = canvas.width / 2;

    if (participants.length === 0) {
        // Draw empty wheel
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.stroke();
        return;
    }

    const arcSize = (2 * Math.PI) / participants.length;

    participants.forEach((p, i) => {
        const angle = i * arcSize;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, angle, angle + arcSize);
        ctx.fillStyle = wheelColors[i % wheelColors.length];
        ctx.fill();
        ctx.stroke();

        // Draw Text
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(angle + arcSize / 2);
        ctx.textAlign = 'right';
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 16px Outfit';
        ctx.fillText(p.name, radius - 20, 5);
        ctx.restore();
    });
}

// Initial draw
drawWheel();

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
    drawWheel();
    canvas.style.transform = `rotate(0deg)`;
    currentRotation = 0;

    // Simulate Network Request
    setTimeout(() => {
        participants = generateMockParticipants(Math.floor(Math.random() * 20) + 10); // 10-30 participants
        
        loadingState.classList.add('hidden');
        commentsList.classList.remove('hidden');
        commentCount.textContent = participants.length;

        // Populate List
        participants.forEach((p, i) => {
            setTimeout(() => {
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
            }, i * 100); // Staggered animation
        });

        drawWheel();
        spinBtn.disabled = false;
    }, 2000);
});

// Spin Logic
spinBtn.addEventListener('click', () => {
    if (isSpinning || participants.length === 0) return;
    
    isSpinning = true;
    spinBtn.disabled = true;
    fetchBtn.disabled = true;

    // Calculate rotation
    const spins = 5; // number of full rotations
    const sliceAngle = 360 / participants.length;
    
    // Choose winner randomly
    const winnerIndex = Math.floor(Math.random() * participants.length);
    
    // Calculate final rotation degrees
    const stopAngle = winnerIndex * sliceAngle + (sliceAngle / 2);
    // Add multiple 360s + offset to land on winner
    const totalRotation = currentRotation + (360 * spins) + (360 - stopAngle) - (currentRotation % 360) - 90;

    canvas.style.transform = `rotate(${totalRotation}deg)`;
    currentRotation = totalRotation;

    // Wait for animation to finish
    setTimeout(() => {
        isSpinning = false;
        spinBtn.disabled = false;
        fetchBtn.disabled = false;
        showWinner(participants[winnerIndex]);
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
    document.getElementById('winnerName').textContent = winner.name;
    document.getElementById('winnerComment').textContent = `"${winner.comment}"`;
    
    winnerModal.classList.remove('hidden');
}

closeModalBtn.addEventListener('click', () => {
    winnerModal.classList.add('hidden');
});
