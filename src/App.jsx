import React from "react";

function Directory(props) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [files, setFiles] = React.useState(null);

  React.useEffect(() => {
    if (props.condensed) expand();
  }, [props.condensed]);

  const expand = async () => {
    if (isExpanded) {
      setIsExpanded(false);
      return;
    }

    try {
      const fileNames = [];
      for await (const entry of props.directory.entries()) {
        fileNames.push(entry[1]);
      }
      setFiles(fileNames);
      setIsExpanded(true);
    } catch (err) {
      console.error("Error opening folder:", err);
    }
  };
  return (
    <div>
      {!props.condensed && (
        <button onClick={expand}>
          {isExpanded ? "-" : "+"} {props.directory.name}
        </button>
      )}
      {isExpanded && (
        <ul
          style={{
            marginLeft: `20px`,
          }}
        >
          {files.map((fileName, index) => {
            return (
              <li key={index}>
                {fileName.kind === "directory" ? (
                  <Directory
                    directory={fileName}
                    depth={props.depth + 1}
                    setSelectedFile={props.setSelectedFile}
                  />
                ) : (
                  <File
                    file={fileName}
                    setSelectedFile={props.setSelectedFile}
                  />
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function File(props) {
  const handleOpen = async () => {
    const fileHandle = await props.file.getFile();
    console.log(fileHandle);
    props.setSelectedFile(fileHandle);
  };
  return <button onClick={handleOpen}>File: {props.file.name}</button>;
}

function SelectedFile(props) {
  const [fileContent, setFileContent] = React.useState(null);
  const [fileType, setFileType] = React.useState(null);
  React.useEffect(() => {
    const readFile = async () => {
      const type = props.file.type;
      const content = await props.file.text();
      console.log({ content, type });
      if (type.indexOf("image") !== -1) {
        setFileType("image");
      } else {
        setFileType("text");
      }
      setFileContent(content);
    };
    readFile();
  }, [props.file]);
  return (
    <div>
      <h2>{props.file.name}</h2>
      {fileType && <p>{fileType}</p>}
      {fileType === "image" && (
        <img src={URL.createObjectURL(props.file)} alt={props.file.name} />
      )}
      {fileType === "text" && <pre>{fileContent}</pre>}
    </div>
  );
}

function App() {
  const [root, setRoot] = React.useState(null);
  const [selectedFile, setSelectedFile] = React.useState(null);
  const openFolder = async () => {
    try {
      const folderHandle = await window.showDirectoryPicker();
      console.log("root handle", folderHandle);
      setRoot(folderHandle);
    } catch (err) {
      console.error("Error opening folder:", err);
    }
  };

  return (
    <div>
      <div>
        <button onClick={openFolder}>Open Folder</button>
        {root && (
          <Directory
            condensed={true}
            directory={root}
            depth={1}
            setSelectedFile={setSelectedFile}
          />
        )}
      </div>
      {selectedFile && <SelectedFile file={selectedFile} />}
    </div>
  );
}

export default App;
