import * as THREE from 'three'
import Sizes from '../Utils/sizes.js'
import LiquidSlider from './LiquidSlider.js'

export default class Scene {
    constructor() {
        console.log('Scene Constructor Start') // Debug log
        try {
            this.canvas = document.createElement('canvas')
            document.body.appendChild(this.canvas)
            console.log('Canvas appended to body')
        } catch (e) {
            console.error('Error creating canvas:', e)
        }

        this.sizes = new Sizes()

        this.init()
    }

    init() {
        console.log('Scene Init')
        // Scene
        this.scene = new THREE.Scene()
        this.scene.background = new THREE.Color('#f0f0f0')

        // Camera
        this.camera = new THREE.OrthographicCamera(
            -this.sizes.width / 2,
            this.sizes.width / 2,
            this.sizes.height / 2,
            -this.sizes.height / 2,
            0.1,
            100
        )
        this.camera.position.z = 10
        this.scene.add(this.camera)

        // Renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: true
        })
        this.renderer.setSize(this.sizes.width, this.sizes.height)
        this.renderer.setPixelRatio(this.sizes.pixelRatio)

        // Components
        this.liquidSlider = new LiquidSlider(this.scene)

        // Events
        this.sizes.on('resize', () => {
            this.resize()
        })

        // Loop
        this.tick()
    }

    resize() {
        this.camera.left = -this.sizes.width / 2
        this.camera.right = this.sizes.width / 2
        this.camera.top = this.sizes.height / 2
        this.camera.bottom = -this.sizes.height / 2
        this.camera.updateProjectionMatrix()

        this.renderer.setSize(this.sizes.width, this.sizes.height)
        this.renderer.setPixelRatio(this.sizes.pixelRatio)
    }

    tick() {
        this.renderer.render(this.scene, this.camera)

        // Update components
        if (this.liquidSlider) this.liquidSlider.update()

        window.requestAnimationFrame(() => this.tick())
    }
}
