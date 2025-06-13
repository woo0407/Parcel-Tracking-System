import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { auth } from './firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

const AdminLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (isLoggedIn === "true") {
      navigate("/admin");
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // ✅ Firebase 로그인
      const userCredential = await signInWithEmailAndPassword(auth, username, password);
      const idToken = await userCredential.user.getIdToken(); // ID 토큰 가져오기
      
      // ✅ 백엔드로 ID 토큰 전송
      const response = await axios.post("http://192.168.1.11:4000/api/admin-login", {
        idToken
      });
      
      console.log(idToken);

      if (response.data.success) {
        localStorage.setItem("isLoggedIn", "true");
        alert("로그인 성공");
        navigate("/admin");
      } else {
        alert("로그인 실패");
      }
    } catch (error) {
      console.error("로그인 오류:", error);
      alert("잘못된 로그인 정보입니다.");
    }
  };

  const goToHome = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-10 rounded-2xl shadow-lg w-full max-w-sm">
        <h2 className="text-2xl font-bold text-center mb-8">관리자 로그인</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="아이디 (이메일)"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2 border rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-md mb-6 focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-md transition duration-200"
          >
            로그인
          </button>
        </form>
        <button
          onClick={goToHome}
          className="w-full bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-md transition duration-200 mt-4"
        >
          홈 화면으로 이동 ->
        </button>
      </div>
    </div>
  );
};

export default AdminLogin;

