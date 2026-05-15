import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypePrismPlus from 'rehype-prism-plus';
import { visit } from 'unist-util-visit';
import { toPng } from 'html-to-image';
import mermaid from 'mermaid';
import pangu from 'pangu/browser';
import {
  Settings,
  Download,
  FileText,
  Columns2,
  Edit3,
  Eye,
  X,
  Copy,
  Check,
  Wand2,
} from 'lucide-react';

import 'katex/dist/katex.min.css';
import 'prismjs/themes/prism.css';
import { site } from '../../config/site';

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
  { name: 'Light',   label: '明', backgroundColor: '#ffffff', textColor: '#333333', headingColor: '#000000', borderColor: '#e0e0e0', codeBackground: '#f5f5f5', dot: '#e8e8e8' },
  { name: 'Warm',    label: '暖', backgroundColor: '#fff9f0', textColor: '#5c4033', headingColor: '#8b4513', borderColor: '#d4a574', codeBackground: '#fef3e2', dot: '#f0d8b8' },
  { name: 'Elegant', label: '雅', backgroundColor: '#faf5ff', textColor: '#444444', headingColor: '#6b46c1', borderColor: '#d6bcfa', codeBackground: '#f3e8ff', dot: '#d6bcfa' },
  { name: 'Dark',    label: '墨', backgroundColor: '#1a1a1a', textColor: '#e0e0e0', headingColor: '#ffffff', borderColor: '#404040', codeBackground: '#2d2d2d', dot: '#404040' },
  { name: 'Nature',  label: '翠', backgroundColor: '#f0fff4', textColor: '#2d5a27', headingColor: '#22543d', borderColor: '#9ae6b4', codeBackground: '#e6ffed', dot: '#86d4a0' },
  { name: 'Sunset',  label: '霞', backgroundColor: '#fffaf0', textColor: '#c05621', headingColor: '#9c4221', borderColor: '#fbd38d', codeBackground: '#fffaf0', dot: '#f6c87a' },
  { name: 'Ocean',   label: '海', backgroundColor: '#ebf8ff', textColor: '#2c5282', headingColor: '#2b6cb0', borderColor: '#90cdf4', codeBackground: '#e3f2fd', dot: '#7ec4e8' },
  { name: 'Mint',    label: '薄', backgroundColor: '#f0fdf4', textColor: '#166534', headingColor: '#15803d', borderColor: '#86efac', codeBackground: '#dcfce7', dot: '#6ee09c' },
];

type TabType = 'theme' | 'font' | 'render' | 'image';
type ViewMode = 'split' | 'editor' | 'preview';

const defaultMarkdown = `# Welcome to Markdown

This is a **markdown to image** converter with beautiful themes.

## Math

Inline math: $E = mc^2$. Display:

$$
\\int_{-\\infty}^{\\infty} e^{-x^2}\\,dx = \\sqrt{\\pi}
$$

## Mermaid

\`\`\`mermaid
graph LR
  A[输入] --> B{解析}
  B -->|是| C[渲染]
  B -->|否| D[报错]
\`\`\`

## Code

\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}
\`\`\`

## Lists

1. First item
2. Second item

> 写下markdown，导出图片or PDF分享。`;

const TAB_LABELS: Record<TabType, string> = {
  theme: '主题',
  font: '字体',
  render: '渲染',
  image: '导出',
};

const FONT_OPTIONS = [
  { value: 'system-ui', label: 'System UI' },
  { value: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', label: 'San Francisco' },
  { value: '"Inter Tight", "Inter", sans-serif', label: 'Inter Tight' },
  { value: '"Noto Serif SC", "Songti SC", serif', label: 'Noto Serif SC' },
  { value: '"Georgia", serif', label: 'Georgia' },
  { value: '"JetBrains Mono", monospace', label: 'JetBrains Mono' },
  { value: '"Courier New", monospace', label: 'Courier New' },
];


const formatMarkdown = (md: string): string => {
  const placeholders: string[] = [];
  const PH = (i: number) => `\u0000${i}\u0000`;
  const push = (str: string): string => {
    placeholders.push(str);
    return PH(placeholders.length - 1);
  };
  const spaceInner = (txt: string): string => {
    try {
      return pangu.spacingText(txt);
    } catch {
      return txt;
    }
  };

  let s = md;
  // Protect fenced code blocks first
  s = s.replace(/```[\s\S]*?```/g, (m) => push(m));
  // Then inline code (no newline inside)
  s = s.replace(/`[^`\n]+`/g, (m) => push(m));

  // Protect strong (**, __) and strikethrough (~~) spans — keep markers
  // visible to outer pangu so spaces are added around the span, not inside it.
  s = s.replace(/(\*\*|__|~~)([^\n]+?)\1/g, (_, mark, content) =>
    `${mark}${push(spaceInner(content))}${mark}`
  );
  // Protect italic *...* (skip line-start "* " bullets and lone markers)
  s = s.replace(
    /(^|[^\w*])\*(?=\S)([^*\n]+?)(?<=\S)\*(?!\w)/g,
    (_, pre, content) => `${pre}*${push(spaceInner(content))}*`
  );
  // Protect italic _..._
  s = s.replace(
    /(^|[^\w_])_(?=\S)([^_\n]+?)(?<=\S)_(?!\w)/g,
    (_, pre, content) => `${pre}_${push(spaceInner(content))}_`
  );

  // Pangu spacing on the remaining (outer) text
  s = spaceInner(s);

  // Tidy whitespace
  s = s
    .replace(/\t/g, '  ')
    .replace(/[ \t]+$/gm, '')
    .replace(/\n{3,}/g, '\n\n');

  // Restore placeholders (iterative — protected spans may contain nested ones)
  let prev = '';
  while (prev !== s) {
    prev = s;
    s = s.replace(/\u0000(\d+)\u0000/g, (_, idx) => placeholders[Number(idx)]);
  }

  // Single trailing newline
  s = s.replace(/\n*$/, '\n');
  return s;
};

/**
 * rehype plugin: 把 \`\`\`mermaid 代码块替换成占位 div,
 * 让 prism 跳过、由 React 端的 Mermaid 子组件渲染。
 */
const rehypeMermaid = () => (tree: any) => {
  visit(tree, 'element', (node: any, index: number | undefined, parent: any) => {
    if (
      node.tagName === 'pre' &&
      Array.isArray(node.children) &&
      node.children[0]?.tagName === 'code'
    ) {
      const code = node.children[0];
      const className: string[] = code.properties?.className || [];
      if (className.includes('language-mermaid')) {
        const raw = (code.children || [])
          .map((c: any) => (c.type === 'text' ? c.value : ''))
          .join('');
        if (parent && typeof index === 'number') {
          parent.children[index] = {
            type: 'element',
            tagName: 'div',
            properties: {
              className: ['md-mermaid'],
              dataMermaidSource: raw,
            },
            children: [],
          };
        }
      }
    }
  });
};

const Markdown: React.FC = () => {
  const loadSettings = () => {
    const saved = localStorage.getItem('markdown-settings') || localStorage.getItem('md2image-settings');
    if (saved) {
      try {
        const s = JSON.parse(saved);
        const theme = themes.find((t) => t.name === s.themeName) || themes[0];
        return {
          theme,
          exportWidth: s.exportWidth || 500,
          fontSize: s.fontSize || 16,
          lineHeight: s.lineHeight || 1.6,
          fontFamily: s.fontFamily || 'system-ui',
          padding: s.padding || 40,
          showLineNumbers: !!s.showLineNumbers,
          softBreaks: s.softBreaks !== false,
          autoSpacing: s.autoSpacing !== false,
          pdfQuality: s.pdfQuality || 4,
          pdfEngine: (s.pdfEngine === 'reactpdf' ? 'reactpdf' : 'browser') as 'browser' | 'reactpdf',
          markdown: s.markdown || defaultMarkdown,
        };
      } catch {}
    }
    return {
      theme: themes[0],
      exportWidth: 500,
      fontSize: 16,
      lineHeight: 1.6,
      fontFamily: 'system-ui',
      padding: 40,
      showLineNumbers: false,
      softBreaks: true,
      autoSpacing: true,
      pdfQuality: 4,
      pdfEngine: 'browser' as 'browser' | 'reactpdf',
      markdown: defaultMarkdown,
    };
  };

  const initial = loadSettings();
  const [markdown, setMarkdown] = useState<string>(initial.markdown);
  const [selectedTheme, setSelectedTheme] = useState<Theme>(initial.theme);
  const [exportWidth, setExportWidth] = useState<number>(initial.exportWidth);
  const [fontSize, setFontSize] = useState<number>(initial.fontSize);
  const [lineHeight, setLineHeight] = useState<number>(initial.lineHeight);
  const [fontFamily, setFontFamily] = useState<string>(initial.fontFamily);
  const [padding, setPadding] = useState<number>(initial.padding);
  const [showLineNumbers, setShowLineNumbers] = useState<boolean>(initial.showLineNumbers);
  const [softBreaks, setSoftBreaks] = useState<boolean>(initial.softBreaks);
  const [autoSpacing, setAutoSpacing] = useState<boolean>(initial.autoSpacing);
  const [pdfQuality, setPdfQuality] = useState<number>(initial.pdfQuality);
  const [pdfEngine, setPdfEngine] = useState<'browser' | 'reactpdf'>(initial.pdfEngine);
  const [justFormatted, setJustFormatted] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('theme');
  const [isNarrow, setIsNarrow] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.matchMedia('(max-width: 767px)').matches : false
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mql = window.matchMedia('(max-width: 767px)');
    const handler = (e: MediaQueryListEvent) => setIsNarrow(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  const [viewMode, setViewMode] = useState<ViewMode>(() => (
    typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches ? 'editor' : 'split'
  ));

  // Force off split mode when entering narrow viewport
  useEffect(() => {
    if (isNarrow && viewMode === 'split') setViewMode('editor');
  }, [isNarrow, viewMode]);
  const [splitRatio, setSplitRatio] = useState(0.5);
  const isDragging = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Initialize Mermaid once
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: 'strict',
      theme: 'default',
      fontFamily: 'inherit',
    });
  }, []);

  // Persist settings
  useEffect(() => {
    try {
      localStorage.setItem(
        'markdown-settings',
        JSON.stringify({
          themeName: selectedTheme.name,
          exportWidth,
          fontSize,
          lineHeight,
          fontFamily,
          padding,
          showLineNumbers,
          softBreaks,
          autoSpacing,
          pdfQuality,
          pdfEngine,
          markdown,
        })
      );
    } catch {}
  }, [selectedTheme, exportWidth, fontSize, lineHeight, fontFamily, padding, showLineNumbers, softBreaks, autoSpacing, pdfQuality, pdfEngine, markdown]);

  useEffect(() => {
    if (!autoSpacing || !previewRef.current) return;
    try {
      pangu.spacingNode(previewRef.current);
    } catch {}
  }, [autoSpacing, markdown, selectedTheme, fontFamily, fontSize, lineHeight, padding, softBreaks, showLineNumbers]);

  const remarkPlugins = useMemo(
    () => [remarkGfm, ...(softBreaks ? [remarkBreaks] : []), remarkMath],
    [softBreaks]
  );

  const rehypePlugins = useMemo(
    () => [
      rehypeMermaid,
      [rehypePrismPlus, { showLineNumbers, ignoreMissing: true }] as any,
      rehypeKatex,
    ],
    [showLineNumbers]
  );

  const markdownComponents = useMemo(() => {
    const codeBg = selectedTheme.codeBackground;
    const headingColor = selectedTheme.headingColor;
    const borderColor = selectedTheme.borderColor;
    const textColor = selectedTheme.textColor;
    const monoFamily = "'JetBrains Mono', Monaco, Menlo, monospace";
    return {
      h1: ({ node, ...props }: any) => (
        <h1 style={{ color: headingColor, borderBottom: `2px solid ${borderColor}`, paddingBottom: '10px', marginTop: 0, marginBottom: '20px', fontSize: `${fontSize * 2}px`, lineHeight }} {...props} />
      ),
      h2: ({ node, ...props }: any) => (
        <h2 style={{ color: headingColor, marginTop: '30px', marginBottom: '15px', fontSize: `${fontSize * 1.5}px`, lineHeight }} {...props} />
      ),
      h3: ({ node, ...props }: any) => (
        <h3 style={{ color: headingColor, marginTop: '25px', marginBottom: '10px', fontSize: `${fontSize * 1.25}px`, lineHeight }} {...props} />
      ),
      p: ({ node, ...props }: any) => (
        <p style={{ marginBottom: '15px', lineHeight }} {...props} />
      ),
      code: ({ node, inline, className, children, ...props }: any) => {
        const isInline = !className || className === 'language-';
        if (isInline) {
          return (
            <code className={className} style={{ backgroundColor: codeBg, padding: '2px 6px', borderRadius: '4px', fontSize: `${fontSize * 0.9}px`, display: 'inline-block', verticalAlign: 'middle', maxWidth: '100%', fontFamily: monoFamily }} {...props}>
              {children}
            </code>
          );
        }
        return (
          <code className={className} style={{ display: 'block', backgroundColor: 'transparent', padding: 0, borderRadius: 0, fontFamily: monoFamily, fontSize: `${fontSize * 0.9}px`, lineHeight: '1.5', color: 'inherit', whiteSpace: 'pre' }} {...props}>
            {children}
          </code>
        );
      },
      pre: ({ node, children, ...props }: any) => (
        <PreWithCopy codeBg={codeBg} textColor={textColor} fontSize={fontSize} {...props}>
          {children}
        </PreWithCopy>
      ),
      div: ({ node, className, children, ...props }: any) => {
        const isMermaid = className === 'md-mermaid' || (Array.isArray(className) && className.includes('md-mermaid'));
        if (isMermaid) {
          const src = (node?.properties?.dataMermaidSource as string) ?? '';
          return <MermaidChart chart={src} />;
        }
        return <div className={className} {...props}>{children}</div>;
      },
      blockquote: ({ node, ...props }: any) => (
        <blockquote style={{ borderLeft: `3px solid ${headingColor}`, paddingLeft: '16px', margin: '20px 0', fontStyle: 'italic', opacity: 0.75, fontSize: `${fontSize}px`, lineHeight }} {...props} />
      ),
      ul: ({ node, ...props }: any) => (
        <ul style={{ paddingLeft: '20px', marginBottom: '15px', fontSize: `${fontSize}px`, lineHeight }} {...props} />
      ),
      ol: ({ node, ...props }: any) => (
        <ol style={{ paddingLeft: '20px', marginBottom: '15px', fontSize: `${fontSize}px`, lineHeight }} {...props} />
      ),
      li: ({ node, ...props }: any) => (
        <li style={{ marginBottom: '8px', fontSize: `${fontSize}px`, lineHeight }} {...props} />
      ),
      a: ({ node, ...props }: any) => (
        <a style={{ color: headingColor, textDecoration: 'underline', textUnderlineOffset: '3px' }} {...props} />
      ),
    };
  }, [selectedTheme, fontSize, lineHeight]);

  const capturePreview = async (pixelRatio = 2) => {
    if (!previewRef.current) return null;
    const original = previewRef.current;
    // Clone the preview into an offscreen wrapper so the live preview never
    // reflows during export. Positioning lives on the wrapper only — putting
    // position/transform on the clone itself breaks html-to-image's
    // foreignObject rendering (produces a blank image).
    const clone = original.cloneNode(true) as HTMLDivElement;
    clone.style.width = `${exportWidth}px`;
    clone.style.maxWidth = `${exportWidth}px`;
    clone.style.margin = '0';

    const wrapper = document.createElement('div');
    wrapper.style.position = 'fixed';
    wrapper.style.top = '0';
    wrapper.style.left = '100vw'; // just outside the right edge of the viewport
    wrapper.style.pointerEvents = 'none';
    wrapper.setAttribute('aria-hidden', 'true');
    wrapper.appendChild(clone);
    document.body.appendChild(wrapper);

    // Let the browser lay out the clone at the new width
    await new Promise<void>((r) => requestAnimationFrame(() => r()));
    try {
      const w = clone.offsetWidth;
      const h = clone.scrollHeight;
      const dataUrl = await toPng(clone, {
        width: w,
        height: h,
        pixelRatio,
        filter: (node) =>
          !(node instanceof HTMLElement && node.classList.contains('md-no-export')),
      });
      return { dataUrl, width: w * pixelRatio, height: h * pixelRatio };
    } finally {
      document.body.removeChild(wrapper);
    }
  };

  const handleExportPng = async () => {
    try {
      const result = await capturePreview();
      if (!result) return;
      const link = document.createElement('a');
      link.download = 'markdown.png';
      link.href = result.dataUrl;
      link.click();
    } catch (error) {
      console.error('Error exporting PNG:', error);
    }
  };

  const exportPdfViaBrowser = () => {
    // Browser "Save as PDF" path: print only the preview via @media print.
    // The browser produces a vector PDF (real text, tiny file, selectable).
    const cleanup = () => {
      document.body.classList.remove('printing-md');
      window.removeEventListener('afterprint', cleanup);
    };
    window.addEventListener('afterprint', cleanup);
    document.body.classList.add('printing-md');
    requestAnimationFrame(() => {
      try {
        window.print();
      } catch (error) {
        console.error('Error opening print dialog:', error);
        cleanup();
      }
    });
  };

  const exportPdfViaReact = async () => {
    if (!previewRef.current) return;
    // Lazy-load the renderer (and @react-pdf) so it isn't in the main bundle.
    const { renderMarkdownToPdfBlob } = await import('../../services/markdownPdf');
    const blob = await renderMarkdownToPdfBlob({
      markdown,
      previewEl: previewRef.current,
      theme: selectedTheme,
      fontSize,
      lineHeight,
      padding,
      imagePixelRatio: pdfQuality,
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'markdown.pdf';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleExportPdf = async () => {
    try {
      if (pdfEngine === 'reactpdf') {
        await exportPdfViaReact();
      } else {
        exportPdfViaBrowser();
      }
    } catch (error) {
      console.error('Error exporting PDF:', error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        isPopupOpen &&
        popupRef.current &&
        !popupRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
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

  const handleFormat = () => {
    const formatted = formatMarkdown(markdown);
    if (formatted !== markdown) {
      setMarkdown(formatted);
    }
    setJustFormatted(true);
    setTimeout(() => setJustFormatted(false), 1400);
  };

  const viewModes = useMemo<{ key: ViewMode; icon: React.ReactNode; label: string }[]>(
    () => [
      { key: 'editor',  icon: <Edit3 size={14} strokeWidth={1.8} />,    label: '编辑' },
      ...(isNarrow ? [] : [{ key: 'split' as ViewMode, icon: <Columns2 size={14} strokeWidth={1.8} />, label: '分屏' }]),
      { key: 'preview', icon: <Eye size={14} strokeWidth={1.8} />,      label: '预览' },
    ],
    [isNarrow]
  );

  return (
    <div className="min-h-screen flex flex-col bg-bg">
      <Helmet>
        <title>{`Markdown | ${site.name}`}</title>
        <meta name="description" content="将 Markdown 转换为图片或 PDF，支持数学公式、Mermaid、代码高亮、行号。" />
        <meta name="keywords" content="markdown, image, converter, pdf, themes, math, mermaid" />
        <meta name="author" content={site.author} />
        <link rel="canonical" href={`${site.url}/markdown`} />
      </Helmet>

      {/* Toolbar */}
      <div className="sticky top-[60px] md:top-0 z-30 md:z-20 flex items-center justify-between gap-2 px-3 md:px-6 py-2.5 md:py-3 bg-bg/85 backdrop-blur border-b border-border">
        <div className="flex items-center gap-3 min-w-0">
          <h1 className="text-sm font-semibold tracking-tight text-text shrink-0">Markdown</h1>
          <span className="hidden sm:inline text-[11px] font-mono text-subtle tracking-wide">
            markdown → image / pdf
          </span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Mobile: 单按钮切换 编辑/预览;桌面:三选段 */}
          <button
            type="button"
            onClick={() => setViewMode(viewMode === 'preview' ? 'editor' : 'preview')}
            aria-label={viewMode === 'preview' ? '切换到编辑' : '切换到预览'}
            title={viewMode === 'preview' ? '切换到编辑' : '切换到预览'}
            className="md:hidden inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-elevated text-muted hover:text-text transition-colors"
          >
            {viewMode === 'preview' ? <Edit3 size={14} strokeWidth={1.8} /> : <Eye size={14} strokeWidth={1.8} />}
          </button>
          {/* Mobile: 格式化(仅 editor 模式) */}
          {viewMode === 'editor' && (
            <button
              type="button"
              onClick={handleFormat}
              aria-label="格式化"
              title="一键格式化"
              className={`md:hidden inline-flex h-8 w-8 items-center justify-center rounded-md border transition-colors ${
                justFormatted
                  ? 'text-success border-success/40 bg-success/10'
                  : 'text-muted border-border bg-elevated hover:text-text'
              }`}
            >
              {justFormatted ? <Check size={14} strokeWidth={2} /> : <Wand2 size={14} strokeWidth={1.8} />}
            </button>
          )}

          <div className="hidden md:flex items-center rounded-lg border border-border bg-elevated p-0.5">
            {viewModes.map(({ key, icon, label }) => (
              <button
                key={key}
                onClick={() => setViewMode(key)}
                title={label}
                aria-label={label}
                className={`inline-flex items-center justify-center h-7 w-7 rounded-md transition-colors ${
                  viewMode === key ? 'bg-accent-soft text-accent' : 'text-muted hover:text-text'
                }`}
              >
                {icon}
              </button>
            ))}
          </div>

          <button
            ref={buttonRef}
            onClick={() => setIsPopupOpen(!isPopupOpen)}
            aria-label="设置"
            className={`inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-elevated transition-colors ${
              isPopupOpen ? 'text-accent border-accent/40' : 'text-muted hover:text-text'
            }`}
          >
            <Settings size={14} strokeWidth={1.8} />
          </button>

          <button
            onClick={handleExportPng}
            aria-label="导出 PNG"
            title="导出 PNG"
            className="inline-flex items-center gap-1.5 h-8 px-2.5 sm:px-3 rounded-md text-xs font-medium text-muted hover:text-text border border-border bg-elevated hover:border-subtle transition-colors"
          >
            <Download size={13} strokeWidth={1.8} />
            <span className="hidden sm:inline">PNG</span>
          </button>
          <button
            onClick={handleExportPdf}
            aria-label="导出 PDF"
            title="导出 PDF"
            className="inline-flex items-center gap-1.5 h-8 px-2.5 sm:px-3 rounded-md text-xs font-medium text-white bg-accent hover:bg-accent-hover transition-colors"
          >
            <FileText size={13} strokeWidth={1.8} />
            <span className="hidden sm:inline">PDF</span>
          </button>
        </div>
      </div>

      {/* Settings popup */}
      {isPopupOpen && (() => {
        const body = (
          <>
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <span className="text-sm font-medium text-text">设置</span>
              <button
                onClick={() => setIsPopupOpen(false)}
                aria-label="关闭"
                className="text-muted hover:text-text"
              >
                <X size={16} strokeWidth={1.8} />
              </button>
            </div>

            <div className="flex border-b border-border">
              {(['theme', 'font', 'render', 'image'] as TabType[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`relative flex-1 py-2.5 text-xs font-medium transition-colors ${
                    activeTab === tab ? 'text-accent' : 'text-muted hover:text-text'
                  }`}
                >
                  {TAB_LABELS[tab]}
                  {activeTab === tab && (
                    <span className="absolute bottom-0 left-1/4 right-1/4 h-[2px] bg-accent" />
                  )}
                </button>
              ))}
            </div>

            <div className={`p-4 ${isNarrow ? 'max-h-[50vh]' : 'max-h-[420px]'} overflow-y-auto`}>
              {activeTab === 'theme' && (
                <div className="grid grid-cols-4 gap-2">
                  {themes.map((theme) => {
                    const active = selectedTheme.name === theme.name;
                    return (
                      <button
                        key={theme.name}
                        onClick={() => setSelectedTheme(theme)}
                        className={`flex flex-col items-center gap-1.5 py-2.5 rounded-md border transition-colors ${
                          active ? 'border-accent bg-accent-soft/30' : 'border-border hover:border-subtle'
                        }`}
                      >
                        <span
                          className="block w-6 h-6 rounded-md border"
                          style={{ background: theme.backgroundColor, borderColor: theme.dot }}
                        />
                        <span className={`text-xs ${active ? 'text-accent font-medium' : 'text-muted'}`}>
                          {theme.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {activeTab === 'font' && (
                <div className="space-y-3">
                  <SettingRow label="字体">
                    <select
                      value={fontFamily}
                      onChange={(e) => setFontFamily(e.target.value)}
                      className="w-[180px] h-8 px-2 rounded-md border border-border bg-bg text-text text-xs focus:outline-none focus:border-accent"
                    >
                      {FONT_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </SettingRow>
                  <SettingRow label="字号">
                    <NumberInput value={fontSize} onChange={setFontSize} min={12} max={24} />
                    <Unit>px</Unit>
                  </SettingRow>
                  <SettingRow label="行距">
                    <NumberInput value={lineHeight} onChange={setLineHeight} min={1.2} max={2.5} step={0.1} />
                  </SettingRow>
                  <SettingRow label="代码行号">
                    <ToggleButton value={showLineNumbers} onChange={setShowLineNumbers} />
                  </SettingRow>
                </div>
              )}

              {activeTab === 'render' && (
                <div className="space-y-3">
                  <SettingRow label="软换行">
                    <ToggleButton value={softBreaks} onChange={setSoftBreaks} />
                  </SettingRow>
                  <p className="text-[11px] text-subtle leading-relaxed">
                    开启时，单个换行符直接渲染为换行（GFM 风格）；关闭后遵循 CommonMark（需空行或行尾两个空格）。
                  </p>
                  <SettingRow label="中英文加空格">
                    <ToggleButton value={autoSpacing} onChange={setAutoSpacing} />
                  </SettingRow>
                  <p className="text-[11px] text-subtle leading-relaxed">
                    在中文与英文/数字间自动加空格（如「Hello世界」→「Hello 世界」）。
                  </p>
                </div>
              )}

              {activeTab === 'image' && (
                <div className="space-y-3">
                  <SettingRow label="导出宽度">
                    <NumberInput value={exportWidth} onChange={setExportWidth} min={500} max={2000} step={50} />
                    <Unit>px</Unit>
                  </SettingRow>
                  <SettingRow label="内边距">
                    <NumberInput value={padding} onChange={setPadding} min={20} max={80} step={5} />
                    <Unit>px</Unit>
                  </SettingRow>
                  <SettingRow label="PDF 引擎">
                    <select
                      value={pdfEngine}
                      onChange={(e) => setPdfEngine(e.target.value as 'browser' | 'reactpdf')}
                      className="w-[140px] h-8 px-2 rounded-md border border-border bg-bg text-text text-xs focus:outline-none focus:border-accent"
                    >
                      <option value="browser">浏览器打印</option>
                      <option value="reactpdf">@react-pdf</option>
                    </select>
                  </SettingRow>
                  <p className="text-[11px] text-subtle leading-relaxed">
                    浏览器打印（推荐）：弹打印对话框，选「另存为 PDF」。文字矢量、体积小，需勾选「背景图形」。
                    <br />
                    @react-pdf：一键导出无对话框、跨浏览器一致。中文从 CDN 拉 Noto Sans SC，首次导出会下载字体；数学公式与 Mermaid 嵌为图。
                  </p>
                  {pdfEngine === 'browser' ? null : (
                    <>
                      <SettingRow label="PDF 清晰度">
                        <NumberInput value={pdfQuality} onChange={setPdfQuality} min={2} max={8} step={1} />
                        <Unit>x</Unit>
                      </SettingRow>
                      <p className="text-[11px] text-subtle leading-relaxed">
                        仅影响 @react-pdf 中数学公式与 Mermaid 嵌入图的清晰度。
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>
          </>
        );

        return isNarrow ? (
          <>
            <div
              className="fixed inset-0 z-[60] bg-text/30 backdrop-blur-sm animate-fade-in"
              onClick={() => setIsPopupOpen(false)}
              aria-label="关闭遮罩"
              role="button"
              tabIndex={-1}
            />
            <div
              ref={popupRef}
              className="fixed bottom-0 left-0 right-0 z-[70] rounded-t-2xl bg-elevated border-t border-border shadow-soft max-h-[80vh] flex flex-col animate-fade-in"
            >
              <div className="flex justify-center pt-2 pb-1">
                <span className="block h-1 w-10 rounded-full bg-border" />
              </div>
              {body}
            </div>
          </>
        ) : (
          <div
            ref={popupRef}
            className="fixed top-16 right-6 z-50 w-[340px] rounded-xl border border-border bg-elevated shadow-soft overflow-hidden animate-fade-in"
          >
            {body}
          </div>
        );
      })()}

      {/* Main */}
      <div ref={containerRef} className="flex flex-1 overflow-hidden bg-surface">
        {/* Editor */}
        {viewMode !== 'preview' && (
          <div
            className="flex flex-col bg-elevated min-w-0"
            style={{
              flex: viewMode === 'editor' ? 1 : `0 0 ${splitRatio * 100}%`,
              transition: isDragging.current ? 'none' : 'flex 0.2s ease',
            }}
          >
            <div className="hidden md:flex items-center gap-1.5 px-4 h-11 border-b border-border shrink-0">
              <span className="text-[11px] font-mono tracking-wide text-subtle uppercase">Editor</span>
              <div className="ml-auto flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleFormat}
                  aria-label="一键格式化"
                  title="一键格式化:中英文加空格、清理空行与行尾、避开代码块"
                  className={`inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md text-xs font-medium transition-colors ${
                    justFormatted
                      ? 'text-success bg-success/10'
                      : 'text-muted hover:text-accent hover:bg-accent-soft/40'
                  }`}
                >
                  {justFormatted ? (
                    <>
                      <Check size={13} strokeWidth={2} />
                      <span>已格式化</span>
                    </>
                  ) : (
                    <>
                      <Wand2 size={13} strokeWidth={1.8} />
                      <span>格式化</span>
                    </>
                  )}
                </button>
              </div>
            </div>
            <textarea
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              placeholder="Enter your markdown here..."
              className="flex-1 w-full p-4 md:p-6 font-mono text-[13px] leading-relaxed text-text bg-transparent border-0 resize-none focus:outline-none caret-accent"
            />
          </div>
        )}

        {/* Divider */}
        {viewMode === 'split' && (
          <div
            onMouseDown={handleDragStart}
            className="w-px cursor-col-resize bg-border hover:bg-subtle transition-colors shrink-0"
            role="separator"
            aria-orientation="vertical"
          />
        )}

        {/* Preview */}
        {viewMode !== 'editor' && (
          <div
            className="flex flex-col bg-bg min-w-0"
            style={{
              flex: viewMode === 'preview' ? 1 : `0 0 ${(1 - splitRatio) * 100}%`,
              transition: isDragging.current ? 'none' : 'flex 0.2s ease',
            }}
          >
            <div className="hidden md:flex items-center gap-2 px-4 h-11 border-b border-border shrink-0">
              <span className="text-[11px] font-mono tracking-wide text-subtle uppercase">Preview</span>
              <span className="ml-auto text-[11px] text-subtle">{selectedTheme.label}</span>
            </div>
            <div
              className="flex-1 overflow-auto"
              style={{ backgroundColor: selectedTheme.backgroundColor }}
            >
              <div
                ref={previewRef}
                className="mx-auto max-w-[800px] md-preview"
                style={{
                  padding: `${padding}px`,
                  backgroundColor: selectedTheme.backgroundColor,
                  color: selectedTheme.textColor,
                  fontFamily,
                  fontSize: `${fontSize}px`,
                  lineHeight,
                }}
              >
                <ReactMarkdown
                  remarkPlugins={remarkPlugins as any}
                  rehypePlugins={rehypePlugins as any}
                  components={markdownComponents}
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

/* Sub-components */

const PreWithCopy: React.FC<{
  codeBg: string;
  textColor: string;
  fontSize: number;
  children?: React.ReactNode;
}> = ({ codeBg, textColor, fontSize, children }) => {
  const ref = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    const text = ref.current?.textContent ?? '';
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {}
  };

  return (
    <div className="md-codeblock relative group" style={{ marginBottom: '20px' }}>
      <button
        type="button"
        onClick={copy}
        className="md-no-export"
        aria-label={copied ? '已复制' : '复制代码'}
        title={copied ? '已复制' : '复制'}
        style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: '4px 8px',
          fontSize: '11px',
          fontWeight: 500,
          background: 'rgba(0, 0, 0, 0.08)',
          color: 'inherit',
          border: '1px solid rgba(0, 0, 0, 0.06)',
          borderRadius: '6px',
          cursor: 'pointer',
          opacity: 0,
          transition: 'opacity 0.15s ease, background 0.15s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(0, 0, 0, 0.14)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(0, 0, 0, 0.08)';
        }}
      >
        {copied ? (
          <>
            <Check size={11} strokeWidth={2} />
            <span>已复制</span>
          </>
        ) : (
          <>
            <Copy size={11} strokeWidth={1.8} />
            <span>复制</span>
          </>
        )}
      </button>
      <pre
        ref={ref}
        style={{
          margin: 0,
          backgroundColor: codeBg,
          padding: '16px',
          borderRadius: '8px',
          overflow: 'auto',
          fontSize: `${fontSize * 0.9}px`,
          color: textColor,
        }}
      >
        {children}
      </pre>
    </div>
  );
};

const MermaidChart: React.FC<{ chart: string }> = ({ chart }) => {
  const ref = useRef<HTMLDivElement>(null);
  const idRef = useRef(`mmd-${Math.random().toString(36).slice(2, 10)}`);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!chart.trim()) return;
    mermaid
      .render(idRef.current, chart)
      .then(({ svg }) => {
        if (!cancelled && ref.current) {
          ref.current.innerHTML = svg;
          setError(null);
        }
      })
      .catch((e) => {
        if (!cancelled) setError(String(e?.message || e));
      });
    return () => {
      cancelled = true;
    };
  }, [chart]);

  if (error) {
    return (
      <pre
        style={{
          color: '#c00',
          background: 'rgba(200,0,0,0.06)',
          padding: '12px 16px',
          borderRadius: '8px',
          fontSize: '12px',
          margin: '16px 0',
          fontFamily: "'JetBrains Mono', monospace",
          whiteSpace: 'pre-wrap',
        }}
      >
        {`Mermaid 渲染失败：\n${error}`}
      </pre>
    );
  }

  return (
    <div
      ref={ref}
      className="md-mermaid-svg"
      style={{
        display: 'flex',
        justifyContent: 'center',
        margin: '20px 0',
      }}
    />
  );
};

const SettingRow: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="flex items-center justify-between gap-3">
    <span className="text-xs text-muted shrink-0">{label}</span>
    <div className="flex items-center gap-1.5">{children}</div>
  </div>
);

const ToggleButton: React.FC<{ value: boolean; onChange: (v: boolean) => void }> = ({ value, onChange }) => (
  <button
    type="button"
    onClick={() => onChange(!value)}
    role="switch"
    aria-checked={value}
    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
      value ? 'bg-accent' : 'bg-surface border border-border'
    }`}
  >
    <span
      className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow-soft transform transition-transform ${
        value ? 'translate-x-[18px]' : 'translate-x-1'
      }`}
    />
  </button>
);

interface NumberInputProps {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
}
const NumberInput: React.FC<NumberInputProps> = ({ value, onChange, min, max, step = 1 }) => (
  <input
    type="number"
    value={value}
    onChange={(e) => onChange(Number(e.target.value))}
    min={min}
    max={max}
    step={step}
    className="w-[72px] h-7 px-2 rounded-md border border-border bg-bg text-right font-mono text-xs text-text focus:outline-none focus:border-accent"
  />
);

const Unit: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="font-mono text-[11px] text-subtle">{children}</span>
);

export default Markdown;
