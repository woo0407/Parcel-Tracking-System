import React, { useState, useEffect } from "react";
import { FaBoxOpen, FaTruck, FaMapMarkerAlt, FaCheckCircle } from "react-icons/fa";

function VirtualData({ trackingNumber, selectedCourier }) {
  const [status, setStatus] = useState("집하 중");
  const [detailedInfo, setDetailedInfo] = useState(""); // 배송 상태에 대한 자세한 정보
  const [currentStep, setCurrentStep] = useState(0); // currentStep을 상태로 관리

  // 가상 데이터 설정: 운송장 번호와 상태 매핑
  const couriers = {
    "CJ대한통운": {
      "1234567890": "배송 중",
      "9876543210": "배송 완료",
      "5555555555": "배송 중",  // CJ대한통운 추가
      "1111111111": "집하 중",  // CJ대한통운 - 집하 중 추가
    },
    "롯데택배": {
      "1122334455": "이동 중",
    },
    "한진택배": {
      "1234567890": "배송 중",
      "9876543210": "배송 완료",
      "5555555555": "집하 중",  // 한진택배 - 집하 중 추가
    },
    "로젠택배": {
      "1122334455": "이동 중",
    },
    "쿠팡": {
      "5555555555": "배송 중",
    },
  };

  const steps = [
    { label: "집하 중", icon: <FaBoxOpen /> },
    { label: "이동 중", icon: <FaTruck /> },
    { label: "배송 중", icon: <FaMapMarkerAlt /> },
    { label: "배송 완료", icon: <FaCheckCircle /> },
  ];

  useEffect(() => {
    if (trackingNumber && selectedCourier) {
      const virtualStatus = couriers[selectedCourier]?.[trackingNumber]; // 택배사와 운송장 번호에 맞는 상태 가져오기

      if (virtualStatus) {
        let stepIndex = steps.findIndex((step) => step.label === virtualStatus);

        // 상태에 맞는 상세 정보 설정
        let details = "";
        if (virtualStatus === "배송 중") {
          details = "배송 중입니다. 잠시만 기다려 주세요.";
        } else if (virtualStatus === "배송 완료") {
          details = "배송이 완료되었습니다. 감사합니다!";
        } else if (virtualStatus === "이동 중") {
          details = "상품이 이동 중입니다. 빠른 시일 내에 도착 예정입니다.";
        } else if (virtualStatus === "집하 중") {
          details = "배송이 집하 중입니다. 잠시만 기다려 주세요.";  // "집하" 상태에 맞는 상세 정보 수정
        }

        setDetailedInfo(details); // 상태에 맞는 상세 정보 업데이트
        setStatus(virtualStatus); // 상태 업데이트
        setCurrentStep(stepIndex); // 애니메이션을 위한 currentStep 설정
      } else {
        alert("해당 운송장 번호 또는 택배사에 대한 정보가 없습니다.");
      }
    }
  }, [trackingNumber, selectedCourier]); // currentStep을 의존성 배열에서 제외

  return (
    <div>
      {/* 배송 단계 애니메이션 */}
      <div className="flex items-center justify-center space-x-6 mb-10 w-full max-w-lg">
        {steps.map((step, idx) => {
          const isActive = currentStep >= idx;
          return (
            <React.Fragment key={step.label}>
              <div className="flex flex-col items-center text-sm">
                <div
                  className={`w-12 h-12 flex items-center justify-center rounded-full text-xl transition-all duration-500 ${
                    isActive ? "bg-indigo-600 text-white" : "bg-gray-300 text-gray-600"
                  }`}
                >
                  {step.icon}
                </div>
                <span
                  className={`mt-1 ${isActive ? "text-indigo-700 dark:text-indigo-300 font-semibold" : "text-gray-500"}`}
                >
                  {step.label}
                </span>
              </div>
              {idx !== steps.length - 1 && (
                <div
                  className={`w-8 h-1 rounded transition-all duration-500 ${
                    isActive ? "bg-indigo-400" : "bg-gray-300"
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* 배송 상태에 대한 자세한 정보 */}
      <div className="mt-4 text-center">
        <h2 className="text-xl font-bold text-indigo-700 dark:text-indigo-300">
          배송 상태: {status}
        </h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">{detailedInfo}</p>
      </div>
    </div>
  );
}

export default VirtualData;

