
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

export const calculateColorDifference = (color1, color2) => {
    const rDifference = Math.pow(color2.r - color1.r, 2);
    const gDifference = Math.pow(color2.g - color1.g, 2);
    const bDifference = Math.pow(color2.b - color1.b, 2);
  
    return rDifference + gDifference + bDifference;
}

export const rgbToHex = (pixel) => {
    const componentToHex = (c) => {
      const hex = c.toString(16);
      return hex.length == 1 ? "0" + hex : hex;
    };
  
    return (
      "#" +
      componentToHex(pixel.r) +
      componentToHex(pixel.g) +
      componentToHex(pixel.b)
    ).toUpperCase();
}

export const hslToHex = (hslColor) => {
    const hslColorCopy = { ...hslColor };
    hslColorCopy.l /= 100;
    const a =
      (hslColorCopy.s * Math.min(hslColorCopy.l, 1 - hslColorCopy.l)) / 100;
    const f = (n) => {
      const k = (n + hslColorCopy.h / 30) % 12;
      const color = hslColorCopy.l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color)
        .toString(16)
        .padStart(2, "0");
    };
    return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
}

//https://github.com/zygisS22/color-palette-extraction/blob/master/index.js
export const orderByLuminance = (rgbValues) => {
    const calculateLuminance = (p) => {
      return 0.2126 * p.r + 0.7152 * p.g + 0.0722 * p.b;
    };

    const data = rgbValues.slice(0)
  
    return data.sort((p1, p2) => {
      return calculateLuminance(p2) - calculateLuminance(p1);
    });
}

export const convertRGBtoHSL = (rgbValues) => {
    return rgbValues.map((pixel) => {
      let hue,
        saturation,
        luminance = 0;
  
      // first change range from 0-255 to 0 - 1
      let redOpposite = pixel.r / 255;
      let greenOpposite = pixel.g / 255;
      let blueOpposite = pixel.b / 255;
  
      const Cmax = Math.max(redOpposite, greenOpposite, blueOpposite);
      const Cmin = Math.min(redOpposite, greenOpposite, blueOpposite);
  
      const difference = Cmax - Cmin;
  
      luminance = (Cmax + Cmin) / 2.0;
  
      if (luminance <= 0.5) {
        saturation = difference / (Cmax + Cmin);
      } else if (luminance >= 0.5) {
        saturation = difference / (2.0 - Cmax - Cmin);
      }
  
      /**
       * If Red is max, then Hue = (G-B)/(max-min)
       * If Green is max, then Hue = 2.0 + (B-R)/(max-min)
       * If Blue is max, then Hue = 4.0 + (R-G)/(max-min)
       */
      const maxColorValue = Math.max(pixel.r, pixel.g, pixel.b);
  
      if (maxColorValue === pixel.r) {
        hue = (greenOpposite - blueOpposite) / difference;
      } else if (maxColorValue === pixel.g) {
        hue = 2.0 + (blueOpposite - redOpposite) / difference;
      } else {
        hue = 4.0 + (greenOpposite - blueOpposite) / difference;
      }
  
      hue = hue * 60; // find the sector of 60 degrees to which the color belongs
  
      // it should be always a positive angle
      if (hue < 0) {
        hue = hue + 360;
      }
  
      // When all three of R, G and B are equal, we get a neutral color: white, grey or black.
      if (difference === 0) {
        return false;
      }
  
      return {
        h: Math.round(hue) + 180, // plus 180 degrees because that is the complementary color
        s: parseFloat(saturation * 100).toFixed(2),
        l: parseFloat(luminance * 100).toFixed(2),
      };
    });
}