const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const serviceAccount = require('./firebase-service-key.json'); // 🔑 서비스 계정 키

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://soldesk-46a18-default-rtdb.firebaseio.com'
});

const db = admin.database();
const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

// Firebase 인증 객체 가져오기
const auth = admin.auth();

// 관리자 로그인
app.post('/api/admin-login', async (req, res) => {
  const idToken = req.body.idToken;
  
  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    const email = decoded.email;

    const snapshot = await db.ref('admin').orderByChild('email').equalTo(email).once('value');
    const adminUser = snapshot.val();

    if (adminUser && Object.keys(adminUser).length > 0) {
      res.json({ success: true, admin: Object.values(adminUser)[0] });
    } else {
      res.status(404).json({ success: false, message: '관리자 정보가 없습니다.' });
    }
  } catch (error) {
    console.error("토큰 인증 실패:", error);
    res.status(401).json({ success: false, message: '잘못된 토큰' });
  }
});

// 전체 배송 데이터 조회 (관리자 대시보드용)
app.get('/api/admin/deliveries', async (req, res) => {
  try {
    const snapshot = await db.ref('deliveries').once('value');
    const deliveries = snapshot.val();

    const formatted = Object.entries(deliveries || {}).map(([id, d]) => ({
      id,
      ...d,
    }));

    // 여기서 driver_status가 "배송 중" 또는 "배송 완료"인 데이터만 보내도록 필터링 가능 (선택)
    const filtered = formatted.filter(
      (d) => d.status === "배송 중" || d.status === "배송 완료"
    );

    res.json(filtered);
  } catch (error) {
    console.error('🚨 전체 배송 데이터 조회 실패:', error);
    res.status(500).json({ error: '서버 오류' });
  }
});


// 관리자에서 배송 기사 목록 조회
app.get("/api/admin/drivers", async (req, res) => {
  try {
    const snapshot = await db.ref("drivers").once("value");
    const drivers = snapshot.val();

    if (!drivers) return res.json([]);

    const formatted = Object.entries(drivers).map(([id, value]) => ({
      id,
      ...value,
    }));

    res.json(formatted);
  } catch (error) {
    console.error("🚨 관리자용 드라이버 목록 조회 실패:", error);
    res.status(500).json({ error: "서버 오류" });
  }
});

// 관리자에서 배송 기사 삭제
app.delete("/api/admin/drivers/:id", async (req, res) => {
  const driverId = req.params.id;
  try {
    await db.ref(`drivers/${driverId}`).remove();
    res.json({ success: true });
  } catch (error) {
    console.error("🚨 드라이버 삭제 실패:", error);
    res.status(500).json({ success: false });
  }
});

// 관리자에서 배송 기사 추가
app.post("/api/admin/drivers", async (req, res) => {
  const { name, phone, password, region } = req.body;
  if (!name || !phone || !password || !region) {
    return res.status(400).json({ success: false, message: "필수 항목 누락" });
  }

  const id = `driver${Date.now().toString().slice(-5)}`; // 예: driver24931

  try {
    await db.ref(`drivers/${id}`).set({ name, phone, password, region });
    res.json({ success: true, id });
  } catch (error) {
    console.error("🚨 드라이버 추가 실패:", error);
    res.status(500).json({ success: false });
  }
});

// 기존의 driver-login API는 그대로 둡니다.
app.post('/api/driver-login', async (req, res) => {
  const { name, password } = req.body;  // name과 password 받아옴

  try {
    const snapshot = await db.ref('drivers').once('value');
    const drivers = snapshot.val();

    // email과 password로 해당 driver 찾기
    const matched = Object.values(drivers).find(
      (d) => d.name === name && d.password === password
    );

    if (matched) {
      console.log('✅ 인증 성공:', matched);
      res.json({ success: true, driver: matched });
    } else {
      console.log('❌ 인증 실패: 이름 또는 비밀번호 불일치');
      res.status(401).json({ success: false, message: '이름 또는 비밀번호가 틀렸습니다.' });
    }
  } catch (error) {
    console.error('서버 오류:', error);
    res.status(500).json({ success: false, message: '서버 오류', error });
  }
});

// 택배사 데이터 제공 API
app.get("/api/couriers", async (req, res) => {
  try {
    const snapshot = await db.ref("courier_companies").once("value");
    const couriers = snapshot.val();

    // 각 택배사의 name과 logo만 추출하여 반환
    const formattedCouriers = Object.values(couriers).map(courier => ({
      name: courier.name,
      logo: courier.logo
    }));

    res.json(formattedCouriers);
  } catch (error) {
    console.error("🚨 택배사 데이터 가져오기 실패:", error);
    res.status(500).json({ error: "서버 오류" });
  }
});

// 드라이버별 배송 목록 API
app.get('/api/deliveries', async (req, res) => {
  const driver = req.query.driver;

  try {
    const snapshot = await db.ref('deliveries').once('value');
    const deliveries = snapshot.val();

    const filtered = Object.entries(deliveries || {})
      .filter(([_, v]) => v.driver === driver)
      .map(([id, v], idx) => ({
        id,
        no: idx + 1,
        address: v.address,
        driver_status: v.driver_status
      }));

    res.json(filtered);
  } catch (error) {
    console.error('🚨 배송 데이터 가져오기 실패:', error);
    res.status(500).json({ error: '서버 오류' });
  }
});

// 배송 상태 변경 (PATCH 요청 처리)
app.patch('/api/deliveries/:id', async (req, res) => {
  const { id } = req.params;  // 요청 URL에서 배송 ID 추출
  const { driver_status } = req.body; // 요청 본문에서 새로운 상태 추출

  const normalizedStatus = driver_status.trim().replace(/\s+/g, "");
  if (!["완료", "배송완료"].includes(normalizedStatus)) {
    return res.status(400).json({ error: '상태는 "배송 완료"여야 합니다.' });
  }

  try {
    await db.ref(`deliveries/${id}`).update({
      driver_status: '완료',
      status: '배송 완료' // ✅ 여기 추가
    });

    // 성공적으로 업데이트 후 응답
    res.status(200).json({ message: '배송 상태가 완료로 업데이트되었습니다.' });
  } catch (error) {
    console.error('🚨 상태 업데이트 실패:', error);
    res.status(500).json({ error: '서버 오류' });
  }
});

app.get('/api/delivery-status', async (req, res) => {
  const trackingNumber = req.query.tracking_number;

  try {
    const deliverySnapshot = await db.ref('deliveries').once('value');
    const deliveries = deliverySnapshot.val();

    let matchedDelivery = null;

    for (let deliveryKey in deliveries) {
      const delivery = deliveries[deliveryKey];
      if (delivery.tracking_number === trackingNumber) {
        matchedDelivery = delivery;
        break;
      }
    }

    if (!matchedDelivery) {
      return res.status(404).json({
        error: '해당 운송장 번호의 배달 상태를 찾을 수 없습니다.',
      });
    }

    const courierName = matchedDelivery.courier_name; // 예: "CJ대한통운"
    let originAddress = "";

    if (courierName) {
      const originSnapshot = await db
        .ref(`courier_companies/${courierName}/regions/0`)
        .once('value');
      originAddress = originSnapshot.val() || "";
    }

    res.status(200).json({
      status: matchedDelivery.status,
      address: matchedDelivery.address,
      origin: originAddress, // ✅ 추가됨
    });
  } catch (error) {
    console.error('🚨 서버 오류:', error);
    res.status(500).json({ error: '서버 오류' });
  }
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`✅ 백엔드 서버 실행 중: http://localhost:${PORT}`);
});

