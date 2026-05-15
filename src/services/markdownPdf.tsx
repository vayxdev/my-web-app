import React from 'react';
import {
  Document,
  Font,
  Image,
  Link,
  Page,
  Text,
  View,
  pdf,
} from '@react-pdf/renderer';

// Register a CJK-capable body font from CDN. Without this @react-pdf falls
// back to Helvetica, which doesn't have CJK and renders Chinese as garbage
// Latin-1 symbols rather than empty boxes.
const CJK_FONT_FAMILY = 'Noto Sans SC';
let cjkFontRegistered = false;
function ensureCjkFontRegistered() {
  if (cjkFontRegistered) return;
  Font.register({
    family: CJK_FONT_FAMILY,
    fonts: [
      {
        src: 'https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-sc/files/noto-sans-sc-chinese-simplified-400-normal.woff',
      },
      {
        src: 'https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-sc/files/noto-sans-sc-chinese-simplified-700-normal.woff',
        fontWeight: 700,
      },
    ],
  });
  cjkFontRegistered = true;
}
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import { toPng } from 'html-to-image';
import Prism from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-rust';

interface Theme {
  backgroundColor: string;
  textColor: string;
  headingColor: string;
  borderColor: string;
  codeBackground: string;
}

export interface RenderOpts {
  markdown: string;
  previewEl: HTMLElement;
  theme: Theme;
  fontSize: number;
  lineHeight: number;
  padding: number;
  imagePixelRatio?: number;
}

interface ImageItem {
  src: string;
  width: number;
  height: number;
}

interface ImagePool {
  blocks: ImageItem[];
  inlines: ImageItem[];
  mermaids: ImageItem[];
}

interface Counters {
  block: number;
  inline: number;
  mermaid: number;
}

interface TokenColors {
  [type: string]: string | undefined;
}

const isThemeDark = (bg: string): boolean => {
  const hex = bg.replace('#', '');
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return 0.299 * r + 0.587 * g + 0.114 * b < 140;
};

const LIGHT_TOKENS: TokenColors = {
  comment: '#6a737d',
  prolog: '#6a737d',
  doctype: '#6a737d',
  cdata: '#6a737d',
  punctuation: '#24292e',
  property: '#005cc5',
  tag: '#22863a',
  boolean: '#005cc5',
  number: '#005cc5',
  constant: '#005cc5',
  symbol: '#005cc5',
  deleted: '#b31d28',
  selector: '#22863a',
  'attr-name': '#6f42c1',
  string: '#032f62',
  char: '#032f62',
  builtin: '#005cc5',
  inserted: '#22863a',
  operator: '#d73a49',
  entity: '#005cc5',
  url: '#032f62',
  keyword: '#d73a49',
  atrule: '#d73a49',
  'attr-value': '#032f62',
  function: '#6f42c1',
  'class-name': '#6f42c1',
  regex: '#032f62',
  important: '#d73a49',
  variable: '#e36209',
};

const DARK_TOKENS: TokenColors = {
  comment: '#6a9955',
  prolog: '#6a9955',
  doctype: '#6a9955',
  cdata: '#6a9955',
  punctuation: '#d4d4d4',
  property: '#9cdcfe',
  tag: '#569cd6',
  boolean: '#569cd6',
  number: '#b5cea8',
  constant: '#9cdcfe',
  symbol: '#9cdcfe',
  deleted: '#f44747',
  selector: '#d7ba7d',
  'attr-name': '#9cdcfe',
  string: '#ce9178',
  char: '#ce9178',
  builtin: '#4ec9b0',
  inserted: '#6a9955',
  operator: '#d4d4d4',
  entity: '#569cd6',
  url: '#ce9178',
  keyword: '#569cd6',
  atrule: '#569cd6',
  'attr-value': '#ce9178',
  function: '#dcdcaa',
  'class-name': '#4ec9b0',
  regex: '#d16969',
  important: '#569cd6',
  variable: '#9cdcfe',
};

// A4 portrait usable width in points (1pt = 1/72in), minus default padding.
const PAGE_USABLE_WIDTH_PT = 595;

async function extractImages(
  previewEl: HTMLElement,
  pixelRatio: number
): Promise<ImagePool> {
  const displayEls = Array.from(
    previewEl.querySelectorAll<HTMLElement>('.katex-display')
  );
  const allKatexEls = Array.from(
    previewEl.querySelectorAll<HTMLElement>('.katex')
  );
  const inlineEls = allKatexEls.filter((el) => !el.closest('.katex-display'));
  const mermaidEls = Array.from(
    previewEl.querySelectorAll<HTMLElement>('.md-mermaid-svg')
  );

  const grab = async (el: HTMLElement): Promise<ImageItem> => {
    try {
      const src = await toPng(el, {
        pixelRatio,
        backgroundColor: 'transparent',
      });
      return { src, width: el.offsetWidth, height: el.offsetHeight };
    } catch {
      return { src: '', width: 0, height: 0 };
    }
  };

  const [blocks, inlines, mermaids] = await Promise.all([
    Promise.all(displayEls.map(grab)),
    Promise.all(inlineEls.map(grab)),
    Promise.all(mermaidEls.map(grab)),
  ]);
  return { blocks, inlines, mermaids };
}

interface Context {
  opts: RenderOpts;
  images: ImagePool;
  counters: Counters;
  tokens: TokenColors;
  codeFallback: string;
}

function renderPrismTokens(
  prismTokens: Array<string | Prism.Token>,
  tokens: TokenColors,
  fallback: string,
  keyBase = ''
): React.ReactNode[] {
  return prismTokens.map((tok, i) => {
    const key = `${keyBase}${i}`;
    if (typeof tok === 'string') {
      return <Text key={key}>{tok}</Text>;
    }
    const typeList: string[] = [];
    if (Array.isArray(tok.type)) typeList.push(...tok.type);
    else if (tok.type) typeList.push(tok.type);
    if (tok.alias) {
      if (Array.isArray(tok.alias)) typeList.push(...tok.alias);
      else typeList.push(tok.alias);
    }
    const color =
      typeList.map((t) => tokens[t]).find(Boolean) || fallback;
    const content = tok.content as string | Prism.Token | Array<string | Prism.Token>;
    if (typeof content === 'string') {
      return <Text key={key} style={{ color }}>{content}</Text>;
    }
    if (Array.isArray(content)) {
      return (
        <Text key={key} style={{ color }}>
          {renderPrismTokens(content, tokens, color, `${key}-`)}
        </Text>
      );
    }
    // single Token
    return (
      <Text key={key} style={{ color }}>
        {renderPrismTokens([content], tokens, color, `${key}-`)}
      </Text>
    );
  });
}

function renderCodeBlock(node: any, ctx: Context, key: number) {
  const lang = (node.lang || '').toLowerCase();
  const grammar = lang ? Prism.languages[lang] : undefined;
  let body: React.ReactNode;
  if (grammar) {
    const tokens = Prism.tokenize(node.value as string, grammar);
    body = renderPrismTokens(tokens, ctx.tokens, ctx.codeFallback);
  } else {
    body = <Text>{node.value}</Text>;
  }
  return (
    <View
      key={key}
      style={{
        backgroundColor: ctx.opts.theme.codeBackground,
        padding: 10,
        borderRadius: 4,
        marginBottom: 10,
      }}
    >
      <Text
        style={{
          fontFamily: 'Courier',
          fontSize: ctx.opts.fontSize * 0.85,
          color: ctx.codeFallback,
          lineHeight: 1.5,
        }}
      >
        {body}
      </Text>
    </View>
  );
}

function renderList(node: any, ctx: Context, key: number): React.ReactNode {
  const ordered = !!node.ordered;
  let n = (node.start as number) || 1;
  return (
    <View key={key} style={{ marginBottom: 10, paddingLeft: 4 }}>
      {node.children.map((item: any, i: number) => {
        const marker = ordered ? `${n++}.` : '•';
        return (
          <View
            key={i}
            style={{ flexDirection: 'row', marginBottom: 4, alignItems: 'flex-start' }}
          >
            <Text
              style={{
                width: 20,
                color: ctx.opts.theme.textColor,
              }}
            >
              {marker}
            </Text>
            <View style={{ flex: 1 }}>{renderNodes(item.children, ctx)}</View>
          </View>
        );
      })}
    </View>
  );
}

function renderTable(node: any, ctx: Context, key: number) {
  const rows = node.children || [];
  return (
    <View
      key={key}
      style={{
        marginBottom: 10,
        borderWidth: 1,
        borderColor: ctx.opts.theme.borderColor,
        borderStyle: 'solid',
      }}
    >
      {rows.map((row: any, ri: number) => (
        <View
          key={ri}
          style={{
            flexDirection: 'row',
            borderBottomWidth: ri === rows.length - 1 ? 0 : 1,
            borderColor: ctx.opts.theme.borderColor,
            borderStyle: 'solid',
          }}
        >
          {(row.children || []).map((cell: any, ci: number) => (
            <View
              key={ci}
              style={{
                flex: 1,
                padding: 6,
                borderRightWidth: ci === row.children.length - 1 ? 0 : 1,
                borderColor: ctx.opts.theme.borderColor,
                borderStyle: 'solid',
              }}
            >
              <Text style={ri === 0 ? { fontWeight: 'bold' } : undefined}>
                {renderInline(cell.children, ctx)}
              </Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

function renderInline(children: any[] = [], ctx: Context): React.ReactNode[] {
  return children.map((child, i): React.ReactNode => {
    switch (child.type) {
      case 'text':
        return <Text key={i}>{child.value}</Text>;
      case 'strong':
        return (
          <Text key={i} style={{ fontWeight: 'bold' }}>
            {renderInline(child.children, ctx)}
          </Text>
        );
      case 'emphasis':
        return (
          <Text key={i} style={{ fontStyle: 'italic' }}>
            {renderInline(child.children, ctx)}
          </Text>
        );
      case 'delete':
        return (
          <Text key={i} style={{ textDecoration: 'line-through' }}>
            {renderInline(child.children, ctx)}
          </Text>
        );
      case 'inlineCode':
        return (
          <Text
            key={i}
            style={{
              backgroundColor: ctx.opts.theme.codeBackground,
              fontFamily: 'Courier',
              fontSize: ctx.opts.fontSize * 0.9,
            }}
          >
            {child.value}
          </Text>
        );
      case 'link':
        return (
          <Link
            key={i}
            src={child.url}
            style={{
              color: ctx.opts.theme.headingColor,
              textDecoration: 'underline',
            }}
          >
            {renderInline(child.children, ctx)}
          </Link>
        );
      case 'inlineMath':
        // @react-pdf can't put <Image> inside <Text>, so fall back to the
        // raw TeX source rendered in monospace. Block math gets a real image.
        return (
          <Text key={i} style={{ fontFamily: 'Courier' }}>
            {child.value}
          </Text>
        );
      case 'break':
        return <Text key={i}>{'\n'}</Text>;
      default:
        return null;
    }
  });
}

function fitImageWidth(item: ImageItem, maxPt: number) {
  if (!item.width || !item.height) return { width: undefined, height: undefined };
  const w = Math.min(item.width, maxPt);
  const h = item.height * (w / item.width);
  return { width: w, height: h };
}

function renderNode(node: any, ctx: Context, key: number): React.ReactNode {
  switch (node.type) {
    case 'heading': {
      const sizes = [2, 1.5, 1.25, 1.1, 1, 0.9];
      const depth = Math.max(1, Math.min(6, node.depth || 1));
      const fontSize = ctx.opts.fontSize * sizes[depth - 1];
      const isH1 = depth === 1;
      return (
        <View
          key={key}
          style={{
            alignSelf: 'stretch',
            marginBottom: 10,
            marginTop: key === 0 ? 0 : 8,
            ...(isH1
              ? {
                  borderBottomWidth: 1,
                  borderColor: ctx.opts.theme.borderColor,
                  borderStyle: 'solid',
                  paddingBottom: 6,
                }
              : {}),
          }}
        >
          <Text
            style={{
              fontSize,
              lineHeight: 1.3,
              fontWeight: 'bold',
              color: ctx.opts.theme.headingColor,
            }}
          >
            {renderInline(node.children, ctx)}
          </Text>
        </View>
      );
    }
    case 'paragraph':
      return (
        <View key={key} style={{ marginBottom: 8 }}>
          <Text>{renderInline(node.children, ctx)}</Text>
        </View>
      );
    case 'list':
      return renderList(node, ctx, key);
    case 'code': {
      if ((node.lang || '').toLowerCase() === 'mermaid') {
        const item = ctx.images.mermaids[ctx.counters.mermaid++];
        if (!item || !item.src) return null;
        const usable = PAGE_USABLE_WIDTH_PT - ctx.opts.padding * 2;
        const dims = fitImageWidth(item, usable);
        return (
          <View key={key} style={{ alignItems: 'center', marginBottom: 10 }}>
            <Image src={item.src} style={dims} />
          </View>
        );
      }
      return renderCodeBlock(node, ctx, key);
    }
    case 'blockquote':
      return (
        <View
          key={key}
          style={{
            borderLeftWidth: 3,
            borderColor: ctx.opts.theme.headingColor,
            borderStyle: 'solid',
            paddingLeft: 12,
            marginBottom: 10,
          }}
        >
          {renderNodes(node.children, ctx)}
        </View>
      );
    case 'thematicBreak':
      return (
        <View
          key={key}
          style={{
            borderTopWidth: 1,
            borderColor: ctx.opts.theme.borderColor,
            borderStyle: 'solid',
            marginTop: 10,
            marginBottom: 10,
          }}
        />
      );
    case 'table':
      return renderTable(node, ctx, key);
    case 'math': {
      const item = ctx.images.blocks[ctx.counters.block++];
      if (!item || !item.src) return null;
      const usable = PAGE_USABLE_WIDTH_PT - ctx.opts.padding * 2;
      const dims = fitImageWidth(item, usable);
      return (
        <View key={key} style={{ alignItems: 'center', marginBottom: 10 }}>
          <Image src={item.src} style={dims} />
        </View>
      );
    }
    case 'html':
      return null;
    default:
      return null;
  }
}

function renderNodes(nodes: any[], ctx: Context): React.ReactNode[] {
  return nodes.map((node, i) => renderNode(node, ctx, i));
}

export async function renderMarkdownToPdfBlob(
  opts: RenderOpts
): Promise<Blob> {
  ensureCjkFontRegistered();
  const tree = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkMath)
    .parse(opts.markdown) as any;

  const images = await extractImages(opts.previewEl, opts.imagePixelRatio || 3);
  const isDark = isThemeDark(opts.theme.backgroundColor);
  const ctx: Context = {
    opts,
    images,
    counters: { block: 0, inline: 0, mermaid: 0 },
    tokens: isDark ? DARK_TOKENS : LIGHT_TOKENS,
    codeFallback: isDark ? '#d4d4d4' : '#24292e',
  };

  const doc = (
    <Document>
      <Page
        size="A4"
        style={{
          backgroundColor: opts.theme.backgroundColor,
          color: opts.theme.textColor,
          padding: opts.padding,
          fontSize: opts.fontSize,
          lineHeight: opts.lineHeight,
          fontFamily: CJK_FONT_FAMILY,
        }}
      >
        {renderNodes(tree.children, ctx)}
      </Page>
    </Document>
  );

  return await pdf(doc).toBlob();
}
