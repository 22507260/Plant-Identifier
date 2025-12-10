import React from 'react';
import ReactMarkdown from 'react-markdown';

interface MarkdownTextProps {
  content: string;
  className?: string;
}

export const MarkdownText: React.FC<MarkdownTextProps> = ({ content, className = '' }) => {
  return (
    <div className={`prose prose-sm md:prose-base max-w-full prose-green w-full break-words overflow-hidden ${className}`}>
      <ReactMarkdown
        components={{
          p: ({ node, ...props }) => <p className="mb-3 leading-relaxed text-gray-700" {...props} />,
          h1: ({ node, ...props }) => <h1 className="text-2xl font-bold mb-3 mt-4 text-green-900 leading-tight" {...props} />,
          h2: ({ node, ...props }) => <h2 className="text-xl font-bold mb-2 mt-4 text-green-800 border-b border-green-100 pb-1" {...props} />,
          h3: ({ node, ...props }) => <h3 className="text-lg font-bold mb-2 mt-3 text-green-700 flex items-center gap-2" {...props} />,
          ul: ({ node, ...props }) => <ul className="list-disc list-outside mb-4 pl-5 space-y-1 text-gray-700" {...props} />,
          ol: ({ node, ...props }) => <ol className="list-decimal list-outside mb-4 pl-5 space-y-1 text-gray-700" {...props} />,
          li: ({ node, ...props }) => <li className="pl-1" {...props} />,
          strong: ({ node, ...props }) => <strong className="font-semibold text-green-900" {...props} />,
          blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-green-300 pl-4 italic text-gray-600 my-4 bg-green-50/50 py-2 rounded-r-lg" {...props} />,
          a: ({ node, ...props }) => <a className="text-blue-600 underline hover:text-blue-800 break-all" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};