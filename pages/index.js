import { useState, useEffect, useRef } from "react";
import { transform } from "@babel/standalone";
import * as Acorn from "acorn";
import { generate as codeGenerate } from "escodegen";
import React from "react";
import ObjPath, { set } from "object-path";
import defaultCode from "snippets/input";
import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs/components/prism-core";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";

export default () => {
  const [code, setCode] = useState(defaultCode);
  const [Component, setComponent] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!code) {
      return;
    }

    generateModule(code);
  }, [code]);

  const generateModule = (input) => {
    try {
      const transformedCode = transform(input, {
        sourceType: "unambiguous",
        presets: ["env", "react"],
      }).code;

      const ast = Acorn.parse(transformedCode);

      const node = findReactNode(ast, { sourceType: "module" });

      const generatedCode = codeGenerate(node);

      const selfExecModule = `return () => ${generatedCode.slice(0, -1)}()`;

      const wrapper = () => new Function("React", selfExecModule)(React);

      setComponent(wrapper);
    } catch (err) {
      console.log(String(err));
      setError(String(err));
    }
  };

  const handleCodeChange = (e) => {
    setError("");
    setCode(e.target.value);
  };

  function findReactNode(ast) {
    const { body } = ast;
    return body.find(isReactNode);
  }

  function isReactNode(node) {
    const type = node.type;
    let obj;
    let func;

    const mainBody = ObjPath.get(node, "expression.body");

    if (mainBody) {
      mainBody.body.forEach((item) => {
        obj =
          ObjPath.get(item, "argument.callee.object.name") === "React"
            ? "React"
            : null;
        func =
          ObjPath.get(item, "argument.callee.property.name") === "createElement"
            ? "createElement"
            : null;
      }, "");
    }
    return (
      type === "ExpressionStatement" &&
      obj === "React" &&
      func === "createElement"
    );
  }

  const testComponent = () => {
    try {
      Component();
      return Component ? <Component /> : null;
    } catch (err) {
      return <></>;
    }
  };

  return (
    <>
      <div className="container">{testComponent()}</div>
      <div className="editor">
        <Editor
          value={code}
          onValueChange={(_code) => {
            setCode(_code);
            setError("");
          }}
          highlight={(code) => highlight(code, languages.js)}
          padding={8}
          style={{
            fontFamily: '"Fira code", "Fira Mono", monospace',
            fontSize: 12,
          }}
          textareaClassName="editorArea"
        />
      </div>
      {error ? <p className="error">{error}</p> : null}

      <style jsx>
        {`
          .error {
            margin-top: 8px;
            padding: 10px;
            color: #fff;
            border-radius: 4px;
            font-family: sans-serif;
            background: #e00;
          }

          .editor {
            margin: 8px 0px;
            position: relative;
          }
        `}
      </style>
      <style jsx global>
        {`
          .editorArea {
            border-radius: 4px !important;
            border: 2px solid rgba(12, 12, 13, 0.1) !important;
            outline: none;
          }

          .editorArea:hover,
          .editorArea:focus {
            border-color: black !important;
          }
        `}
      </style>
    </>
  );
};
