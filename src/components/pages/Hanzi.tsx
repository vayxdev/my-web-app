import React, { useState, useEffect, useRef } from 'react';
import HanziWriter from 'hanzi-writer';
import { Helmet } from 'react-helmet';
import { Search } from 'lucide-react';
import { site } from '../../config/site';

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
      if (key && key.startsWith(CACHE_PREFIX + CACHE_VERSION + '_')) cacheKeys.push(key);
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

const readCssVar = (name: string, fallback: string) => {
  if (typeof window === 'undefined') return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  if (!v) return fallback;
  return `rgb(${v})`;
};

const Hanzi: React.FC = () => {
  const [input, setInput] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const dynamicWritersRef = useRef<Record<string, any>>({});
  const staticWritersRef = useRef<Record<string, any>>({});
  const containerRefs = useRef<Record<string, { dynamic: HTMLDivElement | null; static: HTMLDivElement | null }>>({});

  useEffect(() => {
    return () => {
      Object.values(dynamicWritersRef.current).forEach((writer) => {
        if (writer) writer.target.innerHTML = '';
      });
      Object.values(staticWritersRef.current).forEach((writers) => {
        writers.forEach((writer: any) => {
          if (writer) writer.target.innerHTML = '';
        });
      });
      dynamicWritersRef.current = {};
      staticWritersRef.current = {};
    };
  }, []);

  useEffect(() => {
    const inkColor = readCssVar('--text', '17 24 39');
    const accentColor = readCssVar('--accent', '37 99 235');
    const guideColor = readCssVar('--border', '229 231 235');

    const createSvgBackground = (svg: SVGSVGElement, size: number) => {
      const lines = [
        { x1: 0, y1: 0, x2: size, y2: size },
        { x1: size, y1: 0, x2: 0, y2: size },
        { x1: size / 2, y1: 0, x2: size / 2, y2: size },
        { x1: 0, y1: size / 2, x2: size, y2: size / 2 },
      ];
      lines.forEach((line) => {
        const el = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        el.setAttribute('x1', line.x1.toString());
        el.setAttribute('y1', line.y1.toString());
        el.setAttribute('x2', line.x2.toString());
        el.setAttribute('y2', line.y2.toString());
        el.setAttribute('stroke', guideColor);
        el.setAttribute('stroke-dasharray', '3 3');
        el.setAttribute('stroke-width', '1');
        svg.appendChild(el);
      });
    };

    Object.keys(dynamicWritersRef.current).forEach((char) => {
      if (!input.includes(char)) {
        if (dynamicWritersRef.current[char]) {
          dynamicWritersRef.current[char].target.innerHTML = '';
          delete dynamicWritersRef.current[char];
        }
        if (staticWritersRef.current[char]) {
          staticWritersRef.current[char].forEach((writer: any) => (writer.target.innerHTML = ''));
          delete staticWritersRef.current[char];
        }
        if (containerRefs.current[char]) delete containerRefs.current[char];
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
      strokes.forEach((strokePath: string, idx: number) => {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttributeNS(null, 'd', strokePath);
        const isLast = idx === strokes.length - 1;
        path.style.fill = isLast ? accentColor : inkColor;
        path.style.opacity = isLast ? '1' : '0.78';
        group.appendChild(path);
      });
    };

    input
      .split('')
      .filter((char) => /[一-龥]/.test(char))
      .forEach((char) => {
        if (containerRefs.current[char]) {
          const loadCharacter = async () => {
            try {
              let charData = getCachedCharacterData(char);
              if (!charData) {
                const response = await fetch(
                  `${site.hanziDataBase}/${encodeURIComponent(char)}.json`
                );
                if (!response.ok) throw new Error('Character not found');
                charData = await response.json();
                setCachedCharacterData(char, charData);
              }

              if (!dynamicWritersRef.current[char]) {
                dynamicWritersRef.current[char] = HanziWriter.create(
                  containerRefs.current[char]?.dynamic as HTMLElement,
                  char,
                  {
                    width: 160,
                    height: 160,
                    padding: 8,
                    showOutline: true,
                    strokeAnimationSpeed: 1,
                    delayBetweenStrokes: 500,
                    strokeColor: inkColor,
                    outlineColor: guideColor,
                    drawingColor: accentColor,
                    charDataLoader: (c: string, onComplete: (data: any) => void) => {
                      fetch(`${site.hanziDataBase}/${encodeURIComponent(c)}.json`)
                        .then((r) => r.json())
                        .then(onComplete);
                    },
                    onLoadCharDataSuccess: () => {},
                    onLoadCharDataError: () => {},
                  }
                );
                dynamicWritersRef.current[char].loopCharacterAnimation();
              }

              if (!staticWritersRef.current[char]) {
                staticWritersRef.current[char] = [];
                const staticContainer = containerRefs.current[char]?.static;
                if (staticContainer) {
                  staticContainer.innerHTML = '';
                  for (let i = 0; i < charData.strokes.length; i++) {
                    const cell = document.createElement('div');
                    cell.className =
                      'relative w-14 h-14 rounded-md border border-border bg-surface overflow-hidden';
                    const badge = document.createElement('span');
                    badge.textContent = String(i + 1);
                    badge.className =
                      'absolute top-0.5 left-1 text-[9px] font-mono text-subtle';
                    cell.appendChild(badge);
                    staticContainer.appendChild(cell);
                    renderFanningStrokes(cell, charData.strokes.slice(0, i + 1), 56);
                  }
                }
              }
            } catch (error) {
              console.error(`Error loading character data for "${char}":`, error);
              setErrors((prev) => ({ ...prev, [char]: `无法加载字符「${char}」` }));
            }
          };
          loadCharacter();
        }
      });
  }, [input]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    setErrors({});
  };

  const chars = input.split('').filter((c) => /[一-龥]/.test(c));

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>{`汉字笔画顺序查询 | ${site.name}`}</title>
        <meta name="description" content="HanziWriter 汉字笔画顺序工具，动态演示书写过程，逐笔展示笔画顺序。" />
        <meta name="keywords" content="汉字笔画, 笔画顺序, 汉字学习, 中文学习, 汉字书写, 在线工具" />
        <meta name="author" content={site.author} />
        <link rel="canonical" href={`${site.url}/hanzi`} />
      </Helmet>

      <div className="mx-auto max-w-3xl px-6 md:px-10 py-10 md:py-14">
        {/* Header */}
        <header className="mb-8 animate-fade-in">
          <div className="text-[11px] font-mono tracking-[0.2em] uppercase text-muted mb-3">
            Stroke Order
          </div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-text">
            汉字笔画
          </h1>
          <p className="mt-2 text-sm text-muted">输入汉字，查看笔画顺序与书写动画。</p>
        </header>

        {/* Search Input */}
        <div className="relative mb-8 animate-fade-in" style={{ animationDelay: '60ms' }}>
          <Search
            size={16}
            strokeWidth={1.8}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-subtle"
          />
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder="输入汉字，如：永和"
            className="w-full rounded-lg border border-border bg-elevated pl-10 pr-4 py-3 text-text placeholder:text-subtle focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/15"
          />
          {chars.length > 0 && (
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 font-mono text-[11px] text-subtle">
              {chars.length} 字
            </span>
          )}
        </div>

        {/* Empty state */}
        {chars.length === 0 && (
          <div className="rounded-xl border border-dashed border-border bg-surface/40 px-6 py-16 text-center animate-fade-in">
            <div className="text-5xl font-medium text-subtle mb-3 select-none">永</div>
            <p className="text-sm text-muted">输入任意汉字开始</p>
          </div>
        )}

        {/* Character cards */}
        <div className="space-y-4">
          {chars.map((char, idx) => (
            <article
              key={`${char}-${idx}`}
              className="rounded-xl border border-border bg-elevated p-5 md:p-6 animate-fade-in"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <div className="flex flex-col sm:flex-row sm:items-start gap-5">
                <div className="flex flex-col items-center shrink-0">
                  <div className="relative h-40 w-40 rounded-lg border border-border bg-surface overflow-hidden">
                    <TianZiGeBackground />
                    <div
                      ref={(el) => {
                        if (el) {
                          containerRefs.current[char] = {
                            ...containerRefs.current[char],
                            dynamic: el,
                            static: containerRefs.current[char]?.static ?? null,
                          };
                        }
                      }}
                      className="relative z-10 h-40 w-40"
                    />
                  </div>
                  <div className="mt-2 text-xs font-mono text-subtle">{char}</div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-mono tracking-[0.18em] uppercase text-muted mb-3">
                    Strokes
                  </div>
                  <div
                    className="flex flex-wrap gap-2"
                    ref={(el) => {
                      if (el && containerRefs.current[char]) {
                        containerRefs.current[char].static = el;
                      } else if (el) {
                        containerRefs.current[char] = { dynamic: null, static: el };
                      }
                    }}
                  />
                  {errors[char] && (
                    <div className="mt-3 text-sm text-danger">{errors[char]}</div>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};

const TianZiGeBackground: React.FC = () => (
  <svg
    width="100%"
    height="100%"
    viewBox="0 0 160 160"
    className="absolute inset-0 pointer-events-none text-border"
    aria-hidden
  >
    <line x1="80" y1="0" x2="80" y2="160" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
    <line x1="0" y1="80" x2="160" y2="80" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
    <line x1="0" y1="0" x2="160" y2="160" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />
    <line x1="160" y1="0" x2="0" y2="160" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />
  </svg>
);

export default Hanzi;
