
export const loadImage = (src) => {
    return new Promise((resolve, reject) => {
        const img = new Image()
        img.addEventListener("load", () => {
            resolve(img)
        })
        img.addEventListener("error", (err) => reject(err))
        img.src = src
    })
}

export const getRGB = (imageData) => {

    let rgbValues = []
    for(let i = 0; i < imageData.length; i += 4) {
        const rgb = {
            r: imageData[i],
            g: imageData[i + 1],
            b: imageData[i + 2],
        }
        rgbValues.push(rgb)
    }
    return rgbValues
}


// https://dev.to/producthackers/creating-a-color-palette-with-javascript-44ip

export const findBiggestColorRange = (rgbValues) => {
    
    let rMin = Number.MAX_VALUE
    let gMin = Number.MAX_VALUE
    let bMin = Number.MAX_VALUE
    
    let rMax = Number.MIN_VALUE
    let gMax = Number.MIN_VALUE
    let bMax = Number.MIN_VALUE

    rgbValues.forEach((pixel) => {

        rMin = Math.min(rMin, pixel.r)
        gMin = Math.min(gMin, pixel.g)
        bMin = Math.min(bMin, pixel.b)

        rMax = Math.min(rMax, pixel.r)
        gMax = Math.min(gMax, pixel.g)
        bMax = Math.min(bMax, pixel.b)

    })

    const rRange = rMax - rMin
    const gRange = gMax - gMin
    const bRange = bMax - bMin

    const biggestRange = Math.max(rRange, gRange, bRange)
    if(biggestRange === rRange) {
        return "r"
    } else if(biggestRange === gRange) {
        return "g"
    } else {
        return "b"
    }

}

export const quantization = (rgbValues, depth) => {

    const MAX_DEPTH = 4
    if(depth === MAX_DEPTH || rgbValues.length === 0) {
        const color = rgbValues.reduce(
            (prev, cur) => {
                prev.r += cur.r
                prev.g += cur.g
                prev.b += cur.b

                return prev
            },
            {
                r: 0,
                g: 0,
                b: 0,
            }
        )

        color.r = Math.round(color.r / rgbValues.length)
        color.g = Math.round(color.g / rgbValues.length)
        color.b = Math.round(color.b / rgbValues.length)

        return [color]

    }

    const componentToSortBy = findBiggestColorRange(rgbValues)
    rgbValues.sort((p1, p2) => {
        return p1[componentToSortBy] - p2[componentToSortBy]
    })

    const mid = rgbValues.length / 2

    return [
        ...quantization(rgbValues.slice(0, mid), depth + 1),
        ...quantization(rgbValues.slice(mid + 1), depth + 1),
    ]

}

//https://stackoverflow.com/questions/4801366/convert-rgb-values-to-integer#4801397

export const getColorInt = ({r, g, b}) => {
    return ((r & 0x0ff) << 16) | ((g & 0x0ff) << 8) | (b & 0x0ff)
}

export const getColorRGB = (rgb) => {
    let r = (rgb >> 16) & 0x0ff
    let g = (rgb >> 8) & 0x0ff
    let b = (rgb) & 0x0ff
    return {
        r, g, b
    }
}

export const getGrayScale = ({ r, g, b}) => {
    
    let gs = (r + g + b) / 3

    const delta = Math.round(255 / 8)

    gs = delta * Math.round(gs / delta)

    return { r: gs, g: gs, b: gs }
}

const formatNumber = (s) => s.length === 1 ? '0' + s : s

export const convertToHex = ({ r, g, b}) => {

    let red = parseInt(r).toString(16)
    let green = parseInt(g).toString(16)
    let blue = parseInt(b).toString(16)

    red = formatNumber(red)
    green = formatNumber(green)
    blue = formatNumber(blue)

    return `#${red}${green}${blue}`
}
