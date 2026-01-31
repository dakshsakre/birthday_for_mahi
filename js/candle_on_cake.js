window.onload = function() {
    const canvas = document.getElementById('cake-candle-canvas');
    const ctx = canvas.getContext('2d');

    // تنظیم اندازه canvas به صورت داینامیک
    canvas.width = 50;
    canvas.height = 100;

    let flameOn = true;
    let blowing = false;
    let shakeFrame = 0;
    let flameAngle = 0;
    let smokes = [];
    let showCard = false;
    let isBlowDetected = false;
    let flameSize = 1.0;
    let blowIntensity = 0;

    function drawSmokes() {
        smokes.forEach(s => {
            ctx.save();
            ctx.globalAlpha = s.alpha;
            ctx.beginPath();
            ctx.ellipse(s.x, s.y, Math.abs(s.r), Math.abs(s.r * 1.5), 0, 0, 2 * Math.PI);
            ctx.fillStyle = "#bbb";
            ctx.fill();
            ctx.restore();
            s.y -= 0.7 + Math.random();
            s.x += Math.sin(s.y / 10) * 0.4;
            s.alpha -= 0.008 + Math.random() * 0.004;
        });
        smokes = smokes.filter(s => s.alpha > 0.05);
    }

    function drawCandle(flame = true, flameShake = 0, smoke = false) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Candle body
        ctx.save();
        ctx.fillStyle = "#f8bbd0";
        ctx.fillRect(18, 38, 8, 40);

        // Candle top ellipse
        ctx.beginPath();
        ctx.ellipse(22, 38, 4, 2, 0, 0, 2 * Math.PI);
        ctx.fillStyle = "#e57373";
        ctx.fill();

        // Wick
        ctx.strokeStyle = "#333";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(22, 38);
        ctx.lineTo(22, 28);
        ctx.stroke();
        ctx.restore();

        // Flame
        if (flame) {
            let flick = 0;
            if (isBlowDetected) {
                flick = Math.sin(shakeFrame) * 2; // کاهش دامنه لرزش
            }

            // محاسبه اندازه شعله با محدودیت مقادیر مثبت
            let flameHeight = Math.max(1, 13 * flameSize + flick);
            let flameWidth = Math.max(0.5, 4.5 * flameSize);

            // Outer glow
            ctx.save();
            ctx.globalAlpha = 0.4 * flameSize;
            ctx.beginPath();
            ctx.ellipse(22, 22, flameWidth + 3, flameHeight + 3, 0, 0, 2 * Math.PI);
            ctx.fillStyle = "#fffde7";
            ctx.shadowColor = "#fffde7";
            ctx.shadowBlur = 10;
            ctx.fill();
            ctx.restore();

            // Yellow core
            ctx.save();
            ctx.globalAlpha = 0.8 * flameSize;
            ctx.beginPath();
            ctx.ellipse(22, 22, flameWidth, flameHeight, 0, 0, 2 * Math.PI);
            ctx.fillStyle = "#ffe082";
            ctx.shadowColor = "#ffd600";
            ctx.shadowBlur = 5;
            ctx.fill();
            ctx.restore();

            // Orange center
            ctx.save();
            ctx.globalAlpha = 0.6 * flameSize;
            ctx.beginPath();
            ctx.ellipse(22, 25, Math.max(0.5, flameWidth * 0.5), Math.max(0.5, flameHeight * 0.5), 0, 0, 2 * Math.PI);
            ctx.fillStyle = "#ff9800";
            ctx.shadowColor = "#ff9800";
            ctx.shadowBlur = 2;
            ctx.fill();
            ctx.restore();
        }

        if(smoke) {
            drawSmokes();
        }
    }

    function animate() {
        if (flameOn) {
            flameAngle += 0.1 + Math.random() * 0.05;
            let flameShakeVal = isBlowDetected ? Math.sin(shakeFrame) * 2 : 0;

            if (isBlowDetected) {
                flameSize = Math.max(0.2, flameSize - 0.03 * blowIntensity); // کاهش سرعت کوچک شدن شعله
            }

            drawCandle(true, flameShakeVal, false);
            shakeFrame++;
        } else {
            if (Math.random() < 0.15) {
                smokes.push({
                    x: 22 + (Math.random() - 0.5) * 3,
                    y: 18 + Math.random() * 2,
                    r: 4 + Math.random() * 3,
                    alpha: 0.3 + Math.random() * 0.2
                });
            }
            drawCandle(false, 0, true);
        }
        requestAnimationFrame(animate);
    }

    const blowInstruction = document.getElementById('blow-instruction');
    const celebrateMsg = document.getElementById('celebrate-message');
    const greetingCard = document.getElementById('greeting-card');
    const resetBtn = document.getElementById('reset-btn');
    const congratsMsg = document.getElementById('congrats-message');

    function showLottieCard() {
        const container = document.getElementById('lottie-confetti');
        container.innerHTML = '';

        lottie.loadAnimation({
            container: container,
            renderer: 'svg',
            loop: false,
            autoplay: true,
            path: 'https://lottie.host/0ea60585-2a84-47f6-931e-f52310af3cea/kz77wRyH4j.json',
            rendererSettings: { preserveAspectRatio: 'xMidYMid meet' }
        }).addEventListener('complete', function() {
            congratsMsg.style.display = 'block';
            resetBtn.style.display = 'inline-block';
        });

    }

    function extinguishCandle() {
        if (!flameOn) return;

        flameOn = false;
        blowing = false;
        smokes = [];

        const candleCanvas = document.getElementById('cake-candle-canvas');
        if (candleCanvas) {
            candleCanvas.classList.add('candle-off');
        }

        if (celebrateMsg) celebrateMsg.style.display = 'block';
        if (blowInstruction) blowInstruction.style.display = 'none';
        if (greetingCard) greetingCard.classList.add('show');

        showLottieCard();

        const audio = document.getElementById('birthday-audio');
        if (audio) {
            audio.currentTime = 0;
            audio.play().catch(e => console.log('Audio play error:', e));
        }
    }

    function resetAll() {
        // توقف تشخیص صدا اگر فعال باشد
        if (window.SpeechRecognition || window.webkitSpeechRecognition) {
            const recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (recognition && recognition.abort) {
                recognition.abort();
            }
        }

        flameOn = true;
        blowing = false;
        shakeFrame = 0;
        flameAngle = 0;
        smokes = [];
        flameSize = 1.0;
        isBlowDetected = false;
        blowIntensity = 0;

        const candleCanvas = document.getElementById('cake-candle-canvas');
        if (candleCanvas) {
            candleCanvas.classList.remove('candle-off');
        }

        if (celebrateMsg) celebrateMsg.style.display = 'none';
        if (blowInstruction) blowInstruction.style.display = 'inline-block';
        if (greetingCard) greetingCard.classList.remove('show');
        if (congratsMsg) congratsMsg.style.display = 'none';
        if (resetBtn) resetBtn.style.display = 'none';

        const confettiContainer = document.getElementById('lottie-confetti');
        if (confettiContainer) {
            confettiContainer.innerHTML = '';
        }

        const audio = document.getElementById('birthday-audio');
        if (audio) {
            audio.pause();
            audio.currentTime = 0;
        }

        // راه‌اندازی مجدد انیمیشن
        drawCandle(true, 0, false);
    }

    // تنظیمات تشخیص صدا
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new Recognition();
        recognition.lang = 'en-US';
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.maxAlternatives = 3;

        let recognitionActive = false;
        let blowTimeout;

        if (blowInstruction) {
            blowInstruction.onclick = function() {
                if (recognitionActive) return;

                try {
                    blowInstruction.textContent = "Listening... Blow into your mic!";
                    recognition.start();
                    recognitionActive = true;
                    isBlowDetected = false;
                    blowIntensity = 0;
                } catch (e) {
                    console.log('Recognition error:', e);
                    blowInstruction.textContent = "Error starting microphone. Click to try again.";
                    recognitionActive = false;
                }
            };
        }

        recognition.onresult = function(event) {
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i];

                if (result.isFinal || blowIntensity > 0.4) {
                    isBlowDetected = true;
                    blowIntensity += 0.15;

                    clearTimeout(blowTimeout);
                    blowTimeout = setTimeout(function() {
                        if (flameSize <= 0.4 || blowIntensity > 0.6) {
                            extinguishCandle();
                            try {
                                recognition.stop();
                            } catch (e) {
                                console.log('Recognition stop error:', e);
                            }
                        }
                        isBlowDetected = false;
                    }, 700);
                }

                const transcript = result[0]?.transcript?.toLowerCase() || '';
                if (transcript.includes('who') || transcript.includes('fwoosh') || result[0]?.confidence < 0.4) {
                    blowIntensity += 0.2;
                    isBlowDetected = true;
                }
            }
        };

        recognition.onerror = function(event) {
            if (event.error !== 'no-speech' && blowInstruction) {
                blowInstruction.textContent = "Try again! Click to blow out the candle.";
            }
            recognitionActive = false;
            isBlowDetected = false;
        };

        recognition.onend = function() {
            recognitionActive = false;
            if (flameOn && blowInstruction) {
                blowInstruction.textContent = "Click to blow out the candle!";
            }
        };
    } else if (blowInstruction) {
        blowInstruction.textContent = "Your browser doesn't support voice blowing!";
    }

    if (resetBtn) {
        resetBtn.onclick = resetAll;
    }

    // شروع اولیه
    drawCandle(true, 0, false);
    animate();
};


// ===============================
// CLICK BASED BLOW (NO MIC)
// ===============================

document.addEventListener("DOMContentLoaded", () => {
  const blowBtn = document.getElementById("blow-instruction");

  if (!blowBtn) return;

  blowBtn.addEventListener("click", () => {
    // Hide button
    blowBtn.style.display = "none";

    // Turn off candle (clear canvas)
    const canvas = document.getElementById("cake-candle-canvas");
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    // Show greeting messages
    const congratsMsg = document.getElementById("congrats-message");
    const celebrateMsg = document.getElementById("celebrate-message");
    const resetBtn = document.getElementById("reset-btn");

    if (congratsMsg) congratsMsg.style.display = "block";
    if (celebrateMsg) celebrateMsg.style.display = "block";
    if (resetBtn) resetBtn.style.display = "inline-block";

    // Play birthday song
    const audio = document.getElementById("birthday-audio");
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(() => {});
    }

    // Confetti animation
    if (typeof launchConfetti === "function") {
      launchConfetti();
    }
  });
});


