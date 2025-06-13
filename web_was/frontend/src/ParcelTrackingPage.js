import React from 'react';

const ParcelTrackingPage = () => {
  const trackingInfo = {
    waybill: '698411398774',
    status: '배달완료',
    sender: '진*선',
    receiver: '백*필',
    quantity: 1,
    receivedBy: '본인',
    history: [
      { date: '2017-04-25', time: '22:28:09', location: '서울은평수색', status: '배달완료' },
      { date: '2017-04-25', time: '08:30:39', location: '서울은평수색', status: '배달출발' },
      { date: '2017-04-25', time: '08:29:19', location: '은평A', status: '간선하차' },
      { date: '2017-04-25', time: '03:11:07', location: '옥천HUB', status: '간선상차' },
      // 추가 데이터 생략
    ]
  };

  return (
    <div style={{ maxWidth: 700, margin: 'auto', padding: 20, fontFamily: 'sans-serif' }}>
      <h2>상품추적</h2>
      <p><b>운송장 번호:</b> {trackingInfo.waybill} ({trackingInfo.status})</p>
      <hr />
      <p><b>보내는 사람:</b> {trackingInfo.sender}</p>
      <p><b>받는 사람:</b> {trackingInfo.receiver}</p>
      <p><b>수량:</b> {trackingInfo.quantity}</p>
      <p><b>인수자:</b> {trackingInfo.receivedBy}</p>
      <hr />
      <h3>상품추적 상태</h3>
      <table border="1" cellPadding="6" style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            <th>일자</th>
            <th>시각</th>
            <th>대리점</th>
            <th>구분</th>
          </tr>
        </thead>
        <tbody>
          {trackingInfo.history.map((row, index) => (
            <tr key={index}>
              <td>{row.date}</td>
              <td>{row.time}</td>
              <td>{row.location}</td>
              <td>{row.status}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: 20, fontSize: 13 }}>
        <p><b>※ 설명:</b></p>
        <ul>
          <li>간선상차: TR간 화물을 운반하는 대형차량에 올린 상태</li>
          <li>간선하차: 대형차량에서 화물을 내린 상태</li>
          <li>집화처리: 화물을 배송대리점에 전달한 상태</li>
        </ul>
      </div>
    </div>
  );
};

export default ParcelTrackingPage;

