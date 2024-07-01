import React, { useState, useEffect, useRef } from 'react';
import HanziWriter from 'hanzi-writer';
import { Helmet } from 'react-helmet';

const Hanzi = () => {
  const [input, setInput] = useState('');
  const [errors, setErrors] = useState({});
  const dynamicWritersRef = useRef({});
  const staticWritersRef = useRef({});
  const containerRefs = useRef({});

  useEffect(() => {
    return () => {
      // Clean up all HanziWriter instances when component unmounts
      Object.values(dynamicWritersRef.current).forEach(writer => {
        if (writer) writer.target.innerHTML = '';
      });
      Object.values(staticWritersRef.current).forEach(writers => {
        writers.forEach(writer => {
          if (writer) writer.target.innerHTML = '';
        });
      });
      dynamicWritersRef.current = {};
      staticWritersRef.current = {};
    };
  }, []);

  useEffect(() => {
    const newErrors = {};

    // Remove writers for characters that are no longer in the input
    Object.keys(dynamicWritersRef.current).forEach(char => {
      if (!input.includes(char)) {
        if (dynamicWritersRef.current[char]) {
          dynamicWritersRef.current[char].target.innerHTML = '';
          delete dynamicWritersRef.current[char];
        }
        if (staticWritersRef.current[char]) {
          staticWritersRef.current[char].forEach(writer => writer.target.innerHTML = '');
          delete staticWritersRef.current[char];
        }
        if (containerRefs.current[char]) {
          delete containerRefs.current[char];
        }
      }
    });

    const renderFanningStrokes = (target, strokes) => {
      var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.style.width = '50px';
      svg.style.height = '50px';
      svg.style.border = '1px solid #EEE'
      svg.style.marginRight = '3px'
      target.appendChild(svg);
      var group = document.createElementNS('http://www.w3.org/2000/svg', 'g');

      // set the transform property on the g element so the character renders at 75x75
      var transformData = HanziWriter.getScalingTransform(50, 50);
      group.setAttributeNS(null, 'transform', transformData.transform);
      svg.appendChild(group);

      strokes.forEach(function (strokePath) {
        var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttributeNS(null, 'd', strokePath);
        // style the character paths
        path.style.fill = '#555';
        group.appendChild(path);
      });
    }

    // Create or update writers for each character in the input
    // 过滤掉非汉字的字符
    input.split('').filter(char => /[\u4e00-\u9fa5]/.test(char)).forEach((char) => {
      if (containerRefs.current[char]) {
        const loadCharacter = async () => {
          try {
            const charData = await HanziWriter.loadCharacterData(char);

            // Create dynamic writer
            if (!dynamicWritersRef.current[char]) {
              dynamicWritersRef.current[char] = HanziWriter.create(containerRefs.current[char].dynamic, char, {
                width: 100,
                height: 100,
                padding: 5,
                showOutline: true,
                strokeAnimationSpeed: 1,
                delayBetweenStrokes: 500,
              });
              dynamicWritersRef.current[char].loopCharacterAnimation();
            }

            // Create static writers for each stroke
            if (!staticWritersRef.current[char]) {
              staticWritersRef.current[char] = [];
              for (let i = 0; i < charData.strokes.length; i++) {
                let container = document.createElement('div');
                container.className = 'w-[50px] h-[50px] border border-gray-300 rounded-md m-1';
                containerRefs.current[char].static.appendChild(container);
                renderFanningStrokes(container, charData.strokes.slice(0, i + 1));
              }
            }
          } catch (error) {
            console.error(`Error loading character data for "${char}":`, error);
            newErrors[char] = `无法加载字符 "${char}" 的数据`;
          }
        };

        loadCharacter();
      }
    });

    setErrors(newErrors);
  }, [input]);

  // https://hanziwriter.org/docs.html
  const handleInputChange = (e) => {
    setInput(e.target.value);
    setErrors({});
  };

  return (
    <div className="flex flex-col items-center p-4 space-y-4">
      <Helmet>
        <title>HanziWriter - 汉字笔画顺序 | ww93‘s Tools | 工具站</title>
      </Helmet>
      <input
        type="text"
        value={input}
        onChange={handleInputChange}
        placeholder="输入汉字"
        className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <div className="w-full max-w-2xl">
        {input.split('').filter(char => /[\u4e00-\u9fa5]/.test(char)).map((char, charIndex) => (
          <div key={charIndex} className="flex items-center mb-4">
            <div
              ref={el => containerRefs.current[char] = { ...containerRefs.current[char], dynamic: el, static: el }}
              className="w-[100px] h-[100px] border-2 border-gray-300 rounded-md mr-4"
            ></div>
            <div className="flex flex-wrap" ref={el => {
              if (containerRefs.current[char]) containerRefs.current[char].static = el;
            }}>
              {/* 静态笔画容器会动态插入到这里 */}
            </div>
            {errors[char] && (
              <div className="text-red-500 text-sm ml-2">{errors[char]}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Hanzi;