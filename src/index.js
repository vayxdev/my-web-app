import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './tailwind.css';
import EventLogger from './eventLogger';
import Hanzi from './hanzi';
import PinyinAnnotator from './pinyin';
import Home from './home';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Router>
      <div>
        <nav className='navbar'>
          <ul className='nav-list'>
            <li className='nav-item'><Link to="/">Home</Link></li>
            <li className='nav-item'><Link to="/event-logger">EventLogger</Link></li>
            <li className='nav-item'><Link to="/hanzi">Hanzi</Link></li>
            <li className='nav-item'><Link to="/pinyin">Pinyin</Link></li>
          </ul>
        </nav>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/event-logger" element={<EventLogger />} />
          <Route path="/hanzi" element={<Hanzi />} />
          <Route path="/pinyin" element={<PinyinAnnotator />} />
        </Routes>
      </div>
    </Router>
);
