# 🎉 Mesia EMS 企业管理系统

一个基于Firebase的现代化企业管理系统，支持实时数据同步、多用户协作和跨设备访问。

## 🌟 系统特点

### 💎 核心功能
- **👥 员工管理** - 完整的员工信息管理系统
- **🏢 沙龙管理** - 多门店管理和统计
- **📦 产品管理** - 产品库存和分类管理
- **💰 财务管理** - 收支记录和报表统计
- **🈂️ 多语言支持** - 中文/韩语无缝切换
- **📱 响应式设计** - 支持桌面、平板、手机

### 🚀 技术特性
- **🔐 Firebase Authentication** - 企业级用户认证
- **📊 Firebase Realtime Database** - 实时数据同步
- **☁️ 云端数据存储** - 自动备份，永不丢失
- **🔄 多设备同步** - 数据实时同步到所有设备
- **🛡️ 数据安全** - 用户数据完全隔离

## 📋 当前配置

### Firebase项目信息
```
项目名称: Mesia-EMS
项目ID: mesia-ems
项目编号: 718797479793
Web API密钥: AIzaSyDAfHsHn6jyaCDURsi-R2a0vleka36ML6Q
```

### 部署地址
- **GitHub Pages**: https://rotcst.github.io/hair-management-system
- **Firebase Hosting**: https://mesia-ems.firebaseapp.com

## 🎯 快速开始

### 1. 本地运行
```bash
# 克隆项目
git clone https://github.com/rotcst/hair-management-system.git
cd hair-management-system

# 启动本地服务器
python -m http.server 8080
# 或者
npx http-server -p 8080

# 访问 http://localhost:8080
```

### 2. Firebase配置
1. 访问 [Firebase控制台](https://console.firebase.google.com/)
2. 选择项目 **Mesia-EMS**
3. 启用以下服务：
   - **Authentication** (Email/Password)
   - **Realtime Database**
   - **Hosting** (可选)

### 3. 创建用户账户
在Firebase控制台 > Authentication > Users中手动添加用户，或使用测试页面。

## 🔧 项目结构

```
mesia-ems/
├── 📄 index.html                 # 主应用界面
├── 🔐 login.html                 # 用户登录页面
├── ⚙️ firebase-config.js         # Firebase配置
├── 📊 firebase-data-manager.js   # 数据管理封装
├── 🧪 firebase-test.html         # 连接测试页面
├── 📚 deployment-guide.md        # 部署指南
├── 🛡️ firebase-security-rules.md # 安全规则
└── 📖 README.md                  # 项目说明
```

## 🔥 Firebase集成状态

### ✅ 已完成的功能
- [x] Firebase Authentication 用户认证
- [x] Firebase Realtime Database 实时数据库
- [x] 用户数据完全隔离（每个用户独立数据空间）
- [x] 实时数据同步（多设备同步）
- [x] 安全规则配置（用户只能访问自己的数据）
- [x] 数据操作封装（简化开发）
- [x] 语言设置云端同步
- [x] 自动数据备份

### 🔄 数据同步机制
- **实时监听**: 数据变化时自动更新界面
- **离线缓存**: Firebase SDK自动处理离线数据
- **冲突解决**: 自动处理并发修改
- **数据验证**: 服务器端规则验证数据完整性

## 📱 使用说明

### 登录系统
1. 访问部署地址
2. 输入已创建的用户邮箱和密码
3. 系统会自动验证并跳转到管理界面

### 数据管理
- **添加数据**: 点击"添加"按钮，填写信息
- **编辑数据**: 点击数据行的"编辑"按钮
- **删除数据**: 点击数据行的"删除"按钮
- **批量导入**: 支持Excel文件导入
- **数据导出**: 支持Excel格式导出

### 多设备同步
- 在任何设备上登录相同账户
- 数据会自动同步到所有设备
- 修改数据时，其他设备会实时更新

## 🧪 测试功能

### Firebase连接测试
访问 `firebase-test.html` 进行：
- Firebase配置验证
- 用户认证测试
- 数据库连接测试
- 实时同步测试
- 系统日志查看

### 功能测试清单
- [ ] 用户登录/退出
- [ ] 员工数据管理
- [ ] 沙龙数据管理
- [ ] 产品数据管理
- [ ] 语言切换
- [ ] 数据实时同步
- [ ] 多设备同步
- [ ] 数据导入导出

## 🔒 安全特性

### 数据隔离
- 每个用户的数据存储在独立的路径
- 用户只能访问自己的数据
- 完全防止数据泄露

### 认证保护
- 必须登录才能访问系统
- 支持密码重置
- 会话超时保护

### 数据验证
- 服务器端数据格式验证
- 必填字段检查
- 数据类型验证

## 📊 数据结构

```
users/
  └── {用户UID}/
      ├── employees/          # 员工数据
      │   └── {员工ID}/
      │       ├── id          # 员工ID
      │       ├── name        # 姓名
      │       ├── position    # 职位
      │       └── ...         # 其他信息
      ├── salons/             # 沙龙数据
      ├── products/           # 产品数据
      ├── productCategories/  # 产品分类
      └── settings/           # 用户设置
          └── language        # 语言偏好
```

## 🚀 部署指南

详细部署说明请参考 `deployment-guide.md`

### 快速部署
1. 配置Firebase服务
2. 推送代码到GitHub
3. 启用GitHub Pages
4. 创建用户账户
5. 开始使用！

## 💡 开发说明

### 添加新功能
1. 在 `firebase-data-manager.js` 中添加数据操作方法
2. 在 `index.html` 中添加界面和逻辑
3. 更新 `firebase-security-rules.md` 中的安全规则
4. 测试数据同步功能

### 自定义配置
- 修改 `firebase-config.js` 更改Firebase配置
- 调整 `firebase-data-manager.js` 自定义数据操作
- 更新CSS样式自定义界面

## 🎯 未来计划

- [ ] 移动端原生应用
- [ ] 数据分析仪表板
- [ ] 高级报表功能
- [ ] 工作流管理
- [ ] 集成支付系统
- [ ] API接口开放

## 📞 技术支持

如需帮助，请：
1. 检查 `firebase-test.html` 测试页面
2. 查看浏览器控制台错误信息
3. 参考 `deployment-guide.md` 部署指南
4. 检查Firebase控制台日志

---

🎉 **恭喜！您的企业管理系统现已支持云端数据同步和多用户协作！**

## 📄 许可证

MIT License - 免费使用和修改

## 🤝 贡献

欢迎提交Pull Request和Issue！ 