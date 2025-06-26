// Firebase数据管理器 - 实现云端数据同步
// 替换原有的localStorage操作，实现多设备实时同步

class FirebaseDataManager {
    constructor() {
        this.isOnline = navigator.onLine;
        this.syncQueue = []; // 离线时的操作队列
        
        // 监听网络状态
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.processSyncQueue();
            console.log('网络已连接，开始同步数据...');
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
            console.log('网络已断开，启用离线模式...');
        });
    }

    // 处理离线队列
    async processSyncQueue() {
        while (this.syncQueue.length > 0) {
            const operation = this.syncQueue.shift();
            try {
                await operation();
            } catch (error) {
                console.error('同步操作失败:', error);
                this.syncQueue.unshift(operation); // 失败的操作放回队列
                break;
            }
        }
    }

    // 员工数据管理
    async getEmployees() {
        try {
            if (!this.isOnline) {
                // 离线模式，使用localStorage
                const employees = localStorage.getItem('employees');
                return employees ? JSON.parse(employees) : [];
            }

            const snapshot = await db.collection('employees').orderBy('createTime', 'desc').get();
            const employees = [];
            snapshot.forEach(doc => {
                employees.push({ id: doc.id, ...doc.data() });
            });
            
            // 同时保存到本地作为缓存
            localStorage.setItem('employees', JSON.stringify(employees));
            return employees;
        } catch (error) {
            console.error('获取员工数据失败:', error);
            // 出错时使用本地缓存
            const employees = localStorage.getItem('employees');
            return employees ? JSON.parse(employees) : [];
        }
    }

    async saveEmployee(employee) {
        try {
            if (!this.isOnline) {
                // 离线模式，加入同步队列
                this.syncQueue.push(() => this.saveEmployee(employee));
                // 先保存到本地
                const employees = JSON.parse(localStorage.getItem('employees') || '[]');
                if (employee.id) {
                    const index = employees.findIndex(emp => emp.id === employee.id);
                    if (index !== -1) {
                        employees[index] = employee;
                    } else {
                        employees.push(employee);
                    }
                } else {
                    employee.id = Date.now().toString();
                    employees.push(employee);
                }
                localStorage.setItem('employees', JSON.stringify(employees));
                return employee;
            }

            if (employee.id && typeof employee.id === 'number') {
                employee.id = employee.id.toString();
            }

            if (employee.id) {
                // 更新现有员工
                await db.collection('employees').doc(employee.id).set(employee);
            } else {
                // 新增员工
                employee.id = Date.now().toString();
                await db.collection('employees').doc(employee.id).set(employee);
            }
            
            // 更新本地缓存
            const employees = await this.getEmployees();
            localStorage.setItem('employees', JSON.stringify(employees));
            
            return employee;
        } catch (error) {
            console.error('保存员工数据失败:', error);
            throw error;
        }
    }

    async deleteEmployee(employeeId) {
        try {
            if (!this.isOnline) {
                this.syncQueue.push(() => this.deleteEmployee(employeeId));
                // 先从本地删除
                const employees = JSON.parse(localStorage.getItem('employees') || '[]');
                const filteredEmployees = employees.filter(emp => emp.id != employeeId);
                localStorage.setItem('employees', JSON.stringify(filteredEmployees));
                return;
            }

            await db.collection('employees').doc(employeeId.toString()).delete();
            
            // 更新本地缓存
            const employees = await this.getEmployees();
            localStorage.setItem('employees', JSON.stringify(employees));
        } catch (error) {
            console.error('删除员工数据失败:', error);
            throw error;
        }
    }

    // 客户数据管理
    async getCustomers() {
        try {
            if (!this.isOnline) {
                const customers = localStorage.getItem('customers');
                return customers ? JSON.parse(customers) : [];
            }

            const snapshot = await db.collection('customers').orderBy('createTime', 'desc').get();
            const customers = [];
            snapshot.forEach(doc => {
                customers.push({ id: doc.id, ...doc.data() });
            });
            
            localStorage.setItem('customers', JSON.stringify(customers));
            return customers;
        } catch (error) {
            console.error('获取客户数据失败:', error);
            const customers = localStorage.getItem('customers');
            return customers ? JSON.parse(customers) : [];
        }
    }

    async saveCustomer(customer) {
        try {
            if (!this.isOnline) {
                this.syncQueue.push(() => this.saveCustomer(customer));
                const customers = JSON.parse(localStorage.getItem('customers') || '[]');
                if (customer.id) {
                    const index = customers.findIndex(cust => cust.id === customer.id);
                    if (index !== -1) {
                        customers[index] = customer;
                    } else {
                        customers.push(customer);
                    }
                } else {
                    customer.id = Date.now().toString();
                    customers.push(customer);
                }
                localStorage.setItem('customers', JSON.stringify(customers));
                return customer;
            }

            if (customer.id && typeof customer.id === 'number') {
                customer.id = customer.id.toString();
            }

            if (customer.id) {
                await db.collection('customers').doc(customer.id).set(customer);
            } else {
                customer.id = Date.now().toString();
                await db.collection('customers').doc(customer.id).set(customer);
            }
            
            const customers = await this.getCustomers();
            localStorage.setItem('customers', JSON.stringify(customers));
            
            return customer;
        } catch (error) {
            console.error('保存客户数据失败:', error);
            throw error;
        }
    }

    // 实时数据监听
    listenToEmployeeChanges(callback) {
        if (!this.isOnline) return;
        
        try {
            db.collection('employees').onSnapshot(snapshot => {
                const employees = [];
                snapshot.forEach(doc => {
                    employees.push({ id: doc.id, ...doc.data() });
                });
                employees.sort((a, b) => new Date(b.createTime) - new Date(a.createTime));
                
                // 更新本地缓存
                localStorage.setItem('employees', JSON.stringify(employees));
                
                if (callback) callback(employees);
            });
        } catch (error) {
            console.error('监听员工数据变化失败:', error);
        }
    }

    listenToCustomerChanges(callback) {
        if (!this.isOnline) return;
        
        try {
            db.collection('customers').onSnapshot(snapshot => {
                const customers = [];
                snapshot.forEach(doc => {
                    customers.push({ id: doc.id, ...doc.data() });
                });
                customers.sort((a, b) => new Date(b.createTime) - new Date(a.createTime));
                
                localStorage.setItem('customers', JSON.stringify(customers));
                
                if (callback) callback(customers);
            });
        } catch (error) {
            console.error('监听客户数据变化失败:', error);
        }
    }

    // 业绩数据管理
    async getPerformanceTargets() {
        try {
            if (!this.isOnline) {
                const targets = localStorage.getItem('performanceTargets');
                return targets ? JSON.parse(targets) : {};
            }

            const doc = await db.collection('performance').doc('targets').get();
            const targets = doc.exists ? doc.data() : {};
            
            localStorage.setItem('performanceTargets', JSON.stringify(targets));
            return targets;
        } catch (error) {
            console.error('获取业绩目标失败:', error);
            const targets = localStorage.getItem('performanceTargets');
            return targets ? JSON.parse(targets) : {};
        }
    }

    async savePerformanceTargets(targets) {
        try {
            if (!this.isOnline) {
                this.syncQueue.push(() => this.savePerformanceTargets(targets));
                localStorage.setItem('performanceTargets', JSON.stringify(targets));
                return;
            }

            await db.collection('performance').doc('targets').set(targets);
            localStorage.setItem('performanceTargets', JSON.stringify(targets));
        } catch (error) {
            console.error('保存业绩目标失败:', error);
            throw error;
        }
    }

    async getPerformanceActuals() {
        try {
            if (!this.isOnline) {
                const actuals = localStorage.getItem('performanceActuals');
                return actuals ? JSON.parse(actuals) : {};
            }

            const doc = await db.collection('performance').doc('actuals').get();
            const actuals = doc.exists ? doc.data() : {};
            
            localStorage.setItem('performanceActuals', JSON.stringify(actuals));
            return actuals;
        } catch (error) {
            console.error('获取业绩实际失败:', error);
            const actuals = localStorage.getItem('performanceActuals');
            return actuals ? JSON.parse(actuals) : {};
        }
    }

    async savePerformanceActuals(actuals) {
        try {
            if (!this.isOnline) {
                this.syncQueue.push(() => this.savePerformanceActuals(actuals));
                localStorage.setItem('performanceActuals', JSON.stringify(actuals));
                return;
            }

            await db.collection('performance').doc('actuals').set(actuals);
            localStorage.setItem('performanceActuals', JSON.stringify(actuals));
        } catch (error) {
            console.error('保存业绩实际失败:', error);
            throw error;
        }
    }

    // 检查数据同步状态
    getSyncStatus() {
        return {
            isOnline: this.isOnline,
            pendingSync: this.syncQueue.length,
            message: this.isOnline ? '已连接云端数据库' : `离线模式 (${this.syncQueue.length}个操作待同步)`
        };
    }
}

// 创建全局数据管理器实例
const firebaseDataManager = new FirebaseDataManager();

// 添加连接状态指示器
function addSyncStatusIndicator() {
    const indicator = document.createElement('div');
    indicator.id = 'sync-status';
    indicator.style.cssText = `
        position: fixed;
        top: 70px;
        right: 20px;
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 0.8em;
        z-index: 1001;
        transition: all 0.3s ease;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    `;
    
    function updateStatus() {
        const status = firebaseDataManager.getSyncStatus();
        indicator.textContent = status.message;
        
        if (status.isOnline) {
            indicator.style.background = 'rgba(76, 175, 80, 0.9)';
            indicator.style.color = 'white';
            indicator.style.border = '1px solid #4CAF50';
        } else {
            indicator.style.background = 'rgba(255, 193, 7, 0.9)';
            indicator.style.color = 'black';
            indicator.style.border = '1px solid #FFC107';
        }
    }
    
    updateStatus();
    setInterval(updateStatus, 5000); // 每5秒更新一次状态
    
    document.body.appendChild(indicator);
}

// 页面加载完成后添加状态指示器
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addSyncStatusIndicator);
} else {
    addSyncStatusIndicator();
}

console.log('🔥 Firebase数据管理器已启动 - 支持实时数据同步！'); 