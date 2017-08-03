import { GyroNorm } from './libs/gyronorm';
import './components/App.scss';

const FREQ_LOW = 32.7031956625748294; // C1 in Hz
const FREQ_HIGH = 1046.502261202394538; // C6 in Hz

function scaleBetween(value, newMin, newMax, oldMin, oldMax) {
    return (newMax - newMin) * (value - oldMin) / (oldMax - oldMin) + newMin;
}

const gyroOnIcon = `
<svg version="1.1" width="60px" height="60px" x="0px" y="0px" viewBox="0 0 60 60">
    <ellipse fill="none" stroke="#FFF" stroke-width="2" cx="30" cy="30" rx="5.5" ry="18"/>
    <ellipse fill="none" stroke="#FFF" stroke-width="2" cx="30" cy="30" rx="18" ry="5.5"/>
    <circle fill="#FFF" cx="30" cy="30" r="1"/>
    <circle fill="none" stroke="#FFF" stroke-width="2" cx="30" cy="30" r="25"/>
</svg>`;

const gyroOffIcon = `
<svg version="1.1" width="60px" height="60px" x="0px" y="0px" viewBox="0 0 60 60">
    <circle fill="none" stroke="#FFF" stroke-width="2" cx="30" cy="30" r="25"/>
    <line fill="none" stroke="#FFF" stroke-width="2" x1="19" y1="19" x2="41" y2="41"/>
    <line fill="none" stroke="#FFF" stroke-width="2" x1="41" y1="19" x2="19" y2="41"/>
</svg>`;

const oscOn = `
<svg version="1.1" width="60px" height="60px" x="0px" y="0px" viewBox="0 0 60 60">
    <path fill="none" stroke="#FFF" stroke-width="2" d="M4,30c0.8,6,1.6,12,3.2,12c3.2,0,3.2-24,6.5-24c3.2,0,3.2,24,6.5,24c3.2,0,3.2-24,6.5-24c3.2,0,3.2,24,6.5,24 c3.2,0,3.2-24,6.5-24c3.2,0,3.2,24,6.5,24c3.3,0,3.3-24,6.5-24c1.6,0,2.4,6,3.3,12"/>
    <polyline fill="none" stroke="#FFF" stroke-width="2" points="4,13.7 4,4 56,4 56,13.7 "/>
    <polyline fill="none" stroke="#FFF" stroke-width="2" points="56,46.5 56,56 4,56 4,46.5 "/>
</svg>`;

const oscOff = `
<svg version="1.1" width="60px" height="60px" x="0px" y="0px" viewBox="0 0 60 60">
    <polyline fill="none" stroke="#FFF" stroke-width="2" points="4.8,13.7 4.8,4 56.8,4 56.8,13.7 "/>
    <polyline fill="none" stroke="#FFF" stroke-width="2" points="56.8,46.5 56.8,56 4.8,56 4.8,46.5 "/>
    <line fill="none" stroke="#FFF" stroke-width="2" x1="19" y1="19.8" x2="41" y2="41.8"/>
    <line fill="none" stroke="#FFF" stroke-width="2" x1="41" y1="19.8" x2="19" y2="41.8"/>
</svg>`;

export default class Theremin {
    constructor(root) {
        this.root = root;

        this.setupUI();
        this.renderDom();
        this.updateDom();

        this.x = 0;
        this.y = 0;
        this.w = window.innerWidth;
        this.h = window.innerHeight;

        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.audioCtx = new AudioCtx();
        this.visualizer = new Visualizer(this);

        this.setupGyro();
        this.setCanvasSize();
        this.setupMasterGain();
        this.addListeners();
    }

    state = {
        isPlaying: false,
        userInteracting: false, // flag for mouse or touch interaction
    };

    setState(nextState) {
        this.state = Object.assign({}, this.state, nextState);
        this.updateDom();
    }

    setupUI() {
        this.canvas = document.createElement('canvas');
        this.playButton = document.createElement('button');
        this.playButton.className = 'play-btn';
        this.gyroButton = document.createElement('button');
        this.gyroButton.className = 'gyro-btn';
    }

    setupGyro() {
        // Gyro
        const gn = new GyroNorm();

        const args = {
            frequency: 50, // ( How often the object sends the values - milliseconds )
            gravityNormalized: true, // ( If the gravity related values to be normalized )
            orientationBase: GyroNorm.GAME,
            decimalCount: 3, // ( How many digits after the decimal point will there be in the return values )
            logger: null, // ( Function to be called to log messages from gyronorm.js )
            screenAdjusted: false, // ( If set to true it will return screen adjusted values. )
        };

        gn
            .init(args)
            .then(() => {
                gn.start(this.handleGyro);
            })
            .catch(e => {
                console.warn(
                    'Error: Device does not support DeviceOrientation or DeviceMotion is not supported by the browser or device'
                );
            });
    }

    addListeners() {
        ['mousedown', 'touchstart'].forEach(event => {
            this.canvas.addEventListener(
                event,
                this.handleInteractStart,
                false
            );
        });
        ['mouseup', 'touchend'].forEach(event => {
            this.canvas.addEventListener(event, this.handleInteractEnd, false);
        });
        ['mousemove', 'touchmove'].forEach((event, touch) => {
            this.canvas.addEventListener(event, this.handleInteractMove, false);
        });

        window.addEventListener('resize', this.handlerResize, false);
        this.playButton.addEventListener('click', this.handlePlayButton, false);
        this.gyroButton.addEventListener('click', this.handleGyroButton, false);
    }

    setupMasterGain() {
        this.masterGainNode = this.audioCtx.createGain();
        this.masterGainNode.connect(this.audioCtx.destination);
        this.masterGainNode.gain.value = 0;
    }

    setGain() {
        const gain = scaleBetween(this.y, 0, 1, 0, this.h);
        this.masterGainNode.gain.value = gain;
    }

    setFreq() {
        const frequency = scaleBetween(this.x, FREQ_LOW, FREQ_HIGH, 0, this.w);
        this.osc.frequency.value = frequency;
    }

    setCanvasSize() {
        this.w = window.innerWidth;
        this.h = window.innerHeight;

        this.canvas.width = this.w;
        this.canvas.height = this.h;
    }

    // Interaction and Event Handlers

    handlerResize = () => {
        this.setCanvasSize();
    };

    handleInteractStart = e => {
        e.stopPropagation();

        if (!this.state.userInteracting) {
            this.setState({
                userInteracting: true,
            });
        }
        this.play();
    };

    handleInteractEnd = () => {
        this.stop();
    };

    handlePlayButton = () => {
        this.state.isPlaying ? this.stop() : this.play();
    };

    handleGyroButton = () => {
        this.setState({
            userInteracting: !this.state.userInteracting,
        });
    };

    handleGyro = data => {
        if (this.state.userInteracting) return;

        this.x = scaleBetween(data.do.gamma, 0, this.w, -90, 90);
        this.y = scaleBetween(data.do.beta, 0, this.w, -45, 45);

        this.updateOsc();

        // data.do.alpha    ( deviceorientation event alpha value )  0 to 360.
        // data.do.beta     ( deviceorientation event beta value ) -180 to 180.
        // data.do.gamma    ( deviceorientation event gamma value ) -90 to 90.
        // data.do.absolute ( deviceorientation event absolute value )
    };

    handleInteractMove = (event, touch) => {
        if (!this.state.userInteracting) {
            this.setState({
                userInteracting: !this.state.userInteracting,
            });
        }

        if (event.targetTouches) {
            event.preventDefault();
            this.x = event.targetTouches[0].clientX;
            this.y = event.targetTouches[0].clientY;
        } else {
            this.x = event.clientX;
            this.y = event.clientY;
        }

        this.updateOsc();
    };

    // Audio Playback

    play = () => {
        this.setState({
            isPlaying: true,
        });

        this.setGain();

        if (this.osc) {
            this.stop();
        }

        this.osc = this.audioCtx.createOscillator();
        this.setFreq();
        this.osc.connect(this.masterGainNode);
        this.osc.start();

        return this.osc;
    };

    stop = () => {
        this.setState({
            isPlaying: false,
        });

        this.osc.stop();
        this.osc = null;

        return this.osc;
    };

    updateOsc() {
        if (this.osc) {
            this.setGain();
            this.setFreq();
        }
    }

    // DOM View

    renderDom() {
        this.root.appendChild(this.canvas);
        this.root.appendChild(this.playButton);
        this.root.appendChild(this.gyroButton);
    }

    updateDom() {
        this.playButton.innerHTML = this.state.isPlaying ? oscOff : oscOn;
        this.gyroButton.innerHTML = this.state.userInteracting
            ? gyroOnIcon
            : gyroOffIcon;
    }
}

class Visualizer {
    constructor(theremin) {
        this.theremin = theremin;
        this.ctx = this.theremin.canvas.getContext('2d');
        this.tick = 0;

        this.draw();
    }

    drawOsc() {
        const xAxis = this.theremin.h / 2;

        this.ctx.beginPath();
        this.ctx.lineJoin = 'round';
        this.ctx.lineWidth = 4;
        this.ctx.strokeStyle = '#FFFFFF';
        this.ctx.moveTo(0, xAxis);

        // Draw Oscillator or flat line
        if (this.theremin.osc) {
            const phase = this.tick * Math.PI / 180 * this.theremin.w / 10;

            const amplitude =
                this.theremin.masterGainNode.gain.value * this.theremin.h / 4;
            const frequency =
                this.theremin.osc.frequency.value /
                this.theremin.w *
                this.theremin.w /
                10;

            const step = 1;
            const c = this.theremin.w / Math.PI / (frequency * 2);

            for (let i = 0; i < this.theremin.w; i += step) {
                const y = amplitude * Math.sin(i / c + phase);
                this.ctx.lineTo(i, xAxis + y);
            }

            this.ctx.stroke();
        } else {
            this.ctx.lineTo(this.theremin.w, xAxis);
            this.ctx.stroke();
        }
    }

    drawBackground() {
        const { x, y, w, h } = this.theremin;
        const w2 = w / 2;
        const h2 = h / 2;

        // this.ctx.fillStyle = '#FFFFFF';
        // this.ctx.fillRect(0, 0, w, h);

        const r1 = Math.floor(scaleBetween(y, 50, 155, h, 0));
        const g1 = Math.floor(scaleBetween(y, 25, 155, h, 0));
        const b1 = Math.floor(scaleBetween(x, 50, 155, 0, w));

        const r2 = Math.floor(scaleBetween(y, 95, 255, 0, h));
        const g2 = Math.floor(scaleBetween(y, 155, 95, 0, h));
        const b2 = Math.floor(scaleBetween(x, 95, 255, 0, w));

        const color1 = `rgb(${r1}, ${g1}, ${b1})`;
        const color2 = `rgb(${r2}, ${g2}, ${b2})`;

        const r = Math.max(w, h);

        const grad1 = this.ctx.createRadialGradient(w2, h2, r, x, y, 0);
        grad1.addColorStop(0, color1);
        grad1.addColorStop(1, color2);
        this.ctx.fillStyle = grad1;
        this.ctx.fillRect(0, 0, w, h);
    }

    drawPoint() {
        const r1 = 16;
        const r2 = 2;
        this.ctx.lineWidth = 2;
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.beginPath();
        this.ctx.arc(
            this.theremin.x,
            this.theremin.y,
            r1,
            0,
            Math.PI * 2,
            true
        );
        this.ctx.closePath();
        this.ctx.stroke();

        this.ctx.fillStyle = '#ffffff';
        this.ctx.beginPath();
        this.ctx.arc(
            this.theremin.x,
            this.theremin.y,
            r2,
            0,
            Math.PI * 2,
            true
        );
        this.ctx.closePath();
        this.ctx.fill();
    }

    // Animation Loop

    draw = () => {
        this.drawBackground();
        this.drawOsc();
        this.drawPoint();

        ++this.tick;

        window.requestAnimationFrame(this.draw);
    };
}
