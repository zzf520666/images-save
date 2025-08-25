const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises; // 使用Promise版本的fs API
const fsSync = require('fs'); // 保留同步API用于初始化

const app = express();
const PORT = 3000;

// 创建图片存储目录
const IMAGE_DIR = path.join(__dirname, 'images');
if (!fsSync.existsSync(IMAGE_DIR)) {
  fsSync.mkdirSync(IMAGE_DIR);
}

// 图片列表缓存
let imageCache = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5000; // 缓存5秒

// 配置CORS允许所有来源访问
app.use(cors({
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 使用gzip压缩
app.use(express.json({
  limit: '10mb' // 增加JSON请求体大小限制
}));

// 前置中间件 - 记录请求响应时间
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (duration > 1000) { // 超过1秒的请求记录到控制台
      console.log(`Slow request: ${req.method} ${req.url} - ${duration}ms`);
    }
  });
  next();
});

// 配置multer用于文件上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, IMAGE_DIR);
  },
  filename: (req, file, cb) => {
    // 为了避免文件名冲突，使用时间戳+原始文件名
    const timestamp = Date.now();
    const originalName = file.originalname;
    cb(null, `${timestamp}_${originalName}`);
  }
});

const upload = multer({ storage });

// 提供静态文件访问
app.use('/images', express.static(IMAGE_DIR));

// 提供HTML页面
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// 刷新图片缓存函数
async function refreshImageCache() {
  try {
    const files = await fs.readdir(IMAGE_DIR);
    
    // 过滤非图片文件
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
    const imageFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return imageExtensions.includes(ext);
    });
    
    // 对图片进行排序（按修改时间倒序）
    const sortedImages = await Promise.all(imageFiles.map(async (file) => {
      try {
        const stats = await fs.stat(path.join(IMAGE_DIR, file));
        return {
          filename: file,
          mtime: stats.mtimeMs
        };
      } catch (error) {
        console.error(`获取文件信息失败: ${file}`, error);
        return { filename: file, mtime: 0 };
      }
    }));
    
    // 按修改时间排序
    sortedImages.sort((a, b) => b.mtime - a.mtime);
    
    return sortedImages.map(img => img.filename);
  } catch (error) {
    console.error('刷新图片缓存失败:', error);
    throw error;
  }
}

// 上传图片API
app.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: '没有文件被上传' });
  }
  
  // 上传成功后清除缓存，以便下次请求时重新获取图片列表
  imageCache = null;
  
  // 构建图片的URL
  const imageUrl = `${req.protocol}://${req.get('host')}/images/${req.file.filename}`;
  
  res.json({
    success: true,
    message: '图片上传成功',
    imageUrl: imageUrl,
    filename: req.file.filename
  });
});

// 获取所有图片列表API - 带缓存机制
app.get('/images/list', async (req, res) => {
  try {
    const now = Date.now();
    
    // 检查是否需要刷新缓存
    if (!imageCache || now - cacheTimestamp > CACHE_DURATION) {
      const filenames = await refreshImageCache();
      imageCache = filenames;
      cacheTimestamp = now;
    }
    
    // 构建完整的图片URL列表
    const baseUrl = `${req.protocol}://${req.get('host')}/images/`;
    const imageList = imageCache.map(filename => ({
      filename,
      url: baseUrl + filename
    }));
    
    res.json({
      success: true,
      images: imageList,
      timestamp: cacheTimestamp
    });
  } catch (error) {
    console.error('获取图片列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取图片列表失败',
      error: error.message
    });
  }
});

// 清除缓存的API（用于上传后立即刷新列表）
app.get('/images/refresh-cache', async (req, res) => {
  try {
    imageCache = null;
    await refreshImageCache(); // 立即刷新缓存
    cacheTimestamp = Date.now();
    res.json({
      success: true,
      message: '缓存已刷新'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '刷新缓存失败'
    });
  }
});

// 处理未找到的路由 - 应放在所有路由定义的最后
app.use((req, res) => {
  res.status(404).json({ success: false, message: '请求的资源不存在' });
});

// 全局错误处理 - 应放在所有中间件和路由的最后
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({
    success: false,
    message: '服务器内部错误',
    error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
  console.log(`图片存储目录: ${IMAGE_DIR}`);
});