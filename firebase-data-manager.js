/**
 * Firebase数据管理器
 * 提供云端数据存储和同步功能，替换localStorage
 */

class FirebaseDataManager {
    constructor() {
        this.db = null;
        this.isOnline = navigator.onLine;
        this.syncQueue = [];
        this.cacheTimeout = 5 * 60 * 1000; // 5分钟缓存
        this.localCache = new Map();
        
        // 监听网络状态
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.processSyncQueue();
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
        });
    }

    // 初始化Firebase连接
    async initialize() {
        try {
            this.db = firebase.firestore();
            
            // 启用离线持久化
            await this.db.enablePersistence({
                synchronizeTabs: true
            });
            
            console.log('✅ Firebase数据管理器初始化成功');
            return true;
        } catch (error) {
            console.error('❌ Firebase数据管理器初始化失败:', error);
            return false;
        }
    }

    // 通用数据获取方法
    async getData(collection, useCache = true) {
        const cacheKey = `${collection}_data`;
        
        // 检查缓存
        if (useCache && this.localCache.has(cacheKey)) {
            const cached = this.localCache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheTimeout) {
                return cached.data;
            }
        }

        try {
            const snapshot = await this.db.collection(collection).get();
            const data = [];
            
            snapshot.forEach(doc => {
                data.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            // 更新缓存
            this.localCache.set(cacheKey, {
                data: data,
                timestamp: Date.now()
            });

            return data;
        } catch (error) {
            console.error(`获取${collection}数据失败:`, error);
            
            // 如果网络错误，尝试从缓存返回
            if (this.localCache.has(cacheKey)) {
                console.log(`从缓存返回${collection}数据`);
                return this.localCache.get(cacheKey).data;
            }
            
            return [];
        }
    }

    // 通用数据保存方法
    async saveData(collection, data, docId = null) {
        const operation = {
            type: 'save',
            collection,
            data,
            docId,
            timestamp: Date.now()
        };

        if (!this.isOnline) {
            this.syncQueue.push(operation);
            console.log(`离线模式：${collection}数据已加入同步队列`);
            return { success: true, offline: true };
        }

        try {
            let result;
            if (docId) {
                // 更新现有文档
                await this.db.collection(collection).doc(docId).set(data, { merge: true });
                result = { id: docId };
            } else {
                // 创建新文档
                const docRef = await this.db.collection(collection).add(data);
                result = { id: docRef.id };
            }

            // 清除缓存
            this.localCache.delete(`${collection}_data`);
            
            return { success: true, ...result };
        } catch (error) {
            console.error(`保存${collection}数据失败:`, error);
            
            // 网络错误时加入同步队列
            this.syncQueue.push(operation);
            return { success: false, error: error.message };
        }
    }

    // 通用数据删除方法
    async deleteData(collection, docId) {
        const operation = {
            type: 'delete',
            collection,
            docId,
            timestamp: Date.now()
        };

        if (!this.isOnline) {
            this.syncQueue.push(operation);
            return { success: true, offline: true };
        }

        try {
            await this.db.collection(collection).doc(docId).delete();
            
            // 清除缓存
            this.localCache.delete(`${collection}_data`);
            
            return { success: true };
        } catch (error) {
            console.error(`删除${collection}数据失败:`, error);
            this.syncQueue.push(operation);
            return { success: false, error: error.message };
        }
    }

    // 处理同步队列
    async processSyncQueue() {
        if (!this.isOnline || this.syncQueue.length === 0) {
            return;
        }

        console.log(`开始处理同步队列，共 ${this.syncQueue.length} 个操作`);
        
        const queue = [...this.syncQueue];
        this.syncQueue = [];

        for (const operation of queue) {
            try {
                if (operation.type === 'save') {
                    await this.saveData(operation.collection, operation.data, operation.docId);
                } else if (operation.type === 'delete') {
                    await this.deleteData(operation.collection, operation.docId);
                }
            } catch (error) {
                console.error('同步操作失败:', error);
                // 重新加入队列
                this.syncQueue.push(operation);
            }
        }

        console.log('同步队列处理完成');
    }

    // 员工数据相关方法
    async getEmployees() {
        return await this.getData('employees');
    }

    async saveEmployee(employee) {
        return await this.saveData('employees', employee, employee.id);
    }

    async deleteEmployee(employeeId) {
        return await this.deleteData('employees', employeeId);
    }

    // 沙龙数据相关方法
    async getSalons() {
        return await this.getData('salons');
    }

    async saveSalon(salon) {
        return await this.saveData('salons', salon, salon.id);
    }

    async deleteSalon(salonId) {
        return await this.deleteData('salons', salonId);
    }

    // 操作历史相关方法
    async getOperations() {
        return await this.getData('operations');
    }

    async saveOperation(operation) {
        return await this.saveData('operations', operation);
    }

    // 审批数据相关方法
    async getPendingApprovals() {
        return await this.getData('pending_approvals');
    }

    async saveApproval(approval) {
        return await this.saveData('pending_approvals', approval, approval.id);
    }

    // 业绩目标相关方法
    async getPerformanceTargets() {
        return await this.getData('performance_targets');
    }

    async savePerformanceTargets(targets) {
        return await this.saveData('performance_targets', targets, 'current');
    }

    async getPerformanceActuals() {
        return await this.getData('performance_actuals');
    }

    async savePerformanceActuals(actuals) {
        return await this.saveData('performance_actuals', actuals, 'current');
    }

    // 用户设置相关方法（保持本地存储）
    async getUserSettings() {
        return {
            language: localStorage.getItem('language') || 'zh',
            theme: localStorage.getItem('theme') || 'auto',
            currentUser: JSON.parse(localStorage.getItem('currentUser') || 'null')
        };
    }

    async saveUserSettings(settings) {
        if (settings.language) localStorage.setItem('language', settings.language);
        if (settings.theme) localStorage.setItem('theme', settings.theme);
        if (settings.currentUser) localStorage.setItem('currentUser', JSON.stringify(settings.currentUser));
    }

    // 数据迁移方法：从localStorage迁移到Firebase
    async migrateFromLocalStorage() {
        console.log('开始数据迁移...');
        
        try {
            // 迁移员工数据
            const localEmployees = JSON.parse(localStorage.getItem('employees') || '[]');
            if (localEmployees.length > 0) {
                for (const employee of localEmployees) {
                    await this.saveEmployee(employee);
                }
                console.log(`✅ 已迁移 ${localEmployees.length} 个员工数据`);
            }

            // 迁移沙龙数据
            const localSalons = JSON.parse(localStorage.getItem('salons') || '[]');
            if (localSalons.length > 0) {
                for (const salon of localSalons) {
                    await this.saveSalon(salon);
                }
                console.log(`✅ 已迁移 ${localSalons.length} 个沙龙数据`);
            }

            // 迁移操作历史
            const localOperations = JSON.parse(localStorage.getItem('operationHistory') || localStorage.getItem('operations') || '[]');
            if (localOperations.length > 0) {
                for (const operation of localOperations) {
                    await this.saveOperation(operation);
                }
                console.log(`✅ 已迁移 ${localOperations.length} 个操作记录`);
            }

            // 迁移待审批数据
            const localApprovals = JSON.parse(localStorage.getItem('pendingApprovals') || '[]');
            if (localApprovals.length > 0) {
                for (const approval of localApprovals) {
                    await this.saveApproval(approval);
                }
                console.log(`✅ 已迁移 ${localApprovals.length} 个待审批记录`);
            }

            // 迁移业绩数据
            const localTargets = localStorage.getItem('performanceTargets');
            if (localTargets) {
                await this.savePerformanceTargets(JSON.parse(localTargets));
                console.log('✅ 已迁移业绩目标数据');
            }

            const localActuals = localStorage.getItem('performanceActuals');
            if (localActuals) {
                await this.savePerformanceActuals(JSON.parse(localActuals));
                console.log('✅ 已迁移业绩实际数据');
            }

            console.log('🎉 数据迁移完成！');
            return true;
        } catch (error) {
            console.error('❌ 数据迁移失败:', error);
            return false;
        }
    }

    // 获取同步状态
    getSyncStatus() {
        return {
            isOnline: this.isOnline,
            queueSize: this.syncQueue.length,
            lastSync: this.lastSyncTime || null
        };
    }
}

// 创建全局数据管理器实例
window.dataManager = new FirebaseDataManager();

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
        const status = window.dataManager.getSyncStatus();
        indicator.textContent = status.isOnline ? '已连接云端数据库' : `离线模式 (${status.queueSize}个操作待同步)`;
        
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