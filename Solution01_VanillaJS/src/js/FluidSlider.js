/**
 * FluidSlider - 流体填充式滑块组件 (优化版 v3.1)
 * 修复SVG渐变问题,增强视觉效果
 * @author Antigravity AI
 * @version 3.1.0
 */

class FluidSlider {
    constructor(selector, options = {}) {
      this.options = {
        initialValue: 0,
        // 优化后的颜色配置 - 更接近目标图片
        fluidColors: {
          light: '#FFEAA7',    // 浅金色(高光)
          mid: '#FDCB6E',      // 中橙色
          dark: '#E17055'      // 深橙红色
        },
        waveAmplitude: 6,
        waveFrequency: 0.015,
        onComplete: null,
        onChange: null,
        onDragStart: null,
        onDragEnd: null,
        ...options
      };
  
      this.progress = this.options.initialValue;
      this.isDragging = false;
      this.animationFrame = null;
      this.waveOffset = 0;
  
      // 生成唯一ID避免渐变冲突
      this.uniqueId = `fluid_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
      this.init(selector);
    }
  
    init(selector) {
      const container = document.querySelector(selector);
      if (!container) {
        console.error(`FluidSlider: 找不到容器 "${selector}"`);
        return;
      }
  
      this.container = container;
      this.createElements();
      this.bindEvents();
      this.startAnimation();
      this.updateProgress(this.progress);
    }
  
    createElements() {
      const { light, mid, dark } = this.options.fluidColors;
  
      // 使用唯一ID
      const gradientId = `fluidGradient_${this.uniqueId}`;
      const highlightId = `highlightGradient_${this.uniqueId}`;
      const filterId = `softEdge_${this.uniqueId}`;
  
      this.container.innerHTML = `
        <div class="fluid-slider">
          <div class="slider-track">
            <!-- SVG 流体填充层 -->
            <svg class="fluid-svg" viewBox="0 0 600 100" preserveAspectRatio="none">
              <defs>
                <!-- 流体主渐变 -->
                <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="${light}" stop-opacity="0.95" />
                  <stop offset="50%" stop-color="${mid}" stop-opacity="0.92" />
                  <stop offset="100%" stop-color="${dark}" stop-opacity="0.88" />
                </linearGradient>
                
                <!-- 高光渐变 -->
                <linearGradient id="${highlightId}" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stop-color="rgba(255,255,255,0.7)" />
                  <stop offset="40%" stop-color="rgba(255,255,255,0.3)" />
                  <stop offset="100%" stop-color="rgba(255,255,255,0)" />
                </linearGradient>
                
                <!-- 柔和边缘滤镜 -->
                <filter id="${filterId}">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="1.2" />
                </filter>
              </defs>
              
              <!-- 主流体路径 -->
              <path class="fluid-main" fill="url(#${gradientId})" filter="url(#${filterId})" />
              
              <!-- 高光层 -->
              <path class="fluid-highlight" fill="url(#${highlightId})" />
            </svg>
            
            <!-- 百分比文字 -->
            <span class="percentage-text">0%</span>
          </div>
          
          <!-- 拖动热区 -->
          <div class="drag-hotspot"></div>
        </div>
      `;
  
      this.slider = this.container.querySelector('.fluid-slider');
      this.track = this.container.querySelector('.slider-track');
      this.svg = this.container.querySelector('.fluid-svg');
      this.fluidMain = this.container.querySelector('.fluid-main');
      this.fluidHighlight = this.container.querySelector('.fluid-highlight');
      this.hotspot = this.container.querySelector('.drag-hotspot');
      this.percentageText = this.container.querySelector('.percentage-text');
    }
  
    bindEvents() {
      this.hotspot.addEventListener('mousedown', this.onDragStart.bind(this));
      document.addEventListener('mousemove', this.onDragMove.bind(this));
      document.addEventListener('mouseup', this.onDragEnd.bind(this));
  
      this.hotspot.addEventListener('touchstart', this.onDragStart.bind(this), { passive: false });
      document.addEventListener('touchmove', this.onDragMove.bind(this), { passive: false });
      document.addEventListener('touchend', this.onDragEnd.bind(this));
  
      window.addEventListener('resize', this.debounce(() => {
        this.updateFluidPath();
      }, 250));
    }
  
    onDragStart(e) {
      e.preventDefault();
      this.isDragging = true;
      this.hotspot.classList.add('dragging');
  
      if (this.options.onDragStart) {
        this.options.onDragStart();
      }
    }
  
    onDragMove(e) {
      if (!this.isDragging) return;
      e.preventDefault();
  
      const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
      const rect = this.track.getBoundingClientRect();
  
      let newProgress = ((clientX - rect.left) / rect.width) * 100;
      newProgress = Math.max(0, Math.min(100, newProgress));
  
      this.updateProgress(newProgress);
    }
  
    onDragEnd(e) {
      if (!this.isDragging) return;
  
      this.isDragging = false;
      this.hotspot.classList.remove('dragging');
  
      if (this.options.onDragEnd) {
        this.options.onDragEnd();
      }
  
      if (this.progress >= 100) {
        this.triggerComplete();
      }
    }
  
    updateProgress(value) {
      this.progress = Math.max(0, Math.min(100, value));
  
      this.percentageText.textContent = Math.round(this.progress) + '%';
  
      if (this.progress > 85) {
        this.percentageText.classList.add('near-complete');
      } else {
        this.percentageText.classList.remove('near-complete');
      }
  
      if (this.options.onChange) {
        this.options.onChange(this.progress);
      }
    }
  
    startAnimation() {
      const animate = () => {
        this.waveOffset += 0.05;
        this.updateFluidPath();
        this.animationFrame = requestAnimationFrame(animate);
      };
      animate();
    }
  
    updateFluidPath() {
      const svgWidth = 600;
      const svgHeight = 100;
      const { waveAmplitude, waveFrequency } = this.options;
  
      const fluidWidth = (this.progress / 100) * svgWidth;
  
      if (fluidWidth <= 0) {
        this.fluidMain.setAttribute('d', '');
        this.fluidHighlight.setAttribute('d', '');
        return;
      }
  
      const centerY = svgHeight / 2;
      const fluidHeight = svgHeight * 0.75;
      const topY = centerY - fluidHeight / 2;
      const bottomY = centerY + fluidHeight / 2;
  
      let topWavePath = '';
      let bottomWavePath = '';
  
      const step = 5;
  
      // 顶部波浪
      for (let x = 0; x <= fluidWidth; x += step) {
        const waveY = Math.sin(x * waveFrequency + this.waveOffset) * waveAmplitude;
        const y = topY + waveY;
  
        if (x === 0) {
          topWavePath += `M ${x},${y}`;
        } else {
          topWavePath += ` L ${x},${y}`;
        }
      }
  
      topWavePath += ` L ${fluidWidth},${bottomY}`;
  
      // 底部波浪
      for (let x = fluidWidth; x >= 0; x -= step) {
        const waveY = Math.sin(x * waveFrequency - this.waveOffset) * waveAmplitude * 0.7;
        const y = bottomY + waveY;
        bottomWavePath += ` L ${x},${y}`;
      }
  
      bottomWavePath += ` L 0,${topY}`;
  
      const mainPath = topWavePath + bottomWavePath + ' Z';
      this.fluidMain.setAttribute('d', mainPath);
  
      // 高光层
      const highlightHeight = fluidHeight * 0.35;
      let highlightPath = '';
  
      for (let x = 0; x <= fluidWidth; x += step) {
        const waveY = Math.sin(x * waveFrequency + this.waveOffset) * waveAmplitude;
        const y = topY + waveY;
  
        if (x === 0) {
          highlightPath += `M ${x},${y}`;
        } else {
          highlightPath += ` L ${x},${y}`;
        }
      }
  
      highlightPath += ` L ${fluidWidth},${topY + highlightHeight}`;
  
      for (let x = fluidWidth; x >= 0; x -= step) {
        const y = topY + highlightHeight;
        highlightPath += ` L ${x},${y}`;
      }
  
      highlightPath += ' Z';
      this.fluidHighlight.setAttribute('d', highlightPath);
    }
  
    triggerComplete() {
      this.slider.classList.add('completed');
  
      if (this.options.onComplete) {
        this.options.onComplete();
      }
  
      setTimeout(() => {
        this.slider.classList.remove('completed');
      }, 600);
    }
  
    debounce(func, wait) {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    }
  
    getProgress() {
      return this.progress;
    }
  
    setProgress(value) {
      this.updateProgress(value);
    }
  
    reset() {
      this.updateProgress(0);
    }
  
    destroy() {
      if (this.animationFrame) {
        cancelAnimationFrame(this.animationFrame);
      }
      // 注释掉DOM移除,避免页面跳转时出现空白闪烁
      // 在跳转场景下,保留DOM元素直到新页面加载完成
      // if (this.slider) {
      //   this.slider.remove();
      // }
    }
  }
  
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = FluidSlider;
  }
  