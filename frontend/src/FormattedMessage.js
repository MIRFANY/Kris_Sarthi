import React from "react";
import ReactMarkdown from "react-markdown";

/**
 * FormattedMessage Component
 * Renders chatbot messages with proper markdown formatting
 * Supports: bold, italic, lists, headers, code blocks, etc.
 */
const FormattedMessage = ({ text, isUserMessage = false, colors = {} }) => {
  // Default colors
  const defaultColors = {
    userBg: "rgba(127,255,106,0.16)",
    botBg: "rgba(255,255,255,0.06)",
    text: "rgba(255,255,255,1)",
    primary: "#7fff6a",
    accent: "#b7e4c7",
    border: "rgba(255,255,255,0.12)",
    ...colors,
  };

  // Define markdown component renderers with custom styling
  const markdownComponents = {
    // Paragraphs - normal text with better styling
    p: ({ node, children }) => (
      <p style={{ 
        margin: "8px 0", 
        lineHeight: "1.6",
        fontSize: "inherit",
        color: "inherit"
      }}>
        {children}
      </p>
    ),

    // Unordered lists - subtle background
    ul: ({ node, children }) => (
      <ul
        style={{
          margin: "8px 0",
          paddingLeft: "28px",
          listStyleType: "disc",
          lineHeight: "1.7",
          backgroundColor: `${defaultColors.primary}08`,
          borderRadius: "3px",
          padding: "8px 10px 8px 28px",
        }}
      >
        {children}
      </ul>
    ),

    // Ordered lists - subtle background
    ol: ({ node, children }) => (
      <ol
        style={{
          margin: "8px 0",
          paddingLeft: "28px",
          listStyleType: "decimal",
          lineHeight: "1.7",
          backgroundColor: `${defaultColors.primary}08`,
          borderRadius: "3px",
          padding: "8px 10px 8px 28px",
        }}
      >
        {children}
      </ol>
    ),

    // List items
    li: ({ node, children }) => (
      <li style={{ margin: "5px 0", lineHeight: "1.6", paddingLeft: "2px" }}>
        {children}
      </li>
    ),

    // Headers - visible but not too bright
    h1: ({ node, children }) => (
      <h1
        style={{
          fontSize: "19px",
          fontWeight: 700,
          margin: "10px -8px 6px -8px",
          padding: "6px 8px",
          color: "#ffffff",
          backgroundColor: `${defaultColors.primary}55`,
          borderRadius: "4px",
          lineHeight: "1.4",
          borderLeft: `4px solid ${defaultColors.primary}`,
        }}
      >
        {children}
      </h1>
    ),
    h2: ({ node, children }) => (
      <h2
        style={{
          fontSize: "17px",
          fontWeight: 700,
          margin: "9px -8px 5px -8px",
          padding: "5px 8px",
          color: "#ffffff",
          backgroundColor: `${defaultColors.primary}44`,
          borderRadius: "4px",
          lineHeight: "1.4",
          borderLeft: `4px solid ${defaultColors.primary}`,
        }}
      >
        {children}
      </h2>
    ),
    h3: ({ node, children }) => (
      <h3
        style={{
          fontSize: "15px",
          fontWeight: 700,
          margin: "8px -8px 4px -8px",
          padding: "4px 8px",
          color: `${defaultColors.primary}`,
          backgroundColor: `${defaultColors.primary}22`,
          borderRadius: "4px",
          lineHeight: "1.4",
          borderLeft: `3px solid ${defaultColors.primary}`,
        }}
      >
        {children}
      </h3>
    ),

    // Bold - visible but not too bright
    strong: ({ node, children }) => (
      <strong style={{ 
        fontWeight: 700, 
        color: defaultColors.primary,
        backgroundColor: `${defaultColors.primary}15`,
        padding: "1px 3px",
        borderRadius: "2px",
      }}>
        {children}
      </strong>
    ),

    // Italic
    em: ({ node, children }) => (
      <em style={{ fontStyle: "italic", opacity: 0.9 }}>
        {children}
      </em>
    ),

    // Code inline
    code: ({ node, inline, children }) => {
      if (inline) {
        return (
          <code
            style={{
              background: "rgba(0,0,0,0.3)",
              padding: "2px 6px",
              borderRadius: "4px",
              fontFamily: "monospace",
              fontSize: "13px",
              color: defaultColors.primary,
            }}
          >
            {children}
          </code>
        );
      }
      // Code block
      return (
        <code
          style={{
            background: "rgba(0,0,0,0.3)",
            padding: "2px 6px",
            borderRadius: "4px",
            fontFamily: "monospace",
            fontSize: "13px",
          }}
        >
          {children}
        </code>
      );
    },

    // Code block (pre + code)
    pre: ({ node, children }) => (
      <pre
        style={{
          background: "rgba(0,0,0,0.4)",
          border: `1px solid ${defaultColors.border}`,
          borderRadius: "6px",
          padding: "12px",
          overflowX: "auto",
          margin: "8px 0",
          fontFamily: "monospace",
          fontSize: "13px",
        }}
      >
        {children}
      </pre>
    ),

    // Blockquote - subtle but distinguishable
    blockquote: ({ node, children }) => (
      <blockquote
        style={{
          borderLeft: `4px solid ${defaultColors.primary}`,
          paddingLeft: "12px",
          marginLeft: "2px",
          marginRight: "0",
          marginTop: "8px",
          marginBottom: "8px",
          opacity: 1,
          fontStyle: "italic",
          borderRadius: "3px",
          backgroundColor: `${defaultColors.primary}10`,
          paddingTop: "8px",
          paddingBottom: "8px",
          paddingRight: "8px",
          color: defaultColors.text,
        }}
      >
        {children}
      </blockquote>
    ),

    // Line break handler
    br: () => <br />,

    // Link
    a: ({ node, href, children }) => (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          color: defaultColors.primary,
          textDecoration: "underline",
          cursor: "pointer",
        }}
      >
        {children}
      </a>
    ),

    // Horizontal rule
    hr: () => (
      <hr
        style={{
          border: "none",
          borderTop: `1px solid ${defaultColors.border}`,
          margin: "12px 0",
        }}
      />
    ),
  };

  return (
    <div
      style={{
        display: "inline-block",
        background: isUserMessage ? defaultColors.userBg : defaultColors.botBg,
        color: defaultColors.text,
        borderRadius: 12,
        padding: "8px 14px",
        maxWidth: "75%",
        fontSize: 15,
        wordBreak: "break-word",
        lineHeight: "1.6",
        whiteSpace: "pre-wrap",
        overflowWrap: "break-word",
      }}
    >
      <ReactMarkdown components={markdownComponents}>
        {text}
      </ReactMarkdown>
    </div>
  );
};

export default FormattedMessage;
