import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaLock, FaMapMarkerAlt } from 'react-icons/fa';
import axios from 'axios'; // ← 추가

const DriverPage = () => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  
  useEffect(() => {
    const name = localStorage.getItem('driverName');
    if (name) {
      navigate('/start-delivery');
    }
  }, []);

  const handleAuth = async () => {
    if (!name || !password) {
      alert('이름과 비밀번호를 입력하세요.');
      return;
    }

    try {
      const res = await axios.post('http://192.168.1.11:4000/api/driver-login', {
	name: name.trim(),
        password: password.trim()
      });

      if (res.data.success) {
        alert(`인증되었습니다, ${name} 기사님!`);
	localStorage.setItem('driverName', name.trim());
        navigate('/start-delivery');
      }
    } catch (err) {
      alert(err.response?.data?.message || '인증 실패');
    }
  };

  return (
    <div style={styles.outerContainer}>
      <div style={styles.container}>
        <h2 style={styles.title}>배송 기사님<br />배달 시작 인증</h2>

        <div style={styles.inputGroup}>
          <FaUser style={styles.icon} />
          <input
            type="text"
            placeholder="기사 이름"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={styles.input}
          />
        </div>

        <div style={styles.inputGroup}>
          <FaLock style={styles.icon} />
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
          />
        </div>

        <button style={styles.button} onClick={handleAuth}>인증</button>

        <div style={styles.link} onClick={() => navigate('/')}>홈화면으로 이동 →</div>
      </div>
    </div>
  );
};

const styles = {
  outerContainer: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff'
  },
  container: {
    width: '100%',
    maxWidth: 360,
    padding: 24,
    textAlign: 'center',
    fontFamily: 'sans-serif'
  },
  title: {
    fontSize: 24,
    marginBottom: 32,
    fontWeight: 'bold'
  },
  inputGroup: {
    display: 'flex',
    alignItems: 'center',
    border: '1px solid #ccc',
    borderRadius: 12,
    padding: '10px 14px',
    marginBottom: 16
  },
  icon: {
    marginRight: 10
  },
  input: {
    border: 'none',
    outline: 'none',
    fontSize: 16,
    flex: 1
  },
  button: {
    backgroundColor: '#111',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: 12,
    fontSize: 16,
    cursor: 'pointer',
    marginBottom: 20
  },
  link: {
    color: '#000',
    cursor: 'pointer',
    fontSize: 14,
    textDecoration: 'underline'
  }
};

export default DriverPage;

