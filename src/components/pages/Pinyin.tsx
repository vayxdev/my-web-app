import React, { useState } from 'react';
import { pinyin } from 'pinyin-pro';
import { Helmet } from 'react-helmet';

const PinyinAnnotator: React.FC = () => {
  const [text, setText] = useState<string>('春眠不觉晓，处处闻啼鸟。\n夜来风雨声，花落知多少。');
  const [annotatedText, setAnnotatedText] = useState<React.ReactNode>('');

  const addPinyin = () => {
    const pinyinResult = pinyin(text, { type: 'array' });
    const textArray = text.split('')
    const annotated = pinyinResult.map((item, index) => (
      <React.Fragment key={index}>
        {textArray[index] !== '\n' ? (
          <span></span>
        ): (<br/>)}
        <ruby className="text-base mx-[5px]">
          {textArray[index]}
          <rt className="text-xs text-gray-500">{item}</rt>
        </ruby>
      </React.Fragment>
    ));
    setAnnotatedText(annotated);
  };

  return (
    <div className="container mx-auto p-4">
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
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "description": "中文文本拼音注音工具，支持多行文本处理"
          })}
        </script>
      </Helmet>
      <textarea
        className="w-full p-2 border border-gray-300 rounded mb-4"
        rows={4}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={addPinyin}
      >
        添加拼音注音
      </button>
      <div className="mt-4 p-4 border border-gray-300 rounded">
        {annotatedText}
      </div>
    </div>
  );
};

export default PinyinAnnotator;
