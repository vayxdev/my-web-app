import React from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { ScrollText, Languages, Text, Image, LucideIcon } from 'lucide-react';

interface ToolCard {
  title: string;
  description: string;
  path: string;
  icon: LucideIcon;
  color: string;
}

const TOOLS: ToolCard[] = [
  {
    title: 'Event Logger',
    description: '记录和管理您的重要事件，支持分类和备注功能',
    path: '/event-logger',
    icon: ScrollText,
    color: 'from-blue-500 to-blue-600',
  },
  {
    title: 'Hanzi',
    description: '查看汉字笔画顺序，学习汉字书写规范',
    path: '/hanzi',
    icon: Languages,
    color: 'from-purple-500 to-purple-600',
  },
  {
    title: 'Pinyin',
    description: '为中文文本添加拼音注音，方便学习发音',
    path: '/pinyin',
    icon: Text,
    color: 'from-green-500 to-green-600',
  },
  {
    title: 'Md2Image',
    description: '将Markdown内容转换为精美图片',
    path: '/md2image',
    icon: Image,
    color: 'from-orange-500 to-orange-600',
  },
];

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Helmet>
        <title>WW93 - 实用在线工具集 | 中文工具网站</title>
        <meta name="description" content="WW93提供实用的中文在线工具，包括汉字笔画顺序查询、拼音注音、事件记录等高效工具。提升您的学习与工作效率。" />
        <meta name="keywords" content="在线工具, 中文工具, 汉字学习, 拼音工具, 效率工具, 免费工具" />
        <meta name="author" content="WW93" />
        <meta property="og:title" content="WW93 - 实用在线工具集" />
        <meta property="og:description" content="提供实用的中文在线工具，包括汉字笔画顺序查询、拼音注音、事件记录等高效工具。" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://ww93.com" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="WW93 - 实用在线工具集" />
        <meta name="twitter:description" content="提供实用的中文在线工具，包括汉字笔画顺序查询、拼音注音、事件记录等高效工具。" />
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

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">实用在线工具集</h1>
          <p className="text-gray-600 text-lg">提升您的学习与工作效率</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {TOOLS.map((tool) => (
            <button
              key={tool.path}
              className="group bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-left"
              onClick={() => navigate(tool.path)}
            >
              <div className="flex items-start gap-4">
                <div className={`bg-gradient-to-br ${tool.color} rounded-lg p-3 shadow-md group-hover:shadow-lg transition-shadow`}>
                  <tool.icon size={28} color="white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-800 mb-2 group-hover:text-gray-600 transition-colors">
                    {tool.title}
                  </h2>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {tool.description}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>

        <footer className="text-center py-6 border-t border-gray-200">
          <p className="text-gray-500 text-sm">
            <a 
              href="https://beian.miit.gov.cn/" 
              target="_blank" 
              rel="noreferrer"
              className="hover:text-gray-700 transition-colors"
            >
              浙ICP备2024104088号
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Home;
