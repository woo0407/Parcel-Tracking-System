import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  FaBoxOpen,
  FaTruck,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaSun,
  FaMoon,
} from "react-icons/fa";
import KakaoMap from "./components/KakaoMap";

const HomePage = () => {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [selectedCourier, setSelectedCourier] = useState("");
  const [selectedCourierCode, setSelectedCourierCode] = useState("");
  const [couriers, setCouriers] = useState([]);
  const [status, setStatus] = useState("집하 중");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [detailedInfo, setDetailedInfo] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [originAddress, setOriginAddress] = useState("");

  const clickCountRef = useRef(0);
  const lastClickTimeRef = useRef(0);

  const handleSecretClick = () => {
    const now = Date.now();
    if (now - lastClickTimeRef.current > 3000) {
      clickCountRef.current = 1;
    } else {
      clickCountRef.current += 1;
    }
    lastClickTimeRef.current = now;

    if (clickCountRef.current >= 5) {
      window.location.href = "/admin-login";
    }
  };

  // 택배사 데이터 가져오기 (로고는 하드코딩)
  useEffect(() => {
    const fetchCouriers = async () => {
      try {
        const response = await axios.get("http://192.168.1.11:4000/api/couriers");
        setCouriers(response.data); // 받아온 데이터 그대로 사용
      } catch (error) {
        console.error("🚨 택배사 데이터 불러오기 실패:", error);
      }
    };

    fetchCouriers();
  }, []);

  const steps = [
    { label: "집하 중", icon: <FaBoxOpen />, tooltip: "택배가 창고에서 출발 준비 중입니다." },
    { label: "이동 중", icon: <FaTruck />, tooltip: "택배가 목적지로 이동 중입니다." },
    { label: "배송 중", icon: <FaMapMarkerAlt />, tooltip: "택배가 지금 집으로 가는 중입니다." },
    { label: "배송 완료", icon: <FaCheckCircle />, tooltip: "택배가 집에 도착했어요!" },
  ];

  const handleTrack = async () => {
    if (!trackingNumber) {
      alert("운송장 번호를 입력해주세요.");
      return;
    }

    try {
      // API 요청에서 택배사 코드와 운송장 번호를 전달
      const response = await axios.get("http://192.168.1.11:4000/api/delivery-status", {
	  params: { tracking_number: trackingNumber },
      });

      const virtualStatus = response.data.status;
      let details = "";

      if (virtualStatus === "배송 중") {
        details = "배송 중입니다. 잠시만 기다려 주세요.";
	setDeliveryAddress(response.data.address);  // 도착지
	setOriginAddress(response.data.origin);     // 출발지
      } else if (virtualStatus === "배송 완료") {
        details = "배송이 완료되었습니다. 감사합니다!";
	setDeliveryAddress(response.data.address);
	setOriginAddress(response.data.origin);
      } else if (virtualStatus === "이동 중") {
        details = "상품이 이동 중입니다. 빠른 시일 내에 도착 예정입니다.";
	setDeliveryAddress(""); // 👈 다른 상태일 땐 주소 초기화
	setOriginAddress("");
      } else if (virtualStatus === "집하 중") {
        details = "배송이 집하 중입니다. 잠시만 기다려 주세요.";
	setDeliveryAddress("");
	setOriginAddress("");
      }

      setDetailedInfo(details);
      setStatus(virtualStatus);  // 상태 업데이트
      setErrorMessage("");  // 에러 메시지 초기화
    } catch (error) {
      setStatus("");  // 상태 초기화
      alert("해당 운송장 번호 정보가 없습니다.");
      console.error("🚨 배송 상태 조회 실패:", error);
    }
  };

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("dark");
    if (isDarkMode) {
      root.classList.add("dark");
    }
  }, [isDarkMode]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition">
      <nav className="w-full bg-white dark:bg-gray-800 shadow px-6 py-4 fixed top-0 z-10">
        <div className="flex justify-between items-center max-w-5xl mx-auto">
          <a
            href="/"
            className="text-xl font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center"
          >
            📦 택배 추적 시스템
          </a>
          <button
            onClick={() => setIsDarkMode((prev) => !prev)}
            className="p-2 rounded-md bg-gray-200 dark:bg-gray-700 hover:opacity-80 transition"
            title="테마 전환"
          >
            {isDarkMode ? <FaSun className="text-yellow-400" /> : <FaMoon />}
          </button>
        </div>
      </nav>

      <div className="pt-24 px-4 flex flex-col items-center">
        <h1 className="text-4xl font-bold mb-8 text-indigo-700 dark:text-indigo-300">
          택배 조회
        </h1>

        {/* 운송장 번호 입력 및 조회 버튼 */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-8 w-full max-w-md">
          <input
            type="text"
            placeholder="운송장 번호"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white rounded-md p-3 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={handleTrack}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-md w-full sm:w-auto"
          >
            조회하기
          </button>
        </div>

        {/* 상태 단계를 표시하는 부분 */}
        <div className="flex items-center justify-center space-x-6 mb-10 w-full max-w-lg">
          {steps.map((step, idx) => {
	    const currentStepIndex = steps.findIndex((s) => s.label === status);
            const isPassed = idx <= currentStepIndex;
	    
            return (
              <React.Fragment key={step.label}>
                <div className="flex flex-col items-center text-sm relative group">
                  <div
                    className={`w-12 h-12 flex items-center justify-center rounded-full text-xl transition-all duration-500 ${
                      isPassed
                        ? "bg-blue-600 text-white transform scale-110"
                        : "bg-gray-300 text-gray-600"
                    }`}
                  >
                    {step.icon}
                  </div>
                  <span
                    className={`mt-1 ${
                      isPassed ? "text-blue-700 font-semibold" : "text-gray-500"
                    }`}
                  >
                    {step.label}
                  </span>

                  {/* 툴팁 영역: 아이콘 영역에 마우스를 올리면 설명이 나옴 */}
                  <div
                    className="absolute left-1/2 transform -translate-x-1/2 mt-2 px-3 py-1 rounded-md text-white bg-gray-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-max"
                    style={{ zIndex: 100 }}
                  >
                    {step.tooltip}
                  </div>
                </div>

                {/* 각 단계를 구분하는 선 */}
                {idx !== steps.length - 1 && (
                  <div
                    className={`w-8 h-1 rounded transition-all duration-500 ${
                      idx < currentStepIndex ? "bg-blue-400" : "bg-gray-300"
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
        
        {["배송 중", "배송 완료"].includes(status) && deliveryAddress && (
          <KakaoMap
            address={deliveryAddress}
            origin={status === "배송 중" ? originAddress : null}
            mode={status}
          />
        )}

        {/* 택배사 로고와 이름 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 mb-10">
          {couriers.map((courier) => (
            <React.Fragment key={courier.name}>
              <div className="flex flex-col items-center relative">
                <img
                  src={courier.logo}
                  alt={courier.name}
                  className="w-20 h-20 object-contain rounded shadow"
                />
                <span className="mt-2 text-sm">{courier.name}</span>
              </div>

              {/* 쿠팡 택배에만 관리자 진입을 위한 클릭 영역 추가 */}
              {courier.name === "쿠팡" && (
                <div
                  onClick={handleSecretClick}
                  className="w-20 h-20 opacity-0 cursor-pointer"
                  title="숨겨진 관리자 진입"
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* 에러 메시지 */}
        {errorMessage && <p className="text-red-500 mt-4">{errorMessage}</p>}

        {/* 배송 기사님 화면으로 이동 버튼 */}
        <button
          onClick={() => (window.location.href = "/driver")}
          className="bg-yellow-400 hover:bg-yellow-300 text-black font-semibold px-6 py-3 rounded-lg shadow-md transition"
        >
          🧑‍✈️ 배송 기사님 화면으로 이동
        </button>
      </div>
    </div>
  );
};

export default HomePage;

