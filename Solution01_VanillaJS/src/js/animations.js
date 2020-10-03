/**
 * 动画特效库
 * 提供独立的视觉特效函数(粒子、彩虹等)
 * 注意: 容器脉冲动画已由AnimationStateManager的state-pulse状态管理
 * @author Antigravity AI
 * @version 4.1.7 - 状态驱动架构
 */


// showSuccessAnimation函数已移除
// 脉冲动画现在由main.js中的AnimationStateManager控制
// 使用: animState.setState('state-pulse')

/**
 * 创建粒子爆炸效果
 */
function createParticles() {
    // 创建粒子容器
    const particlesContainer = document.createElement('div');
    particlesContainer.className = 'particles-container';
    document.body.appendChild(particlesContainer);

    // 粒子颜色数组
    const colors = [
        '#FFD700', // 金色
        '#FF8C00', // 橙色
        '#FF6347', // 番茄红
        '#FF1493', // 深粉色
        '#9370DB', // 紫色
        '#00CED1', // 深青色
        '#32CD32'  // 酸橙绿
    ];

    // 计算中心点(滑块位置)
    const slider = document.querySelector('.fluid-slider');
    let centerX = window.innerWidth / 2;
    let centerY = window.innerHeight / 2;

    if (slider) {
        const rect = slider.getBoundingClientRect();
        centerX = rect.left + rect.width;
        centerY = rect.top + rect.height / 2;
    }

    // 创建50个粒子
    const particleCount = 50;
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = centerX + 'px';
        particle.style.top = centerY + 'px';
        particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];

        // 计算粒子运动方向
        const angle = (Math.PI * 2 * i) / particleCount;
        const velocity = 100 + Math.random() * 150; // 随机速度
        const tx = Math.cos(angle) * velocity;
        const ty = Math.sin(angle) * velocity;

        particle.style.setProperty('--tx', tx + 'px');
        particle.style.setProperty('--ty', ty + 'px');

        particlesContainer.appendChild(particle);
    }

    // 1秒后移除粒子容器
    setTimeout(() => {
        particlesContainer.remove();
    }, 1000);
}

/**
 * 创建彩虹渐变扫过效果
 */
function createRainbowSweep() {
    const slider = document.querySelector('.fluid-slider');

    if (!slider) return;

    slider.classList.add('rainbow-sweep');

    // 1秒后移除效果
    setTimeout(() => {
        slider.classList.remove('rainbow-sweep');
    }, 1000);
}

/**
 * 播放成功音效(可选)
 * 需要准备音频文件
 */
function playSuccessSound() {
    try {
        const audio = new Audio('assets/success.mp3');
        audio.volume = 0.5;
        audio.play().catch(err => {
            console.log('音频播放失败:', err);
        });
    } catch (err) {
        console.log('音频加载失败:', err);
    }
}

/**
 * 创建闪光效果
 */
function createFlashEffect() {
    const flash = document.createElement('div');
    flash.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: white;
    opacity: 0;
    pointer-events: none;
    z-index: 9998;
    animation: flash-animation 0.5s ease-out;
  `;

    document.body.appendChild(flash);

    // 添加闪光动画
    const style = document.createElement('style');
    style.textContent = `
    @keyframes flash-animation {
      0% { opacity: 0; }
      50% { opacity: 0.8; }
      100% { opacity: 0; }
    }
  `;
    document.head.appendChild(style);

    // 移除元素
    setTimeout(() => {
        flash.remove();
        style.remove();
    }, 500);
}

/**
 * 创建五彩纸屑效果
 */
function createConfetti() {
    const confettiCount = 100;
    const container = document.createElement('div');
    container.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 9999;
    overflow: hidden;
  `;
    document.body.appendChild(container);

    const colors = ['#FFD700', '#FF8C00', '#FF6347', '#FF1493', '#9370DB'];

    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.style.cssText = `
      position: absolute;
      width: ${5 + Math.random() * 10}px;
      height: ${5 + Math.random() * 10}px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      top: -10px;
      left: ${Math.random() * 100}%;
      opacity: ${0.5 + Math.random() * 0.5};
      transform: rotate(${Math.random() * 360}deg);
      animation: confetti-fall ${2 + Math.random() * 2}s linear forwards;
    `;
        container.appendChild(confetti);
    }

    // 添加下落动画
    const style = document.createElement('style');
    style.textContent = `
    @keyframes confetti-fall {
      to {
        transform: translateY(100vh) rotate(${360 + Math.random() * 360}deg);
        opacity: 0;
      }
    }
  `;
    document.head.appendChild(style);

    // 清理
    setTimeout(() => {
        container.remove();
        style.remove();
    }, 4000);
}

/**
 * 震动反馈(移动端)
 */
function vibrateDevice() {
    if ('vibrate' in navigator) {
        // 震动模式: [震动时间, 暂停时间, ...]
        navigator.vibrate([100, 50, 100]);
    }
}

/**
 * 组合动画效果
 * @param {string} type - 动画类型: 'simple', 'medium', 'full'
 */
function playAnimation(type = 'medium') {
    switch (type) {
        case 'simple':
            // 简单效果
            createFlashEffect();
            break;

        case 'medium':
            // 中等效果(默认)
            showSuccessAnimation();
            vibrateDevice();
            break;

        case 'full':
            // 完整效果
            showSuccessAnimation();
            createConfetti();
            createFlashEffect();
            vibrateDevice();
            break;

        default:
            showSuccessAnimation();
    }
}

// 导出函数(如果使用模块化)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        showSuccessAnimation,
        createParticles,
        createRainbowSweep,
        createFlashEffect,
        createConfetti,
        vibrateDevice,
        playAnimation
    };
}
