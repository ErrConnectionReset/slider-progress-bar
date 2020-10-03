/**
 * 页面模板模块
 * 用于SPA架构的页面内容切换
 * @author Antigravity AI
 * @version 1.0.0
 */

/**
 * 成功页面模板
 * @returns {string} 成功页面的HTML结构
 */
function successPageTemplate() {
    return `
        <div class="success-icon">
            <div class="checkmark-circle">
                <span class="checkmark">✓</span>
            </div>
        </div>

        <h1>🎉 提交成功!</h1>

        <p class="success-message">
            您的表单已成功提交并处理完成
        </p>

        <p class="success-detail">
            感谢您使用 3D 流体滑块组件完成操作
        </p>

        <div class="button-group">
            <a href="#" class="back-button" onclick="resetToIndex(); return false;">返回首页</a>
            <a href="#" class="view-button" onclick="alert('查看详情功能演示'); return false;">查看详情</a>
        </div>
    `;
}

/**
 * 首页模板
 * @returns {string} 首页的HTML结构
 */
function indexPageTemplate() {
    return `
        <h1>滑动解锁</h1>
        <p class="subtitle">体验流畅的流体拉伸效果</p>

        <!-- 滑块容器 -->
        <div id="fluid-slider"></div>

        <p class="instruction">💡 拖动流体滑块至 <strong>100%</strong> 完成操作</p>

        <div class="info-box">
            <p>当前进度: <span id="progress-value">0</span>%</p>
        </div>
    `;
}
