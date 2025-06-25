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

console.log('Firebase初始化成功 - 支持实时数据同步！'); 