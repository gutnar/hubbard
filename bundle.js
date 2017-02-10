/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
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
/******/ 	return __webpack_require__(__webpack_require__.s = 3);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["b"] = createShader;
/* harmony export (immutable) */ __webpack_exports__["d"] = createProgram;
// Get canvas
const canvas = document.getElementById('canvas');
/* harmony export (immutable) */ __webpack_exports__["a"] = canvas;


// Canvas drawing buffer size
canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

// Initialize the GL context
const gl = canvas.getContext('webgl', { alpha: false }) || canvas.getContext('experimental-webgl', { alpha: false });
/* harmony export (immutable) */ __webpack_exports__["c"] = gl;


// If we don't have a GL context, give up now
if (!gl) {
    alert("Unable to initialize WebGL. Your browser may not support it.");
}

// Only continue if WebGL is available and working
if (gl) {
    // Set clear color to black, fully opaque
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    // Viewport
    gl.viewport(0, 0, canvas.width, canvas.height);
}

// Resize window
window.addEventListener('resize', () => {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
});

// Shaders
function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        return shader;
    }

    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
}

// Create the shader program
function createProgram(gl, vertexShader, fragmentShader) {
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
        return program;
    }

    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
}

/***/ }),
/* 1 */
/***/ (function(module, exports) {

module.exports = "precision highp float;\nuniform vec2 u_roots[ROOTS];\nvarying vec2 v_root;\n\nfloat sq(float value) {\n    return value*value;\n}\n\nfloat hue2rgb(float p, float q, float t) {\n    if (t < 0.0) t += 1.0;\n    if (t > 1.0) t -= 1.0;\n    if (t < 1.0/6.0) return p + (q - p) * 6.0 * t;\n    if (t < 1.0/2.0) return q;\n    if (t < 2.0/3.0) return p + (q - p) * (2.0/3.0 - t) * 6.0;\n    return p;\n}\n\nvec3 hsv2rgb(float h, float s, float v) {\n    vec3 c = vec3(0.0, 0.0, 0.0);\n\n    if (s == 0.0) {\n        c[0] = c[1] = c[2] = v;\n    } else {\n        float q = (v < 0.5) ? (v * (1.0 + s)) : (v + s - v * s);\n        float p = 2.0 * v - q;\n\n        c[0] = hue2rgb(p, q, h + 1.0/3.0);\n        c[1] = hue2rgb(p, q, h);\n        c[2] = hue2rgb(p, q, h - 1.0/3.0);\n    }\n\n    return c;\n}\n\nvoid main() {\n    // Find closest root\n    int closest = -1;\n    float closestDist;\n\n    for (int i = 0; i < ROOTS; ++i) {\n        float dist = sq(v_root[0] - u_roots[i][0]) + sq(v_root[1] - u_roots[i][1]);\n\n        if (closest == -1 || dist < closestDist) {\n            closest = i;\n            closestDist = dist;\n        }\n    }\n\n    // Generate hue based on closest root\n    float hue = 1.0/ROOTS.0 * float(closest + 1);\n\n    // Generate lighting based on distance to closest root\n    float lighting = 0.5 - sqrt(closestDist)/FADE/2.0;\n\n    // Discard if not close enough\n    if (lighting <= 0.0) {\n        discard;\n    }\n\n    gl_FragColor = vec4(hsv2rgb(hue, 1.0, lighting), 1.0);\n}"

/***/ }),
/* 2 */
/***/ (function(module, exports) {

module.exports = "precision highp float;\nattribute vec2 a_position;\nuniform vec2 u_resolution;\nuniform vec2 u_offset;\nuniform float u_scale;\nvarying vec2 v_root;\n\nfloat sq(float value) {\n    return value*value;\n}\n\nfloat cb(float value) {\n    return value*value*value;\n}\n\nvoid main() {\n    // Find point location in clip space\n    vec2 clipSpace = (a_position / u_resolution) * 2.0 - 1.0;\n\n    // Set origin to top-left\n    gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);\n\n    // Point size\n    gl_PointSize = 1.0;\n\n    // Convert pixel location to point\n    vec2 point = (a_position - u_offset) / u_scale;\n\n    // Iterate\n    v_root = point;\n\n    for (int i = 0; i < ITERATIONS; ++i) {\n        v_root[0] = X_ITERATION;\n        v_root[1] = Y_ITERATION;\n    }\n}\n"

/***/ }),
/* 3 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__gl__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__vs_glsl__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__vs_glsl___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1__vs_glsl__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__fs_glsl__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__fs_glsl___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2__fs_glsl__);


// Shader source



// Initial scale and offset
let scale = __WEBPACK_IMPORTED_MODULE_0__gl__["a" /* canvas */].width / 5;
const offset = [__WEBPACK_IMPORTED_MODULE_0__gl__["a" /* canvas */].width / 2, __WEBPACK_IMPORTED_MODULE_0__gl__["a" /* canvas */].height / 2];

// Presets
const presets = [{
    name: 'z^4 - 1 = 0',
    x: 'x + 0.25*x*(sq(x) - 3.0*sq(y))/cb(sq(x) + sq(y))',
    y: 'y + 0.25*y*(sq(y) - 3.0*sq(x))/cb(sq(x) + sq(y))',
    roots: [[1, 0], [-1, 0], [0, 1], [0, -1]],
    iterations: 20,
    fade: 5.0
}, {
    name: 'Test',
    x: 'x + 0.25*sq(x)*(sq(x) - 3.0*sq(y))/cb(sq(x) + sq(y))',
    y: 'y + 0.25*sq(y)*(sq(y) - 3.0*sq(x))/cb(sq(x) + sq(y))',
    roots: [[1, 0], [-1, 0], [0, 1], [0, -1]],
    iterations: 10,
    fade: 5.0
}];

// Inputs
const form = document.forms.settings;
const presetInput = document.forms.settings.preset;
const rootsContainer = document.getElementById('roots');

presets.forEach((preset, index) => {
    presetInput.innerHTML += '<option value="' + index + '">' + preset.name + '</option>';
});

// Switching preset
presetInput.addEventListener('change', e => {
    setPreset(presetInput.value);
});

// Attribute locations
let positionAttributeLocation, resolutionUniformLocation, offsetUniformLocation, scaleUniformLocation, rootsUniformLocation;

// Re-compile shader
let activePresetIndex;

function setPreset(index, updateForm = true) {
    // Update active preset
    activePresetIndex = index;

    // Get preset
    const preset = presets[index];

    // Create source
    let presetVertexShaderSource = __WEBPACK_IMPORTED_MODULE_1__vs_glsl___default.a;
    let presetFragmentShaderSource = __WEBPACK_IMPORTED_MODULE_2__fs_glsl___default.a;

    presetVertexShaderSource = presetVertexShaderSource.replace(/ITERATIONS/g, preset.iterations + '');

    presetVertexShaderSource = presetVertexShaderSource.replace(/X_ITERATION/g, preset.x.replace(/x/g, 'v_root[0]').replace(/y/g, 'v_root[1]'));

    presetVertexShaderSource = presetVertexShaderSource.replace(/Y_ITERATION/g, preset.y.replace(/x/g, 'v_root[0]').replace(/y/g, 'v_root[1]'));

    presetFragmentShaderSource = presetFragmentShaderSource.replace(/FADE/g, (preset.fade + '').indexOf('.') === -1 ? preset.fade + '.0' : preset.fade + '');

    presetFragmentShaderSource = presetFragmentShaderSource.replace(/ROOTS/g, preset.roots.length + '');

    // Update form
    if (updateForm) {
        form.x.value = preset.x;
        form.y.value = preset.y;
        form.iterations.value = preset.iterations;
        form.fade.value = preset.fade;

        rootsContainer.innerHTML = '';

        preset.roots.forEach(root => {
            rootsContainer.innerHTML += '<input type="number" value="' + root[0] + '" placeholder="Real part"> + ' + '<input type="number" value="' + root[1] + '" placeholder="Imaginary part"> i' + ' <button type="button">Remove</button><br>';
        });

        rootsContainer.innerHTML += '<button type="button">Add root</button>';

        // Editing roots
        let inputIndex = 0;
        let buttonIndex = 0;

        rootsContainer.childNodes.forEach((element, index) => {
            if (element.type === 'number') {
                element.addEventListener('input', function (index) {
                    preset.roots[parseInt(index / 2)][index % 2] = this.value;
                    setPreset(activePresetIndex, false);
                }.bind(element, inputIndex++));
            } else if (element.type === 'button' && element.innerHTML === 'Remove') {
                element.addEventListener('click', function (index) {
                    preset.roots.splice(index, 1);
                    setPreset(activePresetIndex);
                }.bind(element, buttonIndex++));
            } else if (element.type === 'button' && element.innerHTML === 'Add root') {
                element.addEventListener('click', () => {
                    preset.roots.push([0, 0]);
                    setPreset(activePresetIndex);
                });
            }
        });
    }

    // Create shaders
    const vertexShader = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__gl__["b" /* createShader */])(__WEBPACK_IMPORTED_MODULE_0__gl__["c" /* gl */], __WEBPACK_IMPORTED_MODULE_0__gl__["c" /* gl */].VERTEX_SHADER, presetVertexShaderSource);
    const fragmentShader = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__gl__["b" /* createShader */])(__WEBPACK_IMPORTED_MODULE_0__gl__["c" /* gl */], __WEBPACK_IMPORTED_MODULE_0__gl__["c" /* gl */].FRAGMENT_SHADER, presetFragmentShaderSource);
    const shaderProgram = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__gl__["d" /* createProgram */])(__WEBPACK_IMPORTED_MODULE_0__gl__["c" /* gl */], vertexShader, fragmentShader);

    // Attribute locations
    positionAttributeLocation = __WEBPACK_IMPORTED_MODULE_0__gl__["c" /* gl */].getAttribLocation(shaderProgram, 'a_position');
    resolutionUniformLocation = __WEBPACK_IMPORTED_MODULE_0__gl__["c" /* gl */].getUniformLocation(shaderProgram, 'u_resolution');
    offsetUniformLocation = __WEBPACK_IMPORTED_MODULE_0__gl__["c" /* gl */].getUniformLocation(shaderProgram, 'u_offset');
    scaleUniformLocation = __WEBPACK_IMPORTED_MODULE_0__gl__["c" /* gl */].getUniformLocation(shaderProgram, 'u_scale');
    rootsUniformLocation = __WEBPACK_IMPORTED_MODULE_0__gl__["c" /* gl */].getUniformLocation(shaderProgram, 'u_roots');

    // Use shader
    __WEBPACK_IMPORTED_MODULE_0__gl__["c" /* gl */].useProgram(shaderProgram);

    // Enable position attribute
    __WEBPACK_IMPORTED_MODULE_0__gl__["c" /* gl */].enableVertexAttribArray(positionAttributeLocation);

    // Set screen resolution
    __WEBPACK_IMPORTED_MODULE_0__gl__["c" /* gl */].uniform2f(resolutionUniformLocation, __WEBPACK_IMPORTED_MODULE_0__gl__["a" /* canvas */].width, __WEBPACK_IMPORTED_MODULE_0__gl__["a" /* canvas */].height);

    // Get roots
    const roots = [];

    preset.roots.forEach(root => {
        roots.push(root[0]);
        roots.push(root[1]);
    });

    __WEBPACK_IMPORTED_MODULE_0__gl__["c" /* gl */].uniform2fv(rootsUniformLocation, new Float32Array(roots));

    generatePositions();

    // Set offset and scale
    if (updateForm) {
        scale = __WEBPACK_IMPORTED_MODULE_0__gl__["a" /* canvas */].width / 5;
        offset[0] = __WEBPACK_IMPORTED_MODULE_0__gl__["a" /* canvas */].width / 2;
        offset[1] = __WEBPACK_IMPORTED_MODULE_0__gl__["a" /* canvas */].height / 2;
    }

    __WEBPACK_IMPORTED_MODULE_0__gl__["c" /* gl */].uniform2f(offsetUniformLocation, offset[0], offset[1]);
    __WEBPACK_IMPORTED_MODULE_0__gl__["c" /* gl */].uniform1f(scaleUniformLocation, scale);

    // Bind the position buffer
    __WEBPACK_IMPORTED_MODULE_0__gl__["c" /* gl */].vertexAttribPointer(positionAttributeLocation, 2, __WEBPACK_IMPORTED_MODULE_0__gl__["c" /* gl */].FLOAT, false, 0, 0);

    // Render
    render();
}

// Generate position buffer
const positionBuffer = __WEBPACK_IMPORTED_MODULE_0__gl__["c" /* gl */].createBuffer();

// Create positions
function generatePositions() {
    const points = [];

    for (let x = 0; x < __WEBPACK_IMPORTED_MODULE_0__gl__["a" /* canvas */].width; ++x) {
        for (let y = 0; y < __WEBPACK_IMPORTED_MODULE_0__gl__["a" /* canvas */].height; ++y) {
            points.push(x);
            points.push(y);
        }
    }

    __WEBPACK_IMPORTED_MODULE_0__gl__["c" /* gl */].bindBuffer(__WEBPACK_IMPORTED_MODULE_0__gl__["c" /* gl */].ARRAY_BUFFER, positionBuffer);
    __WEBPACK_IMPORTED_MODULE_0__gl__["c" /* gl */].bufferData(__WEBPACK_IMPORTED_MODULE_0__gl__["c" /* gl */].ARRAY_BUFFER, new Float32Array(points), __WEBPACK_IMPORTED_MODULE_0__gl__["c" /* gl */].STATIC_DRAW);
}

// Render
function render() {
    __WEBPACK_IMPORTED_MODULE_0__gl__["c" /* gl */].drawArrays(__WEBPACK_IMPORTED_MODULE_0__gl__["c" /* gl */].POINTS, 0, __WEBPACK_IMPORTED_MODULE_0__gl__["a" /* canvas */].width * __WEBPACK_IMPORTED_MODULE_0__gl__["a" /* canvas */].height);
}

// Resize window
window.addEventListener('resize', () => {
    __WEBPACK_IMPORTED_MODULE_0__gl__["c" /* gl */].uniform2f(resolutionUniformLocation, __WEBPACK_IMPORTED_MODULE_0__gl__["a" /* canvas */].width, __WEBPACK_IMPORTED_MODULE_0__gl__["a" /* canvas */].height);

    generatePositions();
    render();
});

// Pan around
let panning = false;
const panningAnchor = [];

__WEBPACK_IMPORTED_MODULE_0__gl__["a" /* canvas */].addEventListener('mousedown', e => {
    e.preventDefault();

    panning = true;
    panningAnchor[0] = offset[0] - e.pageX;
    panningAnchor[1] = offset[1] - e.pageY;
});

document.addEventListener('mousemove', e => {
    if (panning) {
        offset[0] = panningAnchor[0] + e.pageX;
        offset[1] = panningAnchor[1] + e.pageY;

        __WEBPACK_IMPORTED_MODULE_0__gl__["c" /* gl */].uniform2f(offsetUniformLocation, offset[0], offset[1]);

        requestAnimationFrame(render);
    }
});

document.addEventListener('mouseup', e => {
    panning = false;
});

// Change scale
__WEBPACK_IMPORTED_MODULE_0__gl__["a" /* canvas */].addEventListener('wheel', e => {
    e.preventDefault();

    const previousScale = scale;

    scale -= e.deltaY / 10;

    if (scale < 1) {
        scale = 1;
    }

    //offset[0] *= scale/previousScale;
    //offset[1] *= scale/previousScale;

    __WEBPACK_IMPORTED_MODULE_0__gl__["c" /* gl */].uniform1f(scaleUniformLocation, scale);
    __WEBPACK_IMPORTED_MODULE_0__gl__["c" /* gl */].uniform2f(offsetUniformLocation, offset[0], offset[1]);

    requestAnimationFrame(render);
});

// Change x iteration
form.x.addEventListener('input', () => {
    const preset = presets[activePresetIndex];
    preset.x = form.x.value;
    setPreset(activePresetIndex, false);
});

// Change y iteration
form.y.addEventListener('input', () => {
    const preset = presets[activePresetIndex];
    preset.y = form.y.value;
    setPreset(activePresetIndex, false);
});

// Change iterations
form.iterations.addEventListener('input', () => {
    const preset = presets[activePresetIndex];
    preset.iterations = form.iterations.value;
    setPreset(activePresetIndex, false);
});

// Change fade
form.fade.addEventListener('input', () => {
    const preset = presets[activePresetIndex];
    preset.fade = form.fade.value;
    setPreset(activePresetIndex, false);
});

// Activate default preset
setPreset(0);

/***/ })
/******/ ]);
//# sourceMappingURL=bundle.js.map