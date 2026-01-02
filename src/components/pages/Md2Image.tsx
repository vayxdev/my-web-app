import React, { useState, useRef, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { toPng } from 'html-to-image';

interface Theme {
  name: string;
  backgroundColor: string;
  textColor: string;
  headingColor: string;
  borderColor: string;
  codeBackground: string;
}

const themes: Theme[] = [
  {
    name: 'Light',
    backgroundColor: '#ffffff',
    textColor: '#333333',
    headingColor: '#000000',
    borderColor: '#e0e0e0',
    codeBackground: '#f5f5f5'
  },
  {
    name: 'Warm',
    backgroundColor: '#fff9f0',
    textColor: '#5c4033',
    headingColor: '#8b4513',
    borderColor: '#d4a574',
    codeBackground: '#fef3e2'
  },
  {
    name: 'Elegant',
    backgroundColor: '#faf5ff',
    textColor: '#444444',
    headingColor: '#6b46c1',
    borderColor: '#d6bcfa',
    codeBackground: '#f3e8ff'
  },
  {
    name: 'Dark',
    backgroundColor: '#1a1a1a',
    textColor: '#e0e0e0',
    headingColor: '#ffffff',
    borderColor: '#404040',
    codeBackground: '#2d2d2d'
  },
  {
    name: 'Nature',
    backgroundColor: '#f0fff4',
    textColor: '#2d5a27',
    headingColor: '#22543d',
    borderColor: '#9ae6b4',
    codeBackground: '#e6ffed'
  },
  {
    name: 'Sunset',
    backgroundColor: '#fffaf0',
    textColor: '#c05621',
    headingColor: '#9c4221',
    borderColor: '#fbd38d',
    codeBackground: '#fffaf0'
  },
  {
    name: 'Ocean',
    backgroundColor: '#ebf8ff',
    textColor: '#2c5282',
    headingColor: '#2b6cb0',
    borderColor: '#90cdf4',
    codeBackground: '#e3f2fd'
  },
  {
    name: 'Mint',
    backgroundColor: '#f0fdf4',
    textColor: '#166534',
    headingColor: '#15803d',
    borderColor: '#86efac',
    codeBackground: '#dcfce7'
  }
];

type TabType = 'theme' | 'font' | 'image';

interface Md2ImageProps {}

const Md2Image: React.FC<Md2ImageProps> = () => {
  const loadSettings = () => {
    const saved = localStorage.getItem('md2image-settings');
    if (saved) {
      const settings = JSON.parse(saved);
      const theme = themes.find((t) => t.name === settings.themeName) || themes[0];
      return {
        theme,
        exportWidth: settings.exportWidth || 500,
        fontSize: settings.fontSize || 16,
        lineHeight: settings.lineHeight || 1.6,
        fontFamily: settings.fontFamily || 'system-ui',
        padding: settings.padding || 40,
        showLineNumbers: settings.showLineNumbers || false,
        markdown: settings.markdown || `# Welcome to MD2Image

This is a **markdown to image** converter with beautiful themes.

## Features

- 🎨 Multiple themes
- ⚡ Real-time preview
- 📱 Responsive design
- 💻 Code highlighting

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

Enjoy creating beautiful images from your markdown!`
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
      markdown: `# Welcome to MD2Image

This is a **markdown to image** converter with beautiful themes.

## Features

- 🎨 Multiple themes
- ⚡ Real-time preview
- 📱 Responsive design
- 💻 Code highlighting

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

Enjoy creating beautiful images from your markdown!`
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
  const [isPopupOpen, setIsPopupOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<TabType>('theme');
  const previewRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const saveSettings = () => {
    try {
      const settings = {
        themeName: selectedTheme.name,
        exportWidth,
        fontSize,
        lineHeight,
        fontFamily,
        padding,
        showLineNumbers,
        markdown
      };
      localStorage.setItem('md2image-settings', JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  useEffect(() => {
    saveSettings();
  }, [selectedTheme, exportWidth, fontSize, lineHeight, fontFamily, padding, showLineNumbers, markdown]);

  const fontOptions = [
    { value: 'system-ui', label: 'System UI' },
    { value: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', label: 'San Francisco' },
    { value: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', label: 'Inter' },
    { value: '"Georgia", serif', label: 'Georgia' },
    { value: '"Times New Roman", serif', label: 'Times New Roman' },
    { value: '"Monaco", "Menlo", "Ubuntu Mono", Consolas, monospace', label: 'Monaco Mono' },
    { value: '"Courier New", monospace', label: 'Courier New' },
  ];

  const handleExport = async () => {
    if (previewRef.current) {
      try {
        const scrollWidth = previewRef.current.scrollWidth;
        const clientWidth = previewRef.current.offsetWidth;
        const contentWidth = scrollWidth > clientWidth ? scrollWidth : exportWidth;
        const finalWidth = Math.max(exportWidth, Math.min(contentWidth * (exportWidth / clientWidth), exportWidth * 1.5));

        const dataUrl = await toPng(previewRef.current, {
          width: finalWidth,
          height: previewRef.current.scrollHeight * (finalWidth / previewRef.current.offsetWidth),
          style: {
            transform: `scale(${finalWidth / previewRef.current.offsetWidth})`,
            transformOrigin: 'top left',
          }
        });
        const link = document.createElement('a');
        link.download = 'md2image.png';
        link.href = dataUrl;
        link.click();
      } catch (error) {
        console.error('Error exporting image:', error);
      }
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isPopupOpen &&
        popupRef.current &&
        !popupRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsPopupOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isPopupOpen]);

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    padding: '20px',
  };

  const mainContentStyle: React.CSSProperties = {
    display: 'flex',
    gap: '20px',
    flex: 1,
    flexDirection: 'row',
    marginTop: '60px',
  };

  const editorStyle: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'transparent',
    padding: '0',
    minWidth: 0,
    maxWidth: '50%',
  };

  const textareaStyle: React.CSSProperties = {
    flex: 1,
    width: '100%',
    minHeight: 'calc(100vh - 40px)',
    padding: '16px',
    fontFamily: 'Monaco, Menlo, Ubuntu Mono, Consolas, monospace',
    fontSize: '14px',
    lineHeight: '1.6',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    resize: 'none',
    outline: 'none',
    backgroundColor: 'white',
  };

  const previewContainerStyle: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'transparent',
    padding: '0',
    minWidth: 0,
    maxWidth: '50%',
  };

  const previewWrapperStyle: React.CSSProperties = {
    flex: 1,
    overflow: 'auto',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    padding: '0',
    backgroundColor: 'white',
  };

  const previewStyle: React.CSSProperties = {
    maxWidth: '800px',
    margin: '0 auto',
    padding: `${padding}px`,
    backgroundColor: selectedTheme.backgroundColor,
    color: selectedTheme.textColor,
    borderRadius: '12px',
    fontFamily: fontFamily,
    fontSize: `${fontSize}px`,
    lineHeight: lineHeight,
  };

  const combinedButtonContainerStyle: React.CSSProperties = {
    position: 'fixed',
    left: '80px',
    top: '20px',
    display: 'flex',
    gap: '8px',
    zIndex: 1000,
  };

  const actionButtonStyle: React.CSSProperties = {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    transition: 'all 0.2s ease',
  };

  const popupStyle: React.CSSProperties = {
    position: 'fixed',
    left: '80px',
    top: '80px',
    width: '360px',
    backgroundColor: 'white',
    borderRadius: '16px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
    zIndex: 999,
    overflow: 'hidden',
  };

  const popupHeaderStyle: React.CSSProperties = {
    display: 'flex',
    borderBottom: '1px solid #f0f0f0',
    backgroundColor: '#fafafa',
    padding: '8px 12px',
    gap: '4px',
  };

  const tabButtonStyle = (tab: TabType): React.CSSProperties => ({
    flex: 1,
    padding: '10px 12px',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: activeTab === tab ? 600 : 400,
    color: activeTab === tab ? '#667eea' : '#666',
    borderRadius: '8px',
    transition: 'all 0.2s ease',
    position: 'relative',
  });

  const popupContentStyle: React.CSSProperties = {
    padding: '16px 20px',
    maxHeight: '400px',
    overflowY: 'auto',
  };

  const settingGroupStyle: React.CSSProperties = {
    marginBottom: '24px',
    paddingBottom: '20px',
    borderBottom: '1px solid #f0f0f0',
  };

  const settingLabelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '13px',
    fontWeight: 600,
    color: '#212529',
    marginBottom: '10px',
    letterSpacing: '0.3px',
  };

  const settingDescriptionStyle: React.CSSProperties = {
    fontSize: '12px',
    color: '#868e96',
    marginTop: '6px',
    marginBottom: '12px',
    letterSpacing: '0.2px',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 14px',
    border: '1px solid #e9ecef',
    borderRadius: '10px',
    fontSize: '14px',
    outline: 'none',
    transition: 'all 0.2s ease',
    backgroundColor: '#f8f9fa',
  };

  const selectStyle: React.CSSProperties = {
    ...inputStyle,
    cursor: 'pointer',
    backgroundColor: 'white',
  };

  const themeButtonStyle = (theme: Theme): React.CSSProperties => ({
    padding: '8px 16px',
    backgroundColor: selectedTheme.name === theme.name ? '#667eea' : '#f8f9fa',
    color: selectedTheme.name === theme.name ? 'white' : '#495057',
    border: selectedTheme.name === theme.name ? 'none' : '1px solid #e9ecef',
    borderRadius: '24px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: selectedTheme.name === theme.name ? 600 : 400,
    transition: 'all 0.2s ease',
    boxShadow: selectedTheme.name === theme.name ? '0 2px 8px rgba(102, 126, 234, 0.3)' : 'none',
  });

  const toggleButtonStyle = (enabled: boolean): React.CSSProperties => ({
    padding: '10px 20px',
    backgroundColor: enabled ? '#667eea' : '#f8f9fa',
    color: enabled ? 'white' : '#495057',
    border: enabled ? 'none' : '1px solid #e9ecef',
    borderRadius: '24px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 600,
    transition: 'all 0.2s ease',
    boxShadow: enabled ? '0 2px 8px rgba(102, 126, 234, 0.3)' : 'none',
  });

  const renderThemeTab = () => (
    <div style={{ ...settingGroupStyle, borderBottom: 'none', paddingBottom: '0', marginBottom: '0' }}>
      <label style={settingLabelStyle}>🎨 Color Theme</label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
        {themes.map((theme) => (
          <button
            key={theme.name}
            style={themeButtonStyle(theme)}
            onClick={() => setSelectedTheme(theme)}
            onMouseEnter={(e) => {
              if (selectedTheme.name !== theme.name) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
              }
            }}
            onMouseLeave={(e) => {
              if (selectedTheme.name !== theme.name) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }
            }}
          >
            {theme.name}
          </button>
        ))}
      </div>
    </div>
  );

  const renderFontTab = () => (
    <>
      <div style={settingGroupStyle}>
        <label style={settingLabelStyle}>🔤 Font Family</label>
        <select
          value={fontFamily}
          onChange={(e) => setFontFamily(e.target.value)}
          style={selectStyle}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = '#667eea';
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = '#e9ecef';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          {fontOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div style={settingGroupStyle}>
        <label style={settingLabelStyle}>📏 Font Size</label>
        <input
          type="number"
          min="12"
          max="24"
          step="1"
          value={fontSize}
          onChange={(e) => setFontSize(Number(e.target.value))}
          style={inputStyle}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = '#667eea';
            e.currentTarget.style.backgroundColor = 'white';
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = '#e9ecef';
            e.currentTarget.style.backgroundColor = '#f8f9fa';
            e.currentTarget.style.boxShadow = 'none';
          }}
        />
        <div style={settingDescriptionStyle}>
          Base font size in pixels
        </div>
      </div>

      <div style={settingGroupStyle}>
        <label style={settingLabelStyle}>📐 Line Height</label>
        <input
          type="number"
          min="1.2"
          max="2.5"
          step="0.1"
          value={lineHeight}
          onChange={(e) => setLineHeight(Number(e.target.value))}
          style={inputStyle}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = '#667eea';
            e.currentTarget.style.backgroundColor = 'white';
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = '#e9ecef';
            e.currentTarget.style.backgroundColor = '#f8f9fa';
            e.currentTarget.style.boxShadow = 'none';
          }}
        />
        <div style={settingDescriptionStyle}>
          Line spacing multiplier
        </div>
      </div>

      <div style={{ ...settingGroupStyle, borderBottom: 'none', paddingBottom: '0', marginBottom: '0' }}>
        <label style={settingLabelStyle}>🔢 Line Numbers</label>
        <button
          style={toggleButtonStyle(showLineNumbers)}
          onClick={() => setShowLineNumbers(!showLineNumbers)}
        >
          {showLineNumbers ? '✓ Enabled' : 'Disabled'}
        </button>
        <div style={settingDescriptionStyle}>
          Show line numbers in code blocks
        </div>
      </div>
    </>
  );

  const renderImageTab = () => (
    <>
      <div style={settingGroupStyle}>
        <label style={settingLabelStyle}>🖼️ Export Width</label>
        <input
          type="number"
          min="500"
          max="2000"
          step="50"
          value={exportWidth}
          onChange={(e) => setExportWidth(Number(e.target.value))}
          style={inputStyle}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = '#667eea';
            e.currentTarget.style.backgroundColor = 'white';
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = '#e9ecef';
            e.currentTarget.style.backgroundColor = '#f8f9fa';
            e.currentTarget.style.boxShadow = 'none';
          }}
        />
        <div style={settingDescriptionStyle}>
          Width of exported image in pixels (min 500)
        </div>
      </div>

      <div style={{ ...settingGroupStyle, borderBottom: 'none', paddingBottom: '0', marginBottom: '0' }}>
        <label style={settingLabelStyle}>📦 Padding</label>
        <input
          type="number"
          min="20"
          max="80"
          step="5"
          value={padding}
          onChange={(e) => setPadding(Number(e.target.value))}
          style={inputStyle}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = '#667eea';
            e.currentTarget.style.backgroundColor = 'white';
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = '#e9ecef';
            e.currentTarget.style.backgroundColor = '#f8f9fa';
            e.currentTarget.style.boxShadow = 'none';
          }}
        />
        <div style={settingDescriptionStyle}>
          Padding around the content
        </div>
      </div>
    </>
  );

  return (
    <div style={containerStyle}>
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



      <div style={mainContentStyle} className="md2image-main-content">
        <div style={editorStyle} className="md2image-editor">
          <textarea
            style={textareaStyle}
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            placeholder="Enter your markdown here..."
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#4caf50';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#e0e0e0';
            }}
          />
        </div>

        <div style={previewContainerStyle} className="md2image-preview">
          <div style={previewWrapperStyle}>
            <div ref={previewRef} style={previewStyle}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
                components={{
                  h1: ({ node, ...props }) => (
                    <h1
                      style={{
                        color: selectedTheme.headingColor,
                        borderBottom: `2px solid ${selectedTheme.borderColor}`,
                        paddingBottom: '10px',
                        marginTop: '0',
                        marginBottom: '20px',
                        fontSize: `${fontSize * 2}px`,
                        lineHeight: lineHeight,
                      }}
                      {...props}
                    />
                  ),
                  h2: ({ node, ...props }) => (
                    <h2
                      style={{
                        color: selectedTheme.headingColor,
                        marginTop: '30px',
                        marginBottom: '15px',
                        fontSize: `${fontSize * 1.5}px`,
                        lineHeight: lineHeight,
                      }}
                      {...props}
                    />
                  ),
                  h3: ({ node, ...props }) => (
                    <h3
                      style={{
                        color: selectedTheme.headingColor,
                        marginTop: '25px',
                        marginBottom: '10px',
                        fontSize: `${fontSize * 1.25}px`,
                        lineHeight: lineHeight,
                      }}
                      {...props}
                    />
                  ),
                  p: ({ node, ...props }) => (
                    <p
                      style={{
                        marginBottom: '15px',
                        lineHeight: lineHeight,
                      }}
                      {...props}
                    />
                  ),
                  code: ({ node, inline, className, children, ...props }: any) => {
                    const isInline = !className || className === 'language-';
                    if (isInline) {
                      return (
                        <code
                          className={className}
                          style={{
                            backgroundColor: selectedTheme.codeBackground,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: `${fontSize * 0.9}px`,
                            display: 'inline-block',
                            verticalAlign: 'middle',
                            maxWidth: '100%',
                            fontFamily: 'Monaco, Menlo, Ubuntu Mono, Consolas, monospace',
                          }}
                          {...props}
                        >
                          {children}
                        </code>
                      );
                    }
                    return (
                      <code
                        className={className}
                        style={{
                          display: 'block',
                          backgroundColor: 'transparent',
                          padding: 0,
                          borderRadius: 0,
                          fontFamily: 'Monaco, Menlo, Ubuntu Mono, Consolas, monospace',
                          fontSize: `${fontSize * 0.9}px`,
                          lineHeight: '1.5',
                          color: 'inherit',
                          whiteSpace: 'pre',
                        }}
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  },
                  pre: ({ node, ...props }) => (
                    <pre
                      style={{
                        marginBottom: '20px',
                        backgroundColor: selectedTheme.codeBackground,
                        padding: '16px',
                        borderRadius: '8px',
                        overflow: 'auto',
                        fontSize: `${fontSize * 0.9}px`,
                        color: selectedTheme.textColor,
                      }}
                      {...props}
                    />
                  ),
                  blockquote: ({ node, ...props }) => (
                    <blockquote
                      style={{
                        borderLeft: `4px solid ${selectedTheme.headingColor}`,
                        paddingLeft: '16px',
                        margin: '20px 0',
                        fontStyle: 'italic',
                        color: '#666',
                        fontSize: `${fontSize}px`,
                        lineHeight: lineHeight,
                      }}
                      {...props}
                    />
                  ),
                  ul: ({ node, ...props }) => (
                    <ul
                      style={{
                        paddingLeft: '20px',
                        marginBottom: '15px',
                        fontSize: `${fontSize}px`,
                        lineHeight: lineHeight,
                      }}
                      {...props}
                    />
                  ),
                  ol: ({ node, ...props }) => (
                    <ol
                      style={{
                        paddingLeft: '20px',
                        marginBottom: '15px',
                        fontSize: `${fontSize}px`,
                        lineHeight: lineHeight,
                      }}
                      {...props}
                    />
                  ),
                  li: ({ node, ...props }) => (
                    <li
                      style={{
                        marginBottom: '8px',
                        fontSize: `${fontSize}px`,
                        lineHeight: lineHeight,
                      }}
                      {...props}
                    />
                  ),
                  a: ({ node, ...props }) => (
                    <a
                      style={{
                        color: '#4caf50',
                        textDecoration: 'none',
                      }}
                      {...props}
                    />
                  ),
                }}
              >
                {markdown}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </div>

      <div style={combinedButtonContainerStyle}>
        <button
          ref={buttonRef}
          style={{
            ...actionButtonStyle,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          }}
          onClick={() => setIsPopupOpen(!isPopupOpen)}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)';
            e.currentTarget.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.39a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
        </button>
        <button
          style={{
            ...actionButtonStyle,
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
          }}
          onClick={handleExport}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)';
            e.currentTarget.style.boxShadow = '0 8px 20px rgba(245, 87, 108, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
        </button>
      </div>

      {isPopupOpen && (
        <div ref={popupRef} style={popupStyle}>
          <div style={popupHeaderStyle}>
            <button
              style={tabButtonStyle('theme')}
              onClick={() => setActiveTab('theme')}
            >
              Theme
            </button>
            <button
              style={tabButtonStyle('font')}
              onClick={() => setActiveTab('font')}
            >
              Font
            </button>
            <button
              style={tabButtonStyle('image')}
              onClick={() => setActiveTab('image')}
            >
              Image
            </button>
          </div>
          <div style={popupContentStyle}>
            {activeTab === 'theme' && renderThemeTab()}
            {activeTab === 'font' && renderFontTab()}
            {activeTab === 'image' && renderImageTab()}
          </div>
        </div>
      )}
    </div>
  );
};

export default Md2Image;
