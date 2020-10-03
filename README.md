# Slider Progress Bar

滑块进度条与流体动画的前端实验项目，包含 Vanilla JavaScript 和 Three.js 两种已有实现，以及待实现的 React 方案说明。

## 目录

| 目录 | 说明 | 当前状态 |
| --- | --- | --- |
| `Solution01_VanillaJS` | HTML、CSS、JavaScript、Canvas；live-server 开发服务器 | 已有源码，可按下方步骤本地验证 |
| `Solution02_React` | React 方案规划 | 只有 README，尚无可运行工程 |
| `Solution03_ThreeJS` | Three.js、GSAP、Vite，含着色器相关代码与配置 | 已有源码，提供开发和构建脚本 |
| `TargetPics` | 视觉参考图片 | 参考资料 |

仓库根目录不是 npm 工程；请进入对应子目录执行 npm 命令。

## 环境

- Git。
- 当前受支持的 Node.js LTS（现有依赖要求至少满足 Node.js 20.17.0）及 npm 10.8.3 或更高版本。
- 支持 WebGL 的现代浏览器，用于 Three.js 方案。

以下命令使用 Windows PowerShell；其他系统将 `npm.cmd` 替换成 `npm`。

## 获取项目

```powershell
git clone https://github.com/ErrConnectionReset/slider-progress-bar.git
Set-Location slider-progress-bar
```

## 运行 Vanilla JavaScript 方案

从仓库根目录执行：

```powershell
Set-Location Solution01_VanillaJS
npm.cmd ci
npm.cmd run dev
```

打开 http://127.0.0.1:8080 。停止服务时按 Ctrl+C。

检查页面加载、拖动进度、达到 100% 后的成功页、返回首页及重复操作，并检查浏览器控制台。该方案没有 `build` 或自动化 `test` 脚本；运行源码使用本地 HTTP 服务。

## 运行 Three.js 方案

另开终端，进入克隆所得仓库根目录，再执行：

```powershell
Set-Location Solution03_ThreeJS
npm.cmd ci
npm.cmd run dev
```

打开终端打印的 Local 地址，通常是 http://localhost:5173 。实际端口以终端输出为准。停止服务时按 Ctrl+C。

在同一个 Three.js 目录检查构建并预览：

```powershell
npm.cmd run build
npm.cmd run preview
```

预览地址通常为 http://localhost:4173 ，以终端输出为准。构建输出 `dist/` 不提交到 Git。

## 说明与限制

- React 目录目前不能执行安装或运行命令。
- 子目录 README 保留了原方案说明，可能包含历史描述或规划；当前入口和脚本以本 README 及对应 `package.json` 为准。
- 本仓库没有自动化测试脚本；构建成功不代表交互和视觉效果已经通过验证。
- Vanilla 代码中包含被注释的表单提交示例；本仓库不包含后端服务。
- GitHub 仓库存储代码；此处没有配置在线演示或 GitHub Pages 部署。
- 不提交 `node_modules/`、构建产物、本机配置或真实凭据。

## 子方案说明

- [Vanilla JavaScript](Solution01_VanillaJS/README.md)
- [React 规划](Solution02_React/README.md)
- [Three.js](Solution03_ThreeJS/README.md)

## 许可说明

当前未在仓库根目录提供统一的 LICENSE；届时会先核实具体文件与依赖的许可。`Solution01_VanillaJS/package.json` 原有 MIT 标记不应被解读为本仓库所有代码、参考图片和第三方依赖都统一采用 MIT。后续确定项目许可时，会同步更新说明。