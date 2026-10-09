"use client";
import SyntaxHighlighter from "react-syntax-highlighter/dist/esm/prism-light";
import sql from "react-syntax-highlighter/dist/esm/languages/prism/sql";
import javascript from "react-syntax-highlighter/dist/esm/languages/prism/javascript";
import python from "react-syntax-highlighter/dist/esm/languages/prism/python";
import json from "react-syntax-highlighter/dist/esm/languages/prism/json";
import atomDark from "react-syntax-highlighter/dist/esm/styles/prism/atom-dark";
SyntaxHighlighter.registerLanguage("sql",sql);
SyntaxHighlighter.registerLanguage("javascript",javascript);
SyntaxHighlighter.registerLanguage("python",python);
SyntaxHighlighter.registerLanguage("json",json);
export default function CodeBlock({language,children}:{language:string;children:string}) {
  return <SyntaxHighlighter language={language} style={atomDark} PreTag="div"
    customStyle={{padding:"1rem",margin:0,backgroundColor:"transparent",fontSize:"0.875rem"}}>{children}</SyntaxHighlighter>;
}
