import React, { useState, useMemo } from 'react';
import { pinyin } from 'pinyin-pro';
import { Helmet } from 'react-helmet';

const PinyinAnnotator: React.FC = () => {
  const [text, setText] = useState<string>('春眠不觉晓，处处闻啼鸟。\n夜来风雨声，花落知多少。');

  const annotatedLines = useMemo(() => {
    if (!text.trim()) return null;
    const lines = text.split('\n');
    return lines.map((line, lineIndex) => {
      if (!line) return <div key={lineIndex} style={{ height: '48px' }} />;
      const pinyinResult = pinyin(line, { type: 'array' });
      const chars = line.split('');
      return (
        <div key={lineIndex} style={{ display: 'flex', flexWrap: 'wrap', marginBottom: '8px' }}>
          {chars.map((char, charIndex) => {
            const isChinese = /[\u4e00-\u9fa5]/.test(char);
            return (
              <span
                key={charIndex}
                style={{
                  display: 'inline-flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  minWidth: isChinese ? '28px' : undefined,
                  margin: '0 1px',
                }}
              >
                <span
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: '18px',
                    fontWeight: 400,
                    color: '#4a8c6f',
                    height: '24px',
                    lineHeight: '24px',
                    letterSpacing: '0.3px',
                  }}
                >
                  {isChinese ? pinyinResult[charIndex] : '\u00A0'}
                </span>
                <span
                  style={{
                    fontFamily: "'Noto Serif SC', serif",
                    fontSize: '17px',
                    lineHeight: '1.6',
                    color: '#2a2520',
                  }}
                >
                  {char}
                </span>
              </span>
            );
          })}
        </div>
      );
    });
  }, [text]);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(160deg, #f0ebe0 0%, #e8e3d8 50%, #eae5da 100%)',
        position: 'relative',
      }}
    >
      <Helmet>
        <title>拼音注音器 - PinyinAnnotator | WW93在线工具</title>
        <meta name="description" content="PinyinAnnotator拼音注音器，快速为中文文本添加拼音标注，支持多行文本处理，是学习中文发音和阅读的得力助手。" />
        <meta name="keywords" content="拼音注音, 拼音标注, 中文拼音, 拼音学习, 拼音转换, 在线工具" />
        <meta name="author" content="WW93" />
        <meta property="og:title" content="拼音注音器 - PinyinAnnotator" />
        <meta property="og:description" content="快速为中文文本添加拼音标注，支持多行文本处理。" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://ww93.com/pinyin" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="拼音注音器 - PinyinAnnotator" />
        <meta name="twitter:description" content="快速为中文文本添加拼音标注，支持多行文本处理。" />
        <link rel="canonical" href="https://ww93.com/pinyin" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "PinyinAnnotator",
            "applicationCategory": "EducationalApplication",
            "operatingSystem": "Web Browser",
            "educationalUse": "Learning",
            "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
            "description": "中文文本拼音注音工具，支持多行文本处理"
          })}
        </script>
      </Helmet>

      <div
        style={{
          maxWidth: '960px',
          margin: '0 auto',
          padding: '80px 24px 60px',
        }}
      >
        {/* Header */}
        <div
          style={{
            textAlign: 'center',
            marginBottom: '48px',
            animation: 'fadeIn 0.6s ease-out',
          }}
        >
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
            拼音注音
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
            Pinyin Annotator
          </span>
        </div>

        {/* Two-column layout */}
        <div
          className="pinyin-layout"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '24px',
            animation: 'fadeInUp 0.6s ease-out 0.15s both',
          }}
        >
          {/* Input Panel */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.65)',
              borderRadius: '16px',
              border: '1px solid rgba(221, 212, 200, 0.5)',
              padding: '28px',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '20px',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ color: '#9c958b' }}>
                <path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: '12px',
                  color: '#9c958b',
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                }}
              >
                Input
              </span>
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="输入中文文本..."
              style={{
                flex: 1,
                minHeight: '280px',
                fontFamily: "'Noto Serif SC', serif",
                fontSize: '17px',
                lineHeight: 2.4,
                color: '#2a2520',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                resize: 'none',
                padding: 0,
              }}
            />
          </div>

          {/* Output Panel */}
          <div
            style={{
              background: 'rgba(250, 247, 240, 0.8)',
              borderRadius: '16px',
              border: '1px solid rgba(221, 212, 200, 0.5)',
              padding: '28px',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '20px',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ color: '#4a8c6f' }}>
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: '12px',
                  color: '#4a8c6f',
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                }}
              >
                Annotated
              </span>
            </div>
            <div
              style={{
                flex: 1,
                minHeight: '280px',
                lineHeight: 1,
              }}
            >
              {annotatedLines ? (
                annotatedLines
              ) : (
                <p
                  style={{
                    fontFamily: "'Noto Serif SC', serif",
                    fontSize: '14px',
                    color: '#b0a99e',
                    fontStyle: 'italic',
                  }}
                >
                  在左侧输入文本，拼音将自动生成
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Hint */}
        <div
          style={{
            textAlign: 'center',
            marginTop: '32px',
            animation: 'fadeIn 0.6s ease-out 0.4s both',
          }}
        >
          <p
            style={{
              fontFamily: "'Noto Serif SC', serif",
              fontSize: '12px',
              color: '#b0a99e',
            }}
          >
            实时转换 · 输入即生成拼音注音
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .pinyin-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default PinyinAnnotator;
