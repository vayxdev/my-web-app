import React from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { Languages, Type, FileImage, ArrowRight, LucideIcon } from 'lucide-react';
import { site } from '../../config/site';

interface Tool {
  title: string;
  description: string;
  path: string;
  icon: LucideIcon;
}

const TOOLS: Tool[] = [
  {
    title: 'Markdown 排版',
    description: '将 Markdown 转换为图片或 PDF，多种主题与排版可选。',
    path: '/markdown',
    icon: FileImage,
  },
  {
    title: '汉字笔画',
    description: '动态演示汉字书写过程，展示每个笔画的先后顺序。',
    path: '/hanzi',
    icon: Languages,
  },
  {
    title: '拼音注音',
    description: '为中文文本添加拼音标注，支持实时转换、多行处理。',
    path: '/pinyin',
    icon: Type,
  },
];

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>{`${site.name} — ${site.tagline}`}</title>
        <meta name="description" content={site.description} />
        <meta name="keywords" content={site.keywords} />
        <meta name="author" content={site.author} />
        <meta property="og:title" content={`${site.name} — ${site.tagline}`} />
        <meta property="og:description" content="提供实用的中文在线工具：汉字笔画、拼音注音、Markdown 排版。" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={site.url} />
        <link rel="canonical" href={site.url} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": site.name,
            "url": site.url,
            "description": "实用中文在线工具集",
          })}
        </script>
      </Helmet>

      <div className="mx-auto max-w-5xl px-6 md:px-10 py-12 md:py-20">
        {/* Header */}
        <header className="mb-12 md:mb-16 animate-fade-in">
          <div className="text-[11px] font-mono tracking-[0.2em] uppercase text-muted mb-4">
            Toolbox · 工具集
          </div>
          <h1 className="text-3xl md:text-5xl font-semibold tracking-tight text-text">
            {site.tagline}
          </h1>
          <p className="mt-4 max-w-xl text-muted leading-relaxed">
            一组简洁、专注的中文工具。无需登录，本地存储，开箱即用。
          </p>
        </header>

        {/* Tools grid */}
        <section aria-label="工具列表">
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TOOLS.map((tool) => {
              const Icon = tool.icon;
              return (
                <li key={tool.path}>
                  <button
                    onClick={() => navigate(tool.path)}
                    className="group relative w-full h-full text-left rounded-xl border border-border bg-elevated p-6 transition-all duration-200 hover:border-subtle hover:shadow-soft"
                  >
                    <div className="flex items-center justify-between mb-5">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-surface text-muted group-hover:bg-accent-soft group-hover:text-accent transition-colors">
                        <Icon size={18} strokeWidth={1.8} />
                      </span>
                      <ArrowRight
                        size={16}
                        strokeWidth={1.8}
                        className="text-subtle transition-all duration-200 group-hover:text-accent group-hover:translate-x-0.5"
                      />
                    </div>
                    <h2 className="text-base font-semibold text-text mb-1.5">
                      {tool.title}
                    </h2>
                    <p className="text-sm text-muted leading-relaxed">
                      {tool.description}
                    </p>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Footer */}
        <footer className="mt-16 md:mt-24 pt-8 border-t border-border">
          <div className="flex items-center gap-2 text-sm text-muted">
            <span className="font-semibold text-text">{site.name}</span>
            <span className="text-subtle">— {site.tagline}</span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Home;
