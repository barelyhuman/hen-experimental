export default ` ()=>{

  const Input = (props) => {
    return (
      <>
        <input {...props} />
        <style jsx>{\`
          input {
            background: #fff;
            color: #000;
            font-weight:bold;
            border: 2px solid #333;
            border-radius: 4px;
            height: 32px;
            padding: 0 16px;
            display: inline-flex;
            justify-content: center;
            align-items: center;
            transition: all 0.2s ease;
          }
  
          input:hover,input:focus {
            border-color:dodgerblue;
            outline:dodgerblue;
          }
        \`}</style>
      </>
    );
  };
  
  return <Input placeholder="hello" />
  }`;
