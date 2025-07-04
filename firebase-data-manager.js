// Firebase数据管理器
// 处理所有与Firebase实时数据库的交互
// 支持公司级别的数据共享和分层权限管理

class FirebaseDataManager {
    constructor() {
        this.database = firebase.database();
        this.auth = firebase.auth();
        this.currentUser = null;
        this.isAdmin = false;
        this.data = {
            employees: [],
            salons: [],
            products: [],
            productCategories: [],
            customDistricts: [],
            userSettings: {}
        };
        this.listeners = {};
    }

    // 获取当前用户的数据路径前缀
    getUserDataPath() {
        const user = this.auth.currentUser;
        if (!user) return null;
        return user.uid;
    }

    // 检查用户是否为管理员
    async checkAdminStatus() {
        const user = this.auth.currentUser;
        if (!user) return false;
        
        try {
            const adminRef = this.database.ref('admins').child(user.email.replace(/\./g, '_'));
            const snapshot = await adminRef.once('value');
            this.isAdmin = snapshot.exists() && snapshot.val() === true;
            console.log('管理员状态:', this.isAdmin ? '是管理员' : '普通员工');
            return this.isAdmin;
        } catch (error) {
            console.error('检查管理员状态失败:', error);
            return false;
        }
    }

    // 初始化数据连接和监听器
    async initializeData() {
        return new Promise((resolve, reject) => {
            this.auth.onAuthStateChanged(async user => {
                if (user) {
                    this.currentUser = user;
                    await this.checkAdminStatus();
                    this.setupDataListeners();
                    resolve(user);
                } else {
                    this.currentUser = null;
                    this.isAdmin = false;
                    this.cleanupListeners();
                    reject(new Error('用户未认证'));
                }
            });
        });
    }

    // 设置数据监听器 - 现在监听公司级别的数据
    setupDataListeners() {
        const userPath = this.getUserDataPath();
        if (!userPath) return;

        // 监听公司员工数据（所有用户都能看到）
        this.listeners.employees = this.database.ref('company/employees').on('value', (snapshot) => {
            const data = snapshot.val();
            this.data.employees = data ? Object.values(data) : [];
            this.triggerDataUpdate('employees', this.data.employees);
        });

        // 监听公司沙龙数据
        this.listeners.salons = this.database.ref('company/salons').on('value', (snapshot) => {
            const data = snapshot.val();
            this.data.salons = data ? Object.values(data) : [];
            this.triggerDataUpdate('salons', this.data.salons);
        });

        // 监听公司产品数据
        this.listeners.products = this.database.ref('company/products').on('value', (snapshot) => {
            const data = snapshot.val();
            this.data.products = data ? Object.values(data) : [];
            this.triggerDataUpdate('products', this.data.products);
        });

        // 监听公司产品分类数据
        this.listeners.productCategories = this.database.ref('company/productCategories').on('value', (snapshot) => {
            const data = snapshot.val();
            this.data.productCategories = data ? Object.values(data) : [];
            this.triggerDataUpdate('productCategories', this.data.productCategories);
        });

        // 监听自定义区域数据（公司级别）
        this.listeners.customDistricts = this.database.ref('company/customDistricts').on('value', (snapshot) => {
            const data = snapshot.val();
            this.data.customDistricts = data ? Object.values(data) : [];
            this.triggerDataUpdate('customDistricts', this.data.customDistricts);
        });

        // 监听用户个人设置
        this.listeners.userSettings = this.database.ref(`users/${userPath}/settings`).on('value', (snapshot) => {
            const data = snapshot.val();
            this.data.userSettings = data || {};
            this.triggerDataUpdate('userSettings', this.data.userSettings);
        });
    }

    // 触发数据更新事件
    triggerDataUpdate(dataType, data) {
        // 发送自定义事件，通知页面数据已更新
        window.dispatchEvent(new CustomEvent('firebaseDataUpdated', {
            detail: { type: dataType, data: data }
        }));
    }

    // 清理监听器
    cleanupListeners() {
        const userPath = this.getUserDataPath();
        if (!userPath) return;

        Object.keys(this.listeners).forEach(key => {
            if (this.listeners[key]) {
                if (key === 'userSettings') {
                    // 用户个人设置监听器
                    this.database.ref(`users/${userPath}/settings`).off('value', this.listeners[key]);
                } else {
                    // 公司数据监听器
                    this.database.ref(`company/${key}`).off('value', this.listeners[key]);
                }
            }
        });
        this.listeners = {};
    }

    // 保存员工数据（只有管理员可以修改）
    async saveEmployees(employees) {
        if (!this.hasAdminPermission()) {
            throw new Error('只有管理员才能修改员工信息');
        }

        try {
            const employeesRef = this.database.ref('company/employees');
            const employeesObj = employees.reduce((acc, emp) => {
                acc[emp.id] = {
                    ...emp,
                    updateTime: new Date().toISOString(),
                    updatedBy: this.currentUser?.email || 'admin'
                };
                return acc;
            }, {});
            await employeesRef.set(employeesObj);
            console.log('员工数据保存成功');
        } catch (error) {
            console.error('保存员工数据失败:', error);
            throw error;
        }
    }

    // 保存沙龙数据（只有管理员可以修改）
    async saveSalons(salons) {
        if (!this.hasAdminPermission()) {
            throw new Error('只有管理员才能修改沙龙信息');
        }

        try {
            const salonsRef = this.database.ref('company/salons');
            const salonsObj = salons.reduce((acc, salon) => {
                acc[salon.id] = {
                    ...salon,
                    updateTime: new Date().toISOString(),
                    updatedBy: this.currentUser?.email || 'admin'
                };
                return acc;
            }, {});
            await salonsRef.set(salonsObj);
            console.log('沙龙数据保存成功');
        } catch (error) {
            console.error('保存沙龙数据失败:', error);
            throw error;
        }
    }

    // 保存产品数据（只有管理员可以修改）
    async saveProducts(products) {
        if (!this.hasAdminPermission()) {
            throw new Error('只有管理员才能修改产品信息');
        }

        try {
            const productsRef = this.database.ref('company/products');
            const productsObj = products.reduce((acc, product) => {
                acc[product.id] = {
                    ...product,
                    updateTime: new Date().toISOString(),
                    updatedBy: this.currentUser?.email || 'admin'
                };
                return acc;
            }, {});
            await productsRef.set(productsObj);
            console.log('产品数据保存成功');
        } catch (error) {
            console.error('保存产品数据失败:', error);
            throw error;
        }
    }

    // 保存产品分类数据（只有管理员可以修改）
    async saveProductCategories(categories) {
        if (!this.hasAdminPermission()) {
            throw new Error('只有管理员才能修改产品分类');
        }

        try {
            const categoriesRef = this.database.ref('company/productCategories');
            const categoriesObj = categories.reduce((acc, category) => {
                acc[category.id] = {
                    ...category,
                    updateTime: new Date().toISOString(),
                    updatedBy: this.currentUser?.email || 'admin'
                };
                return acc;
            }, {});
            await categoriesRef.set(categoriesObj);
            console.log('产品分类数据保存成功');
        } catch (error) {
            console.error('保存产品分类数据失败:', error);
            throw error;
        }
    }

    // 保存用户设置（个人设置）
    async saveUserSettings(settings) {
        const userPath = this.getUserDataPath();
        if (!userPath) throw new Error('用户未认证');

        try {
            const settingsRef = this.database.ref(`users/${userPath}/settings`);
            await settingsRef.set(settings);
            console.log('用户设置保存成功');
        } catch (error) {
            console.error('保存用户设置失败:', error);
            throw error;
        }
    }

    // 添加新员工到公司员工列表（从自主注册转移）
    async addEmployeeToCompany(employeeData) {
        if (!this.hasAdminPermission()) {
            throw new Error('只有管理员才能添加员工到公司');
        }

        try {
            const employeeRef = this.database.ref('company/employees').push();
            await employeeRef.set({
                ...employeeData,
                id: employeeRef.key,
                addTime: new Date().toISOString(),
                addedBy: this.currentUser?.email || 'admin'
            });
            console.log('员工添加到公司成功');
        } catch (error) {
            console.error('添加员工到公司失败:', error);
            throw error;
        }
    }

    // 迁移现有数据到公司级别
    async migrateUserDataToCompany() {
        if (!this.hasAdminPermission()) {
            throw new Error('只有管理员才能执行数据迁移');
        }

        const userPath = this.getUserDataPath();
        if (!userPath) throw new Error('用户未认证');

        try {
            console.log('开始迁移数据到公司级别...');
            
            // 迁移员工数据
            const employeesSnapshot = await this.database.ref(`users/${userPath}/employees`).once('value');
            if (employeesSnapshot.exists()) {
                const employees = employeesSnapshot.val();
                await this.database.ref('company/employees').set(employees);
                console.log('员工数据迁移完成');
            }

            // 迁移沙龙数据
            const salonsSnapshot = await this.database.ref(`users/${userPath}/salons`).once('value');
            if (salonsSnapshot.exists()) {
                const salons = salonsSnapshot.val();
                await this.database.ref('company/salons').set(salons);
                console.log('沙龙数据迁移完成');
            }

            // 迁移产品数据
            const productsSnapshot = await this.database.ref(`users/${userPath}/products`).once('value');
            if (productsSnapshot.exists()) {
                const products = productsSnapshot.val();
                await this.database.ref('company/products').set(products);
                console.log('产品数据迁移完成');
            }

            // 迁移产品分类数据
            const categoriesSnapshot = await this.database.ref(`users/${userPath}/productCategories`).once('value');
            if (categoriesSnapshot.exists()) {
                const categories = categoriesSnapshot.val();
                await this.database.ref('company/productCategories').set(categories);
                console.log('产品分类数据迁移完成');
            }

            console.log('数据迁移完成！');
        } catch (error) {
            console.error('数据迁移失败:', error);
            throw error;
        }
    }

    // 检查是否有管理员权限
    hasAdminPermission() {
        return this.isAdmin;
    }

    // 获取数据的方法
    getEmployees() {
        return this.data.employees;
    }

    getSalons() {
        return this.data.salons;
    }

    getProducts() {
        return this.data.products;
    }

    getProductCategories() {
        return this.data.productCategories;
    }

    getCustomDistricts() {
        return this.data.customDistricts;
    }

    getUserSettings() {
        return this.data.userSettings;
    }

    // 获取当前语言
    getCurrentLanguage() {
        return this.data.userSettings?.language || 'zh';
    }

    // 设置语言
    async setLanguage(language) {
        try {
            const currentSettings = this.getUserSettings();
            const newSettings = { ...currentSettings, language };
            await this.saveUserSettings(newSettings);
        } catch (error) {
            console.error('设置语言失败:', error);
            throw error;
        }
    }
}

// 创建全局实例
window.firebaseDataManager = new FirebaseDataManager();

// 导出供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FirebaseDataManager;
} 