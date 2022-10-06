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

const BLOCK_SIZE = 8
const IMAGE_SIZE = 512

function App() {

  const fileRef = React.useRef()
  const imageRef = React.useRef()

  const [rgbBlocks, setRGBBlocks] = React.useState([])
  const [grayScaleBlocks, setGrayScaleBlocks] = React.useState([])
  const [normalBlocks, setNormalBlocks] = React.useState([])

  const [loading, setLoading] = React.useState(false)
  const [step, setStep] = React.useState(0)

  const handleLoad = () => {

    fileRef.current.click()

  }

  const handleFile = () => {

    const file = fileRef.current.files[0]

    const reader = new FileReader()

    reader.onload = (() => {

      return async function(e) {

        const rawImg = await loadImage(e.target.result)

        const image_width = rawImg.naturalWidth;
        const image_height = rawImg.naturalHeight;

        let canvas = document.createElement('canvas');
        canvas.width = IMAGE_SIZE;
        canvas.height = IMAGE_SIZE;

        let width = image_width;
        let height = image_height;

        let mode = image_width > image_height ? 1 : image_width < image_height ? 2 : 0;

        if(image_width > image_height) {
                
            width = Math.round(IMAGE_SIZE * (image_width/image_height));
            height = IMAGE_SIZE;
              
        } else {

            height = Math.round(IMAGE_SIZE * (image_height/image_width));
            width = IMAGE_SIZE;

        }

        var ctx = canvas.getContext("2d");

        if(mode === 1) {
            
            var x = Math.round((image_width - image_height)/2);
            ctx.drawImage(rawImg, x, 0, image_height, image_height, 0, 0, height, height);

        } else if(mode === 2) {
            
            var y = Math.round((image_height - image_width)/2);
            ctx.drawImage(rawImg, 0, y, image_width, image_width, 0, 0, width, width);

        } else {

            ctx.drawImage(rawImg, 0, 0, image_width, image_height, 0, 0, width, height);

        }
        
        imageRef.current.src = canvas.toDataURL()

      }
    })(file)

    reader.readAsDataURL(file)

  }

  const getDominantColor = () => {
    
    let block_size = BLOCK_SIZE
    let iterate_count = IMAGE_SIZE / block_size

    const canvas = document.createElement('canvas')
    canvas.width = block_size
    canvas.height = block_size

    const ctx = canvas.getContext('2d')

    let blocks = []
    let n = 0

    for(let i = 0; i < iterate_count; i++) {
      
      for(let k = 0; k < iterate_count; k++) {
        
        ctx.drawImage(imageRef.current, k*block_size, i*block_size, block_size, block_size, 0, 0, block_size, block_size);

        const pixelData = ctx.getImageData(0, 0, block_size, block_size)
        const rgbData = getRGB(pixelData.data)
        const color = quantization(rgbData, 4)

        blocks.push(color[0])

        n++

      }

    }

    setRGBBlocks(blocks)

    nextStep()

  }

  const getGrayscale = () => {

    const blocks = rgbBlocks.map(item => {

      const gs = (item.r + item.g + item.b)/3

      return gs

    })

    setGrayScaleBlocks(blocks)
    
    nextStep()

  }

  const getNormalize = () => {

    const delta = 255 / 8

    const blocks = grayScaleBlocks.map(item => {

      const level = Math.round(item / delta)
      const gs = delta * level

      return {
        index: level,
        value: gs,
      }

    })

    setNormalBlocks(blocks)
    
    nextStep()

  }

  const handleDominantColor = () => {

    setLoading(true)
    
    setTimeout(getDominantColor, 100)

  }

  const handleGrayscale = () => {
    
    setLoading(true)

    setTimeout(getGrayscale, 100)

  }

  const handleNormalize = () => {

    setLoading(true)

    setTimeout(getNormalize, 100)

  }

  const handleOutput = () => {

    nextStep()

  }

  const nextStep = () => {

    setStep(cur => cur + 1)
    setLoading(false)
  }

  const handlePrevious = () => {
    setStep(cur => cur - 1)
  }

  return (
    <div className={classes.container}>

      <div style={{
        display: step === 0 ? 'block' : 'none'
      }} className={classes.panel}>
        <label><strong>Step 1</strong> Load image from file</label>
        <div className={classes.innerPanel}>
          <img ref={imageRef} className={classes.imagePreview} src="" />
        </div>
        <div className={classes.action}>
          <button onClick={handleLoad} className={classes.button}>Load Image...</button>
          <button onClick={handleDominantColor} className={classes.button}>Get Dominant Color &#8674;</button>
        </div>
        {
          loading &&
          <div className={classes.loader}><span>Please wait...</span></div>
        }
      </div>

      <div style={{
        display: step === 1 ? 'block' : 'none'
      }} className={classes.panel}>
        <label><strong>Step 2</strong> Dominant Color</label>
        <div className={classes.blockPanel}>
        {
          rgbBlocks.length > 0 && rgbBlocks.map((item, index) => {
            const rgbColor = `rgb(${item.r}, ${item.g}, ${item.b})`
            return (
              <div key={index} style={{
                backgroundColor: rgbColor || '#000',
                width: BLOCK_SIZE,
                height: BLOCK_SIZE,
              }} className={classes.block} />
            )
          })
        }
        </div>
        <div className={classes.action}>
          <button onClick={handlePrevious} className={classes.button}>&#8672; Previous</button>
          <button onClick={handleGrayscale} className={classes.button}>Get Grayscale &#8674;</button>
        </div>
        {
          loading &&
          <div className={classes.loader}><span>Please wait...</span></div>
        }
      </div>

      <div style={{
        display: step === 2 ? 'block' : 'none'
      }} className={classes.panel}>
        <label><strong>Step 3</strong> Grayscale</label>
        <div className={classes.blockPanel}>
        {
          grayScaleBlocks.length > 0 && grayScaleBlocks.map((item, index) => {
            const color = `rgb(${item}, ${item}, ${item})`
            return (
              <div key={index} style={{
                backgroundColor: color || '#000',
                width: BLOCK_SIZE,
                height: BLOCK_SIZE,
              }} className={classes.block} />
            )
          })
        }
        </div>
        <div className={classes.action}>
          <button onClick={handlePrevious} className={classes.button}>&#8672; Previous</button>
          <button onClick={handleNormalize} className={classes.button}>Normalize &#8674;</button>
        </div>
        {
          loading &&
          <div className={classes.loader}><span>Please wait...</span></div>
        }
      </div>

      <div style={{
        display: step === 3 ? 'block' : 'none'
      }} className={classes.panel}>
        <label><strong>Step 4</strong> Normalize</label>
        <div className={classes.blockPanel}>
        {
          normalBlocks.length > 0 && normalBlocks.map((item, index) => {
            const color = `rgb(${item.value}, ${item.value}, ${item.value})`
            return (
              <div key={index} style={{
                backgroundColor: color || '#000',
                width: BLOCK_SIZE,
                height: BLOCK_SIZE,
              }} className={classes.block} />
            )
          })
        }
        </div>
        <div className={classes.action}>
          <button onClick={handlePrevious} className={classes.button}>&#8672; Previous</button>
          <button onClick={handleOutput} className={classes.button}>Show Mosaic &#8674;</button>
        </div>
        {
          loading &&
          <div className={classes.loader}><span>Please wait...</span></div>
        }
      </div>

      <div style={{
        display: step === 4 ? 'block' : 'none'
      }} className={classes.panel}>
        <label><strong>Step 4</strong> Final Output</label>
        <div className={classes.blockPanel}>
        {
          rgbBlocks.length > 0 && rgbBlocks.map((item, index) => {
            const color = `rgb(${item.r}, ${item.g}, ${item.b})`
            const imageIndex = normalBlocks.length > 0 ? normalBlocks[index].index : 0
            return (
              <div key={index} style={{
                backgroundColor: color,
                backgroundImage: `url("./image${imageIndex}.jpeg")`,
                backgroundSize: 'cover',
                backgroundBlendMode: 'overlay',
                width: BLOCK_SIZE,
                height: BLOCK_SIZE,
              }} className={classes.block} />
            )
          })
        }
        </div>
        <div className={classes.action}>
          <button onClick={handlePrevious} className={classes.button}>&#8672; Previous</button>
        </div>
        {
          loading &&
          <div className={classes.loader}><span>Please wait...</span></div>
        }
      </div>

      <input 
      ref={fileRef} 
      type="file" 
      accept="image/*" 
      onChange={handleFile}
      />
    </div>
  )

}

export default App
