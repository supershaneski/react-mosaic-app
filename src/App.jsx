import React from 'react'
import classes from './App.module.css'

import { 
  loadImage,
  getRGB,
  findBiggestColorRange,
  quantization,
  getColorInt,
  getColorRGB,
  getGrayScale,
  convertToHex,
} from './lib/utils'

const initialBlocks = () => Array(64).fill('#000')

function App() {
  
  const fileRef = React.useRef()
  const imageSrcRef = React.useRef()
  const imageResizedRef = React.useRef()

  const [step, setStep] = React.useState(0)
  const [mode, setMode] = React.useState(0)

  const [blocks, setBlocks] = React.useState(initialBlocks())
  const [bwBlocks, setBWBlocks] = React.useState(initialBlocks())

  const handleChangeFile = () => {
    
    const selFile = fileRef.current.files[0]

    const reader = new FileReader()

    reader.onload = (() => {

      return async function(e) {

        console.log("load image")

        const rawImg = await loadImage(e.target.result)

            
        var OPTIMIZED_SIZE = 128;
                        
        var _src_width = rawImg.naturalWidth;
        var _src_height = rawImg.naturalHeight;

        var _canvas = document.createElement("canvas");
        _canvas.width = OPTIMIZED_SIZE;
        _canvas.height = OPTIMIZED_SIZE;
            
        var _width = _src_width;
        var _height = _src_height;

        var _mode = 0;

        if(_src_width > _src_height) {
            
          _width = Math.round(OPTIMIZED_SIZE * (_src_width/_src_height));
          _height = OPTIMIZED_SIZE;
          
          _mode = 1;

        } else {

          if(_src_width < _src_height){
            _mode = 2;
          }

          _height = Math.round(OPTIMIZED_SIZE * (_src_height/_src_width));
          _width = OPTIMIZED_SIZE;

        }

        var _ctx = _canvas.getContext("2d");

        if(_mode === 1) {
            
          var _x = Math.round((_src_width - _src_height)/2);
          _ctx.drawImage(rawImg, _x, 0, _src_height, _src_height, 0, 0, _height, _height);
      
        } else if(_mode === 2) {
            
          var _y = Math.round((_src_height - _src_width)/2);
          _ctx.drawImage(rawImg, 0, _y, _src_width, _src_width, 0, 0, _width, _width);
      
        } else {

          _ctx.drawImage(rawImg, 0, 0, _src_width, _src_height, 0, 0, _width, _height);
        
        }

        imageResizedRef.current.src = _canvas.toDataURL()
        imageSrcRef.current.src = rawImg.src

      }

    })(selFile)
    
    reader.readAsDataURL(selFile)
    
  }

  const handleLoadImage = (_mode) => () => {
  
    setMode(_mode)
    fileRef.current.click()

  }

  const handleProc = () => {

    var OPTIMIZED_SIZE = 128;
    
    //var _src_width = imageResizedRef.current.naturalWidth;
    //var _src_height = imageResizedRef.current.naturalHeight;

    var _canvas = document.createElement("canvas");
    _canvas.width = OPTIMIZED_SIZE;
    _canvas.height = OPTIMIZED_SIZE;

    var _ctx = _canvas.getContext("2d");
    _ctx.drawImage(imageResizedRef.current, 0, 0, OPTIMIZED_SIZE, OPTIMIZED_SIZE, 0, 0, OPTIMIZED_SIZE, OPTIMIZED_SIZE);
    
    let block_size = 4
    let iterate_count = OPTIMIZED_SIZE / block_size

    var test_canvas = document.createElement("canvas")
    test_canvas.width = block_size
    test_canvas.height = block_size

    var test_ctx = test_canvas.getContext('2d')

    let _blocks = []
    let gray_blocks = []

    let n = 0
    for(let i = 0; i < iterate_count; i++) {
        
      for(let k = 0; k < iterate_count; k++) {

        test_ctx.drawImage(_canvas, k*block_size, i*block_size, block_size, block_size, 0, 0, block_size, block_size);

        const data = test_ctx.getImageData(0, 0, block_size, block_size)
        const rgbData = getRGB(data.data)
        const cunt = quantization(rgbData, 4)

        //_blocks.push(`rgb(${cunt[0].r}, ${cunt[0].g}, ${cunt[0].b})`)

        //const gs = (cunt[0].r + cunt[0].g + cunt[0].b)/3
        const rgb2 = getGrayScale({ r: cunt[0].r, g: cunt[0].g, b: cunt[0].b })

        /*let red = cunt[0].r
        let green = cunt[0].g
        let blue = cunt[0].b
                        
        const delta = Math.round(255 / 5)

        red = 51 * Math.round(red / delta)
        green = 51 * Math.round(green / delta)
        blue = 51 * Math.round(blue / delta)
        */

        const rgb1 = { r: cunt[0].r, g: cunt[0].g, b: cunt[0].b }
        //const rgb2 = convertToHex({ r: cunt[0].r, g: cunt[0].g, b: cunt[0].b })
        
        /*const rgb2 = convertToHex({ 
            r: red, 
            g: green, 
            b: blue 
        })*/

        _blocks.push(`rgb(${rgb1.r}, ${rgb1.g}, ${rgb1.b})`)
        gray_blocks.push(`rgb(${rgb2.r}, ${rgb2.g}, ${rgb2.b})`)
        //_blocks.push(rgb2)
        
        n++

      }
    }

    setBlocks(_blocks)
    setBWBlocks(gray_blocks)
    
    handleNext()

  }

  const handleProc2 = () => {
    //
  }

  const handleNext = () => {
    setStep(cur => cur + 1)
  }

  const handlePrevious = () => {
    setStep(cur => cur - 1)
  }

  return (
    <div className={classes.container}>
      <div className={classes.inner}>

        <div style={{display: step === 0 ? 'block' : 'none'}} className={classes.sourcePreviewContainer}>
          <label className={classes.label}>Step 1: Load Image</label>
          <img ref={imageSrcRef} className={classes.sourcePreview} src="" />
          <div className={classes.action}>
            <button onClick={handleLoadImage(0)} className={classes.button}>Browse...</button>
            <button className={classes.button} onClick={handleNext}>Next &#8674;</button>
          </div>
        </div>

        <div style={{display: step === 1 ? 'block' : 'none'}} className={classes.sourcePreviewContainer}>
          <label className={classes.label}>Step 2: Resize Image</label>
          <div className={classes.resizePreview}>
            <img ref={imageResizedRef} className={classes.resizePreviewImg} src="" />
          </div>
          <div className={classes.action}>
          <button className={classes.button} onClick={handlePrevious}>&#8672; Previous</button>
            <button className={classes.button} onClick={handleProc}>Next &#8674;</button>
          </div>
        </div>

        <div style={{display: step === 2 ? 'block' : 'none'}} className={classes.sourcePreviewContainer}>
          <label className={classes.label}>Step 3: Process Image</label>
          <div className={classes.resizePreview}>
            <div className={classes.procImgContainer}>
            {
              blocks.map((item, index) => {
                return (
                  <div key={index} style={{
                    backgroundColor: item,
                  }} className={classes.block} />
                )
              })
            }
            </div>
          </div>
          <div className={classes.action}>
          <button className={classes.button} onClick={handlePrevious}>&#8672; Previous</button>
            <button className={classes.button} onClick={handleNext}>Next &#8674;</button>
          </div>
        </div>

        <div style={{display: step === 3 ? 'block' : 'none'}} className={classes.sourcePreviewContainer}>
          <label className={classes.label}>Step 4: Get Grayscale</label>
          <div className={classes.resizePreview}>
            <div className={classes.procImgContainer}>
            {
              bwBlocks.map((item, index) => {
                return (
                  <div key={index} style={{
                    backgroundColor: item,
                  }} className={classes.block} />
                )
              })
            }
            </div>
          </div>
          <div className={classes.action}>
          <button className={classes.button} onClick={handlePrevious}>&#8672; Previous</button>
            <button className={classes.button} onClick={handleProc2}>Next &#8674;</button>
          </div>
        </div>

      </div>
      <input 
      ref={fileRef} 
      type="file" 
      accept="image/*" 
      onChange={handleChangeFile}
      />
    </div>
  )
}

export default App
