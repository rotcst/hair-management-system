// Firebase配置文件
// 与您的Firebase项目设置匹配：Mesia-EMS (mesia-ems)

const firebaseConfig = {
    apiKey: "AIzaSyDAfHsHn6jyaCDURsi-R2a0vleka36ML6Q",
    authDomain: "mesia-ems.firebaseapp.com",
    projectId: "mesia-ems",
    storageBucket: "mesia-ems.firebasestorage.app",
    messagingSenderId: "718797479793",
    appId: "1:718797479793:web:22a39e902f8ac4324e60d0",
    measurementId: "G-3VHGK0DTQY",
    databaseURL: "https://mesia-ems-default-rtdb.firebaseio.com/"
};

// 初始化Firebase
firebase.initializeApp(firebaseConfig);

// 获取Firebase服务引用
const database = firebase.database();
const auth = firebase.auth();

console.log('Firebase配置已加载，项目ID:', firebaseConfig.projectId); 