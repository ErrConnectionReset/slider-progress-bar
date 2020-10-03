# 方案3: Three.js 3D 高保真流体滑块

## 📖 方案概述

本方案旨在利用 **Three.js** 和 **WebGL (GLSL Shader)** 技术，实现极其接近目标参考图（TargetPics）效果的 3D 流体滑块进度条。
与 Vanilla JS (Canvas 2D) 方案相比，Three.js 方案可以利用 GPU 加速实现更复杂的流体形变、光影反射和物理细节，达到“影视级”或“高阶动效”的视觉体验。

---

## 🛠 技术选型

| 模块 | 技术栈 | 说明 |
| :--- | :--- | :--- |
| **渲染引擎** | **Three.js (r150+)** | 业界标准的 WebGL 封装库，提供强大的场景管理和材质系统。 |
| **着色器语言** | **GLSL (ES 3.0)** | 核心！通过编写 Fragment Shader 实现像素级的流体融合（Metaballs/Raymarching）和噪声畸变。 |
| **动画引擎** | **GSAP (GreenSock)** | 处理 JS 端的数值过渡（如 Progress 缓动、鼠标回弹），将平滑数值传给 Shader Uniforms。 |
| **构建工具** | **Vite** | 极速 HMR，便于调试 Shader 效果。 |
| **辅助库** | **dat.GUI / Leva** | 开发期用于实时调整流体阈值、颜色、粘度等参数，快速对齐参考图。 |

---

## 🎨 视觉实现原理 (核心难点攻克)

根据用户对 **“琥珀色毛玻璃软质塑料条”** 的具体描述，我们将技术重点调整为：

### 1. 材质与着色 (Frosted Glass & Gradient)
*   **Transmission (透射)**: 使用 `MeshPhysicalMaterial` 的 `transmission` 属性或自定义 Shader 来模拟半透明毛玻璃的折射效果。
*   **Roughness (粗糙度)**: 高粗糙度透射，产生磨砂感。
*   **Color Gradient (颜色渐变)**: 在 Shader 中根据 UV 坐标，实现从左侧 `vec3(1.0)` (无色) 到右侧 `vec3(1.0, 0.75, 0.0)` (琥珀色) 的平滑过渡。

### 2. 几何形变 (Soft Body Bending)
*   **Vertex Shader Displacement**: 不再仅仅是流体融合，更多是**弯曲 (Bending)**。
*   **Bending Logic**: 根据滑动的进度 `uProgress`，在 Vertex Shader 中计算弯曲矩阵。
    *   **头部翘起**: 修改顶点 Y 轴坐标，使其在滑动前端呈抛物线状翘起。
    *   **中间弯折**: 模拟软胶条受力后的自然隆起或下陷。

### 3. 轨道凹槽 (Track Groove)
*   **Geometry**: 创建内凹的几何体，或者使用 Normal Map / Displacement Map 模拟凹槽深度，使其看起来像是被“刻”在背景里的。

---

## 📅 实施落地方案

### 阶段一：环境搭建与基础架构 (Day 1)
1.  初始化 Vite + Three.js 项目结构。
2.  搭建基础 3D 场景（Scene, OrthographicCamera, WebGLRenderer）。
3.  实现视口自适应（Resize Handler）。
4.  创建基础 `PlaneMesh` 作为 Shader 的画布。

### 阶段二：Shader原型开发 (Day 2)
1.  **编写顶点着色器 (Vertex Shader)**: 传递基础 UV 和 Time。
2.  **编写片元着色器 (Fragment Shader) - 基础**: 绘制一个圆（手柄）和一个圆角矩形（轨道）。
3.  **编写片元着色器 - 融合**: 实现 `smin` 函数，联调手柄与轨道的平滑融合效果。
4.  **调试工具**: 接入 dat.GUI，把 `uThreshold`, `uSmoothness` 等参数暴露出来，手动调整直到形态满意。

### 阶段三：交互逻辑与动画 (Day 3)
1.  **鼠标/触摸事件交互**: 将屏幕坐标映射到 Shader 的 `uMouse` 或 `uProgress`。
2.  **GSAP 接入**:
    *   实现拖拽时的“弹性滞后”效果（物理感）。
    *   松手时的回弹动画。
3.  **流体动态优化**: 根据移动速度动态改变流体的“拉伸感”（Velocity based distortion）。

### 阶段四：视觉打磨与交付 (Day 4)
1.  **光影材质上色**: 调整颜色，加入高光和边缘光，对齐参考图。
2.  **性能优化**: 确保在低端设备降级或保持 60fps（控制 Raymarching 步数或简化噪声算法）。
3.  **封装与文档**: 整理代码，输出最终使用文档。

---

## 📁 目录结构规划

```
Solution03_ThreeJS/
├── index.html
├── package.json
├── vite.config.js       # 配置 GLSL 插件
├── src/
│   ├── main.js          # 入口
│   ├── Components/
│   │   ├── Scene.js     # Three.js 场景管理器
│   │   └── LiquidSlider.js # 核心组件类
│   ├── Shaders/
│   │   ├── fluid.vert   # 顶点处理
│   │   ├── fluid.frag   # 核心流体逻辑
│   │   └── utils.glsl   # SDF, Noise 等通用函数
│   └── Utils/
│       └── sizes.js     # 屏幕适配
└── assets/              # 贴图、环境图
```

---

## ✅ 验收标准
1.  **形态还原**: 静态下接近参考图的几何形态。
2.  **动态自然**: 拖动时有符合物理直觉的液体粘滞感。
3.  **性能达标**: 桌面端稳定 60fps。
