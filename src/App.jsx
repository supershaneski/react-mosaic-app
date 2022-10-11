import React from 'react'
import classes from './App.module.css'
import GrayScale from './components/GrayScale'
import Palette from './components/Palette'

const APPMODES = {
  NONE: 0,
  GRAYSCALE: 1,
  PALETTE: 2,
}

function App() {

  const [mode, setMode] = React.useState(APPMODES.NONE)

  const handleClose = () => {
    setMode(APPMODES.NONE)
  }

  return (
    <div className={classes.container}>
    {
      mode === APPMODES.NONE &&
      <div className={classes.selectModePanel}>
        <h4 className={classes.title}>Image Mosaic Creator</h4>
        <div className={classes.innerPanel}>
          <button className={classes.button} onClick={() => setMode(1)}>GRAYSCALE</button>
          <button className={classes.button} onClick={() => setMode(2)}>COLOR PALETTE</button>
        </div>
      </div>
    }
    {
      mode === APPMODES.GRAYSCALE &&
      <GrayScale onClose={handleClose} />
    }
    {
      mode === APPMODES.PALETTE &&
      <Palette onClose={handleClose} />
    }
    </div>
  )
}

export default App