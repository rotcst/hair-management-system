# Mesia EMS 企业管理系统 - 部署指南

## 🚀 项目概述

这是一个基于Firebase的企业管理系统，支持：
- 🔐 Firebase Authentication 用户认证
- 📊 Firebase Realtime Database 实时数据同步
- 👥 员工管理
- 🏢 沙龙管理
- 📦 产品管理
- 🌐 多语言支持（中文/韩语）

## 📋 准备工作

### 1. Firebase项目设置

您的Firebase项目信息：
```
项目名称：Mesia-EMS
项目ID：mesia-ems
项目编号：718797479793
Web API密钥：AIzaSyDAfHsHn6jyaCDURsi-R2a0vleka36ML6Q
```

### 2. 需要启用的Firebase服务

在Firebase控制台 (https://console.firebase.google.com/) 中：

1. **Authentication（身份验证）**
   - 进入 Authentication > Sign-in method
   - 启用 "Email/Password" 提供商
   - 可选：启用其他登录方式（Google、Facebook等）

2. **Realtime Database（实时数据库）**
   - 进入 Realtime Database
   - 创建数据库（选择地区：asia-southeast1）
   - 设置安全规则（见下方规则配置）

3. **Hosting（可选）**
   - 如果要使用Firebase Hosting而非GitHub Pages

### 3. Firebase安全规则配置

在Realtime Database > 规则中设置：

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    }
  }
}
```

## 🔧 本地开发设置

### 1. 克隆仓库
```bash
git clone https://github.com/rotcst/hair-management-system.git
cd hair-management-system
```

### 2. 本地运行
```bash
# 使用Python启动本地服务器
python -m http.server 8080

# 或使用Node.js
npx http-server -p 8080

# 访问：http://localhost:8080
```

## 📺 GitHub Pages部署

### 1. 推送代码到GitHub
```bash
git add .
git commit -m "更新Firebase配置"
git push origin main
```

### 2. 启用GitHub Pages
1. 进入GitHub仓库设置
2. 滚动到 "Pages" 部分
3. Source选择 "Deploy from a branch"
4. Branch选择 "main"
5. 文件夹选择 "/ (root)"
6. 点击 "Save"

### 3. 访问部署的网站
- 地址：`https://rotcst.github.io/hair-management-system`
- 通常需要几分钟才能生效

## 🔑 用户账户管理

### 创建管理员账户
1. 打开部署的网站
2. 进入登录页面
3. 在Firebase控制台 > Authentication > Users中手动添加用户
4. 或者在代码中临时启用注册功能

### 测试账户建议
```
邮箱：admin@mesia-ems.com
密码：Admin123456
```

## 🛠️ 配置文件说明

### firebase-config.js
包含Firebase项目配置信息，已配置为您的项目。

### firebase-data-manager.js
Firebase数据操作封装，提供：
- 用户数据隔离
- 实时数据同步
- 错误处理
- 数据验证

## 🌐 域名配置（可选）

### 使用自定义域名
1. 在GitHub Pages设置中添加自定义域名
2. 配置DNS CNAME记录指向 `rotcst.github.io`
3. 等待DNS传播完成

### Firebase Hosting
如果选择使用Firebase Hosting：
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

## 🔍 故障排除

### 常见问题

1. **登录失败**
   - 检查Firebase Authentication是否启用
   - 确认用户账户已创建
   - 检查浏览器控制台错误信息

2. **数据不同步**
   - 检查Realtime Database规则是否正确
   - 确认用户已登录
   - 检查网络连接

3. **页面无法访问**
   - 确认GitHub Pages已启用
   - 检查部署状态
   - 清除浏览器缓存

### 调试工具
- 浏览器开发者工具 > Console
- Firebase控制台 > Authentication/Database
- GitHub Actions部署日志

## 📱 功能测试清单

部署完成后，请测试以下功能：

- [ ] 用户登录/退出
- [ ] 员工管理（添加、编辑、删除）
- [ ] 沙龙管理（添加、编辑、删除）
- [ ] 产品管理（添加、编辑、删除）
- [ ] 语言切换（中文/韩语）
- [ ] 数据实时同步
- [ ] 多设备同步测试

## 🔒 安全建议

1. **定期更新Firebase规则**
2. **启用Firebase安全监控**
3. **使用强密码策略**
4. **定期备份数据**
5. **监控异常登录**

## 📞 技术支持

如遇问题，请检查：
1. Firebase控制台日志
2. 浏览器控制台错误
3. GitHub Pages部署状态

---

🎉 **部署完成后，您的企业管理系统将支持实时数据同步和多用户协作！** 