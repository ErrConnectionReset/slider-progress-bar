export default class Sizes {
    constructor() {
        // Setup
        this.width = window.innerWidth
        this.height = window.innerHeight
        this.pixelRatio = Math.min(window.devicePixelRatio, 2)

        // Simple event dispatcher
        this.callbacks = {}

        // Resize event
        window.addEventListener('resize', () => {
            this.width = window.innerWidth
            this.height = window.innerHeight
            this.pixelRatio = Math.min(window.devicePixelRatio, 2)

            this.trigger('resize')
        })
    }

    on(name, callback) {
        if (!this.callbacks[name])
            this.callbacks[name] = []
        this.callbacks[name].push(callback)
    }

    trigger(name) {
        if (this.callbacks[name]) {
            this.callbacks[name].forEach(callback => callback())
        }
    }
}
