# Firebase安全规则配置

## 🔒 Realtime Database安全规则

将以下规则复制到Firebase控制台 > Realtime Database > 规则中：

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid",
        ".validate": "auth != null",
        "employees": {
          "$employeeId": {
            ".validate": "newData.hasChildren(['id', 'name', 'position'])"
          }
        },
        "salons": {
          "$salonId": {
            ".validate": "newData.hasChildren(['id', 'name', 'address'])"
          }
        },
        "products": {
          "$productId": {
            ".validate": "newData.hasChildren(['id', 'name', 'price'])"
          }
        },
        "productCategories": {
          "$categoryId": {
            ".validate": "newData.hasChildren(['id', 'nameCN', 'nameKO'])"
          }
        },
        "settings": {
          "language": {
            ".validate": "newData.isString() && (newData.val() === 'zh' || newData.val() === 'ko')"
          }
        }
      }
    }
  }
}
```

## 🛡️ 规则说明

### 基本权限
- **读取权限**: 用户只能读取自己的数据
- **写入权限**: 用户只能写入自己的数据
- **认证验证**: 必须登录后才能访问

### 数据验证
- **员工数据**: 必须包含id、name、position字段
- **沙龙数据**: 必须包含id、name、address字段
- **产品数据**: 必须包含id、name、price字段
- **分类数据**: 必须包含id、nameCN、nameKO字段
- **语言设置**: 只能是'zh'或'ko'

## 🔧 配置步骤

1. 登录 [Firebase控制台](https://console.firebase.google.com/)
2. 选择您的项目：**Mesia-EMS**
3. 进入 **Realtime Database**
4. 点击 **规则** 标签
5. 替换默认规则为上述规则
6. 点击 **发布**

## ⚠️ 重要提示

### 生产环境安全
- 定期审查访问日志
- 监控异常数据访问
- 设置数据备份策略

### 测试规则
在发布前，请使用Firebase规则模拟器测试：
1. 进入规则标签
2. 点击 **规则模拟器**
3. 测试不同用户的读写权限

## 🚫 常见安全错误

### ❌ 错误示例
```json
{
  "rules": {
    ".read": true,  // 允许所有人读取
    ".write": true  // 允许所有人写入
  }
}
```

### ✅ 正确示例
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

## 📊 监控和日志

### 启用安全监控
1. 进入Firebase控制台
2. 选择 **Performance Monitoring**
3. 启用实时监控
4. 设置异常告警

### 访问日志分析
- 定期检查认证日志
- 监控数据访问模式
- 识别异常行为

---

🔐 **正确配置安全规则是保护用户数据的关键！** 