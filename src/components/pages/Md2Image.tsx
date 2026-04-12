import React, { useState, useRef, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';

interface Theme {
  name: string;
  label: string;
  backgroundColor: string;
  textColor: string;
  headingColor: string;
  borderColor: string;
  codeBackground: string;
  dot: string;
}

const themes: Theme[] = [
  { name: 'Light', label: '明', backgroundColor: '#ffffff', textColor: '#333333', headingColor: '#000000', borderColor: '#e0e0e0', codeBackground: '#f5f5f5', dot: '#e8e8e8' },
  { name: 'Warm', label: '暖', backgroundColor: '#fff9f0', textColor: '#5c4033', headingColor: '#8b4513', borderColor: '#d4a574', codeBackground: '#fef3e2', dot: '#f0d8b8' },
  { name: 'Elegant', label: '雅', backgroundColor: '#faf5ff', textColor: '#444444', headingColor: '#6b46c1', borderColor: '#d6bcfa', codeBackground: '#f3e8ff', dot: '#d6bcfa' },
  { name: 'Dark', label: '墨', backgroundColor: '#1a1a1a', textColor: '#e0e0e0', headingColor: '#ffffff', borderColor: '#404040', codeBackground: '#2d2d2d', dot: '#404040' },
  { name: 'Nature', label: '翠', backgroundColor: '#f0fff4', textColor: '#2d5a27', headingColor: '#22543d', borderColor: '#9ae6b4', codeBackground: '#e6ffed', dot: '#86d4a0' },
  { name: 'Sunset', label: '霞', backgroundColor: '#fffaf0', textColor: '#c05621', headingColor: '#9c4221', borderColor: '#fbd38d', codeBackground: '#fffaf0', dot: '#f6c87a' },
  { name: 'Ocean', label: '海', backgroundColor: '#ebf8ff', textColor: '#2c5282', headingColor: '#2b6cb0', borderColor: '#90cdf4', codeBackground: '#e3f2fd', dot: '#7ec4e8' },
  { name: 'Mint', label: '薄', backgroundColor: '#f0fdf4', textColor: '#166534', headingColor: '#15803d', borderColor: '#86efac', codeBackground: '#dcfce7', dot: '#6ee09c' },
];

type TabType = 'theme' | 'font' | 'image';

const Md2Image: React.FC = () => {
  const loadSettings = () => {
    const saved = localStorage.getItem('md2image-settings');
    if (saved) {
      const s = JSON.parse(saved);
      const theme = themes.find(t => t.name === s.themeName) || themes[0];
      return {
        theme,
        exportWidth: s.exportWidth || 500,
        fontSize: s.fontSize || 16,
        lineHeight: s.lineHeight || 1.6,
        fontFamily: s.fontFamily || 'system-ui',
        padding: s.padding || 40,
        showLineNumbers: s.showLineNumbers || false,
        markdown: s.markdown || defaultMarkdown,
      };
    }
    return {
      theme: themes[0],
      exportWidth: 500,
      fontSize: 16,
      lineHeight: 1.6,
      fontFamily: 'system-ui',
      padding: 40,
      showLineNumbers: false,
      markdown: defaultMarkdown,
    };
  };

  const initialSettings = loadSettings();
  const [markdown, setMarkdown] = useState<string>(initialSettings.markdown);
  const [selectedTheme, setSelectedTheme] = useState<Theme>(initialSettings.theme);
  const [exportWidth, setExportWidth] = useState<number>(initialSettings.exportWidth);
  const [fontSize, setFontSize] = useState<number>(initialSettings.fontSize);
  const [lineHeight, setLineHeight] = useState<number>(initialSettings.lineHeight);
  const [fontFamily, setFontFamily] = useState<string>(initialSettings.fontFamily);
  const [padding, setPadding] = useState<number>(initialSettings.padding);
  const [showLineNumbers, setShowLineNumbers] = useState<boolean>(initialSettings.showLineNumbers);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('theme');
  const [viewMode, setViewMode] = useState<'split' | 'editor' | 'preview'>('split');
  const [splitRatio, setSplitRatio] = useState(0.5);
  const isDragging = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const saveSettings = () => {
    try {
      localStorage.setItem('md2image-settings', JSON.stringify({
        themeName: selectedTheme.name, exportWidth, fontSize, lineHeight, fontFamily, padding, showLineNumbers, markdown,
      }));
    } catch {}
  };

  useEffect(() => {
    saveSettings();
  }, [selectedTheme, exportWidth, fontSize, lineHeight, fontFamily, padding, showLineNumbers, markdown]);

  const fontOptions = [
    { value: 'system-ui', label: 'System UI' },
    { value: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', label: 'San Francisco' },
    { value: '"Noto Serif SC", "Songti SC", serif', label: 'Noto Serif SC' },
    { value: '"Georgia", serif', label: 'Georgia' },
    { value: '"Cormorant Garamond", serif', label: 'Cormorant' },
    { value: '"JetBrains Mono", monospace', label: 'JetBrains Mono' },
    { value: '"Courier New", monospace', label: 'Courier New' },
  ];

  const capturePreview = async () => {
    if (!previewRef.current) return null;
    const el = previewRef.current;
    const scrollWidth = el.scrollWidth;
    const clientWidth = el.offsetWidth;
    const contentWidth = scrollWidth > clientWidth ? scrollWidth : exportWidth;
    const finalWidth = Math.max(exportWidth, Math.min(contentWidth * (exportWidth / clientWidth), exportWidth * 1.5));
    const dataUrl = await toPng(el, {
      width: finalWidth,
      height: el.scrollHeight * (finalWidth / el.offsetWidth),
      style: {
        transform: `scale(${finalWidth / el.offsetWidth})`,
        transformOrigin: 'top left',
      },
    });
    return { dataUrl, width: finalWidth, height: el.scrollHeight * (finalWidth / el.offsetWidth) };
  };

  const handleExportPng = async () => {
    try {
      const result = await capturePreview();
      if (!result) return;
      const link = document.createElement('a');
      link.download = 'md2image.png';
      link.href = result.dataUrl;
      link.click();
    } catch (error) {
      console.error('Error exporting PNG:', error);
    }
  };

  const handleExportPdf = async () => {
    try {
      const result = await capturePreview();
      if (!result) return;
      // A4: 210mm x 297mm
      const a4W = 210;
      const a4H = 297;
      const marginMm = 12;
      const usableW = a4W - marginMm * 2;
      const usableH = a4H - marginMm * 2;

      const imgAspect = result.height / result.width;
      const imgWMm = usableW;
      const imgHMm = imgWMm * imgAspect;

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

      if (imgHMm <= usableH) {
        // Content fits on one page
        pdf.addImage(result.dataUrl, 'PNG', marginMm, marginMm, imgWMm, imgHMm);
      } else {
        // Split across multiple pages
        const pageContentH = usableH;
        // How many source px per page
        const pxPerMm = result.width / imgWMm;
        const pageContentPx = pageContentH * pxPerMm;
        const totalPages = Math.ceil(result.height / pageContentPx);

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        const img = new Image();
        img.src = result.dataUrl;
        await new Promise<void>(resolve => { img.onload = () => resolve(); });

        for (let i = 0; i < totalPages; i++) {
          if (i > 0) pdf.addPage();
          const srcY = i * pageContentPx;
          const srcH = Math.min(pageContentPx, result.height - srcY);
          canvas.width = result.width;
          canvas.height = srcH;
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, srcY, result.width, srcH, 0, 0, result.width, srcH);
          const sliceUrl = canvas.toDataURL('image/png');
          const sliceHMm = srcH / pxPerMm;
          pdf.addImage(sliceUrl, 'PNG', marginMm, marginMm, imgWMm, sliceHMm);
        }
      }

      pdf.save('md2image.pdf');
    } catch (error) {
      console.error('Error exporting PDF:', error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        isPopupOpen &&
        popupRef.current && !popupRef.current.contains(e.target as Node) &&
        buttonRef.current && !buttonRef.current.contains(e.target as Node)
      ) {
        setIsPopupOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isPopupOpen]);

  const handleDragStart = (e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    const onMove = (ev: MouseEvent) => {
      if (!isDragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const ratio = (ev.clientX - rect.left) / rect.width;
      setSplitRatio(Math.min(0.8, Math.max(0.2, ratio)));
    };
    const onUp = () => {
      isDragging.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  const viewModes: { key: 'editor' | 'split' | 'preview'; icon: React.ReactNode }[] = [
    {
      key: 'editor',
      icon: <><path d="M4 7h7M4 11h7M4 15h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></>,
    },
    {
      key: 'split',
      icon: <><rect x="3" y="3" width="7" height="16" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none" /><rect x="13" y="3" width="7" height="16" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none" /></>,
    },
    {
      key: 'preview',
      icon: <><path d="M2 12s3-6 10-6 10 6 10 6-3 6-10 6-10-6-10-6Z" stroke="currentColor" strokeWidth="1.5" fill="none" /><circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.5" fill="none" /></>,
    },
  ];

  const accentColor = '#c49442';

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#16161a',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Helmet>
        <title>MD2Image - Markdown to Image Converter</title>
        <meta name="description" content="Convert Markdown to beautiful images with multiple themes" />
        <meta name="keywords" content="markdown, image, converter, themes" />
        <meta name="author" content="WW93" />
        <meta property="og:title" content="MD2Image - Markdown to Image Converter" />
        <meta property="og:description" content="Convert Markdown to beautiful images with multiple themes" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://ww93.com/md2image" />
        <link rel="canonical" href="https://ww93.com/md2image" />
      </Helmet>

      {/* Floating Toolbar */}
      <div
        style={{
          position: 'fixed',
          top: '16px',
          right: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          zIndex: 1000,
        }}
      >
        {/* View mode segmented control */}
        <div
          style={{
            display: 'flex',
            borderRadius: '10px',
            border: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(30,30,36,0.85)',
            backdropFilter: 'blur(12px)',
            overflow: 'hidden',
          }}
        >
          {viewModes.map(({ key, icon }) => (
            <button
              key={key}
              onClick={() => setViewMode(key)}
              style={{
                width: '36px',
                height: '36px',
                border: 'none',
                borderRight: key !== 'preview' ? '1px solid rgba(255,255,255,0.06)' : 'none',
                background: viewMode === key ? `${accentColor}22` : 'transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: viewMode === key ? accentColor : '#55555f',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => { if (viewMode !== key) e.currentTarget.style.color = '#9c958b'; }}
              onMouseLeave={(e) => { if (viewMode !== key) e.currentTarget.style.color = '#55555f'; }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">{icon}</svg>
            </button>
          ))}
        </div>

        <button
          ref={buttonRef}
          onClick={() => setIsPopupOpen(!isPopupOpen)}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            border: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(30,30,36,0.85)',
            backdropFilter: 'blur(12px)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: isPopupOpen ? accentColor : '#7f7f8a',
            transition: 'all 0.25s ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${accentColor}44`; e.currentTarget.style.color = accentColor; }}
          onMouseLeave={(e) => {
            if (!isPopupOpen) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#7f7f8a'; }
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.39a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </button>
        <button
          onClick={handleExportPng}
          style={{
            height: '40px',
            borderRadius: '10px',
            border: '1px solid rgba(196, 148, 66, 0.25)',
            background: 'rgba(196, 148, 66, 0.12)',
            backdropFilter: 'blur(12px)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '0 14px',
            color: accentColor,
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '13px',
            fontWeight: 600,
            letterSpacing: '0.5px',
            transition: 'all 0.25s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(196, 148, 66, 0.22)';
            e.currentTarget.style.borderColor = 'rgba(196, 148, 66, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(196, 148, 66, 0.12)';
            e.currentTarget.style.borderColor = 'rgba(196, 148, 66, 0.25)';
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          PNG
        </button>
        <button
          onClick={handleExportPdf}
          style={{
            height: '40px',
            borderRadius: '10px',
            border: '1px solid rgba(196, 148, 66, 0.25)',
            background: 'rgba(196, 148, 66, 0.12)',
            backdropFilter: 'blur(12px)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '0 14px',
            color: accentColor,
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '13px',
            fontWeight: 600,
            letterSpacing: '0.5px',
            transition: 'all 0.25s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(196, 148, 66, 0.22)';
            e.currentTarget.style.borderColor = 'rgba(196, 148, 66, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(196, 148, 66, 0.12)';
            e.currentTarget.style.borderColor = 'rgba(196, 148, 66, 0.25)';
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
          PDF
        </button>
      </div>

      {/* Settings Popup */}
      {isPopupOpen && (
        <div
          ref={popupRef}
          style={{
            position: 'fixed',
            top: '64px',
            right: '24px',
            width: '320px',
            background: 'rgba(24, 24, 30, 0.92)',
            backdropFilter: 'blur(20px)',
            borderRadius: '14px',
            border: '1px solid rgba(255,255,255,0.06)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            zIndex: 999,
            overflow: 'hidden',
            animation: 'slideDown 0.2s ease-out',
          }}
        >
          {/* Tabs */}
          <div
            style={{
              display: 'flex',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
              padding: '4px 6px',
            }}
          >
            {(['theme', 'font', 'image'] as TabType[]).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  flex: 1,
                  padding: '10px 8px',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: '13px',
                  fontWeight: activeTab === tab ? 600 : 400,
                  color: activeTab === tab ? accentColor : '#6b6b75',
                  borderBottom: activeTab === tab ? `2px solid ${accentColor}` : '2px solid transparent',
                  transition: 'all 0.2s ease',
                  letterSpacing: '1px',
                  textTransform: 'capitalize',
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Content */}
          <div style={{ padding: '16px 18px', maxHeight: '380px', overflowY: 'auto' }}>
            {activeTab === 'theme' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                {themes.map(theme => (
                  <button
                    key={theme.name}
                    onClick={() => setSelectedTheme(theme)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '10px 4px',
                      background: selectedTheme.name === theme.name ? 'rgba(196, 148, 66, 0.1)' : 'transparent',
                      border: selectedTheme.name === theme.name ? `1px solid ${accentColor}44` : '1px solid rgba(255,255,255,0.04)',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={e => { if (selectedTheme.name !== theme.name) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                    onMouseLeave={e => { if (selectedTheme.name !== theme.name) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '8px',
                        background: theme.backgroundColor,
                        border: `2px solid ${theme.dot}`,
                        boxShadow: selectedTheme.name === theme.name ? `0 0 8px ${theme.dot}44` : 'none',
                      }}
                    />
                    <span
                      style={{
                        fontFamily: "'Noto Serif SC', serif",
                        fontSize: '11px',
                        color: selectedTheme.name === theme.name ? accentColor : '#6b6b75',
                      }}
                    >
                      {theme.label}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {activeTab === 'font' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <SettingRow label="Font">
                  <select
                    value={fontFamily}
                    onChange={e => setFontFamily(e.target.value)}
                    style={selectInputStyle}
                  >
                    {fontOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </SettingRow>
                <SettingRow label="Size">
                  <input type="number" min={12} max={24} step={1} value={fontSize} onChange={e => setFontSize(Number(e.target.value))} style={numberInputStyle} />
                  <span style={unitStyle}>px</span>
                </SettingRow>
                <SettingRow label="Line Height">
                  <input type="number" min={1.2} max={2.5} step={0.1} value={lineHeight} onChange={e => setLineHeight(Number(e.target.value))} style={numberInputStyle} />
                </SettingRow>
                <SettingRow label="Line Numbers">
                  <button
                    onClick={() => setShowLineNumbers(!showLineNumbers)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: 500,
                      background: showLineNumbers ? `${accentColor}22` : 'rgba(255,255,255,0.05)',
                      color: showLineNumbers ? accentColor : '#6b6b75',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {showLineNumbers ? 'On' : 'Off'}
                  </button>
                </SettingRow>
              </div>
            )}

            {activeTab === 'image' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <SettingRow label="Export Width">
                  <input type="number" min={500} max={2000} step={50} value={exportWidth} onChange={e => setExportWidth(Number(e.target.value))} style={numberInputStyle} />
                  <span style={unitStyle}>px</span>
                </SettingRow>
                <SettingRow label="Padding">
                  <input type="number" min={20} max={80} step={5} value={padding} onChange={e => setPadding(Number(e.target.value))} style={numberInputStyle} />
                  <span style={unitStyle}>px</span>
                </SettingRow>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div
        ref={containerRef}
        style={{
          display: 'flex',
          flex: 1,
          background: 'rgba(255,255,255,0.03)',
          overflow: 'hidden',
        }}
      >
        {/* Editor */}
        {viewMode !== 'preview' && (
          <div
            style={{
              flex: viewMode === 'editor' ? 1 : `0 0 ${splitRatio * 100}%`,
              display: 'flex',
              flexDirection: 'column',
              background: '#1e1e24',
              minWidth: 0,
              transition: isDragging.current ? 'none' : 'flex 0.2s ease',
            }}
          >
            <div
              style={{
                padding: '18px 20px 8px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#c84040', opacity: 0.6 }} />
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#c49442', opacity: 0.6 }} />
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4a8c6f', opacity: 0.6 }} />
              <span
                style={{
                  marginLeft: '8px',
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: '11px',
                  color: '#4a4a54',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                }}
              >
                Editor
              </span>
            </div>
            <textarea
              value={markdown}
              onChange={e => setMarkdown(e.target.value)}
              placeholder="Enter your markdown here..."
              style={{
                flex: 1,
                width: '100%',
                minHeight: 'calc(100vh - 50px)',
                padding: '12px 24px 24px',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '13px',
                lineHeight: 1.7,
                color: '#c8c4bc',
                background: 'transparent',
                border: 'none',
                resize: 'none',
                outline: 'none',
                caretColor: accentColor,
              }}
            />
          </div>
        )}

        {/* Draggable Divider */}
        {viewMode === 'split' && (
          <div
            onMouseDown={handleDragStart}
            style={{
              width: '6px',
              cursor: 'col-resize',
              background: '#16161a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              position: 'relative',
              zIndex: 2,
            }}
          >
            <div
              style={{
                width: '2px',
                height: '32px',
                borderRadius: '1px',
                background: 'rgba(255,255,255,0.1)',
                transition: 'background 0.2s',
              }}
            />
          </div>
        )}

        {/* Preview */}
        {viewMode !== 'editor' && (
          <div
            style={{
              flex: viewMode === 'preview' ? 1 : `0 0 ${(1 - splitRatio) * 100}%`,
              display: 'flex',
              flexDirection: 'column',
              background: '#1a1a1e',
              minWidth: 0,
              transition: isDragging.current ? 'none' : 'flex 0.2s ease',
            }}
          >
            <div
              style={{
                padding: '18px 20px 8px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4a4a54" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <span
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: '11px',
                  color: '#4a4a54',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                }}
              >
                Preview
              </span>
            </div>
            <div style={{ flex: 1, overflow: 'auto', padding: '12px 20px 20px' }}>
              <div
                ref={previewRef}
                style={{
                  maxWidth: '800px',
                  margin: '0 auto',
                  padding: `${padding}px`,
                  backgroundColor: selectedTheme.backgroundColor,
                  color: selectedTheme.textColor,
                  borderRadius: '10px',
                  fontFamily: fontFamily,
                  fontSize: `${fontSize}px`,
                  lineHeight: lineHeight,
                }}
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight]}
                  components={{
                    h1: ({ node, ...props }) => (
                      <h1 style={{
                        color: selectedTheme.headingColor,
                        borderBottom: `2px solid ${selectedTheme.borderColor}`,
                        paddingBottom: '10px',
                        marginTop: 0,
                        marginBottom: '20px',
                        fontSize: `${fontSize * 2}px`,
                        lineHeight,
                      }} {...props} />
                    ),
                    h2: ({ node, ...props }) => (
                      <h2 style={{
                        color: selectedTheme.headingColor,
                        marginTop: '30px',
                        marginBottom: '15px',
                        fontSize: `${fontSize * 1.5}px`,
                        lineHeight,
                      }} {...props} />
                    ),
                    h3: ({ node, ...props }) => (
                      <h3 style={{
                        color: selectedTheme.headingColor,
                        marginTop: '25px',
                        marginBottom: '10px',
                        fontSize: `${fontSize * 1.25}px`,
                        lineHeight,
                      }} {...props} />
                    ),
                    p: ({ node, ...props }) => (
                      <p style={{ marginBottom: '15px', lineHeight }} {...props} />
                    ),
                    code: ({ node, inline, className, children, ...props }: any) => {
                      const isInline = !className || className === 'language-';
                      if (isInline) {
                        return (
                          <code className={className} style={{
                            backgroundColor: selectedTheme.codeBackground,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: `${fontSize * 0.9}px`,
                            display: 'inline-block',
                            verticalAlign: 'middle',
                            maxWidth: '100%',
                            fontFamily: "'JetBrains Mono', Monaco, Menlo, monospace",
                          }} {...props}>{children}</code>
                        );
                      }
                      return (
                        <code className={className} style={{
                          display: 'block',
                          backgroundColor: 'transparent',
                          padding: 0,
                          borderRadius: 0,
                          fontFamily: "'JetBrains Mono', Monaco, Menlo, monospace",
                          fontSize: `${fontSize * 0.9}px`,
                          lineHeight: '1.5',
                          color: 'inherit',
                          whiteSpace: 'pre',
                        }} {...props}>{children}</code>
                      );
                    },
                    pre: ({ node, ...props }) => (
                      <pre style={{
                        marginBottom: '20px',
                        backgroundColor: selectedTheme.codeBackground,
                        padding: '16px',
                        borderRadius: '8px',
                        overflow: 'auto',
                        fontSize: `${fontSize * 0.9}px`,
                        color: selectedTheme.textColor,
                      }} {...props} />
                    ),
                    blockquote: ({ node, ...props }) => (
                      <blockquote style={{
                        borderLeft: `3px solid ${selectedTheme.headingColor}`,
                        paddingLeft: '16px',
                        margin: '20px 0',
                        fontStyle: 'italic',
                        color: '#888',
                        fontSize: `${fontSize}px`,
                        lineHeight,
                      }} {...props} />
                    ),
                    ul: ({ node, ...props }) => (
                      <ul style={{ paddingLeft: '20px', marginBottom: '15px', fontSize: `${fontSize}px`, lineHeight }} {...props} />
                    ),
                    ol: ({ node, ...props }) => (
                      <ol style={{ paddingLeft: '20px', marginBottom: '15px', fontSize: `${fontSize}px`, lineHeight }} {...props} />
                    ),
                    li: ({ node, ...props }) => (
                      <li style={{ marginBottom: '8px', fontSize: `${fontSize}px`, lineHeight }} {...props} />
                    ),
                    a: ({ node, ...props }) => (
                      <a style={{ color: accentColor, textDecoration: 'none' }} {...props} />
                    ),
                  }}
                >
                  {markdown}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ---- Sub-components ---- */

const SettingRow: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
    <span style={{
      fontFamily: "'Cormorant Garamond', serif",
      fontSize: '12px',
      color: '#7f7f8a',
      letterSpacing: '0.5px',
      flexShrink: 0,
    }}>
      {label}
    </span>
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      {children}
    </div>
  </div>
);

const numberInputStyle: React.CSSProperties = {
  width: '70px',
  padding: '6px 10px',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '8px',
  color: '#c8c4bc',
  fontSize: '13px',
  fontFamily: "'JetBrains Mono', monospace",
  outline: 'none',
  textAlign: 'right',
};

const selectInputStyle: React.CSSProperties = {
  padding: '6px 10px',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '8px',
  color: '#c8c4bc',
  fontSize: '12px',
  outline: 'none',
  cursor: 'pointer',
  maxWidth: '150px',
};

const unitStyle: React.CSSProperties = {
  fontSize: '11px',
  color: '#5a5a64',
  fontFamily: "'JetBrains Mono', monospace",
};

const defaultMarkdown = `# Welcome to MD2Image

This is a **markdown to image** converter with beautiful themes.

## Features

- Multiple themes
- Real-time preview
- Responsive design
- Code highlighting

## Code Example

\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}
\`\`\`

## Lists

1. First item
2. Second item
3. Third item

> This is a blockquote

Enjoy creating beautiful images from your markdown!`;

export default Md2Image;
