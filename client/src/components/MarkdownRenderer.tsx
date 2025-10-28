import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { MarkdownRendererProps } from '../types';
import type { Components } from 'react-markdown';

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const components: Components = {
    // Custom code block rendering with syntax highlighting
    code({ node, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '');
      const language = match ? match[1] : '';
      const isInline = !match;

      return !isInline ? (
        <div className="relative group my-4">
          {/* Language badge */}
          <div className="absolute top-0 right-0 px-3 py-1 text-xs font-medium text-gray-300 bg-gray-800 rounded-bl-lg rounded-tr-lg z-10">
            {language}
          </div>

          {/* Code block */}
          <SyntaxHighlighter
            style={vscDarkPlus as any}
            language={language}
            PreTag="div"
            className="rounded-lg !mt-0"
            customStyle={{
              margin: 0,
              padding: '1.5rem',
              paddingTop: '2.5rem',
              fontSize: '0.875rem',
              lineHeight: '1.5',
            }}
          >
            {String(children).replace(/\n$/, '')}
          </SyntaxHighlighter>

          {/* Copy button */}
          <button
            onClick={() => {
              navigator.clipboard.writeText(String(children));
            }}
            className="absolute top-2 right-12 opacity-0 group-hover:opacity-100 transition-opacity duration-200 px-2 py-1 text-xs font-medium text-gray-300 hover:text-white bg-gray-700 hover:bg-gray-600 rounded z-10"
            title="Copy code"
          >
            Copy
          </button>
        </div>
      ) : (
        <code className="px-1.5 py-0.5 text-sm font-mono bg-gray-200 text-gray-800 rounded" {...props}>
          {children}
        </code>
      );
    },

    // Paragraphs
    p({ children }) {
      return <p className="mb-3 leading-relaxed text-gray-800">{children}</p>;
    },

    // Headings
    h1({ children }) {
      return <h1 className="text-2xl font-bold mt-6 mb-4 text-gray-900">{children}</h1>;
    },
    h2({ children }) {
      return <h2 className="text-xl font-bold mt-5 mb-3 text-gray-900">{children}</h2>;
    },
    h3({ children }) {
      return <h3 className="text-lg font-semibold mt-4 mb-2 text-gray-900">{children}</h3>;
    },

    // Lists
    ul({ children }) {
      return <ul className="list-disc list-inside mb-3 space-y-1 text-gray-800">{children}</ul>;
    },
    ol({ children }) {
      return <ol className="list-decimal list-inside mb-3 space-y-1 text-gray-800">{children}</ol>;
    },
    li({ children }) {
      return <li className="leading-relaxed">{children}</li>;
    },

    // ✅ Fixed Link Component
    a({ href, children }) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 underline font-medium"
        >
          {children}
        </a>
      );
    },

    // Blockquotes
    blockquote({ children }) {
      return (
        <blockquote className="border-l-4 border-gray-300 pl-4 py-2 my-4 italic text-gray-700 bg-gray-50">
          {children}
        </blockquote>
      );
    },

    // Tables
    table({ children }) {
      return (
        <div className="overflow-x-auto my-4">
          <table className="min-w-full divide-y divide-gray-300 border border-gray-300">
            {children}
          </table>
        </div>
      );
    },
    thead({ children }) {
      return <thead className="bg-gray-100">{children}</thead>;
    },
    tbody({ children }) {
      return <tbody className="bg-white divide-y divide-gray-200">{children}</tbody>;
    },
    tr({ children }) {
      return <tr>{children}</tr>;
    },
    th({ children }) {
      return (
        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900">
          {children}
        </th>
      );
    },
    td({ children }) {
      return <td className="px-4 py-2 text-sm text-gray-700">{children}</td>;
    },

    // Horizontal rule
    hr() {
      return <hr className="my-6 border-t border-gray-300" />;
    },

    // Text formatting
    strong({ children }) {
      return <strong className="font-bold text-gray-900">{children}</strong>;
    },
    em({ children }) {
      return <em className="italic text-gray-800">{children}</em>;
    },
  };

  return (
    <div className="markdown-content prose prose-sm max-w-none">
      <ReactMarkdown components={components}>{content}</ReactMarkdown>
    </div>
  );
};
