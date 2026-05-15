import React, { useState, useMemo } from 'react';
import { pinyin } from 'pinyin-pro';
import { Helmet } from 'react-helmet';
import { Copy, Check, RotateCcw } from 'lucide-react';
import { site } from '../../config/site';

const DEFAULT_TEXT = '春眠不觉晓，处处闻啼鸟。\n夜来风雨声，花落知多少。';

const PinyinAnnotator: React.FC = () => {
  const [text, setText] = useState<string>(DEFAULT_TEXT);
  const [copied, setCopied] = useState(false);

  const annotatedLines = useMemo(() => {
    if (!text.trim()) return null;
    const lines = text.split('\n');
    return lines.map((line, lineIndex) => {
      if (!line) return <div key={lineIndex} className="h-8" />;
      const pinyinResult = pinyin(line, { type: 'array' });
      const chars = line.split('');
      return (
        <div key={lineIndex} className="flex flex-wrap items-end mb-3">
          {chars.map((char, charIndex) => {
            const isChinese = /[一-龥]/.test(char);
            return (
              <span
                key={charIndex}
                className={`inline-flex flex-col items-center mx-0.5 ${isChinese ? 'min-w-[28px]' : ''}`}
              >
                <span className="font-mono text-[11px] leading-5 text-muted">
                  {isChinese ? pinyinResult[charIndex] : ' '}
                </span>
                <span className="text-base leading-7 text-text">{char}</span>
              </span>
            );
          })}
        </div>
      );
    });
  }, [text]);

  const copyPlainText = async () => {
    const lines = text.split('\n');
    const out = lines
      .map((line) => {
        if (!line) return '';
        const pinyinResult = pinyin(line, { type: 'array' });
        return line
          .split('')
          .map((c, i) => (/[一-龥]/.test(c) ? `${c}(${pinyinResult[i]})` : c))
          .join('');
      })
      .join('\n');
    try {
      await navigator.clipboard.writeText(out);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {}
  };

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>{`拼音注音器 | ${site.name}`}</title>
        <meta name="description" content="PinyinAnnotator 拼音注音器，快速为中文文本添加拼音标注，支持多行文本处理。" />
        <meta name="keywords" content="拼音注音, 拼音标注, 中文拼音, 拼音学习, 拼音转换, 在线工具" />
        <meta name="author" content={site.author} />
        <link rel="canonical" href={`${site.url}/pinyin`} />
      </Helmet>

      <div className="mx-auto max-w-5xl px-6 md:px-10 py-10 md:py-14">
        {/* Header */}
        <header className="mb-8 animate-fade-in">
          <div className="text-[11px] font-mono tracking-[0.2em] uppercase text-muted mb-3">
            Pinyin Annotator
          </div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-text">
            拼音注音
          </h1>
          <p className="mt-2 text-sm text-muted">为中文文本添加拼音，自动实时转换。</p>
        </header>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Input */}
          <div className="rounded-xl border border-border bg-elevated overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
              <span className="text-xs font-medium text-muted">原文</span>
              <button
                onClick={() => setText(DEFAULT_TEXT)}
                className="inline-flex items-center gap-1 text-xs text-muted hover:text-text transition-colors"
                title="恢复范例"
              >
                <RotateCcw size={12} strokeWidth={1.8} />
                范例
              </button>
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="输入中文文本..."
              className="flex-1 w-full min-h-[280px] px-4 py-3.5 bg-transparent text-text leading-relaxed resize-none focus:outline-none"
            />
          </div>

          {/* Output */}
          <div className="rounded-xl border border-border bg-elevated overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
              <span className="text-xs font-medium text-muted">注音</span>
              {annotatedLines && (
                <button
                  onClick={copyPlainText}
                  className="inline-flex items-center gap-1 text-xs text-muted hover:text-text transition-colors"
                >
                  {copied ? <Check size={12} strokeWidth={2} className="text-success" /> : <Copy size={12} strokeWidth={1.8} />}
                  {copied ? '已复制' : '复制纯文本'}
                </button>
              )}
            </div>
            <div className="flex-1 min-h-[280px] px-4 py-3.5">
              {annotatedLines ?? (
                <p className="text-sm text-subtle">在左侧输入文本，拼音将自动生成。</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PinyinAnnotator;
