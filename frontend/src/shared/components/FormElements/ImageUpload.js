import React, { useRef, useState, useEffect } from 'react';

import Button from './Button';
import './ImageUpload.css';

const ImageUpload = props => {
  const [file, setFile] = useState();
  const [previewUrl, setPreviewUrl] = useState();
  const [isValid, setIsValid] = useState(false);

  const filePickerRef = useRef();

  useEffect(() => {
    if (!file) {
      return;
    }
    const fileReader = new FileReader();
    console.log(fileReader)
    fileReader.onload = () => {
      setPreviewUrl(fileReader.result);
    };
    fileReader.readAsDataURL(file);
  }, [file]);

  const pickedHandler = event => {
    let pickedFile;
    let fileIsValid = isValid;
    if (event.target.files && event.target.files.length === 1) {
      pickedFile = event.target.files[0]; // arraylikeobject
      setFile(pickedFile);
      setIsValid(true); 
      fileIsValid = true;
    } else {
      setIsValid(false);
      fileIsValid = false;
    }
    props.onInput(props.id, pickedFile, fileIsValid);
  };

  const pickImageHandler = () => {
    filePickerRef.current.click();
  };

  return (
    <div className="form-control">
      <input
        id={props.id}
        ref={filePickerRef}
        style={{ display: 'none' }}  // ovo je povezano sa pickImageHandler funkcijom
        type="file"
        accept=".jpg,.png,.jpeg"
        onChange={pickedHandler}
      />
      <div className={`image-upload ${props.center && 'center'}`}>
        <div className="image-upload__preview">
          {previewUrl && <img src={previewUrl} alt="Preview" />}
          {!previewUrl && <p>Please pick an image.</p>}
        </div>
        <Button type="button" onClick={pickImageHandler}>
          PICK IMAGE
        </Button>
      </div>
      {!isValid && <p>{props.errorText}</p>}
    </div>
  );
};

export default ImageUpload;

//////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////




// import React, { useRef, useState, useEffect } from 'react';

// import Button from './Button';
// import './ImageUpload.css';

// const ImageUpload = props => {
//   const [file, setFile] = useState();
//   const [previewUrl, setPreviewUrl] = useState();
//   const [isValid, setIsValid] = useState(false);

//   // const filePickerRef = useRef();

//   useEffect(() => {
//     if (!file) {
//       return;
//     }
//     const fileReader = new FileReader();
//     console.log(fileReader)
//     fileReader.onload = () => {
//       setPreviewUrl(fileReader.result);
//     };
//     fileReader.readAsDataURL(file);
//   }, [file]);

//   const pickedHandler = event => {
//     let pickedFile;
//     let fileIsValid = isValid;
//     if (event.target.files && event.target.files.length === 1) {
//       pickedFile = event.target.files[0]; // arraylikeobject
//       setFile(pickedFile);
//       setIsValid(true); // ovim se samo scheduluje probena statea -> iz zbog toga ne moze da se na kraju funkcije stavi props.onInput(props.id,pickedFile,isValid), vec mora da se kreira nova varijabla fileIsValid
//       fileIsValid = true;
//     } else {
//       setIsValid(false);
//       fileIsValid = false;
//     }
//     props.onInput(props.id, pickedFile, fileIsValid); //// ne moze da se stavi props.onInput(props.id,pickedFile,fileIsValid)


//     // props.onInput('image', event.target.files, true); // -> vraca FileList
//     // props.onInput('image', event.target.files[0], true); // -> vraca File
//     // props.onInput('image', event.target.value, true); // -> vraca putanju fajla
//   };

//   // const pickImageHandler = () => {
//   //   // filePickerRef.current.click();
//   //   console.log('Ova funkcija ne radi nista, ako se u inputu izbaci -> style={{ display: "none" }} ')
//   // };

//   return (
//     <div className="form-control">
//       <input
//         id={props.id}
//         // ref={filePickerRef}
//         // style={{ display: 'none' }}  // ovo je povezano sa pickImageHandler funkcijom
//         type="file"
//         accept=".jpg,.png,.jpeg"
//         onChange={pickedHandler}
//       />
//       <div className={`image-upload ${props.center && 'center'}`}>
//         <div className="image-upload__preview">
//           {previewUrl && <img src={previewUrl} alt="Preview" />}
//           {!previewUrl && <p>Please pick an image.</p>}
//         </div>
//         {/* <Button type="button" onClick={pickImageHandler}>
//           PICK IMAGE
//         </Button> */}
//       </div>
//       {!isValid && <p>{props.errorText}</p>}
//     </div>
//   );
// };

// export default ImageUpload;


