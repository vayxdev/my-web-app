import React, { useState, useEffect, useRef } from 'react';
import HanziWriter from 'hanzi-writer';

export default function HanziWriterDemo() {
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
    input.split('').forEach((char) => {
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
              for (var i = 0; i < charData.strokes.length; i++) {
                var strokesPortion = charData.strokes.slice(0, i + 1);
                renderFanningStrokes(containerRefs.current[char].static[i], strokesPortion);
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

  const handleInputChange = (e) => {
    setInput(e.target.value);
    setErrors({});
  };

  return (
    <div className="flex flex-col items-center p-4 space-y-4">
      <input
        type="text"
        value={input}
        onChange={handleInputChange}
        placeholder="输入汉字"
        className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <div className="w-full max-w-2xl">
        {input.split('').map((char, charIndex) => (
          <div key={charIndex} className="flex items-center mb-4">
            <div
              ref={el => containerRefs.current[char] = { ...containerRefs.current[char], dynamic: el }}
              className="w-[100px] h-[100px] border-2 border-gray-300 rounded-md mr-4"
            ></div>
            <div className="flex flex-wrap">
              {[...Array(10)].map((_, index) => (
                <div
                  key={index}
                  ref={el => {
                    if (!containerRefs.current[char]) containerRefs.current[char] = { static: [] };
                    if (!containerRefs.current[char].static) containerRefs.current[char].static = [];
                    containerRefs.current[char].static[index] = el;
                  }}
                  className="w-[50px] h-[50px] border border-gray-300 rounded-md m-1"
                ></div>
              ))}
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