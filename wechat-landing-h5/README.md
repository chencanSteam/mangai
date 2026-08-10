# 满改平台 - 微信 H5 落地页

为微信支付开发平台入驻申请准备的独立 H5 页面项目。

## 说明

- 纯静态 H5 页面，无后端依赖，无需构建工具。
- 页面直接展示满改平台宣传海报原图，1:1 还原设计稿。
- 未包含任何按钮或交互跳转，符合平台材料展示要求。

## 文件结构

```
wechat-landing-h5/
├── index.html          # H5 页面主文件
├── preview.cmd         # Windows 一键预览脚本（双击运行）
├── preview.cjs         # 预览用 Node 本地服务器
├── images/
│   └── original.png    # 满改平台宣传海报原图
└── README.md
```

## 本地预览

### 方式一：双击运行（推荐）

在 Windows 资源管理器中，直接双击 `preview.cmd`，会自动启动本地服务器并尝试打开浏览器。

浏览器地址：`http://localhost:3456`

### 方式二：直接打开 HTML

双击 `index.html` 用浏览器打开即可查看效果。

### 方式三：命令行启动

```bash
cd wechat-landing-h5
node preview.cjs
```

然后浏览器访问 `http://localhost:3456`。

## 上线部署

将整个 `wechat-landing-h5` 目录上传至任意静态站点托管服务（Nginx、OSS、Vercel、Cloudflare Pages 等），用 HTTPS 域名访问，把链接提交给微信支付开发平台审核即可。

## 注意事项

- 建议线上访问使用 HTTPS，以满足微信生态的安全要求。
- 如果 `preview.cmd` 提示找不到 Node，请确认本机已安装 Node.js（项目根目录下已有可用环境）。
- 如需更换海报图，只需替换 `images/original.png` 文件。
