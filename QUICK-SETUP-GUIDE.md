# 🚀 快速设置指南

## ⚠️ 权限问题解决方案

您遇到的"PERMISSION_DENIED"错误是因为Firebase安全规则太严格。请按照以下步骤解决：

## 📋 第1步：设置临时宽松规则

1. 打开 [Firebase Console](https://console.firebase.google.com/)
2. 选择项目：**Mesia-EMS**
3. 点击 **Realtime Database** → **规则**
4. **完全替换**现有规则为以下内容：

```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null"
  }
}
```

5. 点击 **发布**

## 📋 第2步：设置管理员权限

1. 刷新 `setup-admin.html` 页面
2. 如果显示"未登录"，点击"前往登录"按钮
3. 登录 `robot8866@gmail.com` 账户
4. 返回 `setup-admin.html` 页面
5. 点击"设置为管理员"按钮
6. 确认看到"已设置 robot8866@gmail.com 为管理员"

## 📋 第3步：迁移数据

1. 确认页面显示"👑 管理员权限已确认"
2. 点击"迁移现有数据到公司级别"按钮
3. 等待显示"数据迁移完成！"

## 📋 第4步：恢复安全规则

**⚠️ 重要：迁移完成后，立即恢复安全规则**

1. 回到 Firebase Console → Realtime Database → 规则
2. 替换为以下安全规则：

```json
{
  "rules": {
    "company": {
      "employees": {
        ".read": "auth != null",
        ".write": "auth != null && root.child('admins').child(auth.token.email.replace('.', '_')).exists()"
      },
      "salons": {
        ".read": "auth != null",
        ".write": "auth != null && root.child('admins').child(auth.token.email.replace('.', '_')).exists()"
      },
      "products": {
        ".read": "auth != null",
        ".write": "auth != null && root.child('admins').child(auth.token.email.replace('.', '_')).exists()"
      },
      "productCategories": {
        ".read": "auth != null",
        ".write": "auth != null && root.child('admins').child(auth.token.email.replace('.', '_')).exists()"
      }
    },
    "admins": {
      ".read": "auth != null",
      ".write": "auth != null && root.child('admins').child(auth.token.email.replace('.', '_')).exists()"
    },
    "users": {
      "$uid": {
        ".read": "auth != null && auth.uid == $uid",
        ".write": "auth != null && auth.uid == $uid"
      }
    },
    "employees": {
      ".read": "auth != null",
      ".write": "auth != null"
    }
  }
}
```

3. 点击 **发布**

## 📋 第5步：验证数据共享

1. 使用管理员账户(`robot8866@gmail.com`)登录主系统
2. 查看员工、沙龙等数据是否正常显示
3. 使用普通员工账户(`wk8866kr@gmail.com`)登录
4. 确认能看到管理员创建的数据

## 🎯 预期结果

设置完成后：
- ✅ 管理员可以管理所有公司数据
- ✅ 普通员工能看到公司数据但无法编辑
- ✅ 新注册员工自动加入公司员工列表
- ✅ 数据实时同步

## 🆘 故障排除

### 如果仍然看到权限错误：
1. 确认已设置临时宽松规则并发布
2. 刷新页面重新登录
3. 检查Firebase控制台是否有连接问题

### 如果迁移没有反应：
1. 确认已登录正确的管理员账户
2. 查看浏览器控制台是否有错误信息
3. 确认Firebase规则已经设置为宽松模式

### 如果数据没有共享：
1. 确认数据迁移已完成
2. 确认安全规则已恢复为正确版本
3. 重新登录系统刷新数据

## 📞 紧急联系

如果按照上述步骤仍有问题，请：
1. 截图错误信息
2. 检查浏览器控制台错误
3. 确认Firebase项目配置正确 