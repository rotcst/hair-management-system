# 企业管理系统 - Web版本部署指南

## 本地测试

### 方法1：使用Python（推荐）
```bash
# 在项目目录下运行
python -m http.server 8080
```
然后访问：http://localhost:8080

### 方法2：使用Node.js
```bash
# 安装依赖
npm install
# 启动服务器
npm run start-node
```

## 免费部署方案

### 1. Netlify（最简单）
1. 注册账号：https://netlify.com
2. 拖拽整个项目文件夹到Netlify
3. 自动获得https网址

### 2. Vercel
1. 注册账号：https://vercel.com
2. 连接GitHub仓库或直接上传
3. 自动部署获得网址

### 3. GitHub Pages
1. 将代码上传到GitHub
2. 在仓库设置中启用Pages
3. 访问：https://用户名.github.io/仓库名

### 4. 腾讯云静态网站托管
1. 访问：https://cloud.tencent.com/product/wh
2. 上传文件到存储桶
3. 开启静态网站功能

## 需要注意的事项

1. **数据存储**：当前版本使用localStorage，数据只存在浏览器中
2. **文件上传**：Web版本可能需要调整文件处理逻辑
3. **跨域问题**：如果使用外部API，可能需要配置CORS
4. **HTTPS**：推荐使用HTTPS域名确保安全性

## 下一步优化建议

1. 添加数据库支持（如Firebase、Supabase）
2. 实现用户认证系统
3. 添加数据备份功能
4. 考虑使用云存储服务 