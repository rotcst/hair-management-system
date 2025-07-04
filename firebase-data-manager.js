// Firebase数据管理器
// 处理所有与Firebase实时数据库的交互

class FirebaseDataManager {
    constructor() {
        this.database = firebase.database();
        this.auth = firebase.auth();
        this.currentUser = null;
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
        // 使用用户UID作为数据路径，更安全
        return user.uid;
    }

    // 初始化数据连接和监听器
    async initializeData() {
        return new Promise((resolve, reject) => {
            this.auth.onAuthStateChanged(user => {
                if (user) {
                    this.currentUser = user;
                    this.setupDataListeners();
                    resolve(user);
                } else {
                    this.currentUser = null;
                    this.cleanupListeners();
                    reject(new Error('用户未认证'));
                }
            });
        });
    }

    // 设置数据监听器
    setupDataListeners() {
        const userPath = this.getUserDataPath();
        if (!userPath) return;

        // 监听员工数据（用户私有数据）
        this.listeners.employees = this.database.ref(`users/${userPath}/employees`).on('value', (snapshot) => {
            const privateData = snapshot.val();
            this.data.privateEmployees = privateData ? Object.values(privateData) : [];
            this.combineEmployeeData();
        });
        
        // 监听公共员工列表（新注册的员工）
        this.listeners.publicEmployees = this.database.ref('employees').on('value', (snapshot) => {
            const publicData = snapshot.val();
            this.data.publicEmployees = publicData ? Object.values(publicData) : [];
            this.combineEmployeeData();
        });

        // 监听沙龙数据
        this.listeners.salons = this.database.ref(`users/${userPath}/salons`).on('value', (snapshot) => {
            const data = snapshot.val();
            this.data.salons = data ? Object.values(data) : [];
            this.triggerDataUpdate('salons', this.data.salons);
        });

        // 监听产品数据
        this.listeners.products = this.database.ref(`users/${userPath}/products`).on('value', (snapshot) => {
            const data = snapshot.val();
            this.data.products = data ? Object.values(data) : [];
            this.triggerDataUpdate('products', this.data.products);
        });

        // 监听产品分类数据
        this.listeners.productCategories = this.database.ref(`users/${userPath}/productCategories`).on('value', (snapshot) => {
            const data = snapshot.val();
            this.data.productCategories = data ? Object.values(data) : [];
            this.triggerDataUpdate('productCategories', this.data.productCategories);
        });

        // 监听区域数据
        this.listeners.customDistricts = this.database.ref(`users/${userPath}/customDistricts`).on('value', (snapshot) => {
            const data = snapshot.val();
            this.data.customDistricts = data ? Object.values(data) : [];
            this.triggerDataUpdate('customDistricts', this.data.customDistricts);
        });

        // 监听用户设置
        this.listeners.userSettings = this.database.ref(`users/${userPath}/settings`).on('value', (snapshot) => {
            const data = snapshot.val();
            this.data.userSettings = data || {};
            this.triggerDataUpdate('userSettings', this.data.userSettings);
        });
    }

    // 合并员工数据
    combineEmployeeData() {
        const privateEmployees = this.data.privateEmployees || [];
        const publicEmployees = this.data.publicEmployees || [];
        
        // 合并数据，避免重复（以邮箱为准）
        const allEmployees = [...privateEmployees];
        
        // 添加公共员工，排除已存在的（通过邮箱或ID匹配）
        publicEmployees.forEach(publicEmp => {
            const isExisting = allEmployees.some(emp => 
                (emp.email && publicEmp.email && emp.email === publicEmp.email) ||
                (emp.firebaseUid && publicEmp.firebaseUid && emp.firebaseUid === publicEmp.firebaseUid)
            );
            
            if (!isExisting) {
                // 为公共员工添加标识
                publicEmp.source = 'public';
                allEmployees.push(publicEmp);
            }
        });
        
        // 按创建时间排序
        allEmployees.sort((a, b) => {
            const timeA = new Date(a.addTime || a.createTime || 0).getTime();
            const timeB = new Date(b.addTime || b.createTime || 0).getTime();
            return timeB - timeA; // 最新的在前
        });
        
        this.data.employees = allEmployees;
        this.triggerDataUpdate('employees', this.data.employees);
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
                if (key === 'publicEmployees') {
                    // 公共员工监听器
                    this.database.ref('employees').off('value', this.listeners[key]);
                } else {
                    // 用户私有数据监听器
                    this.database.ref(`users/${userPath}/${key}`).off('value', this.listeners[key]);
                }
            }
        });
        this.listeners = {};
    }

    // 保存员工数据
    async saveEmployees(employees) {
        const userPath = this.getUserDataPath();
        if (!userPath) throw new Error('用户未认证');

        try {
            // 分离私有员工和公共员工
            const privateEmployees = employees.filter(emp => emp.source !== 'public');
            const publicEmployees = employees.filter(emp => emp.source === 'public');
            
            // 保存私有员工数据
            if (privateEmployees.length > 0) {
                const employeesRef = this.database.ref(`users/${userPath}/employees`);
                const employeesObj = privateEmployees.reduce((acc, emp) => {
                    acc[emp.id] = emp;
                    return acc;
                }, {});
                await employeesRef.set(employeesObj);
            }
            
            // 如果是管理员，可以更新公共员工的职位信息
            if (this.hasAdminPermission()) {
                for (const emp of publicEmployees) {
                    if (emp.firebaseUid) {
                        // 更新公共员工列表中的职位信息
                        const publicEmpRef = this.database.ref('employees').orderByChild('firebaseUid').equalTo(emp.firebaseUid);
                        const snapshot = await publicEmpRef.once('value');
                        
                        if (snapshot.exists()) {
                            const updates = {};
                            snapshot.forEach(child => {
                                updates[child.key] = {
                                    ...child.val(),
                                    position: emp.position, // 只更新职位
                                    updateTime: new Date().toISOString(),
                                    updatedBy: firebase.auth().currentUser?.email || 'admin'
                                };
                            });
                            await this.database.ref('employees').update(updates);
                        }
                    }
                }
            }
            
            return true;
        } catch (error) {
            console.error('保存员工数据失败:', error);
            throw error;
        }
    }
    
    // 检查是否有管理员权限
    hasAdminPermission() {
        // 这里可以根据当前用户的权限进行检查
        // 暂时返回true，后续可以根据实际需求实现权限检查
        return true;
    }

    // 保存沙龙数据
    async saveSalons(salons) {
        const userPath = this.getUserDataPath();
        if (!userPath) throw new Error('用户未认证');

        try {
            const salonsRef = this.database.ref(`users/${userPath}/salons`);
            const salonsObj = salons.reduce((acc, salon) => {
                acc[salon.id] = salon;
                return acc;
            }, {});
            await salonsRef.set(salonsObj);
            return true;
        } catch (error) {
            console.error('保存沙龙数据失败:', error);
            throw error;
        }
    }

    // 保存产品数据
    async saveProducts(products) {
        const userPath = this.getUserDataPath();
        if (!userPath) throw new Error('用户未认证');

        try {
            const productsRef = this.database.ref(`users/${userPath}/products`);
            const productsObj = products.reduce((acc, product) => {
                acc[product.id] = product;
                return acc;
            }, {});
            await productsRef.set(productsObj);
            return true;
        } catch (error) {
            console.error('保存产品数据失败:', error);
            throw error;
        }
    }

    // 保存产品分类数据
    async saveProductCategories(categories) {
        const userPath = this.getUserDataPath();
        if (!userPath) throw new Error('用户未认证');

        try {
            const categoriesRef = this.database.ref(`users/${userPath}/productCategories`);
            const categoriesObj = categories.reduce((acc, category) => {
                acc[category.id] = category;
                return acc;
            }, {});
            await categoriesRef.set(categoriesObj);
            return true;
        } catch (error) {
            console.error('保存产品分类数据失败:', error);
            throw error;
        }
    }

    // 保存用户设置
    async saveUserSettings(settings) {
        const userPath = this.getUserDataPath();
        if (!userPath) throw new Error('用户未认证');

        try {
            const settingsRef = this.database.ref(`users/${userPath}/settings`);
            await settingsRef.update(settings);
            return true;
        } catch (error) {
            console.error('保存用户设置失败:', error);
            throw error;
        }
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

    // 获取当前语言设置
    getCurrentLanguage() {
        return this.data.userSettings.language || 'zh';
    }

    // 设置语言
    async setLanguage(language) {
        try {
            await this.saveUserSettings({ language: language });
            return true;
        } catch (error) {
            console.error('保存语言设置失败:', error);
            return false;
        }
    }
}

// 创建全局实例
window.firebaseDataManager = new FirebaseDataManager();

// 导出供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FirebaseDataManager;
} 