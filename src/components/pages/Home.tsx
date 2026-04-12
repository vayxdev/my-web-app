import React from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';

interface ToolCard {
  title: string;
  subtitle: string;
  description: string;
  path: string;
  accent: string;
  glow: string;
  icon: React.ReactNode;
}

const TOOLS: ToolCard[] = [
  {
    title: '汉字笔画',
    subtitle: 'Stroke Order',
    description: '动态演示汉字书写过程，展示每个笔画的先后顺序',
    path: '/hanzi',
    accent: '#c84040',
    glow: 'rgba(200, 64, 64, 0.12)',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <path d="M6 8 L26 8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M16 6 L16 26" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M8 14 L24 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
        <path d="M10 20 L22 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
        <path d="M12 26 L20 26" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
      </svg>
    ),
  },
  {
    title: '拼音注音',
    subtitle: 'Pinyin',
    description: '为中文文本添加拼音标注，支持实时转换',
    path: '/pinyin',
    accent: '#4a8c6f',
    glow: 'rgba(74, 140, 111, 0.12)',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <text x="4" y="22" fontFamily="serif" fontSize="18" fill="currentColor" opacity="0.8">字</text>
        <text x="16" y="12" fontFamily="sans-serif" fontSize="9" fill="currentColor" opacity="0.5">zì</text>
      </svg>
    ),
  },
  {
    title: 'Markdown 排版',
    subtitle: 'Md2Image',
    description: '将 Markdown 内容转换为精美图片，多种主题可选',
    path: '/md2image',
    accent: '#c49442',
    glow: 'rgba(196, 148, 66, 0.12)',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <rect x="4" y="4" width="24" height="24" rx="3" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
        <path d="M8 12 L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M8 16 L20 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
        <path d="M8 20 L18 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
        <path d="M8 24 L16 24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
      </svg>
    ),
  },
];

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0c0b0a',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Helmet>
        <title>WW93 - 实用在线工具集 | 中文工具网站</title>
        <meta name="description" content="WW93提供实用的中文在线工具，包括汉字笔画顺序查询、拼音注音、Markdown排版等高效工具。提升您的学习与工作效率。" />
        <meta name="keywords" content="在线工具, 中文工具, 汉字学习, 拼音工具, 效率工具, 免费工具" />
        <meta name="author" content="WW93" />
        <meta property="og:title" content="WW93 - 实用在线工具集" />
        <meta property="og:description" content="提供实用的中文在线工具，包括汉字笔画顺序查询、拼音注音、Markdown排版等高效工具。" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://ww93.com" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="WW93 - 实用在线工具集" />
        <meta name="twitter:description" content="提供实用的中文在线工具，包括汉字笔画顺序查询、拼音注音、Markdown排版等高效工具。" />
        <link rel="canonical" href="https://ww93.com" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "WW93",
            "url": "https://ww93.com",
            "description": "实用中文在线工具集",
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://ww93.com/search?q={search_term_string}",
              "query-input": "required name=search_term_string"
            }
          })}
        </script>
      </Helmet>

      {/* Subtle radial glow */}
      <div
        style={{
          position: 'absolute',
          top: '-20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '800px',
          height: '600px',
          background: 'radial-gradient(ellipse, rgba(200, 148, 66, 0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          maxWidth: '920px',
          margin: '0 auto',
          padding: '0 24px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Header */}
        <header
          style={{
            paddingTop: '120px',
            paddingBottom: '80px',
            textAlign: 'center',
            animation: 'fadeIn 0.8s ease-out',
          }}
        >
          <h1
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '56px',
              fontWeight: 300,
              color: '#f0ebe0',
              letterSpacing: '12px',
              margin: '0 0 16px',
              textTransform: 'uppercase',
            }}
          >
            WW93
          </h1>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '20px',
              marginBottom: '12px',
            }}
          >
            <div style={{ width: '40px', height: '1px', background: 'rgba(156, 149, 139, 0.4)' }} />
            <span
              style={{
                fontFamily: "'Noto Serif SC', serif",
                fontSize: '14px',
                color: '#9c958b',
                letterSpacing: '6px',
              }}
            >
              实用在线工具集
            </span>
            <div style={{ width: '40px', height: '1px', background: 'rgba(156, 149, 139, 0.4)' }} />
          </div>
        </header>

        {/* Tool Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '20px',
            paddingBottom: '100px',
            animation: 'fadeInUp 0.8s ease-out 0.2s both',
          }}
          className="home-card-grid"
        >
          {TOOLS.map((tool) => (
            <button
              key={tool.path}
              onClick={() => navigate(tool.path)}
              style={{
                position: 'relative',
                background: '#151413',
                border: '1px solid rgba(156, 149, 139, 0.1)',
                borderRadius: '16px',
                padding: '0',
                cursor: 'pointer',
                textAlign: 'left',
                overflow: 'hidden',
                transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-6px)';
                e.currentTarget.style.borderColor = `${tool.accent}33`;
                e.currentTarget.style.boxShadow = `0 20px 60px ${tool.glow}, 0 0 0 1px ${tool.accent}22`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'rgba(156, 149, 139, 0.1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* Accent bar */}
              <div
                style={{
                  height: '3px',
                  background: `linear-gradient(90deg, ${tool.accent}, transparent)`,
                  opacity: 0.8,
                }}
              />
              <div style={{ padding: '32px 28px 28px' }}>
                {/* Icon */}
                <div
                  style={{
                    color: tool.accent,
                    marginBottom: '20px',
                    opacity: 0.9,
                  }}
                >
                  {tool.icon}
                </div>
                {/* Title */}
                <h2
                  style={{
                    fontFamily: "'Noto Serif SC', serif",
                    fontSize: '20px',
                    fontWeight: 600,
                    color: '#e8e4dd',
                    margin: '0 0 4px',
                    lineHeight: 1.3,
                  }}
                >
                  {tool.title}
                </h2>
                <span
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: '13px',
                    color: '#6b6560',
                    letterSpacing: '1px',
                    display: 'block',
                    marginBottom: '14px',
                  }}
                >
                  {tool.subtitle}
                </span>
                {/* Description */}
                <p
                  style={{
                    fontFamily: "'Noto Serif SC', serif",
                    fontSize: '13px',
                    color: '#8a847c',
                    lineHeight: 1.7,
                    margin: 0,
                  }}
                >
                  {tool.description}
                </p>
              </div>
            </button>
          ))}
        </div>

        {/* Footer */}
        <footer
          style={{
            textAlign: 'center',
            paddingBottom: '40px',
            borderTop: '1px solid rgba(156, 149, 139, 0.08)',
            paddingTop: '24px',
          }}
        >
          <a
            href="https://beian.miit.gov.cn/"
            target="_blank"
            rel="noreferrer"
            style={{
              fontFamily: "'Noto Serif SC', serif",
              fontSize: '12px',
              color: '#5a5550',
              textDecoration: 'none',
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#9c958b'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#5a5550'; }}
          >
            浙ICP备2024104088号
          </a>
        </footer>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .home-card-grid {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Home;
