export default ` ()=>{

    const Input = (props) => {
      return (
        <>
          <input {...props} />
          <style jsx>{\`
            input {
              background: #fff;
              color: #000;
              border: 2px solid rgba(12,12,13,0.1);
              border-radius: 4px;
              height: 32px;
              padding: 0 16px;
              display: inline-flex;
              justify-content: center;
              align-items: center;
              transition: all 0.2s ease;
            }
    
            input:hover,input:focus {
              border-color:#000;
              outline:#000;
            }
          \`}</style>
        </>
      );
    };
    
    return <Input placeholder="hello" />
    }`;
