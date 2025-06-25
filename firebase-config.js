// Firebase配置信息
// 请替换下面的配置为您从Firebase控制台获取的真实配置

const firebaseConfig = {
  apiKey: "AIzaSyAcLyCy4FIL34AUd6vKrE_EqHV69qcFDYQ",
  authDomain: "mesiahair.firebaseapp.com",
  projectId: "mesiahair",
  storageBucket: "mesiahair.firebasestorage.app",
  messagingSenderId: "538029419112",
  appId: "1:538029419112:web:e2bb82a5fe0356e8d769dd"
};

// 初始化 Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// 设置全局变量
window.db = db;
window.firebase = firebase;

// 测试Firebase连接
console.log('Firebase配置信息:', firebaseConfig);

// 配置Firestore离线持久化
db.enablePersistence({
  synchronizeTabs: true
}).catch((err) => {
  if (err.code == 'failed-precondition') {
    console.log('Multiple tabs open, persistence can only be enabled in one tab at a time.');
  } else if (err.code == 'unimplemented') {
    console.log('The current browser does not support all features required for persistence');
  }
});

// 测试数据库连接
db.collection('test').add({
  message: 'Firebase连接测试',
  timestamp: new Date()
}).then(() => {
  console.log('✅ Firebase连接成功！');
}).catch((error) => {
  console.error('❌ Firebase连接失败:', error);
  console.log('错误详情:', error.code, error.message);
});

console.log('🔥 Firebase初始化完成！'); 