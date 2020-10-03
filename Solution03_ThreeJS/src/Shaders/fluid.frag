varying vec2 vUv;
uniform float uTime;
uniform float uProgress;
uniform vec2 uResolution;
uniform float uDragSpeed; // 拖拽速度，用于形变

// --- SDF Functions ---

// 圆形
float sdCircle(vec2 p, float r) {
    return length(p) - r;
}

// 矩形 (用于轨道)
float sdBox(vec2 p, vec2 b) {
    vec2 d = abs(p) - b;
    return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
}

// 线段 (用于滑块主体 - 棒冰棍)
float sdSegment(in vec2 p, in vec2 a, in vec2 b) {
    vec2 pa = p - a, ba = b - a;
    float h = clamp( dot(pa,ba)/dot(ba,ba), 0.0, 1.0 );
    return length( pa - ba*h );
}

// 平滑融合
float smin(float a, float b, float k) {
    float h = max(k - abs(a - b), 0.0) / k;
    return min(a, b) - h * h * k * (1.0 / 4.0);
}

void main() {
    // 1. 坐标修正 (保持比例)
    vec2 uv = vUv;
    uv -= 0.5;
    float aspect = uResolution.x / uResolution.y;
    uv.x *= aspect;

    // 2. 参数定义
    float trackH = 0.08;       // 轨道高度
    float trackW = 1.2;        // 轨道宽度
    float radius = 0.08;       // 棒冰棍圆角半径 (与高度一致)
    
    // 3. 计算关键坐标
    float leftX = -trackW * 0.5;
    float rightX = trackW * 0.5;
    // 当前滑块头部的 X 坐标
    float currentX = leftX + uProgress * trackW;

    // 4. --- 绘制轨道 (Depression/Groove) ---
    // 简单的圆角矩形槽
    float dTrack = sdBox(uv, vec2(trackW * 0.5, trackH)) - 0.02; // 微调大小

    // 5. --- 绘制主体 (Soft Amber Strip) ---
    
    // 头部翘起形变 (Bending)
    // 根据 uv.x 是否接近 currentX 和 uDragSpeed 来偏移 uv.y
    vec2 deformedUV = uv;
    
    // 如果在滑块头部附近
    float distToHead = currentX - uv.x;
    if (distToHead > -0.1 && distToHead < 0.3) {
        // 简单的弯曲逻辑：速度越快，Y轴偏移越大 (模拟惯性)
        // 头部向上翘起的效果可以是一个固定的偏移加上动态的速度偏移
        float bendFactor = smoothstep(0.3, -0.1, distToHead); // 头部区域权重
        deformedUV.y -= bendFactor * uDragSpeed * 0.1; // 动态弯曲
        
        // 静态翘起 (Target Pics 特征: 右端头部翘起)
        // 这里简单模拟：接近 endpoints 时 y 坐标加一点
        // deferred for later refinement
    }

    // 使用 Segment 绘制从左端到当前进度的长条
    // 起点: 左侧端点, 终点: 当前进度点
    float dBar = sdSegment(deformedUV, vec2(leftX, 0.0), vec2(currentX, 0.0));
    // 减去半径，使其有厚度
    dBar -= radius;

    // 6. --- 融合与光影 ---
    
    // 临时视觉输出
    vec3 color = vec3(0.0);
    float alpha = 0.0;

    // 轨道颜色 (深一点的背景)
    if (dTrack < 0.0) {
        color = vec3(0.9, 0.9, 0.9); // 浅灰槽
        
        // 内阴影模拟 (简单的距离场梯度)
        float dInside = -dTrack;
        color *= smoothstep(0.0, 0.05, dInside); 
        alpha = 1.0;
    }

    // 滑块主体颜色 (琥珀色渐变)
    if (dBar < 0.0) {
        // 基础位置渐变: 左(透明/浅色) -> 右(深琥珀色)
        float gradientFactor = smoothstep(leftX, rightX, uv.x);
        
        // 琥珀色板
        vec3 colorClear = vec3(0.95, 0.98, 1.0); // 几乎透明/淡蓝玻璃
        vec3 colorAmber = vec3(1.0, 0.7, 0.1);   // 浓郁琥珀
        
        vec3 finalColor = mix(colorClear, colorAmber, gradientFactor * uProgress + 0.2);
        
        // 叠加一点毛玻璃的高光防伪 (Fake Frost)
        // 简单的噪声或高光
        float highlight = smoothstep(0.02, 0.0, abs(dBar + 0.05)); // 边缘高光
        finalColor += highlight * 0.3;

        color = finalColor;
        alpha = 0.9; // 半透明
    }

    // 使用 SDF 抗锯齿混合形状
    // 这里简单丢弃外部
    if (dTrack > 0.0 && dBar > 0.0) {
        discard;
    }

    gl_FragColor = vec4(color, alpha);
}
