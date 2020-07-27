import { useState, useEffect } from "react";
import { transform } from "@babel/standalone";
import * as Acorn from "acorn";
import { generate as codeGenerate } from "escodegen";
import React from "react";
import ObjPath from "object-path";
import defaultCode from "snippets/input";

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
        <textarea value={code} onChange={handleCodeChange}></textarea>
      </div>
      <p className="error">{error}</p>
      <style jsx>
        {`
          .error {
            color: #e00;
          }
        `}
      </style>
    </>
  );
};
