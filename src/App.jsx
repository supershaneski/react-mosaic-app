import React from 'react'
import classes from './App.module.css'

function App() {
  
  const fileRef = React.useRef()

  const [mode, setMode] = React.useState(0)

  const handleChangeFile = () => {
    
    // mode

  }

  const handleLoadSource = (_mode) => () => {
  
    setMode(_mode)
    fileRef.current.click()

  }

  return (
    <div className={classes.container}>
      <div className={classes.inner}>
        <div className={classes.sourcePreviewContainer}>
          <label className={classes.label}>Step 1: Load Image</label>
          <img className={classes.sourcePreview} src="" />
          <button onClick={handleLoadSource(0)} className={classes.button}>Browse...</button>
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
