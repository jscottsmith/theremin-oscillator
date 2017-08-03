import React, { Component } from 'react';
import { GyroNorm } from '../libs/gyronorm';
import './App.scss';

const FREQ_LOW = 32.7031956625748294; // C1 in Hz
const FREQ_HIGH = 1046.502261202394538; // C6 in Hz

function scaleBetween(value, newMin, newMax, oldMin, oldMax) {
    return (newMax - newMin) * (value - oldMin) / (oldMax - oldMin) + newMin;
}

export default class App extends Component {
    state = {
        isPlaying: false,
    };

    componentDidMount() {
        this.audioCtx = new (window.AudioContext ||
            window.webkitAudioContext)();
        this.ctx = this.canvas.getContext('2d');

        this.x = 0;
        this.y = 0;
        this.w = 0;
        this.h = 0;
        this.tick = 0;

        // Gyro
        const gn = new GyroNorm();

        const args = {
            frequency: 50, // ( How often the object sends the values - milliseconds )
            gravityNormalized: true, // ( If the gravity related values to be normalized )
            orientationBase: GyroNorm.GAME, // ( Can be GyroNorm.GAME or GyroNorm.WORLD. gn.GAME returns orientation values with respect to the head direction of the device. gn.WORLD returns the orientation values with respect to the actual north direction of the world. )
            decimalCount: 2, // ( How many digits after the decimal point will there be in the return values )
            logger: null, // ( Function to be called to log messages from gyronorm.js )
            screenAdjusted: false, // ( If set to true it will return screen adjusted values. )
        };

        gn
            .init(args)
            .then(() => {
                gn.start(data => {
                    this.x = scaleBetween(data.do.gamma, 0, this.w, -90, 90);
                    this.y = scaleBetween(data.do.beta, 0, this.w, -45, 45);

                    if (this.osc) {
                        this.setGain();
                        this.setFreq();
                    }

                    // data.do.alpha    ( deviceorientation event alpha value )  0 to 360.
                    // data.do.beta     ( deviceorientation event beta value ) -180 to 180.
                    // data.do.gamma    ( deviceorientation event gamma value ) -90 to 90.
                    // data.do.absolute ( deviceorientation event absolute value )
                });
            })
            .catch(e => {
                console.warn(
                    'Error: Device does not support DeviceOrientation or DeviceMotion is not supported by the browser or device'
                );
                // Catch if the DeviceOrientation or DeviceMotion is not supported by the browser or device
            });

        this.setCanvasSize();
        this.setupMasterGain();
        this.addListener();
        this.draw();
    }

    addListener() {
        ['mousedown', 'touchstart'].forEach(event => {
            this.canvas.addEventListener(event, this.handleInteract, false);
        });
        ['mouseup', 'touchend'].forEach(event => {
            this.canvas.addEventListener(event, this.handleInteract, false);
        });
        ['mousemove', 'touchmove'].forEach((event, touch) => {
            this.canvas.addEventListener(event, this.move, false);
        });
        window.addEventListener('resize', this.resize, false);
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

    resize = () => {
        this.setCanvasSize();
    };

    handleInteract = e => {
        e.stopPropagation();
        this.state.isPlaying ? this.stop() : this.play();
    };

    move = (event, touch) => {
        if (event.targetTouches) {
            event.preventDefault();
            this.x = event.targetTouches[0].clientX;
            this.y = event.targetTouches[0].clientY;
        } else {
            this.x = event.clientX;
            this.y = event.clientY;
        }

        if (this.osc) {
            this.setGain();
            this.setFreq();
        }
    };

    play = () => {
        this.setState({
            isPlaying: true,
        });

        this.setGain();

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

    drawOsc() {
        const xAxis = this.h / 2;

        this.ctx.beginPath();
        this.ctx.lineJoin = 'round';
        this.ctx.lineWidth = 3;
        this.ctx.strokeStyle = '#00cdac';
        this.ctx.moveTo(0, xAxis);

        // Draw Oscillator or flat line
        if (this.osc) {
            const phase = this.tick * 3.14159 / 180 * this.w / 10;

            const amplitude = this.masterGainNode.gain.value * this.h / 4;
            const frequency = this.osc.frequency.value / this.w * this.w / 10;

            const step = 1;
            const c = this.w / 3.14159 / (frequency * 2);

            for (let i = 0; i < this.w; i += step) {
                const y = amplitude * Math.sin(i / c + phase);
                this.ctx.lineTo(i, xAxis + y);
            }

            this.ctx.stroke();
        } else {
            this.ctx.lineTo(this.w, xAxis);
            this.ctx.stroke();
        }
    }

    drawBackground() {
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.h);
        gradient.addColorStop(0, '#7579ff');
        gradient.addColorStop(1, '#874da2');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.w, this.h);
    }

    drawPoint() {
        const r1 = 16;
        const r2 = 2;
        this.ctx.lineWidth = 2;
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, r1, 0, Math.PI * 2, true);
        this.ctx.closePath();
        this.ctx.stroke();

        this.ctx.fillStyle = '#ffffff';
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, r2, 0, Math.PI * 2, true);
        this.ctx.closePath();
        this.ctx.fill();
    }

    draw = () => {
        this.drawBackground();
        this.drawOsc();
        this.drawPoint();

        ++this.tick;

        window.requestAnimationFrame(this.draw);
    };

    render() {
        return (
            <main>
                <div className="values">
                    {`x: ${this.x} | y: ${this.y}`}
                </div>
                <canvas ref={ref => (this.canvas = ref)} />
                <button onClick={this.handleInteract}>
                    {this.state.isPlaying ? 'Stop' : 'Play'}
                </button>
            </main>
        );
    }
}
