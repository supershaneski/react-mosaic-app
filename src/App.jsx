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
  orderByLuminance,
  convertRGBtoHSL,
  calculateColorDifference,
  rgbToHex,
  hslToHex,
} from './lib/utils'

const BLOCK_SIZE = 8
const IMAGE_SIZE = 512

function App() {

  const fileRef = React.useRef()
  const imageRef = React.useRef()

  const [rgbBlocks, setRGBBlocks] = React.useState([])
  const [grayScaleBlocks, setGrayScaleBlocks] = React.useState([])
  const [normalBlocks, setNormalBlocks] = React.useState([])
  const [imageBlocks, setImageBlocks] = React.useState([])

  const [histoGray, setHistoGray] = React.useState(Array(256).fill(0))

  const [grayScaleFunc, setGrayScaleFunc] = React.useState(0)

  const [imageLoaded, setImageLoaded] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [step, setStep] = React.useState(0)

  const handleLoad = () => {

    fileRef.current.click()

  }

  const handleFile = () => {

    const file = fileRef.current.files[0]

    const reader = new FileReader()

    reader.onload = async () => {

      const rawImg = await loadImage(reader.result)

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
      setImageLoaded(true)
      
    }

    reader.readAsDataURL(file)

  }

  const handleFile2 = () => {

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
        setImageLoaded(true)

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

    ///////////////
    canvas.width = IMAGE_SIZE
    canvas.height = IMAGE_SIZE

    ctx.drawImage(imageRef.current, 0, 0)
    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const rgbs = getRGB(pixels.data)

    let quants = quantization(rgbs, 0)
    
    const isBlack = quants.some(q => q.r === 0 && q.g === 0 && q.b === 0)
    const isWhite = quants.some(q => q.r === 255 && q.g === 255 && q.b === 255)
    
    quants = quants.filter(q => !(q.r === 0 && q.g === 0 && q.b === 0) || !(q => q.r === 255 && q.g === 255 && q.b === 255))

    if(isBlack) quants.push({ r: 0, g: 0, b: 0 })
    if(isWhite) quants.push({ r: 255, g: 255, b: 255 })

    let luminance = orderByLuminance(quants.slice(0));
    
    const image_blocks = blocks.map((b, i) => {
      
      //if(!(b.r === 0 && b.g === 0 && b.b === 0) && !(b.r === 255 && b.g === 255 && b.b === 255)) {
        
        //console.log(i, b)
        //calculateColorDifference

        let ds = []
        let dds = []

        for(let k = 0; k < quants.length; k++) {
          const q = quants[k]
          const d = calculateColorDifference(b, q)
          ds.push(d)
          dds.push({col: q, del: d})
        }

        //console.log(i, b, Math.min(...ds), dds)

        let min = Math.min(...ds)

        return dds.findIndex(d => d.del === min)

      //} else {

      //  return b

      //}

      //console.log(i, b)

    })

    setImageBlocks(image_blocks)

    //console.log(image_blocks)

    //blocks = luminance

    /////////////

    /*const theblocks = blocks.slice(0)

    let colors = quantization(theblocks, 0)
    colors = orderByLuminance(colors);
    let hslColors = convertRGBtoHSL(colors)
    
    for(let i = 0; i < colors.length; i++) {
      
      const hexcol = rgbToHex(colors[i])
      const hexcolComp = hslToHex(hslColors[i])

      console.log(i, hexcol, hslColors[i].h)

      if(hslColors[i].h) {
        //not black/white/grey
      }

    }*/

    ////////
    /*
    const orderedByColor = orderByLuminance(blocks);
    const hslColors = convertRGBtoHSL(orderedByColor);

    for (let i = 0; i < orderedByColor.length; i++) {

      const hexColor = rgbToHex(orderedByColor[i]);
  
      const hexColorComplementary = hslToHex(hslColors[i]);
  
      if (i > 0) {

        const difference = calculateColorDifference(
          orderedByColor[i],
          orderedByColor[i - 1]
        );
  
        //console.log(i, orderedByColor[i - 1], orderedByColor[i], difference)

        // if the distance is less than 120 we ommit that color
        //if (difference < 120) {
        if (difference < 3000) {
          continue;
        }

      }
  
      // create the div and text elements for both colors & append it to the document
      //const colorElement = document.createElement("div");
      //colorElement.style.backgroundColor = hexColor;
      //colorElement.appendChild(document.createTextNode(hexColor));
      //paletteContainer.appendChild(colorElement);
      
      //console.log("%c" + hexColor, "color:" + hexColor + ";")

      // true when hsl color is not black/white/grey
      if (hslColors[i].h) {

        console.log("%c" + hexColor, "color:" + hexColor + ";")

        //const complementaryElement = document.createElement("div");
        //complementaryElement.style.backgroundColor = `hsl(${hslColors[i].h},${hslColors[i].s}%,${hslColors[i].l}%)`;
  
        //complementaryElement.appendChild(
        //  document.createTextNode(hexColorComplementary)
        //);

        //complementaryContainer.appendChild(complementaryElement);

        //console.log(">", ">", `hsl(${hslColors[i].h},${hslColors[i].s}%,${hslColors[i].l}%)`)

      }

    }
    */
    ////////

    setRGBBlocks(blocks)

    nextStep()

  }

  const getGrayscale = () => {

    const blocks = rgbBlocks.map(item => {

      let gs = 0

      if(grayScaleFunc === 2) {
        gs = (0.21 * item.r) + (0.72 * item.g) + (0.07 * item.b)
      } else if(grayScaleFunc === 1) {
        gs = (Math.max(item.r, item.g, item.b) + Math.min(item.r, item.g, item.b))/2
      } else {
        gs = (item.r + item.g + item.b)/3
      }
      
      return gs > 255 ? 255 : gs

    })

    let histogram = Array(256).fill(0)

    blocks.forEach(item => {

      const i = Math.round(item)

      histogram[i]++;

    })
    
    setGrayScaleBlocks(blocks)
    setHistoGray(histogram)
    
    nextStep()

  }

  const handleSelectGrayScale = (e) => {

    const newValue = parseInt(e.target.value)
    
    const blocks = rgbBlocks.map(item => {

      let gs = 0

      if(newValue === 2) {
        gs = (0.21 * item.r) + (0.72 * item.g) + (0.07 * item.b)
      } else if(newValue === 1) {
        gs = (Math.max(item.r, item.g, item.b) + Math.min(item.r, item.g, item.b))/2
      } else {
        gs = (item.r + item.g + item.b)/3
      }
      
      return gs > 255 ? 255 : gs

    })

    let histogram = Array(256).fill(0)

    blocks.forEach(item => {

      const i = Math.round(item)

      histogram[i]++;

    })
    
    setHistoGray(histogram)
    setGrayScaleBlocks(blocks)
    setGrayScaleFunc(newValue)
    
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

    setLoading(true)

    setTimeout(nextStep, 100)

  }

  const nextStep = () => {

    setStep(cur => cur + 1)
    setLoading(false)
  }

  const handlePrevious = () => {
    setStep(cur => cur - 1)
  }

  const handleRestart = () => {

    imageRef.current.src = null

    setStep(0)

    setImageLoaded(false)
    setRGBBlocks([])
    setGrayScaleBlocks([])
    setNormalBlocks([])
    
  }

  const handleHistogram = () => {

    setLoading(true)

    setTimeout(nextStep, 100)

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
          <button disabled={!imageLoaded ? true : false} onClick={handleDominantColor} className={classes.button}>Get Dominant Color &#8674;</button>
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
        <div className={classes.action}>
          <label><strong>Step 3</strong> Grayscale</label>
          <select 
          className={classes.select}
          value={grayScaleFunc}
          onChange={handleSelectGrayScale}>
              <option value={0}>Average</option>
              <option value={1}>Lightness</option>
              <option value={2}>Luminosity</option>
            </select>
        </div>
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
          <button onClick={handleHistogram} className={classes.button}>View Histogram &#8674;</button>
        </div>
        {
          loading &&
          <div className={classes.loader}><span>Please wait...</span></div>
        }
      </div>
      
      <div style={{
        display: step === 3 ? 'block' : 'none'
      }} className={classes.panel}>
        <label><strong>Step 4</strong> GrayScale Histogram</label>
        <div className={classes.blockPanel} style={{
          border: '1px solid #999'
        }}>
        {
          histoGray.length > 0 && histoGray.map((item, index) => {
            const wid = Math.round(512 / 256)
            const hgt = Math.round(512 * (item / Math.max(...histoGray)))
            return (
              <div key={index} style={{
                backgroundColor: `#666`,
                width: wid || 0,
                height: hgt || 0,
              }} />
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
        display: step === 4 ? 'block' : 'none'
      }} className={classes.panel}>
        <label><strong>Step 5</strong> Normalize</label>
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
        display: step === 5 ? 'block' : 'none'
      }} className={classes.panel}>
        <label><strong>Step 6</strong> Final Output</label>
        <div className={classes.blockPanel}>
        {
          rgbBlocks.length > 0 && rgbBlocks.map((item, index) => {
            const color = `rgb(${item.r}, ${item.g}, ${item.b})`
            const imageIndex = normalBlocks.length > 0 ? normalBlocks[index].index : 0
            //const imageIndex = imageBlocks.length > 0 ? imageBlocks[index] : 0
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
          <button onClick={handleRestart} className={classes.button}>Restart</button>
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
