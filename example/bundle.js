/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 2);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _gyronorm = __webpack_require__(3);

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*------------------------------*\
|* Theremin Oscillator
\*------------------------------*/

/*
 *
 * NOTES:
 *
 * Pitch on the theremin is controlled by the pointers x position.
 * Amplitude is controlled by the pointers y position.
 * Mousedown or Touch to start the Oscillator. Toggle on/off with osc UI.
 * Must view in debug mode to use the Gyroscope. Toggle on/off with gyro UI.
 *
 **/

/*------------------------------*\
|* Utils / Constants
\*------------------------------*/

var FREQ_LOW = 32.7031956625748294; // C1 in Hz
var FREQ_HIGH = 1046.502261202394538; // C6 in Hz
var DPR = window.devicePixelRatio || 1;

function scaleBetween(value, newMin, newMax, oldMin, oldMax) {
    return (newMax - newMin) * (value - oldMin) / (oldMax - oldMin) + newMin;
}

/*------------------------------*\
|* UI Icons
\*------------------------------*/

var gyroOnIcon = '\n<svg version="1.1" width="60px" height="60px" x="0px" y="0px" viewBox="0 0 60 60">\n    <ellipse fill="none" stroke="#FFF" stroke-width="2" cx="30" cy="30" rx="5.5" ry="18"/>\n    <ellipse fill="none" stroke="#FFF" stroke-width="2" cx="30" cy="30" rx="18" ry="5.5"/>\n    <circle fill="#FFF" cx="30" cy="30" r="1"/>\n    <circle fill="none" stroke="#FFF" stroke-width="2" cx="30" cy="30" r="25"/>\n</svg>';

var gyroOffIcon = '\n<svg version="1.1" width="60px" height="60px" x="0px" y="0px" viewBox="0 0 60 60">\n    <circle fill="none" stroke="#FFF" stroke-width="2" cx="30" cy="30" r="25"/>\n    <line fill="none" stroke="#FFF" stroke-width="2" x1="19" y1="19" x2="41" y2="41"/>\n    <line fill="none" stroke="#FFF" stroke-width="2" x1="41" y1="19" x2="19" y2="41"/>\n</svg>';

var oscOn = '\n<svg version="1.1" width="60px" height="60px" x="0px" y="0px" viewBox="0 0 60 60">\n    <path fill="none" stroke="#FFF" stroke-width="2" d="M4,30c0.8,6,1.6,12,3.2,12c3.2,0,3.2-24,6.5-24c3.2,0,3.2,24,6.5,24c3.2,0,3.2-24,6.5-24c3.2,0,3.2,24,6.5,24 c3.2,0,3.2-24,6.5-24c3.2,0,3.2,24,6.5,24c3.3,0,3.3-24,6.5-24c1.6,0,2.4,6,3.3,12"/>\n    <polyline fill="none" stroke="#FFF" stroke-width="2" points="4,13.7 4,4 56,4 56,13.7 "/>\n    <polyline fill="none" stroke="#FFF" stroke-width="2" points="56,46.5 56,56 4,56 4,46.5 "/>\n</svg>';

var oscOff = '\n<svg version="1.1" width="60px" height="60px" x="0px" y="0px" viewBox="0 0 60 60">\n    <polyline fill="none" stroke="#FFF" stroke-width="2" points="4.8,13.7 4.8,4 56.8,4 56.8,13.7 "/>\n    <polyline fill="none" stroke="#FFF" stroke-width="2" points="56.8,46.5 56.8,56 4.8,56 4.8,46.5 "/>\n    <line fill="none" stroke="#FFF" stroke-width="2" x1="19" y1="19.8" x2="41" y2="41.8"/>\n    <line fill="none" stroke="#FFF" stroke-width="2" x1="41" y1="19.8" x2="19" y2="41.8"/>\n</svg>';

/*------------------------------*\
|* Theremin Class
\*------------------------------*/

var Theremin = function () {
    function Theremin(root) {
        var _this = this;

        _classCallCheck(this, Theremin);

        this.state = {
            isPlaying: false,
            userInteracting: false };

        this.handlerResize = function () {
            _this.setCanvasSize();
        };

        this.handleInteractStart = function (e) {
            e.stopPropagation();

            if (!_this.state.userInteracting) {
                _this.setState({
                    userInteracting: true
                });
            }

            if (_this.state.isPlaying) {
                _this.stop();
            } else {
                _this.play();
            }
        };

        this.handleInteractEnd = function () {
            _this.stop();
        };

        this.handlePlayButton = function (e) {
            e.stopPropagation();
            _this.state.isPlaying ? _this.stop() : _this.play();
        };

        this.handleGyroButton = function () {
            _this.setState({
                userInteracting: !_this.state.userInteracting
            });
        };

        this.handleGyro = function (data) {
            if (_this.state.userInteracting) return;

            _this.x = scaleBetween(data.do.gamma, 0, _this.w, -90, 90);
            _this.y = scaleBetween(data.do.beta, 0, _this.w, -45, 45);

            _this.updateOsc();
        };

        this.handleInteractMove = function (event, touch) {
            if (!_this.state.userInteracting) {
                _this.setState({
                    userInteracting: !_this.state.userInteracting
                });
            }

            if (event.targetTouches) {
                event.preventDefault();
                _this.x = event.targetTouches[0].clientX * DPR;
                _this.y = event.targetTouches[0].clientY * DPR;
            } else {
                _this.x = event.clientX * DPR;
                _this.y = event.clientY * DPR;
            }

            _this.updateOsc();
        };

        this.play = function () {
            if (_this.osc) {
                _this.osc.stop();
                _this.osc = null;
            }

            if (_this.gainTimeout) return; // wait for any fading gains

            _this.setState({
                isPlaying: true
            });

            _this.updateGain();

            // new osc
            _this.osc = _this.audioCtx.createOscillator();
            _this.setFreq();
            _this.osc.connect(_this.masterGainNode);
            _this.osc.start();

            return _this.osc;
        };

        this.stop = function () {
            _this.updateGain(0, function () {
                _this.setState({
                    isPlaying: false
                });
                _this.osc.stop();
                _this.osc = null;
            });
        };

        this.root = root;

        this.setupUI();
        this.renderDom();
        this.updateDom();

        this.x = window.innerWidth / 2 * DPR;
        this.y = window.innerWidth / 1.8 * DPR;
        this.w = window.innerWidth;
        this.h = window.innerHeight;

        var AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.audioCtx = new AudioCtx();
        this.visualizer = new Visualizer(this);

        this.setupGyro();
        this.setCanvasSize();
        this.setupMasterGain();
        this.addListeners();
    }

    _createClass(Theremin, [{
        key: 'setState',
        value: function setState(nextState) {
            this.state = Object.assign({}, this.state, nextState);
            this.updateDom();
        }
    }, {
        key: 'setupUI',
        value: function setupUI() {
            this.canvas = document.createElement('canvas');
            this.playButton = document.createElement('button');
            this.playButton.className = 'play-btn';
            this.gyroButton = document.createElement('button');
            this.gyroButton.className = 'gyro-btn';
        }
    }, {
        key: 'setupGyro',
        value: function setupGyro() {
            var _this2 = this;

            // Gyro
            var gn = new _gyronorm.GyroNorm();

            var args = {
                frequency: 50, // ( How often the object sends the values - milliseconds )
                gravityNormalized: true, // ( If the gravity related values to be normalized )
                orientationBase: _gyronorm.GyroNorm.GAME,
                decimalCount: 3, // ( How many digits after the decimal point will there be in the return values )
                logger: null, // ( Function to be called to log messages from gyronorm.js )
                screenAdjusted: false };

            gn.init(args).then(function () {
                gn.start(_this2.handleGyro);
            }).catch(function (e) {
                console.warn('Error: Device does not support DeviceOrientation or DeviceMotion is not supported by the browser or device');
            });
        }
    }, {
        key: 'addListeners',
        value: function addListeners() {
            var _this3 = this;

            ['mousedown', 'touchstart'].forEach(function (event) {
                _this3.canvas.addEventListener(event, _this3.handleInteractStart, false);
            });
            ['mouseup', 'touchend'].forEach(function (event) {
                _this3.canvas.addEventListener(event, _this3.handleInteractEnd, false);
            });
            ['mousemove', 'touchmove'].forEach(function (event, touch) {
                _this3.canvas.addEventListener(event, _this3.handleInteractMove, false);
            });

            window.addEventListener('resize', this.handlerResize, false);
            this.playButton.addEventListener('click', this.handlePlayButton, false);
            this.gyroButton.addEventListener('click', this.handleGyroButton, false);
        }
    }, {
        key: 'setupMasterGain',
        value: function setupMasterGain() {
            console.log('master gain setup');
            this.masterGainNode = this.audioCtx.createGain();
            this.masterGainNode.connect(this.audioCtx.destination);
            this.masterGainNode.gain.value = 0;
        }
    }, {
        key: 'setGain',
        value: function setGain(value) {
            // cancel any future value
            var currentTime = this.audioCtx.currentTime;
            this.masterGainNode.gain.cancelScheduledValues(currentTime);
            this.masterGainNode.gain.value = value;
        }
    }, {
        key: 'updateGain',
        value: function updateGain(nextGain, cb) {
            var _this4 = this;

            if (typeof nextGain === 'undefined') {
                nextGain = scaleBetween(this.y, 0, 1, 0, this.h);
            }

            var rampTime = 0.1;
            var prevGain = this.masterGainNode.gain.value;
            var currentTime = this.audioCtx.currentTime;
            var endTime = currentTime + rampTime;
            this.masterGainNode.gain.cancelScheduledValues(currentTime);
            this.masterGainNode.gain.setValueAtTime(prevGain, currentTime);
            this.masterGainNode.gain.linearRampToValueAtTime(nextGain, endTime);

            // probably a nicer way to do this without callback nonsense...
            if (typeof cb === 'function') {
                if (this.gainTimeout) {
                    clearTimeout(this.gainTimeout);
                }
                this.gainTimeout = setTimeout(function () {
                    _this4.gainTimeout = null;
                    cb();
                }, rampTime * 1000);
            }
        }
    }, {
        key: 'setFreq',
        value: function setFreq() {
            var frequency = scaleBetween(this.x, FREQ_LOW, FREQ_HIGH, 0, this.w);
            this.osc.frequency.value = frequency;
        }
    }, {
        key: 'setCanvasSize',
        value: function setCanvasSize() {
            this.w = window.innerWidth * DPR;
            this.h = window.innerHeight * DPR;

            this.canvas.width = this.w;
            this.canvas.height = this.h;
            this.canvas.style.width = window.innerWidth + 'px';
            this.canvas.style.height = window.innerHeight + 'px';
        }

        // Interaction and Event Handlers

        // Audio Playback

    }, {
        key: 'updateOsc',
        value: function updateOsc() {
            if (this.osc && !this.gainTimeout) {
                this.updateGain();
                this.setFreq();
            }
        }

        // DOM View

    }, {
        key: 'renderDom',
        value: function renderDom() {
            this.root.appendChild(this.canvas);
            this.root.appendChild(this.playButton);
            this.root.appendChild(this.gyroButton);
        }
    }, {
        key: 'updateDom',
        value: function updateDom() {
            this.playButton.innerHTML = this.state.isPlaying ? oscOff : oscOn;
            this.gyroButton.innerHTML = this.state.userInteracting ? gyroOnIcon : gyroOffIcon;
        }
    }]);

    return Theremin;
}();

/*------------------------------*\
|* Visualizer
\*------------------------------*/

var Visualizer = function () {
    function Visualizer(theremin) {
        var _this5 = this;

        _classCallCheck(this, Visualizer);

        this.draw = function () {
            _this5.drawBackground();
            _this5.drawOsc();
            _this5.drawText();
            _this5.drawPoint();

            ++_this5.tick;

            window.requestAnimationFrame(_this5.draw);
        };

        this.theremin = theremin;
        this.ctx = this.theremin.canvas.getContext('2d');
        this.ctx.scale(DPR, DPR);
        this.tick = 0;

        this.draw();
    }

    _createClass(Visualizer, [{
        key: 'drawOsc',
        value: function drawOsc() {
            var xAxis = this.theremin.h / 2;

            this.ctx.beginPath();
            this.ctx.lineJoin = 'round';
            this.ctx.lineWidth = 2 * DPR;
            this.ctx.strokeStyle = '#222';
            this.ctx.moveTo(0, xAxis);

            // Draw Oscillator or flat line
            if (this.theremin.osc) {
                var phase = this.tick * Math.PI / 180 * this.theremin.w / 8;

                var amplitude = this.theremin.masterGainNode.gain.value * this.theremin.h / 4;
                var frequency = this.theremin.osc.frequency.value / this.theremin.w * this.theremin.w / 10;

                var step = 1;
                var c = this.theremin.w / Math.PI / (frequency * 2);

                for (var i = 0; i < this.theremin.w; i += step) {
                    var y = amplitude * Math.sin(i / c + phase);
                    this.ctx.lineTo(i, xAxis + y);
                }

                this.ctx.stroke();
            } else {
                this.ctx.lineTo(this.theremin.w, xAxis);
                this.ctx.stroke();
            }
        }
    }, {
        key: 'drawBackground',
        value: function drawBackground() {
            var _theremin = this.theremin,
                x = _theremin.x,
                y = _theremin.y,
                w = _theremin.w,
                h = _theremin.h;

            var w2 = w / 2;
            var h2 = h / 2;

            // this.ctx.fillStyle = '#FFFFFF';
            // this.ctx.fillRect(0, 0, w, h);

            var r1 = Math.floor(scaleBetween(y, 50, 155, h, 0));
            var g1 = Math.floor(scaleBetween(y, 200, 50, h, 0));
            var b1 = Math.floor(scaleBetween(x, 100, 255, 0, w));

            var r2 = Math.floor(scaleBetween(y, 95, 255, 0, h));
            var g2 = Math.floor(scaleBetween(y, 155, 95, 0, h));
            var b2 = Math.floor(scaleBetween(x, 95, 255, 0, w));

            var color1 = 'rgb(' + r1 + ', ' + g1 + ', ' + b1 + ')';
            var color2 = 'rgb(' + r2 + ', ' + g2 + ', ' + b2 + ')';

            var r = Math.max(w, h) * 2;

            var grad1 = this.ctx.createRadialGradient(w2, h2, r, x, y, 0);
            grad1.addColorStop(0, color1);
            grad1.addColorStop(1, color2);
            this.ctx.fillStyle = grad1;
            this.ctx.fillRect(0, 0, w, h);
        }
    }, {
        key: 'drawPoint',
        value: function drawPoint() {
            var r1 = 16 * DPR;
            var r2 = 2 * DPR;
            this.ctx.lineWidth = 2 * DPR;
            this.ctx.strokeStyle = '#222';
            this.ctx.beginPath();
            this.ctx.arc(this.theremin.x, this.theremin.y, r1, 0, Math.PI * 2, true);
            this.ctx.closePath();
            this.ctx.stroke();

            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.beginPath();
            this.ctx.arc(this.theremin.x, this.theremin.y, r2, 0, Math.PI * 2, true);
            this.ctx.closePath();
            this.ctx.fill();
        }
    }, {
        key: 'drawText',
        value: function drawText() {
            var ms = Math.min(this.theremin.w, this.theremin.h);
            var size = ms / 12;
            this.ctx.font = '900 italic ' + size + 'px futura-pt, futura, sans-serif';
            this.ctx.textAlign = 'center';
            this.ctx.fillStyle = 'white';

            var copy = 'Theremin Oscillator';
            this.ctx.fillText(copy, this.theremin.w / 2, this.theremin.h / 2 + size / 3);
        }

        // Animation Loop

    }]);

    return Visualizer;
}();

var root = document.getElementById('root');

var theremin = new Theremin(root);

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(4);
if(typeof content === 'string') content = [[module.i, content, '']];
// add the styles to the DOM
var update = __webpack_require__(6)(content, {});
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../node_modules/css-loader/index.js??ref--1-1!../node_modules/postcss-loader/index.js!../node_modules/sass-loader/lib/loader.js??ref--1-3!./App.scss", function() {
			var newContent = require("!!../node_modules/css-loader/index.js??ref--1-1!../node_modules/postcss-loader/index.js!../node_modules/sass-loader/lib/loader.js??ref--1-3!./App.scss");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _Theremin = __webpack_require__(0);

var _Theremin2 = _interopRequireDefault(_Theremin);

__webpack_require__(1);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var root = document.getElementById('root');
var theremin = new _Theremin2.default(root);

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
var __WEBPACK_AMD_DEFINE_RESULT__;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/**
 *
 * FULL TILT
 * http://github.com/richtr/Full-Tilt
 *
 * A standalone DeviceOrientation + DeviceMotion JavaScript library that
 * normalises orientation sensor input, applies relevant screen orientation
 * transforms, returns Euler Angle, Quaternion and Rotation
 * Matrix representations back to web developers and provides conversion
 * between all supported orientation representation types.
 *
 * Copyright: 2014 Rich Tibbett
 * License:   MIT
 *
 */

(function (window) {

    // Only initialize the FULLTILT API if it is not already attached to the DOM
    if (window.FULLTILT !== undefined && window.FULLTILT !== null) {
        return;
    }

    var M_PI = Math.PI;
    var M_PI_2 = M_PI / 2;
    var M_2_PI = 2 * M_PI;

    // Degree to Radian conversion
    var degToRad = M_PI / 180;
    var radToDeg = 180 / M_PI;

    // Internal device orientation + motion variables
    var sensors = {
        "orientation": {
            active: false,
            callbacks: [],
            data: undefined
        },
        "motion": {
            active: false,
            callbacks: [],
            data: undefined
        }
    };
    var screenActive = false;

    // Internal screen orientation variables
    var hasScreenOrientationAPI = window.screen && window.screen.orientation && window.screen.orientation.angle !== undefined && window.screen.orientation.angle !== null ? true : false;
    var screenOrientationAngle = (hasScreenOrientationAPI ? window.screen.orientation.angle : window.orientation || 0) * degToRad;

    var SCREEN_ROTATION_0 = 0,
        SCREEN_ROTATION_90 = M_PI_2,
        SCREEN_ROTATION_180 = M_PI,
        SCREEN_ROTATION_270 = M_2_PI / 3,
        SCREEN_ROTATION_MINUS_90 = -M_PI_2;

    // Math.sign polyfill
    function sign(x) {
        x = +x; // convert to a number
        if (x === 0 || isNaN(x)) return x;
        return x > 0 ? 1 : -1;
    }

    ///// Promise-based Sensor Data checker //////

    function SensorCheck(sensorRootObj) {

        var promise = new Promise(function (resolve, reject) {

            var runCheck = function runCheck(tries) {

                setTimeout(function () {

                    if (sensorRootObj && sensorRootObj.data) {

                        resolve();
                    } else if (tries >= 20) {

                        reject();
                    } else {

                        runCheck(++tries);
                    }
                }, 50);
            };

            runCheck(0);
        });

        return promise;
    }

    ////// Internal Event Handlers //////

    function handleScreenOrientationChange() {

        if (hasScreenOrientationAPI) {

            screenOrientationAngle = (window.screen.orientation.angle || 0) * degToRad;
        } else {

            screenOrientationAngle = (window.orientation || 0) * degToRad;
        }
    }

    function handleDeviceOrientationChange(event) {

        sensors.orientation.data = event;

        // Fire every callback function each time deviceorientation is updated
        for (var i in sensors.orientation.callbacks) {

            sensors.orientation.callbacks[i].call(this);
        }
    }

    function handleDeviceMotionChange(event) {

        sensors.motion.data = event;

        // Fire every callback function each time devicemotion is updated
        for (var i in sensors.motion.callbacks) {

            sensors.motion.callbacks[i].call(this);
        }
    }

    ///// FULLTILT API Root Object /////

    var FULLTILT = {};

    FULLTILT.version = "0.5.3";

    ///// FULLTILT API Root Methods /////

    FULLTILT.getDeviceOrientation = function (options) {

        var promise = new Promise(function (resolve, reject) {

            var control = new FULLTILT.DeviceOrientation(options);

            control.start();

            var orientationSensorCheck = new SensorCheck(sensors.orientation);

            orientationSensorCheck.then(function () {

                control._alphaAvailable = sensors.orientation.data.alpha && sensors.orientation.data.alpha !== null;
                control._betaAvailable = sensors.orientation.data.beta && sensors.orientation.data.beta !== null;
                control._gammaAvailable = sensors.orientation.data.gamma && sensors.orientation.data.gamma !== null;

                resolve(control);
            }).catch(function () {

                control.stop();
                reject('DeviceOrientation is not supported');
            });
        });

        return promise;
    };

    FULLTILT.getDeviceMotion = function (options) {

        var promise = new Promise(function (resolve, reject) {

            var control = new FULLTILT.DeviceMotion(options);

            control.start();

            var motionSensorCheck = new SensorCheck(sensors.motion);

            motionSensorCheck.then(function () {

                control._accelerationXAvailable = sensors.motion.data.acceleration && sensors.motion.data.acceleration.x;
                control._accelerationYAvailable = sensors.motion.data.acceleration && sensors.motion.data.acceleration.y;
                control._accelerationZAvailable = sensors.motion.data.acceleration && sensors.motion.data.acceleration.z;

                control._accelerationIncludingGravityXAvailable = sensors.motion.data.accelerationIncludingGravity && sensors.motion.data.accelerationIncludingGravity.x;
                control._accelerationIncludingGravityYAvailable = sensors.motion.data.accelerationIncludingGravity && sensors.motion.data.accelerationIncludingGravity.y;
                control._accelerationIncludingGravityZAvailable = sensors.motion.data.accelerationIncludingGravity && sensors.motion.data.accelerationIncludingGravity.z;

                control._rotationRateAlphaAvailable = sensors.motion.data.rotationRate && sensors.motion.data.rotationRate.alpha;
                control._rotationRateBetaAvailable = sensors.motion.data.rotationRate && sensors.motion.data.rotationRate.beta;
                control._rotationRateGammaAvailable = sensors.motion.data.rotationRate && sensors.motion.data.rotationRate.gamma;

                resolve(control);
            }).catch(function () {

                control.stop();
                reject('DeviceMotion is not supported');
            });
        });

        return promise;
    };

    ////// FULLTILT.Quaternion //////

    FULLTILT.Quaternion = function (x, y, z, w) {

        var quat, outQuat;

        this.set = function (x, y, z, w) {

            this.x = x || 0;
            this.y = y || 0;
            this.z = z || 0;
            this.w = w || 1;
        };

        this.copy = function (quaternion) {

            this.x = quaternion.x;
            this.y = quaternion.y;
            this.z = quaternion.z;
            this.w = quaternion.w;
        };

        this.setFromEuler = function () {

            var _x, _y, _z;
            var _x_2, _y_2, _z_2;
            var cX, cY, cZ, sX, sY, sZ;

            return function (euler) {

                euler = euler || {};

                _z = (euler.alpha || 0) * degToRad;
                _x = (euler.beta || 0) * degToRad;
                _y = (euler.gamma || 0) * degToRad;

                _z_2 = _z / 2;
                _x_2 = _x / 2;
                _y_2 = _y / 2;

                cX = Math.cos(_x_2);
                cY = Math.cos(_y_2);
                cZ = Math.cos(_z_2);
                sX = Math.sin(_x_2);
                sY = Math.sin(_y_2);
                sZ = Math.sin(_z_2);

                this.set(sX * cY * cZ - cX * sY * sZ, // x
                cX * sY * cZ + sX * cY * sZ, // y
                cX * cY * sZ + sX * sY * cZ, // z
                cX * cY * cZ - sX * sY * sZ // w
                );

                this.normalize();

                return this;
            };
        }();

        this.setFromRotationMatrix = function () {

            var R;

            return function (matrix) {

                R = matrix.elements;

                this.set(0.5 * Math.sqrt(1 + R[0] - R[4] - R[8]) * sign(R[7] - R[5]), // x
                0.5 * Math.sqrt(1 - R[0] + R[4] - R[8]) * sign(R[2] - R[6]), // y
                0.5 * Math.sqrt(1 - R[0] - R[4] + R[8]) * sign(R[3] - R[1]), // z
                0.5 * Math.sqrt(1 + R[0] + R[4] + R[8]) // w
                );

                return this;
            };
        }();

        this.multiply = function (quaternion) {

            outQuat = FULLTILT.Quaternion.prototype.multiplyQuaternions(this, quaternion);
            this.copy(outQuat);

            return this;
        };

        this.rotateX = function (angle) {

            outQuat = FULLTILT.Quaternion.prototype.rotateByAxisAngle(this, [1, 0, 0], angle);
            this.copy(outQuat);

            return this;
        };

        this.rotateY = function (angle) {

            outQuat = FULLTILT.Quaternion.prototype.rotateByAxisAngle(this, [0, 1, 0], angle);
            this.copy(outQuat);

            return this;
        };

        this.rotateZ = function (angle) {

            outQuat = FULLTILT.Quaternion.prototype.rotateByAxisAngle(this, [0, 0, 1], angle);
            this.copy(outQuat);

            return this;
        };

        this.normalize = function () {

            return FULLTILT.Quaternion.prototype.normalize(this);
        };

        // Initialize object values
        this.set(x, y, z, w);
    };

    FULLTILT.Quaternion.prototype = {

        constructor: FULLTILT.Quaternion,

        multiplyQuaternions: function () {

            var multipliedQuat = new FULLTILT.Quaternion();

            return function (a, b) {

                var qax = a.x,
                    qay = a.y,
                    qaz = a.z,
                    qaw = a.w;
                var qbx = b.x,
                    qby = b.y,
                    qbz = b.z,
                    qbw = b.w;

                multipliedQuat.set(qax * qbw + qaw * qbx + qay * qbz - qaz * qby, // x
                qay * qbw + qaw * qby + qaz * qbx - qax * qbz, // y
                qaz * qbw + qaw * qbz + qax * qby - qay * qbx, // z
                qaw * qbw - qax * qbx - qay * qby - qaz * qbz // w
                );

                return multipliedQuat;
            };
        }(),

        normalize: function normalize(q) {

            var len = Math.sqrt(q.x * q.x + q.y * q.y + q.z * q.z + q.w * q.w);

            if (len === 0) {

                q.x = 0;
                q.y = 0;
                q.z = 0;
                q.w = 1;
            } else {

                len = 1 / len;

                q.x *= len;
                q.y *= len;
                q.z *= len;
                q.w *= len;
            }

            return q;
        },

        rotateByAxisAngle: function () {

            var outputQuaternion = new FULLTILT.Quaternion();
            var transformQuaternion = new FULLTILT.Quaternion();

            var halfAngle, sA;

            return function (targetQuaternion, axis, angle) {

                halfAngle = (angle || 0) / 2;
                sA = Math.sin(halfAngle);

                transformQuaternion.set((axis[0] || 0) * sA, // x
                (axis[1] || 0) * sA, // y
                (axis[2] || 0) * sA, // z
                Math.cos(halfAngle) // w
                );

                // Multiply quaternion by q
                outputQuaternion = FULLTILT.Quaternion.prototype.multiplyQuaternions(targetQuaternion, transformQuaternion);

                return FULLTILT.Quaternion.prototype.normalize(outputQuaternion);
            };
        }()

    };

    ////// FULLTILT.RotationMatrix //////

    FULLTILT.RotationMatrix = function (m11, m12, m13, m21, m22, m23, m31, m32, m33) {

        var outMatrix;

        this.elements = new Float32Array(9);

        this.identity = function () {

            this.set(1, 0, 0, 0, 1, 0, 0, 0, 1);

            return this;
        };

        this.set = function (m11, m12, m13, m21, m22, m23, m31, m32, m33) {

            this.elements[0] = m11 || 1;
            this.elements[1] = m12 || 0;
            this.elements[2] = m13 || 0;
            this.elements[3] = m21 || 0;
            this.elements[4] = m22 || 1;
            this.elements[5] = m23 || 0;
            this.elements[6] = m31 || 0;
            this.elements[7] = m32 || 0;
            this.elements[8] = m33 || 1;
        };

        this.copy = function (matrix) {

            this.elements[0] = matrix.elements[0];
            this.elements[1] = matrix.elements[1];
            this.elements[2] = matrix.elements[2];
            this.elements[3] = matrix.elements[3];
            this.elements[4] = matrix.elements[4];
            this.elements[5] = matrix.elements[5];
            this.elements[6] = matrix.elements[6];
            this.elements[7] = matrix.elements[7];
            this.elements[8] = matrix.elements[8];
        };

        this.setFromEuler = function () {

            var _x, _y, _z;
            var cX, cY, cZ, sX, sY, sZ;

            return function (euler) {

                euler = euler || {};

                _z = (euler.alpha || 0) * degToRad;
                _x = (euler.beta || 0) * degToRad;
                _y = (euler.gamma || 0) * degToRad;

                cX = Math.cos(_x);
                cY = Math.cos(_y);
                cZ = Math.cos(_z);
                sX = Math.sin(_x);
                sY = Math.sin(_y);
                sZ = Math.sin(_z);

                //
                // ZXY-ordered rotation matrix construction.
                //

                this.set(cZ * cY - sZ * sX * sY, // 1,1
                -cX * sZ, // 1,2
                cY * sZ * sX + cZ * sY, // 1,3

                cY * sZ + cZ * sX * sY, // 2,1
                cZ * cX, // 2,2
                sZ * sY - cZ * cY * sX, // 2,3

                -cX * sY, // 3,1
                sX, // 3,2
                cX * cY // 3,3
                );

                this.normalize();

                return this;
            };
        }();

        this.setFromQuaternion = function () {

            var sqw, sqx, sqy, sqz;

            return function (q) {

                sqw = q.w * q.w;
                sqx = q.x * q.x;
                sqy = q.y * q.y;
                sqz = q.z * q.z;

                this.set(sqw + sqx - sqy - sqz, // 1,1
                2 * (q.x * q.y - q.w * q.z), // 1,2
                2 * (q.x * q.z + q.w * q.y), // 1,3

                2 * (q.x * q.y + q.w * q.z), // 2,1
                sqw - sqx + sqy - sqz, // 2,2
                2 * (q.y * q.z - q.w * q.x), // 2,3

                2 * (q.x * q.z - q.w * q.y), // 3,1
                2 * (q.y * q.z + q.w * q.x), // 3,2
                sqw - sqx - sqy + sqz // 3,3
                );

                return this;
            };
        }();

        this.multiply = function (m) {

            outMatrix = FULLTILT.RotationMatrix.prototype.multiplyMatrices(this, m);
            this.copy(outMatrix);

            return this;
        };

        this.rotateX = function (angle) {

            outMatrix = FULLTILT.RotationMatrix.prototype.rotateByAxisAngle(this, [1, 0, 0], angle);
            this.copy(outMatrix);

            return this;
        };

        this.rotateY = function (angle) {

            outMatrix = FULLTILT.RotationMatrix.prototype.rotateByAxisAngle(this, [0, 1, 0], angle);
            this.copy(outMatrix);

            return this;
        };

        this.rotateZ = function (angle) {

            outMatrix = FULLTILT.RotationMatrix.prototype.rotateByAxisAngle(this, [0, 0, 1], angle);
            this.copy(outMatrix);

            return this;
        };

        this.normalize = function () {

            return FULLTILT.RotationMatrix.prototype.normalize(this);
        };

        // Initialize object values
        this.set(m11, m12, m13, m21, m22, m23, m31, m32, m33);
    };

    FULLTILT.RotationMatrix.prototype = {

        constructor: FULLTILT.RotationMatrix,

        multiplyMatrices: function () {

            var matrix = new FULLTILT.RotationMatrix();

            var aE, bE;

            return function (a, b) {

                aE = a.elements;
                bE = b.elements;

                matrix.set(aE[0] * bE[0] + aE[1] * bE[3] + aE[2] * bE[6], aE[0] * bE[1] + aE[1] * bE[4] + aE[2] * bE[7], aE[0] * bE[2] + aE[1] * bE[5] + aE[2] * bE[8], aE[3] * bE[0] + aE[4] * bE[3] + aE[5] * bE[6], aE[3] * bE[1] + aE[4] * bE[4] + aE[5] * bE[7], aE[3] * bE[2] + aE[4] * bE[5] + aE[5] * bE[8], aE[6] * bE[0] + aE[7] * bE[3] + aE[8] * bE[6], aE[6] * bE[1] + aE[7] * bE[4] + aE[8] * bE[7], aE[6] * bE[2] + aE[7] * bE[5] + aE[8] * bE[8]);

                return matrix;
            };
        }(),

        normalize: function normalize(matrix) {

            var R = matrix.elements;

            // Calculate matrix determinant
            var determinant = R[0] * R[4] * R[8] - R[0] * R[5] * R[7] - R[1] * R[3] * R[8] + R[1] * R[5] * R[6] + R[2] * R[3] * R[7] - R[2] * R[4] * R[6];

            // Normalize matrix values
            R[0] /= determinant;
            R[1] /= determinant;
            R[2] /= determinant;
            R[3] /= determinant;
            R[4] /= determinant;
            R[5] /= determinant;
            R[6] /= determinant;
            R[7] /= determinant;
            R[8] /= determinant;

            matrix.elements = R;

            return matrix;
        },

        rotateByAxisAngle: function () {

            var outputMatrix = new FULLTILT.RotationMatrix();
            var transformMatrix = new FULLTILT.RotationMatrix();

            var sA, cA;
            var validAxis = false;

            return function (targetRotationMatrix, axis, angle) {

                transformMatrix.identity(); // reset transform matrix

                validAxis = false;

                sA = Math.sin(angle);
                cA = Math.cos(angle);

                if (axis[0] === 1 && axis[1] === 0 && axis[2] === 0) {
                    // x

                    validAxis = true;

                    transformMatrix.elements[4] = cA;
                    transformMatrix.elements[5] = -sA;
                    transformMatrix.elements[7] = sA;
                    transformMatrix.elements[8] = cA;
                } else if (axis[1] === 1 && axis[0] === 0 && axis[2] === 0) {
                    // y

                    validAxis = true;

                    transformMatrix.elements[0] = cA;
                    transformMatrix.elements[2] = sA;
                    transformMatrix.elements[6] = -sA;
                    transformMatrix.elements[8] = cA;
                } else if (axis[2] === 1 && axis[0] === 0 && axis[1] === 0) {
                    // z

                    validAxis = true;

                    transformMatrix.elements[0] = cA;
                    transformMatrix.elements[1] = -sA;
                    transformMatrix.elements[3] = sA;
                    transformMatrix.elements[4] = cA;
                }

                if (validAxis) {

                    outputMatrix = FULLTILT.RotationMatrix.prototype.multiplyMatrices(targetRotationMatrix, transformMatrix);

                    outputMatrix = FULLTILT.RotationMatrix.prototype.normalize(outputMatrix);
                } else {

                    outputMatrix = targetRotationMatrix;
                }

                return outputMatrix;
            };
        }()

    };

    ////// FULLTILT.Euler //////

    FULLTILT.Euler = function (alpha, beta, gamma) {

        this.set = function (alpha, beta, gamma) {

            this.alpha = alpha || 0;
            this.beta = beta || 0;
            this.gamma = gamma || 0;
        };

        this.copy = function (inEuler) {

            this.alpha = inEuler.alpha;
            this.beta = inEuler.beta;
            this.gamma = inEuler.gamma;
        };

        this.setFromRotationMatrix = function () {

            var R, _alpha, _beta, _gamma;

            return function (matrix) {

                R = matrix.elements;

                if (R[8] > 0) {
                    // cos(beta) > 0

                    _alpha = Math.atan2(-R[1], R[4]);
                    _beta = Math.asin(R[7]); // beta (-pi/2, pi/2)
                    _gamma = Math.atan2(-R[6], R[8]); // gamma (-pi/2, pi/2)
                } else if (R[8] < 0) {
                    // cos(beta) < 0

                    _alpha = Math.atan2(R[1], -R[4]);
                    _beta = -Math.asin(R[7]);
                    _beta += _beta >= 0 ? -M_PI : M_PI; // beta [-pi,-pi/2) U (pi/2,pi)
                    _gamma = Math.atan2(R[6], -R[8]); // gamma (-pi/2, pi/2)
                } else {
                    // R[8] == 0

                    if (R[6] > 0) {
                        // cos(gamma) == 0, cos(beta) > 0

                        _alpha = Math.atan2(-R[1], R[4]);
                        _beta = Math.asin(R[7]); // beta [-pi/2, pi/2]
                        _gamma = -M_PI_2; // gamma = -pi/2
                    } else if (R[6] < 0) {
                        // cos(gamma) == 0, cos(beta) < 0

                        _alpha = Math.atan2(R[1], -R[4]);
                        _beta = -Math.asin(R[7]);
                        _beta += _beta >= 0 ? -M_PI : M_PI; // beta [-pi,-pi/2) U (pi/2,pi)
                        _gamma = -M_PI_2; // gamma = -pi/2
                    } else {
                        // R[6] == 0, cos(beta) == 0

                        // gimbal lock discontinuity
                        _alpha = Math.atan2(R[3], R[0]);
                        _beta = R[7] > 0 ? M_PI_2 : -M_PI_2; // beta = +-pi/2
                        _gamma = 0; // gamma = 0
                    }
                }

                // alpha is in [-pi, pi], make sure it is in [0, 2*pi).
                if (_alpha < 0) {
                    _alpha += M_2_PI; // alpha [0, 2*pi)
                }

                // Convert to degrees
                _alpha *= radToDeg;
                _beta *= radToDeg;
                _gamma *= radToDeg;

                // apply derived euler angles to current object
                this.set(_alpha, _beta, _gamma);
            };
        }();

        this.setFromQuaternion = function () {

            var _alpha, _beta, _gamma;

            return function (q) {

                var sqw = q.w * q.w;
                var sqx = q.x * q.x;
                var sqy = q.y * q.y;
                var sqz = q.z * q.z;

                var unitLength = sqw + sqx + sqy + sqz; // Normalised == 1, otherwise correction divisor.
                var wxyz = q.w * q.x + q.y * q.z;
                var epsilon = 1e-6; // rounding factor

                if (wxyz > (0.5 - epsilon) * unitLength) {

                    _alpha = 2 * Math.atan2(q.y, q.w);
                    _beta = M_PI_2;
                    _gamma = 0;
                } else if (wxyz < (-0.5 + epsilon) * unitLength) {

                    _alpha = -2 * Math.atan2(q.y, q.w);
                    _beta = -M_PI_2;
                    _gamma = 0;
                } else {

                    var aX = sqw - sqx + sqy - sqz;
                    var aY = 2 * (q.w * q.z - q.x * q.y);

                    var gX = sqw - sqx - sqy + sqz;
                    var gY = 2 * (q.w * q.y - q.x * q.z);

                    if (gX > 0) {

                        _alpha = Math.atan2(aY, aX);
                        _beta = Math.asin(2 * wxyz / unitLength);
                        _gamma = Math.atan2(gY, gX);
                    } else {

                        _alpha = Math.atan2(-aY, -aX);
                        _beta = -Math.asin(2 * wxyz / unitLength);
                        _beta += _beta < 0 ? M_PI : -M_PI;
                        _gamma = Math.atan2(-gY, -gX);
                    }
                }

                // alpha is in [-pi, pi], make sure it is in [0, 2*pi).
                if (_alpha < 0) {
                    _alpha += M_2_PI; // alpha [0, 2*pi)
                }

                // Convert to degrees
                _alpha *= radToDeg;
                _beta *= radToDeg;
                _gamma *= radToDeg;

                // apply derived euler angles to current object
                this.set(_alpha, _beta, _gamma);
            };
        }();

        this.rotateX = function (angle) {

            FULLTILT.Euler.prototype.rotateByAxisAngle(this, [1, 0, 0], angle);

            return this;
        };

        this.rotateY = function (angle) {

            FULLTILT.Euler.prototype.rotateByAxisAngle(this, [0, 1, 0], angle);

            return this;
        };

        this.rotateZ = function (angle) {

            FULLTILT.Euler.prototype.rotateByAxisAngle(this, [0, 0, 1], angle);

            return this;
        };

        // Initialize object values
        this.set(alpha, beta, gamma);
    };

    FULLTILT.Euler.prototype = {

        constructor: FULLTILT.Euler,

        rotateByAxisAngle: function () {

            var _matrix = new FULLTILT.RotationMatrix();
            var outEuler;

            return function (targetEuler, axis, angle) {

                _matrix.setFromEuler(targetEuler);

                _matrix = FULLTILT.RotationMatrix.prototype.rotateByAxisAngle(_matrix, axis, angle);

                targetEuler.setFromRotationMatrix(_matrix);

                return targetEuler;
            };
        }()

    };

    ///// FULLTILT.DeviceOrientation //////

    FULLTILT.DeviceOrientation = function (options) {

        this.options = options || {}; // by default use UA deviceorientation 'type' ("game" on iOS, "world" on Android)

        var tries = 0;
        var maxTries = 200;
        var successCount = 0;
        var successThreshold = 10;

        this.alphaOffsetScreen = 0;
        this.alphaOffsetDevice = undefined;

        // Create a game-based deviceorientation object (initial alpha === 0 degrees)
        if (this.options.type === "game") {

            var setGameAlphaOffset = function (evt) {

                if (evt.alpha !== null) {
                    // do regardless of whether 'evt.absolute' is also true
                    this.alphaOffsetDevice = new FULLTILT.Euler(evt.alpha, 0, 0);
                    this.alphaOffsetDevice.rotateZ(-screenOrientationAngle);

                    // Discard first {successThreshold} responses while a better compass lock is found by UA
                    if (++successCount >= successThreshold) {
                        window.removeEventListener('deviceorientation', setGameAlphaOffset, false);
                        return;
                    }
                }

                if (++tries >= maxTries) {
                    window.removeEventListener('deviceorientation', setGameAlphaOffset, false);
                }
            }.bind(this);

            window.addEventListener('deviceorientation', setGameAlphaOffset, false);

            // Create a compass-based deviceorientation object (initial alpha === compass degrees)
        } else if (this.options.type === "world") {

            var setCompassAlphaOffset = function (evt) {

                if (evt.absolute !== true && evt.webkitCompassAccuracy !== undefined && evt.webkitCompassAccuracy !== null && +evt.webkitCompassAccuracy >= 0 && +evt.webkitCompassAccuracy < 50) {
                    this.alphaOffsetDevice = new FULLTILT.Euler(evt.webkitCompassHeading, 0, 0);
                    this.alphaOffsetDevice.rotateZ(screenOrientationAngle);
                    this.alphaOffsetScreen = screenOrientationAngle;

                    // Discard first {successThreshold} responses while a better compass lock is found by UA
                    if (++successCount >= successThreshold) {
                        window.removeEventListener('deviceorientation', setCompassAlphaOffset, false);
                        return;
                    }
                }

                if (++tries >= maxTries) {
                    window.removeEventListener('deviceorientation', setCompassAlphaOffset, false);
                }
            }.bind(this);

            window.addEventListener('deviceorientation', setCompassAlphaOffset, false);
        } // else... use whatever orientation system the UA provides ("game" on iOS, "world" on Android)
    };

    FULLTILT.DeviceOrientation.prototype = {

        constructor: FULLTILT.DeviceOrientation,

        start: function start(callback) {

            if (callback && Object.prototype.toString.call(callback) == '[object Function]') {

                sensors.orientation.callbacks.push(callback);
            }

            if (!screenActive) {

                if (hasScreenOrientationAPI) {

                    window.screen.orientation.addEventListener('change', handleScreenOrientationChange, false);
                } else {

                    window.addEventListener('orientationchange', handleScreenOrientationChange, false);
                }
            }

            if (!sensors.orientation.active) {

                window.addEventListener('deviceorientation', handleDeviceOrientationChange, false);

                sensors.orientation.active = true;
            }
        },

        stop: function stop() {

            if (sensors.orientation.active) {

                window.removeEventListener('deviceorientation', handleDeviceOrientationChange, false);

                sensors.orientation.active = false;
            }
        },

        listen: function listen(callback) {

            this.start(callback);
        },

        getFixedFrameQuaternion: function () {

            var euler = new FULLTILT.Euler();
            var matrix = new FULLTILT.RotationMatrix();
            var quaternion = new FULLTILT.Quaternion();

            return function () {

                var orientationData = sensors.orientation.data || { alpha: 0, beta: 0, gamma: 0 };

                var adjustedAlpha = orientationData.alpha;

                if (this.alphaOffsetDevice) {
                    matrix.setFromEuler(this.alphaOffsetDevice);
                    matrix.rotateZ(-this.alphaOffsetScreen);
                    euler.setFromRotationMatrix(matrix);

                    if (euler.alpha < 0) {
                        euler.alpha += 360;
                    }

                    euler.alpha %= 360;

                    adjustedAlpha -= euler.alpha;
                }

                euler.set(adjustedAlpha, orientationData.beta, orientationData.gamma);

                quaternion.setFromEuler(euler);

                return quaternion;
            };
        }(),

        getScreenAdjustedQuaternion: function () {

            var quaternion;

            return function () {

                quaternion = this.getFixedFrameQuaternion();

                // Automatically apply screen orientation transform
                quaternion.rotateZ(-screenOrientationAngle);

                return quaternion;
            };
        }(),

        getFixedFrameMatrix: function () {

            var euler = new FULLTILT.Euler();
            var matrix = new FULLTILT.RotationMatrix();

            return function () {

                var orientationData = sensors.orientation.data || { alpha: 0, beta: 0, gamma: 0 };

                var adjustedAlpha = orientationData.alpha;

                if (this.alphaOffsetDevice) {
                    matrix.setFromEuler(this.alphaOffsetDevice);
                    matrix.rotateZ(-this.alphaOffsetScreen);
                    euler.setFromRotationMatrix(matrix);

                    if (euler.alpha < 0) {
                        euler.alpha += 360;
                    }

                    euler.alpha %= 360;

                    adjustedAlpha -= euler.alpha;
                }

                euler.set(adjustedAlpha, orientationData.beta, orientationData.gamma);

                matrix.setFromEuler(euler);

                return matrix;
            };
        }(),

        getScreenAdjustedMatrix: function () {

            var matrix;

            return function () {

                matrix = this.getFixedFrameMatrix();

                // Automatically apply screen orientation transform
                matrix.rotateZ(-screenOrientationAngle);

                return matrix;
            };
        }(),

        getFixedFrameEuler: function () {

            var euler = new FULLTILT.Euler();
            var matrix;

            return function () {

                matrix = this.getFixedFrameMatrix();

                euler.setFromRotationMatrix(matrix);

                return euler;
            };
        }(),

        getScreenAdjustedEuler: function () {

            var euler = new FULLTILT.Euler();
            var matrix;

            return function () {

                matrix = this.getScreenAdjustedMatrix();

                euler.setFromRotationMatrix(matrix);

                return euler;
            };
        }(),

        isAbsolute: function isAbsolute() {

            if (sensors.orientation.data && sensors.orientation.data.absolute === true) {
                return true;
            }

            return false;
        },

        getLastRawEventData: function getLastRawEventData() {

            return sensors.orientation.data || {};
        },

        _alphaAvailable: false,
        _betaAvailable: false,
        _gammaAvailable: false,

        isAvailable: function isAvailable(_valueType) {

            switch (_valueType) {
                case this.ALPHA:
                    return this._alphaAvailable;

                case this.BETA:
                    return this._betaAvailable;

                case this.GAMMA:
                    return this._gammaAvailable;
            }
        },

        ALPHA: 'alpha',
        BETA: 'beta',
        GAMMA: 'gamma'

    };

    ///// FULLTILT.DeviceMotion //////

    FULLTILT.DeviceMotion = function (options) {

        this.options = options || {}; // placeholder object since no options are currently supported
    };

    FULLTILT.DeviceMotion.prototype = {

        constructor: FULLTILT.DeviceMotion,

        start: function start(callback) {

            if (callback && Object.prototype.toString.call(callback) == '[object Function]') {

                sensors.motion.callbacks.push(callback);
            }

            if (!screenActive) {

                if (hasScreenOrientationAPI) {

                    window.screen.orientation.addEventListener('change', handleScreenOrientationChange, false);
                } else {

                    window.addEventListener('orientationchange', handleScreenOrientationChange, false);
                }
            }

            if (!sensors.motion.active) {

                window.addEventListener('devicemotion', handleDeviceMotionChange, false);

                sensors.motion.active = true;
            }
        },

        stop: function stop() {

            if (sensors.motion.active) {

                window.removeEventListener('devicemotion', handleDeviceMotionChange, false);

                sensors.motion.active = false;
            }
        },

        listen: function listen(callback) {

            this.start(callback);
        },

        getScreenAdjustedAcceleration: function getScreenAdjustedAcceleration() {

            var accData = sensors.motion.data && sensors.motion.data.acceleration ? sensors.motion.data.acceleration : { x: 0, y: 0, z: 0 };
            var screenAccData = {};

            switch (screenOrientationAngle) {
                case SCREEN_ROTATION_90:
                    screenAccData.x = -accData.y;
                    screenAccData.y = accData.x;
                    break;
                case SCREEN_ROTATION_180:
                    screenAccData.x = -accData.x;
                    screenAccData.y = -accData.y;
                    break;
                case SCREEN_ROTATION_270:
                case SCREEN_ROTATION_MINUS_90:
                    screenAccData.x = accData.y;
                    screenAccData.y = -accData.x;
                    break;
                default:
                    // SCREEN_ROTATION_0
                    screenAccData.x = accData.x;
                    screenAccData.y = accData.y;
                    break;
            }

            screenAccData.z = accData.z;

            return screenAccData;
        },

        getScreenAdjustedAccelerationIncludingGravity: function getScreenAdjustedAccelerationIncludingGravity() {

            var accGData = sensors.motion.data && sensors.motion.data.accelerationIncludingGravity ? sensors.motion.data.accelerationIncludingGravity : { x: 0, y: 0, z: 0 };
            var screenAccGData = {};

            switch (screenOrientationAngle) {
                case SCREEN_ROTATION_90:
                    screenAccGData.x = -accGData.y;
                    screenAccGData.y = accGData.x;
                    break;
                case SCREEN_ROTATION_180:
                    screenAccGData.x = -accGData.x;
                    screenAccGData.y = -accGData.y;
                    break;
                case SCREEN_ROTATION_270:
                case SCREEN_ROTATION_MINUS_90:
                    screenAccGData.x = accGData.y;
                    screenAccGData.y = -accGData.x;
                    break;
                default:
                    // SCREEN_ROTATION_0
                    screenAccGData.x = accGData.x;
                    screenAccGData.y = accGData.y;
                    break;
            }

            screenAccGData.z = accGData.z;

            return screenAccGData;
        },

        getScreenAdjustedRotationRate: function getScreenAdjustedRotationRate() {

            var rotRateData = sensors.motion.data && sensors.motion.data.rotationRate ? sensors.motion.data.rotationRate : { alpha: 0, beta: 0, gamma: 0 };
            var screenRotRateData = {};

            switch (screenOrientationAngle) {
                case SCREEN_ROTATION_90:
                    screenRotRateData.beta = -rotRateData.gamma;
                    screenRotRateData.gamma = rotRateData.beta;
                    break;
                case SCREEN_ROTATION_180:
                    screenRotRateData.beta = -rotRateData.beta;
                    screenRotRateData.gamma = -rotRateData.gamma;
                    break;
                case SCREEN_ROTATION_270:
                case SCREEN_ROTATION_MINUS_90:
                    screenRotRateData.beta = rotRateData.gamma;
                    screenRotRateData.gamma = -rotRateData.beta;
                    break;
                default:
                    // SCREEN_ROTATION_0
                    screenRotRateData.beta = rotRateData.beta;
                    screenRotRateData.gamma = rotRateData.gamma;
                    break;
            }

            screenRotRateData.alpha = rotRateData.alpha;

            return screenRotRateData;
        },

        getLastRawEventData: function getLastRawEventData() {

            return sensors.motion.data || {};
        },

        _accelerationXAvailable: false,
        _accelerationYAvailable: false,
        _accelerationZAvailable: false,

        _accelerationIncludingGravityXAvailable: false,
        _accelerationIncludingGravityYAvailable: false,
        _accelerationIncludingGravityZAvailable: false,

        _rotationRateAlphaAvailable: false,
        _rotationRateBetaAvailable: false,
        _rotationRateGammaAvailable: false,

        isAvailable: function isAvailable(_valueType) {

            switch (_valueType) {
                case this.ACCELERATION_X:
                    return this._accelerationXAvailable;

                case this.ACCELERATION_Y:
                    return this._accelerationYAvailable;

                case this.ACCELERATION_Z:
                    return this._accelerationZAvailable;

                case this.ACCELERATION_INCLUDING_GRAVITY_X:
                    return this._accelerationIncludingGravityXAvailable;

                case this.ACCELERATION_INCLUDING_GRAVITY_Y:
                    return this._accelerationIncludingGravityYAvailable;

                case this.ACCELERATION_INCLUDING_GRAVITY_Z:
                    return this._accelerationIncludingGravityZAvailable;

                case this.ROTATION_RATE_ALPHA:
                    return this._rotationRateAlphaAvailable;

                case this.ROTATION_RATE_BETA:
                    return this._rotationRateBetaAvailable;

                case this.ROTATION_RATE_GAMMA:
                    return this._rotationRateGammaAvailable;
            }
        },

        ACCELERATION_X: 'accelerationX',
        ACCELERATION_Y: 'accelerationY',
        ACCELERATION_Z: 'accelerationZ',

        ACCELERATION_INCLUDING_GRAVITY_X: 'accelerationIncludingGravityX',
        ACCELERATION_INCLUDING_GRAVITY_Y: 'accelerationIncludingGravityY',
        ACCELERATION_INCLUDING_GRAVITY_Z: 'accelerationIncludingGravityZ',

        ROTATION_RATE_ALPHA: 'rotationRateAlpha',
        ROTATION_RATE_BETA: 'rotationRateBeta',
        ROTATION_RATE_GAMMA: 'rotationRateGamma'

    };

    ////// Attach FULLTILT to root DOM element //////

    window.FULLTILT = FULLTILT;
})(window);
/**
* JavaScript project for accessing and normalizing the accelerometer and gyroscope data on mobile devices
*
* @author Doruk Eker <doruk@dorukeker.com>
* @copyright Doruk Eker <http://dorukeker.com>
* @version 2.0.6
* @license MIT License | http://opensource.org/licenses/MIT
*/

(function (root, factory) {
    var e = {
        GyroNorm: factory()
    };
    if (true) {
        !(__WEBPACK_AMD_DEFINE_RESULT__ = function () {
            return e;
        }.call(exports, __webpack_require__, exports, module),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
    } else if ((typeof module === "undefined" ? "undefined" : _typeof(module)) === 'object' && module.exports) {
        module.exports = e;
    } else {
        root.GyroNorm = e.GyroNorm;
    }
})(undefined, function () {
    /* Constants */
    var GAME = 'game';
    var WORLD = 'world';
    var DEVICE_ORIENTATION = 'deviceorientation';
    var ACCELERATION = 'acceleration';
    var ACCELERATION_INCLUDING_GRAVITY = 'accelerationinludinggravity';
    var ROTATION_RATE = 'rotationrate';

    /*-------------------------------------------------------*/
    /* PRIVATE VARIABLES */

    var _interval = null; // Timer to return values
    var _isCalibrating = false; // Flag if calibrating
    var _calibrationValue = 0; // Alpha offset value
    var _gravityCoefficient = 0; // Coefficient to normalze gravity related values
    var _isRunning = false; // Boolean value if GyroNorm is tracking
    var _isReady = false; // Boolean value if GyroNorm is is initialized

    var _do = null; // Object to store the device orientation values
    var _dm = null; // Object to store the device motion values

    /* OPTIONS */
    var _frequency = 50; // Frequency for the return data in milliseconds
    var _gravityNormalized = true; // Flag if to normalize gravity values
    var _orientationBase = GAME; // Can be GyroNorm.GAME or GyroNorm.WORLD. GyroNorm.GAME returns orientation values with respect to the head direction of the device. GyroNorm.WORLD returns the orientation values with respect to the actual north direction of the world.
    var _decimalCount = 2; // Number of digits after the decimals point for the return values
    var _logger = null; // Function to callback on error. There is no default value. It can only be set by the user on gn.init()
    var _screenAdjusted = false; // If set to true it will return screen adjusted values. (e.g. On a horizontal orientation of a mobile device, the head would be one of the sides, instead of  the actual head of the device.)

    var _values = {
        do: {
            alpha: 0,
            beta: 0,
            gamma: 0,
            absolute: false
        },
        dm: {
            x: 0,
            y: 0,
            z: 0,
            gx: 0,
            gy: 0,
            gz: 0,
            alpha: 0,
            beta: 0,
            gamma: 0
        }
    };

    /*-------------------------------------------------------*/
    /* PUBLIC FUNCTIONS */

    /*
    *
    * Constructor function
    *
    */

    var GyroNorm = function GyroNorm(options) {};

    /* Constants */
    GyroNorm.GAME = GAME;
    GyroNorm.WORLD = WORLD;
    GyroNorm.DEVICE_ORIENTATION = DEVICE_ORIENTATION;
    GyroNorm.ACCELERATION = ACCELERATION;
    GyroNorm.ACCELERATION_INCLUDING_GRAVITY = ACCELERATION_INCLUDING_GRAVITY;
    GyroNorm.ROTATION_RATE = ROTATION_RATE;

    /*
    *
    * Initialize GyroNorm instance function
    *
    * @param object options - values are as follows. If set in the init function they overwrite the default option values
    * @param int options.frequency
    * @param boolean options.gravityNormalized
    * @param boolean options.orientationBase
    * @param boolean options.decimalCount
    * @param function options.logger
    * @param function options.screenAdjusted
    *
    */

    GyroNorm.prototype.init = function (options) {
        // Assign options that are passed with the constructor function
        if (options && options.frequency) _frequency = options.frequency;
        if (options && options.gravityNormalized) _gravityNormalized = options.gravityNormalized;
        if (options && options.orientationBase) _orientationBase = options.orientationBase;
        if (options && typeof options.decimalCount === 'number' && options.decimalCount >= 0) _decimalCount = parseInt(options.decimalCount);
        if (options && options.logger) _logger = options.logger;
        if (options && options.screenAdjusted) _screenAdjusted = options.screenAdjusted;

        var deviceOrientationPromise = new FULLTILT.getDeviceOrientation({ 'type': _orientationBase }).then(function (controller) {
            _do = controller;
        });

        var deviceMotionPromise = new FULLTILT.getDeviceMotion().then(function (controller) {
            _dm = controller;
            // Set gravity coefficient
            _gravityCoefficient = _dm.getScreenAdjustedAccelerationIncludingGravity().z > 0 ? -1 : 1;
        });

        return Promise.all([deviceOrientationPromise, deviceMotionPromise]).then(function () {
            _isReady = true;
        });
    };

    /*
    *
    * Stops all the tracking and listening on the window objects
    *
    */
    GyroNorm.prototype.end = function () {
        try {
            _isReady = false;
            this.stop();
            _dm.stop();
            _do.stop();
        } catch (err) {
            log(err);
        }
    };

    /*
    *
    * Starts tracking the values
    *
    * @param function callback - Callback function to read the values
    *
    */
    GyroNorm.prototype.start = function (callback) {
        if (!_isReady) {
            log({ message: 'GyroNorm is not initialized yet. First call the "init()" function.', code: 1 });
            return;
        }

        _interval = setInterval(function () {
            callback(snapShot());
        }, _frequency);
        _isRunning = true;
    };

    /*
    *
    * Stops tracking the values
    *
    */
    GyroNorm.prototype.stop = function () {
        if (_interval) {
            clearInterval(_interval);
            _isRunning = false;
        }
    };

    /*
    *
    * Toggles if to normalize gravity related values
    *
    * @param boolean flag
    *
    */
    GyroNorm.prototype.normalizeGravity = function (flag) {
        _gravityNormalized = flag ? true : false;
    };

    /*
    *
    * Sets the current head direction as alpha = 0
    * Can only be used if device orientation is being tracked, values are not screen adjusted, value type is GyroNorm.EULER and orientation base is GyroNorm.GAME
    *
    * @return: If head direction is set successfully returns true, else false
    *
    */
    GyroNorm.prototype.setHeadDirection = function () {
        if (_screenAdjusted || _orientationBase === WORLD) {
            return false;
        }

        _calibrationValue = _do.getFixedFrameEuler().alpha;
        return true;
    };

    /*
    *
    * Sets the log function
    *
    */
    GyroNorm.prototype.startLogging = function (logger) {
        if (logger) {
            _logger = logger;
        }
    };

    /*
    *
    * Sets the log function to null which stops the logging
    *
    */
    GyroNorm.prototype.stopLogging = function () {
        _logger = null;
    };

    /*
    *
    * Returns if certain type of event is available on the device
    *
    * @param string _eventType - possible values are "deviceorientation" , "devicemotion" , "compassneedscalibration"
    *
    * @return true if event is available false if not
    *
    */
    GyroNorm.prototype.isAvailable = function (_eventType) {

        var doSnapShot = _do.getScreenAdjustedEuler();
        var accSnapShot = _dm.getScreenAdjustedAcceleration();
        var accGraSnapShot = _dm.getScreenAdjustedAccelerationIncludingGravity();
        var rotRateSnapShot = _dm.getScreenAdjustedRotationRate();

        switch (_eventType) {
            case DEVICE_ORIENTATION:
                return doSnapShot.alpha && doSnapShot.alpha !== null && doSnapShot.beta && doSnapShot.beta !== null && doSnapShot.gamma && doSnapShot.gamma !== null;
                break;

            case ACCELERATION:
                return accSnapShot && accSnapShot.x && accSnapShot.y && accSnapShot.z;
                break;

            case ACCELERATION_INCLUDING_GRAVITY:
                return accGraSnapShot && accGraSnapShot.x && accGraSnapShot.y && accGraSnapShot.z;
                break;

            case ROTATION_RATE:
                return rotRateSnapShot && rotRateSnapShot.alpha && rotRateSnapShot.beta && rotRateSnapShot.gamma;
                break;

            default:
                return {
                    deviceOrientationAvailable: doSnapShot.alpha && doSnapShot.alpha !== null && doSnapShot.beta && doSnapShot.beta !== null && doSnapShot.gamma && doSnapShot.gamma !== null,
                    accelerationAvailable: accSnapShot && accSnapShot.x && accSnapShot.y && accSnapShot.z,
                    accelerationIncludingGravityAvailable: accGraSnapShot && accGraSnapShot.x && accGraSnapShot.y && accGraSnapShot.z,
                    rotationRateAvailable: rotRateSnapShot && rotRateSnapShot.alpha && rotRateSnapShot.beta && rotRateSnapShot.gamma
                };
                break;
        }
    };

    /*
    *
    * Returns boolean value if the GyroNorm is running
    *
    */
    GyroNorm.prototype.isRunning = function () {
        return _isRunning;
    };

    /*-------------------------------------------------------*/
    /* PRIVATE FUNCTIONS */

    /*
    *
    * Utility function to round with digits after the decimal point
    *
    * @param float number - the original number to round
    *
    */
    function rnd(number) {
        return Math.round(number * Math.pow(10, _decimalCount)) / Math.pow(10, _decimalCount);
    }

    /*
    *
    * Starts calibration
    *
    */
    function calibrate() {
        _isCalibrating = true;
        _calibrationValues = new Array();
    }

    /*
    *
    * Takes a snapshot of the current deviceo orientaion and device motion values
    *
    */
    function snapShot() {
        var doSnapShot = {};

        if (_screenAdjusted) {
            doSnapShot = _do.getScreenAdjustedEuler();
        } else {
            doSnapShot = _do.getFixedFrameEuler();
        }

        var accSnapShot = _dm.getScreenAdjustedAcceleration();
        var accGraSnapShot = _dm.getScreenAdjustedAccelerationIncludingGravity();
        var rotRateSnapShot = _dm.getScreenAdjustedRotationRate();

        var alphaToSend = 0;

        if (_orientationBase === GAME) {
            alphaToSend = doSnapShot.alpha - _calibrationValue;
            alphaToSend = alphaToSend < 0 ? 360 - Math.abs(alphaToSend) : alphaToSend;
        } else {
            alphaToSend = doSnapShot.alpha;
        }

        var snapShot = {
            do: {
                alpha: rnd(alphaToSend),
                beta: rnd(doSnapShot.beta),
                gamma: rnd(doSnapShot.gamma),
                absolute: _do.isAbsolute()
            },
            dm: {
                x: rnd(accSnapShot.x),
                y: rnd(accSnapShot.y),
                z: rnd(accSnapShot.z),
                gx: rnd(accGraSnapShot.x),
                gy: rnd(accGraSnapShot.y),
                gz: rnd(accGraSnapShot.z),
                alpha: rnd(rotRateSnapShot.alpha),
                beta: rnd(rotRateSnapShot.beta),
                gamma: rnd(rotRateSnapShot.gamma)
            }
        };

        // Normalize gravity
        if (_gravityNormalized) {
            snapShot.dm.gx *= _gravityCoefficient;
            snapShot.dm.gy *= _gravityCoefficient;
            snapShot.dm.gz *= _gravityCoefficient;
        }

        return snapShot;
    }

    /*
    *
    * Starts listening to orientation event on the window object
    *
    */
    function log(err) {
        if (_logger) {
            if (typeof err == 'string') {
                err = { message: err, code: 0 };
            }
            _logger(err);
        }
    }

    return GyroNorm;
});

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(5)(undefined);
// imports


// module
exports.push([module.i, "html, body {\n  width: 100%;\n  height: 100%;\n  overflow: hidden;\n}\n\nbutton {\n  z-index: 1;\n  font-size: 1rem;\n  font-family: Futura, helvetica;\n  text-transform: uppercase;\n  letter-spacing: 0.1rem;\n  font-weight: bold;\n  color: #fff;\n  border: none;\n  outline: none;\n  background: transparent;\n  cursor: pointer;\n}\n\n.play-btn {\n  position: fixed;\n  top: 1rem;\n  right: 50%;\n  margin-right: -40px;\n}\n\n.gyro-btn {\n  position: fixed;\n  bottom: 1rem;\n  right: 50%;\n  margin-right: -40px;\n}\n\ncanvas {\n  cursor: none;\n}\n", ""]);

// exports


/***/ }),
/* 5 */
/***/ (function(module, exports) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
module.exports = function(useSourceMap) {
	var list = [];

	// return the list of modules as css string
	list.toString = function toString() {
		return this.map(function (item) {
			var content = cssWithMappingToString(item, useSourceMap);
			if(item[2]) {
				return "@media " + item[2] + "{" + content + "}";
			} else {
				return content;
			}
		}).join("");
	};

	// import a list of modules into the list
	list.i = function(modules, mediaQuery) {
		if(typeof modules === "string")
			modules = [[null, modules, ""]];
		var alreadyImportedModules = {};
		for(var i = 0; i < this.length; i++) {
			var id = this[i][0];
			if(typeof id === "number")
				alreadyImportedModules[id] = true;
		}
		for(i = 0; i < modules.length; i++) {
			var item = modules[i];
			// skip already imported module
			// this implementation is not 100% perfect for weird media query combinations
			//  when a module is imported multiple times with different media queries.
			//  I hope this will never occur (Hey this way we have smaller bundles)
			if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
				if(mediaQuery && !item[2]) {
					item[2] = mediaQuery;
				} else if(mediaQuery) {
					item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
				}
				list.push(item);
			}
		}
	};
	return list;
};

function cssWithMappingToString(item, useSourceMap) {
	var content = item[1] || '';
	var cssMapping = item[3];
	if (!cssMapping) {
		return content;
	}

	if (useSourceMap && typeof btoa === 'function') {
		var sourceMapping = toComment(cssMapping);
		var sourceURLs = cssMapping.sources.map(function (source) {
			return '/*# sourceURL=' + cssMapping.sourceRoot + source + ' */'
		});

		return [content].concat(sourceURLs).concat([sourceMapping]).join('\n');
	}

	return [content].join('\n');
}

// Adapted from convert-source-map (MIT)
function toComment(sourceMap) {
	// eslint-disable-next-line no-undef
	var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap))));
	var data = 'sourceMappingURL=data:application/json;charset=utf-8;base64,' + base64;

	return '/*# ' + data + ' */';
}


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
var stylesInDom = {},
	memoize = function(fn) {
		var memo;
		return function () {
			if (typeof memo === "undefined") memo = fn.apply(this, arguments);
			return memo;
		};
	},
	isOldIE = memoize(function() {
		// Test for IE <= 9 as proposed by Browserhacks
		// @see http://browserhacks.com/#hack-e71d8692f65334173fee715c222cb805
		// Tests for existence of standard globals is to allow style-loader 
		// to operate correctly into non-standard environments
		// @see https://github.com/webpack-contrib/style-loader/issues/177
		return window && document && document.all && !window.atob;
	}),
	getElement = (function(fn) {
		var memo = {};
		return function(selector) {
			if (typeof memo[selector] === "undefined") {
				memo[selector] = fn.call(this, selector);
			}
			return memo[selector]
		};
	})(function (styleTarget) {
		return document.querySelector(styleTarget)
	}),
	singletonElement = null,
	singletonCounter = 0,
	styleElementsInsertedAtTop = [],
	fixUrls = __webpack_require__(7);

module.exports = function(list, options) {
	if(typeof DEBUG !== "undefined" && DEBUG) {
		if(typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
	}

	options = options || {};
	options.attrs = typeof options.attrs === "object" ? options.attrs : {};

	// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
	// tags it will allow on a page
	if (typeof options.singleton === "undefined") options.singleton = isOldIE();

	// By default, add <style> tags to the <head> element
	if (typeof options.insertInto === "undefined") options.insertInto = "head";

	// By default, add <style> tags to the bottom of the target
	if (typeof options.insertAt === "undefined") options.insertAt = "bottom";

	var styles = listToStyles(list);
	addStylesToDom(styles, options);

	return function update(newList) {
		var mayRemove = [];
		for(var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];
			domStyle.refs--;
			mayRemove.push(domStyle);
		}
		if(newList) {
			var newStyles = listToStyles(newList);
			addStylesToDom(newStyles, options);
		}
		for(var i = 0; i < mayRemove.length; i++) {
			var domStyle = mayRemove[i];
			if(domStyle.refs === 0) {
				for(var j = 0; j < domStyle.parts.length; j++)
					domStyle.parts[j]();
				delete stylesInDom[domStyle.id];
			}
		}
	};
};

function addStylesToDom(styles, options) {
	for(var i = 0; i < styles.length; i++) {
		var item = styles[i];
		var domStyle = stylesInDom[item.id];
		if(domStyle) {
			domStyle.refs++;
			for(var j = 0; j < domStyle.parts.length; j++) {
				domStyle.parts[j](item.parts[j]);
			}
			for(; j < item.parts.length; j++) {
				domStyle.parts.push(addStyle(item.parts[j], options));
			}
		} else {
			var parts = [];
			for(var j = 0; j < item.parts.length; j++) {
				parts.push(addStyle(item.parts[j], options));
			}
			stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
		}
	}
}

function listToStyles(list) {
	var styles = [];
	var newStyles = {};
	for(var i = 0; i < list.length; i++) {
		var item = list[i];
		var id = item[0];
		var css = item[1];
		var media = item[2];
		var sourceMap = item[3];
		var part = {css: css, media: media, sourceMap: sourceMap};
		if(!newStyles[id])
			styles.push(newStyles[id] = {id: id, parts: [part]});
		else
			newStyles[id].parts.push(part);
	}
	return styles;
}

function insertStyleElement(options, styleElement) {
	var styleTarget = getElement(options.insertInto)
	if (!styleTarget) {
		throw new Error("Couldn't find a style target. This probably means that the value for the 'insertInto' parameter is invalid.");
	}
	var lastStyleElementInsertedAtTop = styleElementsInsertedAtTop[styleElementsInsertedAtTop.length - 1];
	if (options.insertAt === "top") {
		if(!lastStyleElementInsertedAtTop) {
			styleTarget.insertBefore(styleElement, styleTarget.firstChild);
		} else if(lastStyleElementInsertedAtTop.nextSibling) {
			styleTarget.insertBefore(styleElement, lastStyleElementInsertedAtTop.nextSibling);
		} else {
			styleTarget.appendChild(styleElement);
		}
		styleElementsInsertedAtTop.push(styleElement);
	} else if (options.insertAt === "bottom") {
		styleTarget.appendChild(styleElement);
	} else {
		throw new Error("Invalid value for parameter 'insertAt'. Must be 'top' or 'bottom'.");
	}
}

function removeStyleElement(styleElement) {
	styleElement.parentNode.removeChild(styleElement);
	var idx = styleElementsInsertedAtTop.indexOf(styleElement);
	if(idx >= 0) {
		styleElementsInsertedAtTop.splice(idx, 1);
	}
}

function createStyleElement(options) {
	var styleElement = document.createElement("style");
	options.attrs.type = "text/css";

	attachTagAttrs(styleElement, options.attrs);
	insertStyleElement(options, styleElement);
	return styleElement;
}

function createLinkElement(options) {
	var linkElement = document.createElement("link");
	options.attrs.type = "text/css";
	options.attrs.rel = "stylesheet";

	attachTagAttrs(linkElement, options.attrs);
	insertStyleElement(options, linkElement);
	return linkElement;
}

function attachTagAttrs(element, attrs) {
	Object.keys(attrs).forEach(function (key) {
		element.setAttribute(key, attrs[key]);
	});
}

function addStyle(obj, options) {
	var styleElement, update, remove;

	if (options.singleton) {
		var styleIndex = singletonCounter++;
		styleElement = singletonElement || (singletonElement = createStyleElement(options));
		update = applyToSingletonTag.bind(null, styleElement, styleIndex, false);
		remove = applyToSingletonTag.bind(null, styleElement, styleIndex, true);
	} else if(obj.sourceMap &&
		typeof URL === "function" &&
		typeof URL.createObjectURL === "function" &&
		typeof URL.revokeObjectURL === "function" &&
		typeof Blob === "function" &&
		typeof btoa === "function") {
		styleElement = createLinkElement(options);
		update = updateLink.bind(null, styleElement, options);
		remove = function() {
			removeStyleElement(styleElement);
			if(styleElement.href)
				URL.revokeObjectURL(styleElement.href);
		};
	} else {
		styleElement = createStyleElement(options);
		update = applyToTag.bind(null, styleElement);
		remove = function() {
			removeStyleElement(styleElement);
		};
	}

	update(obj);

	return function updateStyle(newObj) {
		if(newObj) {
			if(newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap)
				return;
			update(obj = newObj);
		} else {
			remove();
		}
	};
}

var replaceText = (function () {
	var textStore = [];

	return function (index, replacement) {
		textStore[index] = replacement;
		return textStore.filter(Boolean).join('\n');
	};
})();

function applyToSingletonTag(styleElement, index, remove, obj) {
	var css = remove ? "" : obj.css;

	if (styleElement.styleSheet) {
		styleElement.styleSheet.cssText = replaceText(index, css);
	} else {
		var cssNode = document.createTextNode(css);
		var childNodes = styleElement.childNodes;
		if (childNodes[index]) styleElement.removeChild(childNodes[index]);
		if (childNodes.length) {
			styleElement.insertBefore(cssNode, childNodes[index]);
		} else {
			styleElement.appendChild(cssNode);
		}
	}
}

function applyToTag(styleElement, obj) {
	var css = obj.css;
	var media = obj.media;

	if(media) {
		styleElement.setAttribute("media", media)
	}

	if(styleElement.styleSheet) {
		styleElement.styleSheet.cssText = css;
	} else {
		while(styleElement.firstChild) {
			styleElement.removeChild(styleElement.firstChild);
		}
		styleElement.appendChild(document.createTextNode(css));
	}
}

function updateLink(linkElement, options, obj) {
	var css = obj.css;
	var sourceMap = obj.sourceMap;

	/* If convertToAbsoluteUrls isn't defined, but sourcemaps are enabled
	and there is no publicPath defined then lets turn convertToAbsoluteUrls
	on by default.  Otherwise default to the convertToAbsoluteUrls option
	directly
	*/
	var autoFixUrls = options.convertToAbsoluteUrls === undefined && sourceMap;

	if (options.convertToAbsoluteUrls || autoFixUrls){
		css = fixUrls(css);
	}

	if(sourceMap) {
		// http://stackoverflow.com/a/26603875
		css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
	}

	var blob = new Blob([css], { type: "text/css" });

	var oldSrc = linkElement.href;

	linkElement.href = URL.createObjectURL(blob);

	if(oldSrc)
		URL.revokeObjectURL(oldSrc);
}


/***/ }),
/* 7 */
/***/ (function(module, exports) {


/**
 * When source maps are enabled, `style-loader` uses a link element with a data-uri to
 * embed the css on the page. This breaks all relative urls because now they are relative to a
 * bundle instead of the current page.
 *
 * One solution is to only use full urls, but that may be impossible.
 *
 * Instead, this function "fixes" the relative urls to be absolute according to the current page location.
 *
 * A rudimentary test suite is located at `test/fixUrls.js` and can be run via the `npm test` command.
 *
 */

module.exports = function (css) {
  // get current location
  var location = typeof window !== "undefined" && window.location;

  if (!location) {
    throw new Error("fixUrls requires window.location");
  }

	// blank or null?
	if (!css || typeof css !== "string") {
	  return css;
  }

  var baseUrl = location.protocol + "//" + location.host;
  var currentDir = baseUrl + location.pathname.replace(/\/[^\/]*$/, "/");

	// convert each url(...)
	/*
	This regular expression is just a way to recursively match brackets within
	a string.

	 /url\s*\(  = Match on the word "url" with any whitespace after it and then a parens
	   (  = Start a capturing group
	     (?:  = Start a non-capturing group
	         [^)(]  = Match anything that isn't a parentheses
	         |  = OR
	         \(  = Match a start parentheses
	             (?:  = Start another non-capturing groups
	                 [^)(]+  = Match anything that isn't a parentheses
	                 |  = OR
	                 \(  = Match a start parentheses
	                     [^)(]*  = Match anything that isn't a parentheses
	                 \)  = Match a end parentheses
	             )  = End Group
              *\) = Match anything and then a close parens
          )  = Close non-capturing group
          *  = Match anything
       )  = Close capturing group
	 \)  = Match a close parens

	 /gi  = Get all matches, not the first.  Be case insensitive.
	 */
	var fixedCss = css.replace(/url\s*\(((?:[^)(]|\((?:[^)(]+|\([^)(]*\))*\))*)\)/gi, function(fullMatch, origUrl) {
		// strip quotes (if they exist)
		var unquotedOrigUrl = origUrl
			.trim()
			.replace(/^"(.*)"$/, function(o, $1){ return $1; })
			.replace(/^'(.*)'$/, function(o, $1){ return $1; });

		// already a full url? no change
		if (/^(#|data:|http:\/\/|https:\/\/|file:\/\/\/)/i.test(unquotedOrigUrl)) {
		  return fullMatch;
		}

		// convert the url to a full url
		var newUrl;

		if (unquotedOrigUrl.indexOf("//") === 0) {
		  	//TODO: should we add protocol?
			newUrl = unquotedOrigUrl;
		} else if (unquotedOrigUrl.indexOf("/") === 0) {
			// path should be relative to the base url
			newUrl = baseUrl + unquotedOrigUrl; // already starts with '/'
		} else {
			// path should be relative to current directory
			newUrl = currentDir + unquotedOrigUrl.replace(/^\.\//, ""); // Strip leading './'
		}

		// send back the fixed url(...)
		return "url(" + JSON.stringify(newUrl) + ")";
	});

	// send back the fixed css
	return fixedCss;
};


/***/ })
/******/ ]);