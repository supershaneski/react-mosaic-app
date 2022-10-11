import React from 'react'
import classes from './Palette.module.css'

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
} from '../lib/utils'

const IMAGE_SIZE = 512
const BLOCK_SIZE = 8

function Palette({ onClose }) {

    const fileRef = React.useRef()
    const imageRef = React.useRef()

    const [step, setStep] = React.useState(0)
    const [loading, setLoading] = React.useState(false)
    const [isImageLoaded, setImageLoaded] = React.useState(false)

    const [palette, setPalette] = React.useState([])
    const [rgbBlocks, setRGBBlocks] = React.useState([])
    const [rgbBlocks2, setRGBBlocks2] = React.useState([])
    
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

    const handlePalette = () => {

        setLoading(true)

        setTimeout(getPalette, 100)

    }

    const handleDominantColor = () => {

        setLoading(true)

        setTimeout(getDominantColor, 100)

    }

    const handleRestart = () => {

        setLoading(true)

        setTimeout(() => {

            imageRef.current.src = null

            setPalette([])
            setRGBBlocks([])
            setRGBBlocks2([])

            setImageLoaded(false)
            setLoading(false)
            setStep(0)

        }, 300)

    }

    const getPalette = () => {
        
        const canvas = document.createElement('canvas')
        canvas.width = IMAGE_SIZE
        canvas.height = IMAGE_SIZE

        const ctx = canvas.getContext('2d')
        ctx.drawImage(imageRef.current, 0, 0)

        const pixelData = ctx.getImageData(0, 0, canvas.width, canvas.height)

        const rgbData = getRGB(pixelData.data)

        const colorData = quantization(rgbData, 0)

        const orderColors = orderByLuminance(colorData.slice(0))

        //setPalette(colorData)
        setPalette(orderColors)

        nextStep()

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

        const blocks2 = blocks.map(item => {

            let diffs = []
            let pals = []

            palette.forEach(color => {

                const d = calculateColorDifference(item, color)

                pals.push({color: color, diff: d })
                diffs.push(d)

            })

            let min = Math.min(...diffs)

            let selcolor = pals.find(p => p.diff === min).color
            let selindex = pals.findIndex(p => p.diff === min)

            return {
                color: selcolor,
                image: (selindex + 1),
            }

        })

        setRGBBlocks(blocks)
        setRGBBlocks2(blocks2)

        nextStep()

    }

    const nextStep = () => {

        setLoading(false)

        setStep(cur => cur + 1)

    }

    const previousStep = () => {

        setStep(cur => cur - 1)

    }

    return (
        <div className={classes.container}>
            <div className={classes.close} onClick={onClose}>
                <span className={classes.closeIcon}>&#215;</span>
            </div>

            <div className={classes.panel} style={{
                display: step === 0 ? 'block' : 'none',
            }}>
                <label><strong>Step 1</strong> Load image from file</label>
                <div className={classes.innerPanel}>
                    <img ref={imageRef} className={classes.imagePreview} />
                </div>
                <div className={classes.action}>
                    <button onClick={handleLoad} className={classes.button}>Load Image...</button>
                    <button onClick={handlePalette} disabled={isImageLoaded === false ? true : false} className={classes.button}>Get Palette</button>
                </div>
                {
                    loading &&
                    <div className={classes.loader}><span>Please wait...</span></div>
                }
            </div>

            <div className={classes.panel} style={{
                display: step === 1 ? 'block' : 'none',
            }}>
                <label><strong>Step 2</strong> Color Palette (16 colors)</label>
                <div className={classes.innerPanel}>
                {
                    palette.length > 0 && palette.map((item, index) => {
                        return (
                            <div key={index} style={{
                                backgroundColor: `rgb(${item.r}, ${item.g}, ${item.b})`,
                                width: 128,
                                height: 128,
                            }} className={classes.block} />
                        )
                    })
                }
                </div>
                <div className={classes.action}>
                    <button onClick={previousStep} className={classes.button}>Back</button>
                    <button onClick={handleDominantColor} className={classes.button}>Show Mosaic</button>
                </div>
                {
                    loading &&
                    <div className={classes.loader}><span>Please wait...</span></div>
                }
            </div>

            <div className={classes.panel} style={{
                display: step === 2 ? 'block' : 'none',
            }}>
                <label><strong>Step 3</strong> Mosaic</label>
                <div className={classes.innerPanel}>
                {
                    rgbBlocks.length > 0 && rgbBlocks.map((item, index) => {
                        const imageIndex = rgbBlocks2[index].image
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

export default Palette