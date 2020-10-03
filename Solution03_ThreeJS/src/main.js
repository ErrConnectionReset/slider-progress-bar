import './style.css'
import Scene from './Components/Scene.js'

console.log('Three.js Fluid Slider Initialized')

try {
    const scene = new Scene()
} catch (error) {
    console.error(error)
    alert('Error initializing App: ' + error.message)
}

