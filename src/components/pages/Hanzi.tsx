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

    const cacheItem = {
      characterData,
      timestamp: Date.now(),
    };
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
      { x1: 0, y1: size / 2, x2: size, y2: size / 2 }
    ];

    lines.forEach(line => {
      const lineElement = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      lineElement.setAttribute('x1', line.x1.toString());
      lineElement.setAttribute('y1', line.y1.toString());
      lineElement.setAttribute('x2', line.x2.toString());
      lineElement.setAttribute('y2', line.y2.toString());
      lineElement.setAttribute('stroke', '#DDD');
      svg.appendChild(lineElement);
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
      svg.style.border = '1px solid #EEE';
      svg.style.marginRight = '3px';
      target.appendChild(svg);

      createSvgBackground(svg, size);

      const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      const transformData = HanziWriter.getScalingTransform(size, size);
      group.setAttributeNS(null, 'transform', transformData.transform);
      svg.appendChild(group);

      strokes.forEach(function (strokePath: string) {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttributeNS(null, 'd', strokePath);
        path.style.fill = '#555';
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
              if (!response.ok) {
                throw new Error('Character not found');
              }
              charData = await response.json();
              setCachedCharacterData(char, charData);
            }

            if (!dynamicWritersRef.current[char]) {
              dynamicWritersRef.current[char] = HanziWriter.create(containerRefs.current[char]?.dynamic as HTMLElement, char, {
                width: 100,
                height: 100,
                padding: 5,
                showOutline: true,
                strokeAnimationSpeed: 1,
                delayBetweenStrokes: 500,
                charDataLoader: (char: string, onComplete: (data: any) => void) => {
                  fetch(`https://static.ww93.fun/hanzi-writer-data/${encodeURIComponent(char)}.json`)
                    .then(response => response.json())
                    .then(charData => {
                      onComplete(charData);
                    });
                },
                onLoadCharDataSuccess: () => {
                  console.log('Success!');
                },
                onLoadCharDataError: () => {
                  console.log('Oh No! Something went wrong :(');
                },
              });
              dynamicWritersRef.current[char].loopCharacterAnimation();
            }

            if (!staticWritersRef.current[char]) {
              staticWritersRef.current[char] = [];
              for (let i = 0; i < charData.strokes.length; i++) {
                let container = document.createElement('div');
                container.className = 'w-[50px] h-[50px] border border-gray-300 rounded-md m-1';
                containerRefs.current[char]?.static?.appendChild(container);
                renderFanningStrokes(container, charData.strokes.slice(0, i + 1), 50);
              }
            }
          } catch (error) {
            console.error(`Error loading character data for "${char}":`, error);
            newErrors[char] = `无法加载字符 "${char}" 的数据`;
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

  return (
    <div className="flex flex-col items-center p-4 space-y-4">
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
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "description": "汉字笔画顺序学习工具，支持动态演示汉字书写过程"
          })}
        </script>
      </Helmet>
      <input
        type="text"
        value={input}
        onChange={handleInputChange}
        placeholder="输入汉字"
        className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <div className="w-full max-w-2xl">
        {input.split('').filter(char => /[\u4e00-\u9fa5]/.test(char)).map((char, charIndex) => (
          <div key={charIndex} className="flex items-center mb-4">
            <div
              ref={el => {
                if (el) {
                  containerRefs.current[char] = { ...containerRefs.current[char], dynamic: el, static: el };
                }
              }}
              className="w-[100px] h-[100px] border-2 border-gray-300 rounded-md mr-4"
            ></div>
            <div className="flex flex-wrap" ref={el => {
              if (el && containerRefs.current[char]) {
                containerRefs.current[char].static = el;
              }
            }}>
            </div>
            {errors[char] && (
              <div className="text-red-500 text-sm ml-2">{errors[char]}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Hanzi;
