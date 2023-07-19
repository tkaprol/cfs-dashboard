import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Typography } from 'antd';
import MainLayout from '../layouts/MainLayout';
import { DateTime } from 'luxon';

const { Title, Text } = Typography;

// Target: 28/11/2025 15:30 in Cyprus (Asia/Nicosia) timezone
const targetDate = DateTime.fromISO('2025-11-28T15:30:00', {
  zone: 'Asia/Nicosia',
});

function CountdownView() {
  const [remaining, setRemaining] = useState(null);

  useEffect(() => {
    const updateCountdown = () => {
      const now = DateTime.now().setZone('Asia/Nicosia');
      const diff = targetDate.diff(now, ['days', 'hours', 'minutes', 'seconds']);
      setRemaining(diff);
    };

    updateCountdown(); // First update
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval); // Cleanup
  }, []);

  const formatTime = (value) => String(Math.max(0, Math.floor(value))).padStart(2, '0');

  return (
    <MainLayout menu='20'>
      <div
        style={{
          padding: 24,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <Card
          style={{
            maxWidth: 600,
            width: '100%',
            textAlign: 'center',
            borderRadius: 16,
            boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
          }}
        >
          <Title level={2}>Route to Freedom!!!</Title>
          <img
            src='https://thumbs.dreamstime.com/b/prison-break-illustration-escaped-convict-who-runs-fast-48523138.jpg'
            alt='Prison Break'
            style={{
              maxWidth: '100%',
              height: 'auto',
              borderRadius: 12,
              marginBottom: 24,
            }}
          />
          {remaining ? (
            <Row gutter={16} justify='center'>
              <TimeBox label='Days' value={formatTime(remaining.days)} />
              <TimeBox label='Hours' value={formatTime(remaining.hours)} />
              <TimeBox label='Minutes' value={formatTime(remaining.minutes)} />
              <TimeBox label='Seconds' value={formatTime(remaining.seconds)} />
            </Row>
          ) : (
            <Text>Loading countdown...</Text>
          )}
        </Card>
      </div>
    </MainLayout>
  );
}

function TimeBox({ label, value }) {
  return (
    <Col span={6}>
      <Card bordered={false} style={{ background: '#294e87', borderRadius: 12 }}>
        <Title level={3}>{value}</Title>
        <Text>{label}</Text>
      </Card>
    </Col>
  );
}

export default CountdownView;
