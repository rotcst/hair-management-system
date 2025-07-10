// Firebase配置文件
// 与您的Firebase项目设置匹配：Mesia Management system

const firebaseConfig = {
    apiKey: "AIzaSyDYaff6z2iqr6IMdK9OOavhv9R-0Av3JXI",
    authDomain: "mesia-management-system.firebaseapp.com",
    projectId: "mesia-management-system",
    storageBucket: "mesia-management-system.firebasestorage.app",
    messagingSenderId: "602101408546",
    appId: "1:602101408546:web:9f3f2089a9cc53aa9efb7b",
    measurementId: "G-B6S7C6ZRYS",
    databaseURL: "https://mesia-management-system-default-rtdb.asia-southeast1.firebasedatabase.app/"
};

// 初始化Firebase
firebase.initializeApp(firebaseConfig);

// 获取Firebase服务引用
const database = firebase.database();
const auth = firebase.auth();

console.log('Firebase配置已加载，项目ID:', firebaseConfig.projectId); 