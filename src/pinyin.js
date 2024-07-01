import React, { useState } from 'react';
import { pinyin } from 'pinyin-pro';
import { Helmet } from 'react-helmet';

// https://pinyin-pro.cn/use/pinyin.html
const PinyinAnnotator = () => {
  const [text, setText] = useState('春眠不觉晓，处处闻啼鸟。\n夜来风雨声，花落知多少。');
  const [annotatedText, setAnnotatedText] = useState('');

  const addPinyin = () => {
    const pinyinResult = pinyin(text, { type: 'array' });
    console.log(pinyinResult)
    const textArray = text.split('')
    console.log(textArray)
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
        <title>PinyinAnnotator - 拼音注音器 | ww93‘s Tools | 工具站</title>
      </Helmet>
      <textarea
        className="w-full p-2 border border-gray-300 rounded mb-4"
        rows="4"
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