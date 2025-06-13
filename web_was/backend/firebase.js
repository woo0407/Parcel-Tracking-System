const admin = require('firebase-admin');
const serviceAccount = require('./firebase-service-key.json'); // 🔑 서비스 계정 키

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://soldesk-46a18-default-rtdb.firebaseio.com'  // 🔁 수정 필요
});

const db = admin.database();
const auth = admin.auth(); // Firebase Authentication 기능

// Firebase 인증된 사용자 확인 함수
const verifyIdToken = async (idToken) => {
  try {
    const decodedToken = await auth.verifyIdToken(idToken); // ID 토큰 검증
    const uid = decodedToken.uid;  // 인증된 사용자의 UID
    console.log('인증된 사용자 UID:', uid);
    return uid;  // 인증된 UID 반환
  } catch (error) {
    console.error('인증 실패:', error);
    throw new Error('Invalid ID Token');
  }
};

module.exports = db;
