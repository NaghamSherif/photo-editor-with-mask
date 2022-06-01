import { useCallback, useLayoutEffect, useState, useRef } from "react";
import { useDropzone } from "react-dropzone";
import usePanZoom from "use-pan-and-zoom";

import "../styles/photo-editor.scss";
import ratios from '../config/ratios.js'

const PhotoEditor = () => {
  const [screenHeight, setHight] = useState(window.innerHeight);
  const [screenWidth, setWidth] = useState(window.innerWidth);

  const { transform, panZoomHandlers, setContainer, setPan  } = usePanZoom({
    //set the limits of panning based on screen size
    minX: ratios.MIN_X*screenWidth,
    minY: ratios.MIN_Y*screenHeight,
    maxX: ratios.MAX_X*screenWidth,
    maxY: ratios.MAX_Y*screenHeight,

    initialPan: {x:screenWidth*ratios.CENTER_X, y:screenHeight*ratios.CENTER_Y},

    minZoom: 1,
  });

//relocat the image every time the screen size changes
useLayoutEffect(() => {
    function updateSize() {
      setHight(window.innerHeight);
      setWidth(window.innerWidth);
      setPan({x: screenWidth*ratios.CENTER_X, y: screenHeight*ratios.CENTER_Y});
    }
    window.addEventListener('resize', updateSize);
    updateSize();
  }, []);

 

  const onDrop = useCallback((droppedFiles) => {
        //
  }, []);

  const { acceptedFiles, getRootProps, getInputProps, isDragActive } =
    useDropzone({
      onDrop,
      maxFiles: 1,
      multiple: false,
      accept: "image/*",
    });

  const selectedImage = acceptedFiles.length > 0 && (
    <img
      alt={acceptedFiles[0].name}
      key={acceptedFiles[0].path}
      src={URL.createObjectURL(acceptedFiles[0])}
    />
  );

  const ref = useRef();
  const takeshot= async () => {
    const stream = await navigator.mediaDevices.getDisplayMedia({
       video: {mediaSource: 'screen'}
     }).then( (mediaStream)=>{
       //setting a timer so I don't capture the permetion window.
       setTimeout(async () => {const track = mediaStream.getVideoTracks()[0];
    const image = await new ImageCapture(track);
    const bitmap = await image.grabFrame();
    track.stop();
    const canvas = ref.current;
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const context = canvas.getContext('2d');
    context.drawImage(bitmap,0,0,790,bitmap.height/2);
    const img = canvas.toDataURL();
    //download image
    const a = document.createElement("a");
    a.href = img;
    a.download = 'img.png';
    a.click();
  return img;
     }, 1000)
    })
  }

  return (
    <div className="App" >
      <button onClick={takeshot}>take screenshot</button>
      <div className="photo-editor" >
        <canvas ref={ref} style={{width: 0}}/>
        <div className="photo-viewer">
          <div
            className="image-outer-container"
            ref={(el) => setContainer(el)}
            {...panZoomHandlers}
          >
            <div className="image-inner-container" style={{ transform }}>
              {selectedImage}
            </div>
          </div>
        </div>
        <div className="drop-zone" {...getRootProps()}>
          <input {...getInputProps()} />
          <div className="text">
            {isDragActive ? (
              <p>Drop the images here</p>
            ) : (
              <div>
                <i className="n-icon n-icon-upload"></i>
                <p>Drag &amp; Drop or click to select an image</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoEditor;
