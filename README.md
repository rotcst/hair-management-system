# MAKE IT HAIR Professional - 企业管理系统

美发店专业管理系统，支持职员管理、客户信息管理、库存管理等功能。

## 🌐 在线访问

部署完成后，可通过以下地址访问：
`https://您的GitHub用户名.github.io/仓库名`

## 💻 本地运行

```bash
# 克隆项目
git clone https://github.com/您的用户名/仓库名.git

# 进入项目目录
cd 仓库名

# 启动本地服务器
python -m http.server 8080
```

访问：http://localhost:8080

## 📱 功能特性

- 👥 职员管理：新增、编辑、删除员工信息
- 👤 客户管理：客户档案管理和查询
- 📦 库存管理：产品库存跟踪
- 💰 财务管理：收支记录和统计
- 🈂️ 多语言支持：中文/韩语切换
- 📱 响应式设计：支持多种设备

## ⚠️ 数据存储说明

当前版本使用浏览器本地存储(localStorage)：
- 数据仅保存在当前浏览器中
- 不同设备/浏览器之间数据不同步
- 清除浏览器数据会丢失所有记录

## 🔧 技术栈

- 前端：HTML5 + CSS3 + JavaScript
- 数据存储：localStorage
- 文件处理：SheetJS (Excel导入导出)
- 部署：GitHub Pages

## �� 许可证

MIT License 