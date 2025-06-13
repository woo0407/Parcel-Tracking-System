import { useEffect } from "react";

const KakaoMap = ({ address, origin }) => {
  useEffect(() => {
    if (!address) {
      console.warn("❌ address 없음, 지도 렌더 생략");
      return;
    }

    const initMap = () => {
      if (!window.kakao || !window.kakao.maps || !window.kakao.maps.services) {
        console.error("🚨 카카오 맵 SDK 로드 실패 또는 누락");
        return;
      }

      console.log("📍 도착지:", address);
      if (origin) console.log("🚚 출발지:", origin);

      const container = document.getElementById("map");
      container.innerHTML = "";

      const map = new window.kakao.maps.Map(container, {
        center: new window.kakao.maps.LatLng(37.5665, 126.9780),
        level: 5,
      });

      const geocoder = new window.kakao.maps.services.Geocoder();
      const bounds = new window.kakao.maps.LatLngBounds();

      const makeMarker = (addr, label) => {
        return new Promise((resolve, reject) => {
          geocoder.addressSearch(addr, (result, status) => {
            if (status === window.kakao.maps.services.Status.OK) {
              const coords = new window.kakao.maps.LatLng(result[0].y, result[0].x);
              new window.kakao.maps.Marker({
                map,
                position: coords,
                title: label,
              });
              bounds.extend(coords);
              resolve();
            } else {
              console.error(`❌ ${label} 주소 변환 실패:`, addr);
              reject();
            }
          });
        });
      };

      const tasks = [makeMarker(address, "도착지")];
      if (origin) tasks.push(makeMarker(origin, "출발지"));

      Promise.all(tasks).then(() => {
        map.setBounds(bounds);
      });
    };

    if (window.kakao && window.kakao.maps) {
      window.kakao.maps.load(initMap);
    } else {
      const script = document.createElement("script");
      script.src =
        "//dapi.kakao.com/v2/maps/sdk.js?appkey=1a64c6d3760daf7debdbf6e3cc544bac&autoload=false&libraries=services";
      script.async = true;
      script.onload = () => {
        window.kakao.maps.load(initMap);
      };
      document.head.appendChild(script);
    }
  }, [address, origin]);

  return (
    <div
      id="map"
      style={{
        width: "700px",
        height: "300px",
        marginBottom: "2rem",
        borderRadius: "10px",
        overflow: "hidden",
        background: "#eee",
      }}
    >
      지도 로딩 중...
    </div>
  );
};

export default KakaoMap;

