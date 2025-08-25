# 图片存放服务

一个简单易用的图片存放服务，提供上传图片并生成可被外部小程序引用的URL地址功能。

## 功能特性

- 📤 **图片上传**：支持拖拽或选择文件上传图片
- 🔗 **获取URL**：自动生成可被外部引用的图片URL
- 📋 **一键复制**：快速复制图片URL到剪贴板
- 🔍 **搜索功能**：根据文件名搜索图片
- 📱 **响应式设计**：适配各种设备屏幕
- 🎨 **美观界面**：使用Tailwind CSS构建现代化UI
- 📊 **分页展示**：支持大量图片的分页浏览

## 技术栈

- **后端**：Node.js + Express
- **文件上传**：Multer
- **前端**：HTML5 + JavaScript + Tailwind CSS
- **跨域支持**：CORS

## 安装和使用

### 1. 安装依赖

```bash
npm install
```

### 2. 启动服务

开发模式（使用nodemon自动重启）：
```bash
npm run dev
```

生产模式：
```bash
npm start
```

服务启动后，访问 http://localhost:3000 即可使用图片存放服务。

## API接口

### 1. 上传图片

- **URL**: `/upload`
- **方法**: `POST`
- **参数**: `image` (文件)
- **返回**: JSON格式，包含图片URL和文件名

示例响应：
```json
{
  "success": true,
  "message": "图片上传成功",
  "imageUrl": "http://localhost:3000/images/1634567890123_example.jpg",
  "filename": "1634567890123_example.jpg"
}
```

### 2. 获取图片列表

- **URL**: `/images/list`
- **方法**: `GET`
- **参数**: 无
- **返回**: JSON格式，包含所有图片的信息

示例响应：
```json
{
  "success": true,
  "images": [
    {
      "filename": "1634567890123_example.jpg",
      "url": "http://localhost:3000/images/1634567890123_example.jpg"
    },
    {
      "filename": "1634567890456_another.jpg",
      "url": "http://localhost:3000/images/1634567890456_another.jpg"
    }
  ]
}
```

### 3. 访问图片

直接通过URL访问已上传的图片：
```
http://localhost:3000/images/[filename]
```

## 目录结构

```
├── server.js          # 服务器主文件
├── index.html         # 前端页面
├── package.json       # 项目配置和依赖
├── .gitignore         # Git忽略规则
└── images/            # 图片存储目录（自动创建）
```

## 配置说明

- **端口**: 默认使用3000端口，可在server.js文件中修改
- **存储目录**: 默认存储在`images/`目录下
- **文件命名**: 上传的图片会自动添加时间戳前缀，避免文件名冲突
- **文件限制**: 支持JPG、PNG、GIF等常见图片格式，大小限制为5MB

## 注意事项

1. 请确保有足够的磁盘空间存储图片文件
2. 该服务默认允许所有来源的跨域请求，在生产环境中可根据需要修改CORS配置
3. 如需持久化存储，建议考虑使用云存储服务

## License

MIT