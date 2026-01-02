import React, { useState, useEffect } from 'react';
import { PlusCircle, Clock, Calendar, Music, Book, Briefcase, Coffee, Edit2, Check, X } from 'lucide-react';
import { Helmet } from 'react-helmet';
import AnalogClock from '../ui/AnalogClock';

interface Event {
  id: number;
  type: string;
  note: string;
  startTime: string;
  duration: string;
  endTime: string;
}

const EventLogger: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [eventType, setEventType] = useState<string>('工作');
  const [note, setNote] = useState<string>('');
  const [startTime, setStartTime] = useState<string>('');
  const [duration, setDuration] = useState<string>('');
  const [editingEventId, setEditingEventId] = useState<number | null>(null);

  useEffect(() => {
    const storedEvents = localStorage.getItem('events');
    if (storedEvents) {
      setEvents(JSON.parse(storedEvents));
    }

    const now = new Date();
    setStartTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  }, []);

  useEffect(() => {
    localStorage.setItem('events', JSON.stringify(events));
  }, [events]);

  const addEvent = () => {
    if (!eventType || !startTime || !duration) return;
    const newEvent: Event = {
      id: Date.now(),
      type: eventType,
      note,
      startTime,
      duration,
      endTime: calculateEndTime(startTime, duration),
    };
    setEvents([newEvent, ...events]);
    resetForm();
  };

  const resetForm = () => {
    setEventType('工作');
    setNote('');
    setStartTime('');
    setDuration('');
  };

  const calculateEndTime = (start: string, duration: string): string => {
    const [hours, minutes] = start.split(':');
    const durationMinutes = parseInt(duration);
    const endDate = new Date();
    endDate.setHours(parseInt(hours));
    endDate.setMinutes(parseInt(minutes) + durationMinutes);
    return endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const updateEvent = (id: number, updatedFields: Partial<Event>) => {
    setEvents(events.map(event =>
      event.id === id
        ? {
          ...event,
          ...updatedFields,
          endTime: calculateEndTime(updatedFields.startTime || event.startTime, updatedFields.duration || event.duration)
        }
        : event
    ));
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case '工作': return <Briefcase size={24} />;
      case '学习': return <Book size={24} />;
      case '娱乐': return <Music size={24} />;
      default: return <Coffee size={24} />;
    }
  };

  const containerStyle: React.CSSProperties = {
    minHeight: '100vh',
    padding: '24px',
    background: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
    boxSizing: 'border-box',
  };

  const contentStyle: React.CSSProperties = {
    maxWidth: '800px',
    margin: '0 auto',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '20px',
    padding: '24px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px',
    border: 'none',
    borderRadius: '10px',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    marginBottom: '16px',
    fontSize: '16px',
    transition: 'all 0.3s ease',
  };

  const timeInputStyle: React.CSSProperties = {
    ...inputStyle,
    paddingRight: '5px',
    marginBottom: 0,
  };

  const timeInputContainerStyle: React.CSSProperties = {
    position: 'relative',
    flex: 1,
  };

  const buttonStyle: React.CSSProperties = {
    width: '100%',
    backgroundColor: '#4CAF50',
    color: 'white',
    padding: '12px',
    borderRadius: '10px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '18px',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease',
  };

  const eventCardStyle: React.CSSProperties = {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: '16px',
    borderRadius: '10px',
    marginBottom: '16px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease',
  };

  const iconButtonStyle: React.CSSProperties = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    marginLeft: '8px',
  };

  return (
    <div style={containerStyle}>
      <Helmet>
        <title>事件记录工具 - EventLogger | WW93在线工具</title>
        <meta name="description" content="EventLogger是一款便捷的事件记录工具，帮助您记录工作、学习、娱乐等日常活动的时间与详情，支持本地存储，数据永不丢失。" />
        <meta name="keywords" content="事件记录, 时间管理, 工作日志, 学习记录, 效率工具, 在线工具" />
        <meta name="author" content="WW93" />
        <meta property="og:title" content="事件记录工具 - EventLogger" />
        <meta property="og:description" content="便捷的事件记录工具，帮助您管理日常活动时间与详情。" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://ww93.com/event-logger" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="事件记录工具 - EventLogger" />
        <meta name="twitter:description" content="便捷的事件记录工具，帮助您管理日常活动时间与详情。" />
        <link rel="canonical" href="https://ww93.com/event-logger" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "EventLogger",
            "applicationCategory": "ProductivityApplication",
            "operatingSystem": "Web Browser",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "description": "便捷的事件记录工具，帮助您记录工作、学习、娱乐等日常活动"
          })}
        </script>
      </Helmet>
      <div style={contentStyle}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
          <AnalogClock />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <select
            value={eventType}
            onChange={(e) => setEventType(e.target.value)}
            style={inputStyle}
          >
            <option value="工作">工作</option>
            <option value="学习">学习</option>
            <option value="娱乐">娱乐</option>
            <option value="其他">其他</option>
          </select>

          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="备注"
            style={inputStyle}
          />

          <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
            <div style={timeInputContainerStyle}>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                style={timeInputStyle}
              />
            </div>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="持续时间(分钟)"
              style={{ ...inputStyle, marginBottom: 0, flex: 1 }}
            />
          </div>

          <button onClick={addEvent} style={buttonStyle}>
            <PlusCircle style={{ marginRight: '8px' }} />
            添加事件
          </button>
        </div>

        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px', color: 'white' }}>事件历史</h2>
          {events.map(event => (
            <div key={event.id} style={eventCardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                {getEventIcon(event.type)}
                <span style={{ fontWeight: 'bold', marginLeft: '8px', flexGrow: 1 }}>{event.type}</span>
                {editingEventId === event.id ? (
                  <>
                    <button onClick={() => setEditingEventId(null)} style={iconButtonStyle}>
                      <Check size={20} color="green" />
                    </button>
                    <button onClick={() => setEditingEventId(null)} style={iconButtonStyle}>
                      <X size={20} color="red" />
                    </button>
                  </>
                ) : (
                  <button onClick={() => setEditingEventId(event.id)} style={iconButtonStyle}>
                    <Edit2 size={20} />
                  </button>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', marginTop: '8px' }}>
                <Clock size={16} style={{ marginRight: '4px' }} />
                {editingEventId === event.id ? (
                  <input
                    type="time"
                    value={event.startTime}
                    onChange={(e) => updateEvent(event.id, { startTime: e.target.value })}
                    style={{ ...inputStyle, padding: '4px', marginBottom: 0, marginRight: '8px' }}
                  />
                ) : (
                  <span>{event.startTime} - {event.endTime}</span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Calendar size={16} style={{ marginRight: '4px' }} />
                {editingEventId === event.id ? (
                  <input
                    type="number"
                    value={event.duration}
                    onChange={(e) => updateEvent(event.id, { duration: e.target.value })}
                    style={{ ...inputStyle, padding: '4px', marginBottom: 0, marginRight: '8px' }}
                  />
                ) : (
                  <span>{event.duration}</span>
                )}
                <span>分钟</span>
              </div>
              <div>{event.note}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EventLogger;
