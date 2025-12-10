import { useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface LatexRendererProps {
  latex: string;
  displayMode?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Renders LaTeX mathematical expressions using KaTeX
 * Handles both inline ($...$) and display ($$...$$) math
 */
export default function LatexRenderer({
  latex,
  displayMode = false,
  className = '',
  style = {}
}: LatexRendererProps) {
  const renderedHtml = useMemo(() => {
    try {
      // Clean up the LaTeX string - handle common subscript/superscript patterns
      let cleanLatex = latex;

      // If it doesn't look like LaTeX, wrap simple subscripts
      if (!latex.includes('\\') && !latex.includes('{')) {
        // Convert simple patterns like L_k to L_{k}
        cleanLatex = latex
          .replace(/([A-Za-z])_([A-Za-z0-9])/g, '$1_{$2}')
          .replace(/([A-Za-z])\^([A-Za-z0-9])/g, '$1^{$2}');
      }

      return katex.renderToString(cleanLatex, {
        displayMode,
        throwOnError: false,
        strict: false,
        trust: true,
        macros: {
          // Common macros for DeFi/AMM notation
          '\\R': '\\mathbb{R}',
          '\\N': '\\mathbb{N}',
          '\\Z': '\\mathbb{Z}',
        }
      });
    } catch (error) {
      // Fallback to plain text if LaTeX parsing fails
      return `<span class="latex-error">${latex}</span>`;
    }
  }, [latex, displayMode]);

  return (
    <span
      className={`latex-rendered ${className}`}
      style={style}
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  );
}

/**
 * Parse and render a string that may contain mixed text and LaTeX
 * Handles inline $...$ and display $$...$$ delimiters
 */
export function MixedLatexRenderer({
  content,
  className = '',
  style = {}
}: {
  content: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const parts = useMemo(() => {
    const result: { type: 'text' | 'latex' | 'displayLatex'; content: string }[] = [];

    // Match $$...$$ (display) and $...$ (inline)
    const regex = /(\$\$[\s\S]*?\$\$|\$[^$]+\$)/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(content)) !== null) {
      // Add text before this match
      if (match.index > lastIndex) {
        result.push({
          type: 'text',
          content: content.slice(lastIndex, match.index)
        });
      }

      // Add the LaTeX part
      const matched = match[0];
      if (matched.startsWith('$$')) {
        result.push({
          type: 'displayLatex',
          content: matched.slice(2, -2)
        });
      } else {
        result.push({
          type: 'latex',
          content: matched.slice(1, -1)
        });
      }

      lastIndex = regex.lastIndex;
    }

    // Add remaining text
    if (lastIndex < content.length) {
      result.push({
        type: 'text',
        content: content.slice(lastIndex)
      });
    }

    return result;
  }, [content]);

  return (
    <span className={className} style={style}>
      {parts.map((part, index) => {
        if (part.type === 'text') {
          return <span key={index}>{part.content}</span>;
        }
        return (
          <LatexRenderer
            key={index}
            latex={part.content}
            displayMode={part.type === 'displayLatex'}
          />
        );
      })}
    </span>
  );
}
