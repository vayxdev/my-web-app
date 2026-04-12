import React, { useState, useEffect, useRef } from 'react';
import HanziWriter from 'hanzi-writer';
import { Helmet } from 'react-helmet';

declare global {
  interface Window {
    HanziWriter: any;
  }
}

const CACHE_PREFIX = 'hanzi_cache_';
const CACHE_VERSION = 'v1';

const getCachedCharacterData = (char: string): any | null => {
  try {
    const cached = localStorage.getItem(`${CACHE_PREFIX}${CACHE_VERSION}_${char}`);
    if (cached) {
      const data = JSON.parse(cached);
      if (data.timestamp && Date.now() - data.timestamp < 7 * 24 * 60 * 60 * 1000) {
        return data.characterData;
      }
      localStorage.removeItem(`${CACHE_PREFIX}${CACHE_VERSION}_${char}`);
    }
  } catch (error) {
    console.error('Error reading from cache:', error);
  }
  return null;
};

const autoCleanCache = () => {
  if (Math.random() < 0.1) {
    cleanExpiredCache();
  }
};

const setCachedCharacterData = (char: string, characterData: any) => {
  try {
    cleanExpiredCache();
    checkStorageAndEvict();
    const cacheItem = { characterData, timestamp: Date.now() };
    localStorage.setItem(`${CACHE_PREFIX}${CACHE_VERSION}_${char}`, JSON.stringify(cacheItem));
  } catch (error) {
    console.error('Error writing to cache:', error);
  }
};

const cleanExpiredCache = () => {
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(CACHE_PREFIX + CACHE_VERSION + '_')) {
        try {
          const cached = JSON.parse(localStorage.getItem(key) || '');
          if (!cached.timestamp || Date.now() - cached.timestamp > 7 * 24 * 60 * 60 * 1000) {
            keysToRemove.push(key);
          }
        } catch {
          keysToRemove.push(key);
        }
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
  } catch (error) {
    console.error('Error cleaning cache:', error);
  }
};

const checkStorageAndEvict = () => {
  try {
    const MAX_CACHE_SIZE = 100;
    const cacheKeys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(CACHE_PREFIX + CACHE_VERSION + '_')) {
        cacheKeys.push(key);
      }
    }
    if (cacheKeys.length > MAX_CACHE_SIZE) {
      const sortedKeys = cacheKeys.sort((a, b) => {
        const dataA = JSON.parse(localStorage.getItem(a) || '');
        const dataB = JSON.parse(localStorage.getItem(b) || '');
        return (dataA.timestamp || 0) - (dataB.timestamp || 0);
      });
      const keysToRemove = sortedKeys.slice(0, cacheKeys.length - MAX_CACHE_SIZE);
      keysToRemove.forEach(key => localStorage.removeItem(key));
    }
  } catch (error) {
    console.error('Error checking storage:', error);
  }
};

/* ---- Tian Zi Ge (田字格) SVG Guide Lines ---- */
const TianZiGeBackground: React.FC<{ size: number; strokeColor?: string }> = ({
  size,
  strokeColor = '#c84040',
}) => (
  <svg
    width={size}
    height={size}
    viewBox={`0 0 ${size} ${size}`}
    style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
  >
    {/* Dashed cross */}
    <line x1={size / 2} y1={0} x2={size / 2} y2={size} stroke={strokeColor} strokeWidth="0.8" strokeDasharray="4 3" opacity="0.35" />
    <line x1={0} y1={size / 2} x2={size} y2={size / 2} stroke={strokeColor} strokeWidth="0.8" strokeDasharray="4 3" opacity="0.35" />
    {/* Dashed diagonals */}
    <line x1={0} y1={0} x2={size} y2={size} stroke={strokeColor} strokeWidth="0.6" strokeDasharray="4 4" opacity="0.18" />
    <line x1={size} y1={0} x2={0} y2={size} stroke={strokeColor} strokeWidth="0.6" strokeDasharray="4 4" opacity="0.18" />
  </svg>
);

const Hanzi: React.FC = () => {
  const [input, setInput] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const dynamicWritersRef = useRef<Record<string, any>>({});
  const staticWritersRef = useRef<Record<string, any>>({});
  const containerRefs = useRef<Record<string, { dynamic: HTMLDivElement | null; static: HTMLDivElement | null }>>({});

  useEffect(() => {
    return () => {
      Object.values(dynamicWritersRef.current).forEach(writer => {
        if (writer) writer.target.innerHTML = '';
      });
      Object.values(staticWritersRef.current).forEach(writers => {
        writers.forEach((writer: any) => {
          if (writer) writer.target.innerHTML = '';
        });
      });
      dynamicWritersRef.current = {};
      staticWritersRef.current = {};
    };
  }, []);

  const createSvgBackground = (svg: SVGSVGElement, size: number) => {
    const lines = [
      { x1: 0, y1: 0, x2: size, y2: size },
      { x1: size, y1: 0, x2: 0, y2: size },
      { x1: size / 2, y1: 0, x2: size / 2, y2: size },
      { x1: 0, y1: size / 2, x2: size, y2: size / 2 },
    ];
    lines.forEach(line => {
      const el = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      el.setAttribute('x1', line.x1.toString());
      el.setAttribute('y1', line.y1.toString());
      el.setAttribute('x2', line.x2.toString());
      el.setAttribute('y2', line.y2.toString());
      el.setAttribute('stroke', '#c8a07a');
      el.setAttribute('stroke-dasharray', '3 3');
      el.setAttribute('opacity', '0.3');
      svg.appendChild(el);
    });
  };

  useEffect(() => {
    const newErrors: Record<string, string> = {};

    Object.keys(dynamicWritersRef.current).forEach(char => {
      if (!input.includes(char)) {
        if (dynamicWritersRef.current[char]) {
          dynamicWritersRef.current[char].target.innerHTML = '';
          delete dynamicWritersRef.current[char];
        }
        if (staticWritersRef.current[char]) {
          staticWritersRef.current[char].forEach((writer: any) => writer.target.innerHTML = '');
          delete staticWritersRef.current[char];
        }
        if (containerRefs.current[char]) {
          delete containerRefs.current[char];
        }
      }
    });

    const renderFanningStrokes = (target: HTMLDivElement, strokes: string[], size: number) => {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('width', size.toString());
      svg.setAttribute('height', size.toString());
      svg.style.display = 'block';
      target.appendChild(svg);

      createSvgBackground(svg, size);

      const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      const transformData = HanziWriter.getScalingTransform(size, size);
      group.setAttributeNS(null, 'transform', transformData.transform);
      svg.appendChild(group);

      strokes.forEach((strokePath: string) => {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttributeNS(null, 'd', strokePath);
        path.style.fill = '#2a2520';
        group.appendChild(path);
      });
    };

    input.split('').filter(char => /[\u4e00-\u9fa5]/.test(char)).forEach((char) => {
      if (containerRefs.current[char]) {
        const loadCharacter = async () => {
          try {
            autoCleanCache();
            let charData = getCachedCharacterData(char);
            if (!charData) {
              const response = await fetch(`https://static.ww93.fun/hanzi-writer-data/${encodeURIComponent(char)}.json`);
              if (!response.ok) throw new Error('Character not found');
              charData = await response.json();
              setCachedCharacterData(char, charData);
            }

            if (!dynamicWritersRef.current[char]) {
              dynamicWritersRef.current[char] = HanziWriter.create(containerRefs.current[char]?.dynamic as HTMLElement, char, {
                width: 160,
                height: 160,
                padding: 8,
                showOutline: true,
                strokeAnimationSpeed: 1,
                delayBetweenStrokes: 500,
                strokeColor: '#2a2520',
                outlineColor: '#ddd4c8',
                drawingColor: '#c84040',
                charDataLoader: (char: string, onComplete: (data: any) => void) => {
                  fetch(`https://static.ww93.fun/hanzi-writer-data/${encodeURIComponent(char)}.json`)
                    .then(r => r.json())
                    .then(onComplete);
                },
                onLoadCharDataSuccess: () => {},
                onLoadCharDataError: () => {},
              });
              dynamicWritersRef.current[char].loopCharacterAnimation();
            }

            if (!staticWritersRef.current[char]) {
              staticWritersRef.current[char] = [];
              for (let i = 0; i < charData.strokes.length; i++) {
                const wrapper = document.createElement('div');
                wrapper.style.cssText = `
                  position: relative;
                  width: 56px; height: 56px;
                  background: #faf6ee;
                  border: 1px solid #ddd4c8;
                  border-radius: 6px;
                  overflow: hidden;
                  flex-shrink: 0;
                `;
                // Step number badge
                const badge = document.createElement('span');
                badge.textContent = String(i + 1);
                badge.style.cssText = `
                  position: absolute; top: 2px; left: 4px; z-index: 2;
                  font-size: 9px; font-weight: 600;
                  color: #c84040; opacity: 0.7;
                  font-family: 'Cormorant Garamond', serif;
                `;
                wrapper.appendChild(badge);
                containerRefs.current[char]?.static?.appendChild(wrapper);
                renderFanningStrokes(wrapper, charData.strokes.slice(0, i + 1), 56);
              }
            }
          } catch (error) {
            console.error(`Error loading character data for "${char}":`, error);
            newErrors[char] = `无法加载字符「${char}」的数据`;
          }
        };
        loadCharacter();
      }
    });

    setErrors(newErrors);
  }, [input]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    setErrors({});
  };

  const chars = input.split('').filter(char => /[\u4e00-\u9fa5]/.test(char));

  return (
    <div
      className="paper-texture"
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #f7f3ea 0%, #f0ebe0 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Helmet>
        <title>汉字笔画顺序查询 - HanziWriter | WW93在线工具</title>
        <meta name="description" content="HanziWriter汉字笔画顺序工具，支持动态演示汉字书写过程，展示每个笔画的先后顺序，帮助学习汉字的正确写法。" />
        <meta name="keywords" content="汉字笔画, 笔画顺序, 汉字学习, 中文学习, 汉字书写, 在线工具" />
        <meta name="author" content="WW93" />
        <meta property="og:title" content="汉字笔画顺序查询 - HanziWriter" />
        <meta property="og:description" content="支持动态演示汉字书写过程，展示每个笔画的先后顺序，帮助学习汉字的正确写法。" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://ww93.com/hanzi" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="汉字笔画顺序查询 - HanziWriter" />
        <meta name="twitter:description" content="支持动态演示汉字书写过程，展示每个笔画的先后顺序。" />
        <link rel="canonical" href="https://ww93.com/hanzi" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "EducationalApplication",
            "name": "HanziWriter",
            "applicationCategory": "EducationalApplication",
            "educationalLevel": "All",
            "educationalUse": "Learning",
            "learningResourceType": "InteractiveTool",
            "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
            "description": "汉字笔画顺序学习工具，支持动态演示汉字书写过程"
          })}
        </script>
      </Helmet>

      <div
        style={{
          maxWidth: '740px',
          margin: '0 auto',
          padding: '80px 24px 60px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '48px', animation: 'fadeIn 0.6s ease-out' }}>
          <h1
            style={{
              fontFamily: "'Noto Serif SC', serif",
              fontSize: '28px',
              fontWeight: 700,
              color: '#2a2520',
              margin: '0 0 6px',
              letterSpacing: '4px',
            }}
          >
            汉字笔画
          </h1>
          <span
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '13px',
              color: '#9c958b',
              letterSpacing: '3px',
              textTransform: 'uppercase',
            }}
          >
            Stroke Order
          </span>
        </div>

        {/* Search Input */}
        <div
          style={{
            maxWidth: '400px',
            margin: '0 auto 52px',
            animation: 'fadeInUp 0.6s ease-out 0.1s both',
          }}
        >
          <div style={{ position: 'relative' }}>
            <svg
              width="18" height="18" viewBox="0 0 24 24" fill="none"
              style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: '#b0a99e' }}
            >
              <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder="输入汉字查看笔画顺序…"
              style={{
                width: '100%',
                padding: '14px 20px 14px 48px',
                fontFamily: "'Noto Serif SC', serif",
                fontSize: '15px',
                color: '#2a2520',
                background: 'rgba(255,255,255,0.7)',
                border: '1px solid #ddd4c8',
                borderRadius: '40px',
                outline: 'none',
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#c8a07a';
                e.currentTarget.style.background = 'rgba(255,255,255,0.95)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#ddd4c8';
                e.currentTarget.style.background = 'rgba(255,255,255,0.7)';
                e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.04)';
              }}
            />
          </div>
        </div>

        {/* Character Display */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
          {chars.map((char, charIndex) => (
            <div
              key={charIndex}
              style={{
                background: 'rgba(255,255,255,0.5)',
                borderRadius: '16px',
                padding: '32px',
                border: '1px solid rgba(221,212,200,0.6)',
                animation: `fadeInUp 0.5s ease-out ${0.1 * charIndex}s both`,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '28px',
                  flexWrap: 'wrap',
                }}
              >
                {/* Main character grid (田字格) */}
                <div style={{ flexShrink: 0 }}>
                  <div
                    style={{
                      position: 'relative',
                      width: '160px',
                      height: '160px',
                      background: '#faf6ee',
                      border: '2px solid #d4c5b0',
                      borderRadius: '8px',
                      overflow: 'hidden',
                    }}
                  >
                    <TianZiGeBackground size={160} />
                    <div
                      ref={el => {
                        if (el) {
                          containerRefs.current[char] = { ...containerRefs.current[char], dynamic: el, static: containerRefs.current[char]?.static || null };
                        }
                      }}
                      style={{ position: 'relative', zIndex: 1, width: '160px', height: '160px' }}
                    />
                  </div>
                  {/* Character label */}
                  <div
                    style={{
                      textAlign: 'center',
                      marginTop: '10px',
                      fontFamily: "'Noto Serif SC', serif",
                      fontSize: '13px',
                      color: '#9c958b',
                    }}
                  >
                    {char}
                  </div>
                </div>

                {/* Stroke progression */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: '12px',
                      color: '#b0a99e',
                      letterSpacing: '2px',
                      textTransform: 'uppercase',
                      marginBottom: '12px',
                    }}
                  >
                    Strokes
                  </div>
                  <div
                    ref={el => {
                      if (el && containerRefs.current[char]) {
                        containerRefs.current[char].static = el;
                      } else if (el) {
                        containerRefs.current[char] = { dynamic: null, static: el };
                      }
                    }}
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '8px',
                    }}
                  />
                </div>
              </div>

              {errors[char] && (
                <div
                  style={{
                    marginTop: '12px',
                    fontFamily: "'Noto Serif SC', serif",
                    fontSize: '13px',
                    color: '#c84040',
                    opacity: 0.8,
                  }}
                >
                  {errors[char]}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Empty state */}
        {chars.length === 0 && (
          <div
            style={{
              textAlign: 'center',
              padding: '60px 0',
              animation: 'fadeIn 0.8s ease-out 0.3s both',
            }}
          >
            <div
              style={{
                fontFamily: "'Noto Serif SC', serif",
                fontSize: '64px',
                color: '#ddd4c8',
                marginBottom: '16px',
                lineHeight: 1,
              }}
            >
              永
            </div>
            <p
              style={{
                fontFamily: "'Noto Serif SC', serif",
                fontSize: '14px',
                color: '#b0a99e',
                margin: 0,
              }}
            >
              输入汉字，探索笔画之美
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Hanzi;
