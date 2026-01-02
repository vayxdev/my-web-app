import React, { useState, useEffect } from 'react';

const AnalogClock: React.FC = () => {
  const [time, setTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const secondsDegrees = time.getSeconds() * 6;
  const minutesDegrees = time.getMinutes() * 6 + time.getSeconds() * 0.1;
  const hoursDegrees = time.getHours() * 30 + time.getMinutes() * 0.5;

  const clockMarks = [...Array(12)].map((_, index) => {
    const degree = index * 30;
    const isQuarter = index % 3 === 0;
    return (
      <div
        key={index}
        style={{
          position: 'absolute',
          width: isQuarter ? '4px' : '2px',
          height: isQuarter ? '15px' : '10px',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          top: '10px',
          left: '50%',
          transform: `translateX(-50%) rotate(${degree}deg)`,
          transformOrigin: 'center 90px',
        }}
      />
    );
  });

  const clockStyle: React.CSSProperties = {
    position: 'relative',
    width: '220px',
    height: '220px',
    borderRadius: '50%',
    border: '4px solid rgba(255, 255, 255, 0.1)',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  };

  const innerClockStyle: React.CSSProperties = {
    position: 'relative',
    width: '200px',
    height: '200px',
    borderRadius: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  };

  const timeDisplayStyle: React.CSSProperties = {
    position: 'absolute',
    inset: '0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    fontWeight: 'bold',
    color: 'white',
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
  };

  const handStyles: React.CSSProperties = {
    position: 'absolute',
    bottom: '50%',
    left: '50%',
    transformOrigin: 'bottom center',
    borderRadius: '9999px',
  };

  return (
    <div style={clockStyle}>
      <div style={innerClockStyle}>
        {clockMarks}
        <div style={timeDisplayStyle}>
          {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
        <div
          style={{
            ...handStyles,
            width: '6px',
            height: '60px',
            backgroundColor: 'white',
            transform: `translate(-50%, 0) rotate(${hoursDegrees}deg)`,
            transition: 'transform 0.5s cubic-bezier(0.4, 2.08, 0.55, 0.44)',
          }}
        />
        <div
          style={{
            ...handStyles,
            width: '4px',
            height: '80px',
            backgroundColor: 'white',
            transform: `translate(-50%, 0) rotate(${minutesDegrees}deg)`,
            transition: 'transform 0.5s cubic-bezier(0.4, 2.08, 0.55, 0.44)',
          }}
        />
        <div
          style={{
            ...handStyles,
            width: '2px',
            height: '90px',
            backgroundColor: '#FF6B6B',
            transform: `translate(-50%, 0) rotate(${secondsDegrees}deg)`,
            transition: 'transform 0.2s cubic-bezier(0.4, 2.08, 0.55, 0.44)',
          }}
        />
      </div>
    </div>
  );
};

export default AnalogClock;
