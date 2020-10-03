/**
 * 主入口文件
 * 初始化滑块并配置回调
 * @author Antigravity AI
 * @version 4.1.7 - 状态驱动架构
 */

/**
 * 动画状态管理器
 * 职责: 确保容器只有一个active状态类,避免animation冲突
 */
class AnimationStateManager {
    constructor(container) {
        this.container = container;
        // 所有可能的状态类
        this.states = ['state-init', 'state-pulse', 'state-leaving', 'state-entering'];
    }

    /**
     * 清除所有状态类
     */
    clearAllStates() {
        this.states.forEach(state => {
            this.container.classList.remove(state);
        });
    }

    /**
     * 设置新状态 (原子操作: 清空+设置)
     * @param {string} newState - 新状态类名,如'state-pulse'
     */
    setState(newState) {
        this.clearAllStates();

        // 强制重排,确保清理生效
        void this.container.offsetWidth;

        if (newState) {
            this.container.classList.add(newState);
            console.log(`🎬 动画状态: ${newState}`);
        }
    }

    /**
     * 等待当前动画完成后清理状态
     * @param {number} duration - 动画时长(毫秒)
     */
    clearAfter(duration) {
        setTimeout(() => {
            this.clearAllStates();
            console.log('🧹 动画状态已清理');
        }, duration);
    }
}

// 等待 DOM 加载完成
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎨 3D 流体滑块进度条初始化中...');

    const container = document.querySelector('.container');
    const animState = new AnimationStateManager(container);

    // 初始淡入
    animState.setState('state-init');
    animState.clearAfter(600);

    // 获取进度显示元素
    const progressValueElement = document.getElementById('progress-value');

    // 初始化滑块
    const slider = new FluidSlider('#fluid-slider', {
        // 初始进度
        initialValue: 0,

        // 流体颜色配置(优化后 - 接近目标图片的琥珀色)
        fluidColors: {
            light: '#FFEAA7',  // 浅金色(高光区域)
            mid: '#FDCB6E',    // 中橙色(主体)
            dark: '#E17055'    // 深橙红色(底部)
        },

        // 波浪参数
        waveAmplitude: 6,      // 波浪幅度
        waveFrequency: 0.015,  // 波浪频率

        // 回调函数配置

        /**
         * 进度变化时触发
         * @param {number} value - 当前进度值
         */
        onChange: (value) => {
            // 更新进度显示
            if (progressValueElement) {
                progressValueElement.textContent = Math.round(value);
            }

            // 控制台输出(调试用)
            console.log('📊 当前进度:', Math.round(value) + '%');

            // 当进度接近100%时的提示
            if (value >= 95 && value < 100) {
                console.log('🎯 即将完成!');
            }
        },

        /**
         * 开始拖动时触发
         */
        onDragStart: () => {
            console.log('👆 开始拖动滑块');
        },

        /**
         * 结束拖动时触发
         */
        onDragEnd: () => {
            console.log('✋ 结束拖动');
        },

        /**
         * 达到100%时触发
         * 状态驱动架构: pulse -> leaving -> 切换内容
         */
        onComplete: () => {
            console.log('🎉 滑块完成!触发完成事件...');

            const container = document.querySelector('.container');
            const animState = new AnimationStateManager(container);

            // 状态1: 脉冲动画
            animState.setState('state-pulse');

            // 触发视觉特效(粒子+彩虹)
            createParticles();
            createRainbowSweep();

            // 脉冲完成后淡出
            setTimeout(() => {
                animState.setState('state-leaving');

                // 淡出完成后切换内容
                setTimeout(() => {
                    console.log('🔄 切换到成功页面...');
                    showSuccessPage();
                }, 400); // leaving动画时长
            }, 600); // pulse动画时长
        }
    });

    // 将滑块实例挂载到全局(便于调试)
    window.fluidSlider = slider;

    console.log('✅ 滑块初始化完成!');
    console.log('💡 提示: 可通过 window.fluidSlider 访问滑块实例');

    // 添加键盘快捷键(可选功能)
    addKeyboardShortcuts(slider);

    // 添加开发者工具(仅开发环境)
    if (isDevelopmentMode()) {
        addDeveloperTools(slider);
    }

    // 监听浏览器前进/后退按钮
    window.addEventListener('popstate', (event) => {
        if (event.state && event.state.page === 'success') {
            showSuccessPage();
        } else {
            resetToIndex();
        }
    });
});

/**
 * 添加键盘快捷键
 * @param {FluidSlider} slider - 滑块实例
 */
function addKeyboardShortcuts(slider) {
    document.addEventListener('keydown', (e) => {
        // 左箭头: 减少进度
        if (e.key === 'ArrowLeft') {
            const newProgress = Math.max(0, slider.getProgress() - 5);
            slider.setProgress(newProgress);
        }

        // 右箭头: 增加进度
        if (e.key === 'ArrowRight') {
            const newProgress = Math.min(100, slider.getProgress() + 5);
            slider.setProgress(newProgress);
        }

        // R键: 重置
        if (e.key === 'r' || e.key === 'R') {
            slider.reset();
            console.log('🔄 滑块已重置');
        }

        // 空格键: 设置为100%
        if (e.key === ' ') {
            e.preventDefault();
            slider.setProgress(100);
        }
    });

    console.log('⌨️ 键盘快捷键已启用:');
    console.log('  ← 减少进度');
    console.log('  → 增加进度');
    console.log('  R 重置');
    console.log('  空格 完成');
}

/**
 * 判断是否为开发模式
 * @returns {boolean}
 */
function isDevelopmentMode() {
    return window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.protocol === 'file:';
}

/**
 * 添加开发者工具
 * @param {FluidSlider} slider - 滑块实例
 */
function addDeveloperTools(slider) {
    // 创建开发者工具面板
    const devPanel = document.createElement('div');
    devPanel.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 15px;
    border-radius: 8px;
    font-size: 12px;
    z-index: 10000;
    font-family: monospace;
  `;

    devPanel.innerHTML = `
    <div style="margin-bottom: 10px; font-weight: bold;">🛠️ 开发者工具</div>
    <button onclick="window.fluidSlider.setProgress(0)" style="margin: 2px; padding: 5px 10px; cursor: pointer;">0%</button>
    <button onclick="window.fluidSlider.setProgress(50)" style="margin: 2px; padding: 5px 10px; cursor: pointer;">50%</button>
    <button onclick="window.fluidSlider.setProgress(100)" style="margin: 2px; padding: 5px 10px; cursor: pointer;">100%</button>
  `;

    document.body.appendChild(devPanel);
    console.log('🛠️ 开发者工具已加载');
}

/**
 * 提交表单数据(示例)
 * 实际项目中可以在这里发送数据到服务器
 */
function submitFormData() {
    const formData = {
        timestamp: new Date().toISOString(),
        progress: 100,
        userAgent: navigator.userAgent
    };

    console.log('📤 提交表单数据:', formData);

    // 示例: 使用 Fetch API 发送数据
    /*
    fetch('/api/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
      console.log('✅ 服务器响应:', data);
    })
    .catch(error => {
      console.error('❌ 提交失败:', error);
    });
    */
}

/**
 * 显示成功页面(SPA切换)
 * 状态驱动: entering -> 清空
 */
function showSuccessPage() {
    const container = document.querySelector('.container');
    if (!container) return;
    const animState = new AnimationStateManager(container);

    // 替换内容为成功页面
    container.innerHTML = successPageTemplate();

    // 进入新页状态
    animState.setState('state-entering');
    animState.clearAfter(400);

    // 更新URL(不刷新页面)
    history.pushState({ page: 'success' }, '提交成功', 'success.html');

    // 更新页面标题
    document.title = '提交成功';

    console.log('✅ 已切换到成功页面');
}

/**
 * 返回首页(SPA切换)
 * 状态驱动: leaving -> 内容替换 -> entering -> 清空
 */
function resetToIndex() {
    const container = document.querySelector('.container');
    if (!container) return;
    const animState = new AnimationStateManager(container);

    // 离开当前页
    animState.setState('state-leaving');

    setTimeout(() => {
        // 替换内容
        container.innerHTML = indexPageTemplate();

        // 进入新页
        animState.setState('state-entering');
        animState.clearAfter(400);

        // 重新初始化滑块
        initSlider();

        // 更新URL
        history.pushState({ page: 'index' }, '3D 流体滑块进度条', 'index.html');
        document.title = '3D 流体滑块进度条';

        console.log('✅ 已返回首页');
    }, 400); // leaving动画时长
}

/**
 * 初始化滑块(提取为独立函数以便重用)
 * 状态驱动: pulse -> leaving -> 切换
 */
function initSlider() {
    const progressValueElement = document.getElementById('progress-value');

    const slider = new FluidSlider('#fluid-slider', {
        initialValue: 0,
        fluidColors: {
            light: '#FFEAA7',
            mid: '#FDCB6E',
            dark: '#E17055'
        },
        waveAmplitude: 6,
        waveFrequency: 0.015,
        onChange: (value) => {
            if (progressValueElement) {
                progressValueElement.textContent = Math.round(value);
            }
            console.log('📊 当前进度:', Math.round(value) + '%');
        },
        onDragStart: () => console.log('👆 开始拖动滑块'),
        onDragEnd: () => console.log('✋ 结束拖动'),
        onComplete: () => {
            console.log('🎉 滑块完成!触发完成事件...');

            const container = document.querySelector('.container');
            const animState = new AnimationStateManager(container);

            // 脉冲动画
            animState.setState('state-pulse');

            // 触发视觉特效
            createParticles();
            createRainbowSweep();

            setTimeout(() => {
                animState.setState('state-leaving');
                setTimeout(() => {
                    console.log('🔄 切换到成功页面...');
                    showSuccessPage();
                }, 400);
            }, 600);
        }
    });

    window.fluidSlider = slider;

    // 注意:不要在这里重复添加键盘快捷键和开发者工具!
    // 这些只需要在页面首次加载时添加一次
}

// 页面卸载前的清理
window.addEventListener('beforeunload', () => {
    if (window.fluidSlider) {
        window.fluidSlider.destroy();
        console.log('🧹 滑块实例已清理');
    }
});
