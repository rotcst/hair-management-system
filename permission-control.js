// 权限控制系统
// 根据用户角色控制界面功能的显示和操作权限

class PermissionControl {
    constructor() {
        this.userRole = 'employee'; // 默认为普通员工
        this.isAdmin = false;
        this.restrictedElements = [];
        this.init();
    }

    // 初始化权限控制
    init() {
        // 监听Firebase数据管理器的权限变化
        window.addEventListener('firebaseDataUpdated', (event) => {
            if (event.detail.type === 'adminStatus') {
                this.updatePermissions();
            }
        });

        // 延迟执行权限检查，等待数据管理器初始化
        setTimeout(() => {
            this.checkPermissions();
        }, 2000);
    }

    // 检查用户权限
    checkPermissions() {
        if (window.firebaseDataManager) {
            this.isAdmin = window.firebaseDataManager.hasAdminPermission();
            this.userRole = this.isAdmin ? 'admin' : 'employee';
            console.log('用户权限:', this.userRole);
            this.applyPermissions();
        } else {
            console.log('数据管理器未初始化，稍后重试');
            setTimeout(() => this.checkPermissions(), 1000);
        }
    }

    // 更新权限（当权限状态改变时调用）
    updatePermissions() {
        this.checkPermissions();
    }

    // 应用权限控制
    applyPermissions() {
        if (this.isAdmin) {
            this.enableAdminFeatures();
        } else {
            this.restrictEmployeeFeatures();
        }
        this.updateRoleDisplay();
    }

    // 启用管理员功能
    enableAdminFeatures() {
        // 移除所有限制
        this.restrictedElements.forEach(element => {
            if (element && element.style) {
                element.style.display = '';
                element.disabled = false;
                element.title = '';
            }
        });
        this.restrictedElements = [];
        
        // 显示管理员标识
        this.showAdminBadge();
    }

    // 限制员工功能
    restrictEmployeeFeatures() {
        // 需要管理员权限的功能元素选择器
        const adminOnlySelectors = [
            // 新增功能
            'button[onclick*="addEmployee"]',
            'button[onclick*="addSalon"]',
            'button[onclick*="addProduct"]',
            'button[onclick*="submitCreateCategory"]',
            'input[type="submit"]',
            'button[type="submit"]',
            
            // 删除功能
            'button[onclick*="delete"]',
            'button[onclick*="Delete"]',
            'button[onclick*="remove"]',
            'button[onclick*="Remove"]',
            
            // 编辑功能
            'button[onclick*="edit"]',
            'button[onclick*="Edit"]',
            'button[onclick*="update"]',
            'button[onclick*="Update"]',
            'button[onclick*="save"]',
            'button[onclick*="Save"]',
            
            // 批量操作
            'button[onclick*="batch"]',
            'button[onclick*="Batch"]',
            'button[onclick*="selectAll"]',
            'button[onclick*="assignResponsible"]',
            
            // 配置功能
            'button[onclick*="reset"]',
            'button[onclick*="Reset"]',
            'button[onclick*="export"]',
            'button[onclick*="import"]',
            'button[onclick*="recalculate"]'
        ];

        // 特定页面的限制
        const adminOnlyPages = [
            'new-employee',
            'delete-employee', 
            'new-salon',
            'delete-salon',
            'add-product'
        ];

        // 隐藏管理员专用的导航菜单
        adminOnlyPages.forEach(pageId => {
            const menuItem = document.querySelector(`[onclick*="${pageId}"]`);
            if (menuItem) {
                this.restrictElement(menuItem, '仅管理员可访问');
            }
        });

        // 限制功能按钮
        adminOnlySelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                this.restrictElement(element, '仅管理员可操作');
            });
        });

        // 限制表单提交
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            const submitButtons = form.querySelectorAll('button[type="submit"], input[type="submit"]');
            submitButtons.forEach(button => {
                this.restrictElement(button, '仅管理员可提交');
            });
        });

        // 显示员工标识
        this.showEmployeeBadge();
    }

    // 限制单个元素
    restrictElement(element, message) {
        if (element && element.style) {
            // 方案1：完全隐藏（推荐）
            element.style.display = 'none';
            
            // 方案2：禁用并添加提示（备选）
            // element.disabled = true;
            // element.style.opacity = '0.5';
            // element.style.cursor = 'not-allowed';
            // element.title = message;
            
            this.restrictedElements.push(element);
        }
    }

    // 显示管理员标识
    showAdminBadge() {
        this.clearRoleBadge();
        const badge = document.createElement('div');
        badge.id = 'admin-badge';
        badge.innerHTML = '👑 管理员';
        badge.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: linear-gradient(135deg, #FFD700, #FFA500);
            color: #000;
            padding: 5px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            z-index: 10000;
            box-shadow: 0 2px 10px rgba(255,215,0,0.5);
            border: 1px solid #FFD700;
        `;
        document.body.appendChild(badge);
    }

    // 显示员工标识
    showEmployeeBadge() {
        this.clearRoleBadge();
        const badge = document.createElement('div');
        badge.id = 'employee-badge';
        badge.innerHTML = '👤 员工 (仅查看)';
        badge.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: linear-gradient(135deg, #87CEEB, #4682B4);
            color: #fff;
            padding: 5px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            z-index: 10000;
            box-shadow: 0 2px 10px rgba(135,206,235,0.5);
            border: 1px solid #87CEEB;
        `;
        document.body.appendChild(badge);
    }

    // 清除角色标识
    clearRoleBadge() {
        const adminBadge = document.getElementById('admin-badge');
        const employeeBadge = document.getElementById('employee-badge');
        if (adminBadge) adminBadge.remove();
        if (employeeBadge) employeeBadge.remove();
    }

    // 更新角色显示
    updateRoleDisplay() {
        // 在用户信息区域显示角色
        const userPositionElement = document.getElementById('userPosition');
        if (userPositionElement) {
            const roleText = this.isAdmin ? '管理员' : '员工';
            userPositionElement.textContent = roleText;
            userPositionElement.style.color = this.isAdmin ? '#FFD700' : '#87CEEB';
        }
    }

    // 检查操作权限
    checkOperationPermission(operation) {
        if (this.isAdmin) {
            return true;
        }

        const adminOnlyOperations = [
            'add', 'edit', 'delete', 'update', 'save', 'remove',
            'batch', 'assign', 'reset', 'export', 'import',
            'create', 'modify', 'configure'
        ];

        const hasPermission = !adminOnlyOperations.some(op => 
            operation.toLowerCase().includes(op)
        );

        if (!hasPermission) {
            this.showPermissionDeniedMessage();
        }

        return hasPermission;
    }

    // 显示权限拒绝消息
    showPermissionDeniedMessage() {
        const message = document.createElement('div');
        message.innerHTML = `
            <div style="
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(0,0,0,0.8);
                color: white;
                padding: 20px;
                border-radius: 10px;
                text-align: center;
                z-index: 10001;
            ">
                <h3>⚠️ 权限不足</h3>
                <p>此操作需要管理员权限</p>
                <p>请联系管理员获取权限</p>
            </div>
        `;
        document.body.appendChild(message);
        
        setTimeout(() => {
            message.remove();
        }, 3000);
    }

    // 获取当前用户角色
    getUserRole() {
        return this.userRole;
    }

    // 检查是否为管理员
    isUserAdmin() {
        return this.isAdmin;
    }
}

// 创建全局权限控制实例
window.permissionControl = new PermissionControl();

// 导出权限检查函数供其他脚本使用
window.checkPermission = function(operation) {
    return window.permissionControl.checkOperationPermission(operation);
};

// 在页面加载完成后初始化权限控制
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.permissionControl.checkPermissions();
    });
} else {
    window.permissionControl.checkPermissions();
} 