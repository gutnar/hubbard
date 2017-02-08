import {canvas, gl, createShader, createProgram} from './gl'

// Shader source
import vertexShaderSource from './vs.glsl'
import fragmentShaderSource from './fs.glsl'

// Shader program
const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
const shaderProgram = createProgram(gl, vertexShader, fragmentShader);

// Attribute locations
const positionAttributeLocation = gl.getAttribLocation(shaderProgram, 'a_position');
const resolutionUniformLocation = gl.getUniformLocation(shaderProgram, 'u_resolution');
const offsetUniformLocation = gl.getUniformLocation(shaderProgram, 'u_offset');
const scaleUniformLocation = gl.getUniformLocation(shaderProgram, 'u_scale');
const rootsUniformLocation = gl.getUniformLocation(shaderProgram, 'u_roots');
const colorsUniformLocation = gl.getUniformLocation(shaderProgram, 'u_colors');

// Use shader
gl.useProgram(shaderProgram);

// Enable position attribute
gl.enableVertexAttribArray(positionAttributeLocation);

// Set screen resolution
gl.uniform2f(resolutionUniformLocation, canvas.width, canvas.height);

// Get roots
gl.uniform2fv(rootsUniformLocation, new Float32Array([
    1, 0,
    -1, 0,
    0, 1,
    0, -1
]));

// Set root colors
gl.uniform3fv(colorsUniformLocation, new Float32Array([
    1, 0, 0,
    0, 1, 0,
    0, 0, 1,
    0, 0, 0
]));

// Generate position buffer
const positionBuffer = gl.createBuffer();

// Create positions
function generatePositions() {
    const points = [];

    for (let x = 0; x < canvas.width; ++x) {
        for (let y = 0; y < canvas.height; ++y) {
            points.push(x);
            points.push(y);
        }
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW);
}

generatePositions();

// Set offset and scale
let scale = canvas.width/5;
const offset = [canvas.width/2, canvas.height/2];

gl.uniform2f(offsetUniformLocation, offset[0], offset[1]);
gl.uniform1f(scaleUniformLocation, scale);

// Bind the position buffer
gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

// Render
function render() {
    gl.drawArrays(gl.POINTS, 0, canvas.width*canvas.height);
}

render();

// Resize window
window.addEventListener('resize', () => {
    gl.uniform2f(resolutionUniformLocation, canvas.width, canvas.height);

    generatePositions();
    render();
});

// Pan around
let panning = false;
const panningAnchor = [];

canvas.addEventListener('mousedown', e => {
    e.preventDefault();

    panning = true;
    panningAnchor[0] = offset[0] - e.pageX;
    panningAnchor[1] = offset[1] - e.pageY;
});

document.addEventListener('mousemove', e => {
    if (panning) {
        offset[0] = panningAnchor[0] + e.pageX;
        offset[1] = panningAnchor[1] + e.pageY;

        gl.uniform2f(offsetUniformLocation, offset[0], offset[1]);

        requestAnimationFrame(render);
    }
});

document.addEventListener('mouseup', e => {
    panning = false;
});

// Change scale
canvas.addEventListener('wheel', e => {
    scale -= e.deltaY/10;

    if (scale < 1) {
        scale = 1;
    }

    gl.uniform1f(scaleUniformLocation, scale);
    requestAnimationFrame(render);
});