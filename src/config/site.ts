export const site = {
  name: 'Fluxi',
  shortLabel: 'F',
  domain: 'fluxi.cc',
  url: 'https://fluxi.cc',
  author: 'Fluxi',
  tagline: '我的工具集',
  description: '我的工具集',
  keywords: '在线工具, 中文工具, 汉字学习, 拼音工具, 效率工具, 免费工具',
  hanziDataBase: 'https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0.1',
} as const;

export type SiteConfig = typeof site;
