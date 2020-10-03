import * as THREE from 'three'
import gsap from 'gsap'

// Inline Vertex Shader
const vertexShader = `
varying vec2 vUv;
void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

// Inline Fragment Shader
const fragmentShader = `
varying vec2 vUv;
uniform float uProgress;
uniform vec2 uResolution;
uniform float uTime;
uniform float uDragSpeed;

// --- SDF Functions ---

// Segment (Capsule shape)
float sdSegment(in vec2 p, in vec2 a, in vec2 b) {
    vec2 pa = p - a, ba = b - a;
    float h = clamp( dot(pa,ba)/dot(ba,ba), 0.0, 1.0 );
    return length( pa - ba*h );
}

// Cubic Pulse for organic peaks
float cubicPulse(float c, float w, float x) {
    x = abs(x - c);
    if(x > w) return 0.0;
    x /= w;
    return 1.0 - x*x*(3.0 - 2.0*x);
}

void main() {
    // 1. UV Setup
    vec2 uv = vUv - 0.5;
    float aspect = uResolution.x / uResolution.y;
    uv.x *= aspect;

    // 2. Configuration
    float trackWidth = 0.8; 
    float radius = 0.08; 
    
    // 3. Coordinates
    float leftX = -trackWidth * 0.5;
    float rightX = trackWidth * 0.5;
    
    // Physical lengths
    float maxSpan = rightX - leftX; // Full track length
    float currentSpan = maxSpan * uProgress; // Current distance between ends
    
    // 3.1 Buckling Physics (Fixed Body Length)
    // Concept: The strip has a "Resting Length" (say, equal to trackWidth).
    // As uProgress decreases, the endpoints get closer (currentSpan decreases).
    // To conserve length, the strip MUST buckle up.
    // Approximate Triangle Buckle Height: h = sqrt((L/2)^2 - (d/2)^2)
    
    // Tune this "Resting Length" to be slightly longer than the current span
    // so it always has a little curve, or starts flat at 1.0.
    // Let's assume it becomes flat at progress = 0.9.
    float restingLength = maxSpan * 0.9; 
    
    float buckleHeight = 0.0;
    if (currentSpan < restingLength) {
        // Pythagoras approximation for arch height
        float halfL = restingLength * 0.5;
        float halfD = currentSpan * 0.5;
        // Safety sqrt
        float val = halfL*halfL - halfD*halfD;
        if (val > 0.0) {
            buckleHeight = sqrt(val) * 0.8; // Scaling factor to control visual exaggeration
        }
    }
    
    // Clamp min/max for sanity
    buckleHeight = clamp(buckleHeight, 0.0, 0.4);

    // 4. Coordinates Logic
    // Head Position based on progress
    float currentX = leftX + currentSpan;

    // 5. Deforming the Space (The Inverted V)
    vec2 deformedUV = uv;
    
    // Center of the buckle should be halfway between leftX and currentX
    float midX = (leftX + currentX) * 0.5;
    float distFromMid = deformedUV.x - midX;
    
    // Determine Shape:
    // We want a peak at midX.
    // Width of the buckle is roughly currentSpan.
    
    // Normalized position along the strip (0 at left, 1 at right)
    float t = (deformedUV.x - leftX) / (currentSpan + 0.001);
    
    // Only deform if we are within the strip range (roughly)
    float deformation = 0.0;
    
    // Parabolic / Sinusoidal Arch
    // sin(t * PI) gives a nice smooth arch 0->1->0
    // But user wants "Inverted V" (Sharp peak)
    // Let's mix Sine and Triangle
    // Determine Shape:
    // We want a smooth arch (Sine wave is best for "rounded")
    // Normalized position along the strip (t) already defined above
    
    // Only deform if we are within the strip range
    
    if (t > 0.0 && t < 1.0) {
        // Pure Sine Wave for smooth, rounded top
        // "Power" function can shape it slightly but keep it round
        float sine = sin(t * 3.14159);
        deformation = sine * buckleHeight;
    }
    
    // Tip Tilt Logic (Improved Connectivity)
    // Avoid "segments" by using a continuous smoothstep fading out from the head
    float distToHead = currentX - uv.x;
    // Effect area: -0.1 to 0.2 (around the head)
    float tipInfluence = smoothstep(0.2, -0.05, distToHead) * smoothstep(-0.2, 0.05, distToHead);
    // Bias significantly towards the actual tip
    tipInfluence *= smoothstep(0.2, 0.0, distToHead);
    
    // Tilt Amount
    float tiltz = 0.02 + clamp(abs(uDragSpeed) * 0.02, 0.0, 0.04);
    deformation += tiltz * tipInfluence;
    
    // Apply Deformation (Upwards)
    deformedUV.y -= deformation;

    // --- End Physics ---

    // 6. SDF Rendering

    // Track (Standard Groove)
    float dTrack = sdSegment(uv, vec2(leftX, 0.0), vec2(rightX, 0.0)) - (radius + 0.02);

    // Bar (Deformed Space)
    float dBar = sdSegment(deformedUV, vec2(leftX, 0.0), vec2(currentX, 0.0)) - radius;


    // 7. Coloring & Lighting
    vec3 color = vec3(0.0);
    float alpha = 0.0;
    
    vec3 lightDir = normalize(vec3(-0.5, 1.5, 2.0)); 
    vec3 viewDir = vec3(0.0, 0.0, 1.0);

    // A. Track
    if (dTrack < 0.0) {
        // Fake Normal
        vec3 tNorm = normalize(vec3(0.0, -uv.y * 3.0, 0.2));
        float diff = max(0.0, dot(tNorm, lightDir));
        
        // Base Color
        vec3 baseTrack = vec3(0.92, 0.92, 0.93) * (0.8 + 0.2*diff);
        
        // Inner Shadow (Subtle)
        // Mix with a darker grey instead of multiplying by black
        float shadowAlpha = 1.0 - smoothstep(0.0, 0.03, abs(dTrack));
        color = mix(baseTrack, vec3(0.7, 0.7, 0.75), shadowAlpha * 0.5); // Max 50% opacity shadow
        
        alpha = 1.0;
    }

    // B. Amber Strip
    if (dBar < 0.0) {
        // 3D Normal Mapping
        // Map local Y relative to the BENT spine
        // Approximation: localY is roughly (deformedUV.y) / radius
        float localY = clamp(deformedUV.y / radius, -1.0, 1.0);
        float localZ = sqrt(1.0 - localY*localY);
        
        // Reconstruct spatial normal taking the varying slope into account?
        // Advanced: Use dFdx(deformedUV.y) to tilt the normal? 
        // For now, standard cylinder normal is enough for the "roundness"
        vec3 normal = normalize(vec3(0.0, localY, localZ));
        
        // Add "Slope" influence to normal (Light catching the buckled shape)
        // If deformation slope is positive (left side of peak), normal.x should reflect that.
        // Slope approx = derivative of shape.
        // Normalized x (t) is centric.
        // t < 0.5 (Left slope): Normal points Left/Up
        // t > 0.5 (Right slope): Normal points Right/Down
        float slope = 0.0;
        if (t > 0.0 && t < 1.0) {
             // Derivative of triangle wave is constant sign
             slope = (t < 0.5) ? 1.0 : -1.0;
             // Scale by buckle height
             slope *= buckleHeight * 2.0; 
        }
        normal.x += slope;
        normal = normalize(normal);

        // Lighting
        vec3 halfVec = normalize(lightDir + viewDir);
        float spec = pow(max(0.0, dot(normal, halfVec)), 30.0);
        float fresnel = pow(1.0 - max(0.0, dot(normal, viewDir)), 3.0);
        
        // Colors
        vec3 cClear = vec3(0.9, 0.96, 0.98);
        vec3 cAmber = vec3(1.0, 0.60, 0.02);
        
        // Gradient along the Length (using original undeformed X for stable gradient?)
        // Or t? t depends on current span.
        // Let's use uProgress to decide how "Amber" the whole thing is? 
        // Or keep spatial gradient: Left=Clear, Right=Amber.
        float gradientPos = smoothstep(leftX, currentX, deformedUV.x);
        vec3 baseC = mix(cClear, cAmber, gradientPos * 0.8 + 0.2);
        
        // Translucency / Beer's Law
        vec3 finalC = baseC * vec3(1.0, 0.95, 0.9);
        finalC *= (0.4 + 0.6 * localZ); // Thicker center = lighter? No, thicker = absorbs more... 
        // Actually for glowing liquid, center might clearly show source color, edges dark.
        
        // Add Specular (White)
        finalC += vec3(1.0) * spec * 0.5;
        // Add Fresnel (Amber Glow)
        finalC += cAmber * fresnel * 0.8;
       
        color = finalC;
        alpha = 0.98;
    }

    if (dTrack > 0.0 && dBar > 0.0) discard;
    gl_FragColor = vec4(color, alpha);
}
`

export default class LiquidSlider {
    constructor(scene) {
        this.scene = scene
        this.sizes = { width: window.innerWidth, height: window.innerHeight }

        // State
        this.params = {
            progress: 0.5,
            currentProgress: 0.5,
            isDragging: false
        }

        this.init()
        this.addEventListeners()
    }

    init() {
        // Geometry
        this.geometry = new THREE.PlaneGeometry(this.sizes.width, this.sizes.height)

        // Material with Inline Shaders
        this.material = new THREE.ShaderMaterial({
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            uniforms: {
                uTime: { value: 0 },
                uProgress: { value: 0.5 },
                uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
                uDragSpeed: { value: 0.0 }
            },
            transparent: true,
            side: THREE.DoubleSide
        })

        this.mesh = new THREE.Mesh(this.geometry, this.material)
        this.scene.add(this.mesh)

        // Debug
        window.sliderMaterial = this.material
    }

    addEventListeners() {
        this.onPointerDown = this.onPointerDown.bind(this)
        this.onPointerMove = this.onPointerMove.bind(this)
        this.onPointerUp = this.onPointerUp.bind(this)

        window.addEventListener('pointerdown', this.onPointerDown)
        window.addEventListener('pointermove', this.onPointerMove)
        window.addEventListener('pointerup', this.onPointerUp)
    }

    onPointerDown(event) {
        this.params.isDragging = true
        this.updateProgress(event)
    }

    onPointerMove(event) {
        if (this.params.isDragging) {
            this.updateProgress(event)
        }
    }

    onPointerUp() {
        this.params.isDragging = false

        // Elastic bounce back effect
        gsap.to(this.params, {
            currentProgress: this.params.progress,
            duration: 0.5,
            ease: 'elastic.out(1, 0.5)',
            onUpdate: () => {
                if (this.material.uniforms.uProgress) {
                    this.material.uniforms.uProgress.value = this.params.currentProgress
                }
            }
        })
    }

    updateProgress(event) {
        const margin = 0.1
        let normalizedX = (event.clientX / window.innerWidth - margin) / (1.0 - margin * 2)
        normalizedX = Math.max(0, Math.min(1, normalizedX))

        this.params.progress = normalizedX

        gsap.to(this.params, {
            currentProgress: this.params.progress,
            duration: 0.2,
            ease: 'power2.out',
            onUpdate: () => {
                const velocity = (this.params.currentProgress - this.material.uniforms.uProgress.value) * 10.0
                if (this.material.uniforms.uDragSpeed) {
                    this.material.uniforms.uDragSpeed.value = velocity
                    console.log('Drag Speed:', velocity) // Debug Log
                }
                if (this.material.uniforms.uProgress) {
                    this.material.uniforms.uProgress.value = this.params.currentProgress
                }
            }
        })
    }

    update() {
        if (this.material.uniforms.uTime) {
            this.material.uniforms.uTime.value += 0.01
        }

        // Dampen velocity faster for sharper response
        if (this.material.uniforms.uDragSpeed) {
            this.material.uniforms.uDragSpeed.value *= 0.9
        }
    }
}
