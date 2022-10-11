import React from 'react'
import classes from './GrayScale.module.css'

import { 
    loadImage,
    getRGB,
    quantization,
} from '../lib/utils'

const IMAGE_SIZE = 512
const BLOCK_SIZE = 8

function GrayScale({ onClose }) {

    const fileRef = React.useRef()
    const imageRef = React.useRef()

    const [step, setStep] = React.useState(0)

    const [loading, setLoading] = React.useState(false)
    const [isImageLoaded, setImageLoaded] = React.useState(false)
    
    const [grayScaleFunc, setGrayScaleFunc] = React.useState(0)

    const [rgbBlocks, setRGBBlocks] = React.useState([])
    const [grayBlocks, setGrayBlocks] = React.useState([])
    const [histoBlocks, setHistoBlocks] = React.useState([])
    const [normalBlocks, setNormalBlocks] = React.useState([])

    const handleLoad = () => {
        fileRef.current.click()
    }

    const handleFile = () => {
        const selfile = fileRef.current.files[0]

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

        reader.readAsDataURL(selfile)
    }

    const handleDominant = () => {

        setLoading(true)

        setTimeout(getDominantColor, 100)

    }

    const handleGrayscale = () => {
        
        setLoading(true)

        setTimeout(getGrayScale, 100)

    }

    const handleHistogram = () => {

        setLoading(true)

        setTimeout(() => {
            nextStep()
        }, 100)

    }

    const handleNormalize = () => {

        setLoading(true)

        setTimeout(getNormalize, 100)

    }

    const handleMosaic = () => {

        setLoading(true)

        setTimeout(() => {
            nextStep()
        }, 100)

    }

    const handleRestart = () => {
        
        setLoading(true)

        setTimeout(() => {

            imageRef.current.src = null

            setImageLoaded(false)
            setRGBBlocks([])
            setGrayBlocks([])
            setHistoBlocks([])
            setNormalBlocks([])
            setStep(0)

            setLoading(false)

        }, 300)

    }

    const getDominantColor = () => {

        let block_size = BLOCK_SIZE
        let iterate_count = IMAGE_SIZE / block_size

        const canvas = document.createElement('canvas')
        canvas.width = block_size
        canvas.height = block_size

        const ctx = canvas.getContext('2d')

        let blocks = []

        for(let i = 0; i < iterate_count; i++) {
        
            for(let k = 0; k < iterate_count; k++) {
                
                ctx.drawImage(imageRef.current, k * block_size, i * block_size, block_size, block_size, 0, 0, block_size, block_size);

                const pixelData = ctx.getImageData(0, 0, block_size, block_size)
                const rgbData = getRGB(pixelData.data)
                const color = quantization(rgbData, 4)

                blocks.push(color[0])

            }

        }

        setRGBBlocks(blocks)

        nextStep()

    }

    const getGrayScale = () => {

        const blocks = rgbBlocks.map(item => {

            let gs = 0

            if(grayScaleFunc === 1) {
                gs = (Math.max(item.r, item.g, item.b) + Math.min(item.r, item.g, item.b))/2
            } else if(grayScaleFunc === 2) {
                gs = (0.21 * item.r) + (0.72 * item.g) + (0.07 * item.b)
            } else {
                gs = (item.r + item.g + item.b) / 3
            }

            return gs
        })

        let histogram = Array(256).fill(0)

        blocks.forEach(item => {

            const i = Math.round(item)

            histogram[i]++;

        })

        setGrayBlocks(blocks)
        setHistoBlocks(histogram)

        nextStep()

    }

    const getNormalize = () => {

        const delta = 255 / 8

        const blocks = grayBlocks.map(item => {

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

    const nextStep = () => {

        setLoading(false)

        setStep(cur => cur + 1)

    }

    const previousStep = () => {

        setStep(cur => cur - 1)

    }

    const handleSelectGrayScale = (e) => {

        const newIndex = parseInt(e.target.value)

        const blocks = rgbBlocks.map(item => {

            let gs = 0

            if(newIndex === 1) {
                gs = (Math.max(item.r, item.g, item.b) + Math.min(item.r, item.g, item.b))/2
            } else if(newIndex === 2) {
                gs = (0.21 * item.r) + (0.72 * item.g) + (0.07 * item.b)
            } else {
                gs = (item.r + item.g + item.b) / 3
            }

            return gs
        })

        let histogram = Array(256).fill(0)

        blocks.forEach(item => {

            const i = Math.round(item)

            histogram[i]++;

        })

        setGrayBlocks(blocks)
        setHistoBlocks(histogram)

        setGrayScaleFunc(newIndex)

    }

    return (
        <div className={classes.container}>
            <div className={classes.close} onClick={onClose}>
                <span className={classes.closeIcon}>&#215;</span>
            </div>

            <div className={classes.panel} style={{
                display: step === 0 ? 'block' : 'none'
            }}>
                <label><strong>Step 1</strong> Load image from file</label>
                <div className={classes.innerPanel}>
                    <img ref={imageRef} className={classes.imagePreview} src="" />
                </div>
                <div className={classes.action}>
                    <button onClick={handleLoad} className={classes.button}>Load Image...</button>
                    <button disabled={isImageLoaded === false ? true : false} onClick={handleDominant} className={classes.button}>Get Dominant Color</button>
                </div>
                {
                    loading &&
                    <div className={classes.loader}><span>Please wait...</span></div>
                }
            </div>

            <div className={classes.panel} style={{
                display: step === 1 ? 'block' : 'none'
            }}>
                <label><strong>Step 2</strong> Dominant Color</label>
                <div className={classes.innerPanel}>
                {
                    rgbBlocks.length > 0 && rgbBlocks.map((item, index) => {
                        return (
                            <div key={index} style={{
                                backgroundColor: `rgb(${item.r}, ${item.g}, ${item.b})`,
                                width: BLOCK_SIZE,
                                height: BLOCK_SIZE,
                            }} className={classes.block} />
                        )
                    })
                }
                </div>
                <div className={classes.action}>
                    <button onClick={previousStep} className={classes.button}>Back</button>
                    <button onClick={handleGrayscale} className={classes.button}>Get GrayScale</button>
                </div>
                {
                    loading &&
                    <div className={classes.loader}><span>Please wait...</span></div>
                }
            </div>

            <div className={classes.panel} style={{
                display: step === 2 ? 'block' : 'none'
            }}>
                <div className={classes.action}>
                    <label><strong>Step 3</strong> GrayScale</label>
                    <select 
                    className={classes.select}
                    value={grayScaleFunc}
                    onChange={handleSelectGrayScale}>
                        <option value={0}>Average</option>
                        <option value={1}>Lightness</option>
                        <option value={2}>Luminosity</option>
                    </select>
                </div>
                <div className={classes.innerPanel}>
                {
                    grayBlocks.length > 0 && grayBlocks.map((item, index) => {
                        return (
                            <div key={index} style={{
                                backgroundColor: `rgb(${item}, ${item}, ${item})`,
                                width: BLOCK_SIZE,
                                height: BLOCK_SIZE,
                            }} className={classes.block} />
                        )
                    })
                }
                </div>
                <div className={classes.action}>
                    <button onClick={previousStep} className={classes.button}>Back</button>
                    <button onClick={handleHistogram} className={classes.button}>Histogram</button>
                </div>
                {
                    loading &&
                    <div className={classes.loader}><span>Please wait...</span></div>
                }
            </div>

            <div className={classes.panel} style={{
                display: step === 3 ? 'block' : 'none'
            }}>
                <label><strong>Step 4</strong> Histogram</label>
                <div className={classes.innerPanel} style={{border: '1px solid #999'}}>
                {
                    histoBlocks.length > 0 && histoBlocks.map((item, index) => {
                        const wid = Math.round(512 / 256)
                        const hgt = Math.round(512 * (item / Math.max(...histoBlocks)))
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
                    <button onClick={previousStep} className={classes.button}>Back</button>
                    <button onClick={handleNormalize} className={classes.button}>Normalize</button>
                </div>
                {
                    loading &&
                    <div className={classes.loader}><span>Please wait...</span></div>
                }
            </div>

            <div className={classes.panel} style={{
                display: step === 4 ? 'block' : 'none'
            }}>
                <label><strong>Step 5</strong> Normalized</label>
                <div className={classes.innerPanel}>
                {
                    normalBlocks.length > 0 && normalBlocks.map((item, index) => {
                        return (
                            <div key={index} style={{
                                backgroundColor: `rgb(${item.value}, ${item.value}, ${item.value})`,
                                width: BLOCK_SIZE,
                                height: BLOCK_SIZE,
                            }} className={classes.block} />
                        )
                    })
                }
                </div>
                <div className={classes.action}>
                    <button onClick={previousStep} className={classes.button}>Back</button>
                    <button onClick={handleMosaic} className={classes.button}>Show Mosaic</button>
                </div>
                {
                    loading &&
                    <div className={classes.loader}><span>Please wait...</span></div>
                }
            </div>

            <div className={classes.panel} style={{
                display: step === 5 ? 'block' : 'none'
            }}>
                <label><strong>Step 6</strong> Mosaic</label>
                <div className={classes.innerPanel}>
                {
                    (step === 5 && rgbBlocks.length > 0) && rgbBlocks.map((item, index) => {
                        const imageIndex = normalBlocks[index].index
                        return (
                            <div key={index} style={{
                                backgroundColor: `rgb(${item.r}, ${item.g}, ${item.b})`,
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
                    <button onClick={previousStep} className={classes.button}>Back</button>
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

export default GrayScale