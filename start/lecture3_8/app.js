import * as THREE from '../../libs/three126/three.module.js';
import { GLTFLoader } from '../../libs/three126/GLTFLoader.js';
import { RGBELoader } from '../../libs/three126/RGBELoader.js';
import { OrbitControls } from '../../libs/three126/OrbitControls.js';
import { LoadingBar } from '../../libs/LoadingBar.js';

class App{
	constructor(){
		const container = document.createElement( 'div' );
		document.body.appendChild( container );
        
		this.camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 100 );
		this.camera.position.set( 0, 0, 5 );
        
		this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color( 0xaaaaaa );
        
		const ambient = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 0.5);
		this.scene.add(ambient);
        
        const light = new THREE.DirectionalLight( 0xFFFFFF, 1.5 );
        light.position.set( 0.2, 1, 1);
        this.scene.add(light);
			
		this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true } );
		this.renderer.setPixelRatio( window.devicePixelRatio );
		this.renderer.setSize( window.innerWidth, window.innerHeight );
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        container.appendChild( this.renderer.domElement );
		this.setEnvironment();
		
        //Add code here to code-along with the video
        this.LoadingBar = new LoadingBar();
        this.loadGLTF();

        this.controls = new OrbitControls( this.camera, this.renderer.domElement );
        
        window.addEventListener('resize', this.resize.bind(this) );
	}	
    
    setEnvironment(){
        const loader = new RGBELoader();
        const pmremGenerator = new THREE.PMREMGenerator( this.renderer );
        pmremGenerator.compileEquirectangularShader();
        
        const self = this;
        
        loader.load( '../../assets/hdr/venice_sunset_1k.hdr', ( texture ) => {
          const envMap = pmremGenerator.fromEquirectangular( texture ).texture;
          pmremGenerator.dispose();

          self.scene.environment = envMap;

        }, undefined, (err)=>{
            console.error( 'An error occurred setting the environment');
        } );
    }
    
    loadGLTF(){
        const loader = new GLTFLoader().setPath('../../assets/plane/');

        loader.load(
            'microplane.glb',
            gltf => {
                this.scene.add(gltf.scene);

                const bbox = new THREE.Box3().setFromObject(gltf.scene);
                console.log(`min:${bbox.min.x.toFixed(2)},${bbox.min.y.toFixed(2)}${bbox.min.z.toFixed(2)} max:${bbox.max.x.toFixed(2)},${bbox.max.y.toFixed(2)}${bbox.max.z.toFixed(2)}`)
                
                this.LoadingBar.visible = false;

                this.renderer.setAnimationLoop( this.render.bind(this));

                this.plane = gltf.scene;
                

            },
            xhr => {

                this.LoadingBar.progress = (xhr.loaded/xhr.total);
            },
            err => {

                console.error(err);

            }
        )
    }
    
    resize(){
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize( window.innerWidth, window.innerHeight );  
    }
    
	render( ) {   
        this.plane.rotateY( 0.01 );
        this.renderer.render( this.scene, this.camera );
    }
}

export { App };