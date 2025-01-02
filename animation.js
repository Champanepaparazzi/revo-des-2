class EnhancedAnimation {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        this.clock = new THREE.Clock();
        this.mouse = new THREE.Vector2();

        this.init();
    }

    init() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        document.getElementById('animation-container').appendChild(this.renderer.domElement);

        this.camera.position.z = 30;

        this.createConstellationSystem();
        this.createHolographicUI();

        window.addEventListener('resize', () => this.onWindowResize(), false);
        window.addEventListener('mousemove', (e) => this.onMouseMove(e), false);

        this.animate();
    }

    createConstellationSystem() {
        const geometry = new THREE.BufferGeometry();
        const particles = 1000;
        const positions = new Float32Array(particles * 3);
        
        for(let i = 0; i < positions.length; i += 3) {
            positions[i] = (Math.random() - 0.5) * 100;
            positions[i + 1] = (Math.random() - 0.5) * 100;
            positions[i + 2] = (Math.random() - 0.5) * 100;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const material = new THREE.PointsMaterial({
            size: 0.2,
            color: 0x9932CC,
            blending: THREE.AdditiveBlending,
            transparent: true,
            opacity: 0.8
        });

        this.particleSystem = new THREE.Points(geometry, material);
        this.scene.add(this.particleSystem);
    }

    createHolographicUI() {
        const shapes = [];
        const texts = ['INNOVATION', 'TECHNOLOGY', 'FUTURE'];
        
        texts.forEach((text, i) => {
            const geometry = new THREE.PlaneGeometry(10, 2);
            const material = new THREE.ShaderMaterial({
                uniforms: {
                    time: { value: 0 },
                    color: { value: new THREE.Color(0x9932CC) }
                },
                vertexShader: `
                    varying vec2 vUv;
                    void main() {
                        vUv = uv;
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                    }
                `,
                fragmentShader: `
                    uniform float time;
                    uniform vec3 color;
                    varying vec2 vUv;
                    
                    void main() {
                        float opacity = sin(vUv.x * 10.0 + time) * 0.5 + 0.5;
                        gl_FragColor = vec4(color, opacity * 0.5);
                    }
                `,
                transparent: true,
                blending: THREE.AdditiveBlending
            });

            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(-15, 10 - i * 5, 0);
            mesh.rotation.x = 0.2;
            shapes.push(mesh);
            this.scene.add(mesh);
        });

        this.holographicElements = shapes;
    }

    onMouseMove(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    updateParticles() {
        const positions = this.particleSystem.geometry.attributes.position.array;
        const time = this.clock.getElapsedTime();
        
        for(let i = 0; i < positions.length; i += 3) {
            positions[i] += Math.sin(time + i) * 0.01;
            positions[i + 1] += Math.cos(time + i) * 0.01;
            positions[i + 2] += Math.sin(time + i) * 0.01;
            
            if(Math.abs(positions[i]) > 50) positions[i] *= -1;
            if(Math.abs(positions[i + 1]) > 50) positions[i + 1] *= -1;
            if(Math.abs(positions[i + 2]) > 50) positions[i + 2] *= -1;
        }
        
        this.particleSystem.geometry.attributes.position.needsUpdate = true;
    }

    updateHolographicUI() {
        const time = this.clock.getElapsedTime();
        
        this.holographicElements.forEach((element, i) => {
            element.material.uniforms.time.value = time;
            element.position.x = -15 + Math.sin(time * 0.5 + i) * 2;
            element.rotation.z = Math.sin(time * 0.3 + i) * 0.1;
        });
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        this.updateParticles();
        this.updateHolographicUI();

        this.camera.position.x += (this.mouse.x * 30 - this.camera.position.x) * 0.05;
        this.camera.lookAt(this.scene.position);

        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize enhanced animation when the page loads
window.addEventListener('load', () => {
    new EnhancedAnimation();
});