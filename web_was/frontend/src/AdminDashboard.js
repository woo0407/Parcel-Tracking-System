import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState("dashboard");
  const [drivers, setDrivers] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [newDriver, setNewDriver] = useState({
    name: "",
    phone: "",
    password: "",
    region: "",
  });
  const [searchTerm, setSearchTerm] = useState("");

  const API_BASE = "http://192.168.1.11:4000";

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) navigate("/admin-login");
  }, [navigate]);

  useEffect(() => {
    axios
      .get(`${API_BASE}/api/admin/drivers`)
      .then((res) => setDrivers(res.data))
      .catch((err) => console.error("기사 목록 불러오기 실패:", err));

    axios
      .get(`${API_BASE}/api/admin/deliveries`) // ✅ 백엔드 API 경로
      .then((res) => setDeliveries(res.data))
      .catch((err) => console.error("배송 목록 불러오기 실패:", err));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    navigate("/admin-login");
  };

  const addDriver = async () => {
    const { name, phone, password, region } = newDriver;
    if (!name || !phone || !password || !region) return;

    try {
      await axios.post(`${API_BASE}/api/admin/drivers`, {
        name,
        phone,
        password,
        region,
      });
      setNewDriver({ name: "", phone: "", password: "", region: "" });
      const res = await axios.get(`${API_BASE}/api/admin/drivers`);
      setDrivers(res.data);
    } catch (err) {
      console.error("추가 실패:", err);
    }
  };

  const removeDriver = async (index) => {
    const target = drivers[index];
    if (target?.id) {
      await axios.delete(`${API_BASE}/api/admin/drivers/${target.id}`);
      const res = await axios.get(`${API_BASE}/api/admin/drivers`);
      setDrivers(res.data);
    }
  };

  const updateDeliveryStatus = async (id, newStatus) => {
    try {
      await axios.patch(`${API_BASE}/api/deliveries/${id}`, {
        driver_status: newStatus,
      });
      const res = await axios.get(`${API_BASE}/api/admin/deliveries`);
      setDeliveries(res.data);
    } catch (error) {
      console.error("배송 상태 업데이트 실패:", error);
    }
  };

  const chartData = [
    {
      name: "배송 중",
      count: deliveries.filter((d) => d.status === "배송 중").length,
    },
    {
      name: "배송 완료",
      count: deliveries.filter((d) => d.status === "배송 완료").length,
    },
  ];

  const chartColors = {
    "배송 중": "#3182ce",
    "배송 완료": "#38a169",
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">📦 관리자 대시보드</h1>
            <p className="text-gray-600">관리자님, 환영합니다 👋</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
          >
            로그아웃
          </button>
        </div>

        <div className="flex space-x-3 mb-6">
          {["dashboard", "drivers"].map((key) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-4 py-2 rounded-md font-semibold ${
                tab === key
                  ? "bg-blue-600 text-white"
                  : "bg-white border text-gray-700"
              }`}
            >
              {key === "dashboard" && "📊 대시보드"}
              {key === "drivers" && "👤 기사 관리"}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          {tab === "dashboard" && (
            <>
              <h2 className="text-xl font-bold mb-4">📈 배송 상태 차트</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count">
                    {chartData.map((entry, index) => (
                      <Cell
                        key={index}
                        fill={chartColors[entry.name] || "#ccc"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </>
          )}

          {tab === "drivers" && (
            <>
              <h2 className="text-xl font-bold mb-4">👤 기사 목록</h2>
              <div className="mb-4 flex gap-3 items-center">
                <input
                  placeholder="이름 검색"
                  className="border px-3 py-1 rounded-md"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <table className="w-full border mb-4 text-sm">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="p-2 text-center">이름</th>
                    <th className="p-2 text-center">비밀번호</th>
                    <th className="p-2 text-center">지역</th>
                    <th className="p-2 text-center">연락처</th>
                    <th className="p-2 text-center">삭제</th>
                  </tr>
                </thead>
                <tbody>
                  {drivers
                    .filter((d) => d.name.includes(searchTerm))
                    .map((driver, i) => (
                      <tr key={i} className="border-t">
                        <td className="p-2 text-center">{driver.name}</td>
                        <td className="p-2 text-center">{driver.password}</td>
                        <td className="p-2 text-center">{driver.region}</td>
                        <td className="p-2 text-center">{driver.phone}</td>
                        <td className="p-2 text-center">
                          <button
                            onClick={() => removeDriver(i)}
                            className="text-red-600 hover:underline"
                          >
                            삭제
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
              <div className="flex flex-wrap gap-2">
                <input
                  type="text"
                  placeholder="기사 이름"
                  className="border p-2 rounded w-40"
                  value={newDriver.name}
                  onChange={(e) =>
                    setNewDriver({ ...newDriver, name: e.target.value })
                  }
                />
                <input
                  type="text"
                  placeholder="비밀번호"
                  className="border p-2 rounded w-40"
                  value={newDriver.password}
                  onChange={(e) =>
                    setNewDriver({ ...newDriver, password: e.target.value })
                  }
                />
                <input
                  type="text"
                  placeholder="지역 (예: 서울 강남구)"
                  className="border p-2 rounded w-40"
                  value={newDriver.region}
                  onChange={(e) =>
                    setNewDriver({ ...newDriver, region: e.target.value })
                  }
                />
                <input
                  type="text"
                  placeholder="연락처"
                  className="border p-2 rounded w-40"
                  value={newDriver.phone}
                  onChange={(e) =>
                    setNewDriver({ ...newDriver, phone: e.target.value })
                  }
                />
                <button
                  onClick={addDriver}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                >
                  추가
                </button>
              </div>
            </>
          )}
	  {/*
          //{tab === "deliveries" && (
          //  <>
          //    <h2 className="text-xl font-bold mb-4">📦 배송 목록</h2>
          //    <table className="w-full border text-sm">
          //      <thead className="bg-gray-200">
          //        <tr>
          //          <th className="p-2">송장번호</th>
          //          <th className="p-2">수신자</th>
          //          <th className="p-2">상태</th>
          //          <th className="p-2">기사</th>
          //        </tr>
          //      </thead>
          //      <tbody>
          //        {deliveries.map((d, i) => (
          //          <tr key={i} className="border-t">
          //            <td className="p-2">{d.id}</td>
          //            <td className="p-2">{d.receiver}</td>
          //            <td className="p-2">
          //              <select
          //                value={d.status}
          //                onChange={(e) =>
          //                  updateDeliveryStatus(d.id, e.target.value)
          //                }
          //                className="border rounded px-2 py-1"
          //              >
          //                <option>배송 중</option>
          //                <option>배송 완료</option>
          //              </select>
          //            </td>
          //            <td className="p-2">{d.driver}</td>
          //          </tr>
          //        ))}
          //      </tbody>
          //    </table>
          //  </>
          //)} */}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

