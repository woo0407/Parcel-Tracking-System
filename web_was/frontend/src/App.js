import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./HomePage";
import DriverPage from "./DriverPage";
import StartDeliveryPage from "./StartDeliveryPage";
import ParcelTrackingPage from "./ParcelTrackingPage";
import AdminDashboard from "./AdminDashboard"; // ✅ import 이름 정확히
import AdminLogin from "./AdminLogin";
import VirtualData from './VirtualData'; // VirtualData 컴포넌트 import

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/driver" element={<DriverPage />} />
        <Route path="/start-delivery" element={<StartDeliveryPage />} />
        <Route path="/tracking" element={<ParcelTrackingPage />} />
        <Route path="/admin" element={<AdminDashboard />} /> {/* ✅ 컴포넌트로 사용 */}
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/virtual-data" element={<VirtualData />} /> {/* VirtualData 컴포넌트를 새로운 Route로 추가 */}
      </Routes>
    </Router>
  );
};

export default App;

