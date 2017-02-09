import {canvas, gl, createShader, createProgram} from './gl'

// Shader source
import vertexShaderSource from './vs.glsl'
import fragmentShaderSource from './fs.glsl'

// Initial scale and offset
let scale = canvas.width/5;
const offset = [canvas.width/2, canvas.height/2];

// Presets
const presets = [
    {
        name: 'z^4 - 1 = 0',
        x: 'x + 0.25*x*(sq(x) - 3.0*sq(y))/cb(sq(x) + sq(y))',
        y: 'y + 0.25*y*(sq(y) - 3.0*sq(x))/cb(sq(x) + sq(y))',
        roots: [[1, 0], [-1, 0], [0, 1], [0, -1]],
        iterations: 20,
        fade: 5.0
    },
    {
        name: 'Test',
        x: 'x + 0.25*sq(x)*(sq(x) - 3.0*sq(y))/cb(sq(x) + sq(y))',
        y: 'y + 0.25*sq(y)*(sq(y) - 3.0*sq(x))/cb(sq(x) + sq(y))',
        roots: [[1, 0], [-1, 0], [0, 1], [0, -1]],
        iterations: 10,
        fade: 5.0
    }
];

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
function setPreset(index) {
    // Get preset
    const preset = presets[index];

    // Create source
    let presetVertexShaderSource = vertexShaderSource;
    let presetFragmentShaderSource = fragmentShaderSource;

    presetVertexShaderSource = presetVertexShaderSource
        .replace(/ITERATIONS/g, preset.iterations + '');

    presetVertexShaderSource = presetVertexShaderSource
        .replace(/X_ITERATION/g, preset.x.replace(/x/g, 'v_root[0]').replace(/y/g, 'v_root[1]'));

    presetVertexShaderSource = presetVertexShaderSource
        .replace(/Y_ITERATION/g, preset.y.replace(/x/g, 'v_root[0]').replace(/y/g, 'v_root[1]'));

    presetFragmentShaderSource = presetFragmentShaderSource
        .replace(/FADE/g, (preset.fade + '').indexOf('.') === -1 ? preset.fade + '.0' : preset.fade + '');

    presetFragmentShaderSource = presetFragmentShaderSource
        .replace(/ROOTS/g, preset.roots.length + '');

    // Update form
    form.x.value = preset.x;
    form.y.value = preset.y;
    form.iterations.value = preset.iterations;
    form.fade.value = preset.fade;

    rootsContainer.innerHTML = '';

    preset.roots.forEach(root => {
        rootsContainer.innerHTML += '<input type="number" value="' + root[0] + '" placeholder="Real part"> + ' +
            '<input type="number" value="' + root[1] + '" placeholder="Imaginary part"> i' +
            '<br>';
    });

    // Create shaders
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, presetVertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, presetFragmentShaderSource);
    const shaderProgram = createProgram(gl, vertexShader, fragmentShader);

    // Attribute locations
    positionAttributeLocation = gl.getAttribLocation(shaderProgram, 'a_position');
    resolutionUniformLocation = gl.getUniformLocation(shaderProgram, 'u_resolution');
    offsetUniformLocation = gl.getUniformLocation(shaderProgram, 'u_offset');
    scaleUniformLocation = gl.getUniformLocation(shaderProgram, 'u_scale');
    rootsUniformLocation = gl.getUniformLocation(shaderProgram, 'u_roots');

    // Use shader
    gl.useProgram(shaderProgram);

    // Enable position attribute
    gl.enableVertexAttribArray(positionAttributeLocation);

    // Set screen resolution
    gl.uniform2f(resolutionUniformLocation, canvas.width, canvas.height);

    // Get roots
    const roots = [];

    preset.roots.forEach(root => {
        roots.push(root[0]);
        roots.push(root[1]);
    });

    gl.uniform2fv(rootsUniformLocation, new Float32Array(roots));

    generatePositions();

    // Set offset and scale
    scale = canvas.width/5;
    offset[0] = canvas.width/2;
    offset[1] = canvas.height/2;

    gl.uniform2f(offsetUniformLocation, offset[0], offset[1]);
    gl.uniform1f(scaleUniformLocation, scale);

    // Bind the position buffer
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    // Render
    render();
}

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

// Render
function render() {
    gl.drawArrays(gl.POINTS, 0, canvas.width*canvas.height);
}

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
    e.preventDefault();

    const previousScale = scale;

    scale -= e.deltaY/10;

    if (scale < 1) {
        scale = 1;
    }

    //offset[0] *= scale/previousScale;
    //offset[1] *= scale/previousScale;

    gl.uniform1f(scaleUniformLocation, scale);
    gl.uniform2f(offsetUniformLocation, offset[0], offset[1]);

    requestAnimationFrame(render);
});

// Default preset
setPreset(0);