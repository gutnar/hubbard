import {canvas, gl, createShader, createProgram} from './gl'
import * as mathjs from 'mathjs'

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
        fade: 500000
    },
    {
        name: 'Julia set',
        input: 'parameter',
        x: 'sq(x) - sq(y) + Re(c)',
        y: '2.0*x*y + Im(c)',
        c: [-0.618, 0],
        roots: [[1, 0], [0, 1]],
        iterations: 20,
        fade: 2.0
    },
    {
        name: 'Test',
        x: 'x + 0.25*sq(x)*(sq(x) - 3.0*sq(y))/cb(sq(x) + sq(y))',
        y: 'y + 0.25*sq(y)*(sq(y) - 3.0*sq(x))/cb(sq(x) + sq(y))',
        roots: [[1, 0], [-1, 0], [0, 1], [0, -1]],
        iterations: 10,
        fade: 5.0
    },
    {
        name: 'z^3 - 1 = 0',
        x: 'cb(x) - 3.0*x*sq(y) - 1.0',
        y: '3.0*sq(x)*y - cb(y)',
        roots: [[1.3247, 0], [-0.66236, -0.56228], [-0.66236, 0.56228]],
        iterations: 4,
        fade: 100.0
    }
];

// Inputs
const form = document.forms.settings;
const presetInput = document.forms.settings.preset;
const rootsContainer = document.getElementById('roots');
const scaleOutput = document.getElementById('scale');
scaleOutput.innerHTML = (1/scale).toExponential(2);

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

function hue2rgb(t) {
    const q = 1;
    const p = 0;

    if (t < 0.0) t += 1.0;
    if (t > 1.0) t -= 1.0;
    if (t < 1.0/6.0) return p + (q - p) * 6.0 * t;
    if (t < 1.0/2.0) return q;
    if (t < 2.0/3.0) return p + (q - p) * (2.0/3.0 - t) * 6.0;
    return p;
}

function setPreset(index, updateForm=true) {
    // Update active preset
    activePresetIndex = index;

    // Get preset
    const preset = presets[index];

    // Show inputs
    const inputs = preset.input || 'iterations';

    if (inputs === 'iterations') {
        document.getElementById('parameter').style.display = 'none';
        document.getElementById('iterations').style.display = 'block';
    } else {
        document.getElementById('parameter').style.display = 'block';
        document.getElementById('iterations').style.display = 'none';
    }

    let c = ['0.0', '0.0'];

    if (preset.c) {
        c[0] = ((preset.c[0]+'').indexOf('.') === -1) ? (preset.c[0] + '.0') : preset.c[0];
        c[1] = ((preset.c[1]+'').indexOf('.') === -1) ? (preset.c[1] + '.0') : preset.c[1];
    }

    // Create source
    let presetVertexShaderSource = vertexShaderSource;
    let presetFragmentShaderSource = fragmentShaderSource;

    presetVertexShaderSource = presetVertexShaderSource
        .replace(/ITERATIONS/g, preset.iterations + '');

    presetVertexShaderSource = presetVertexShaderSource
        .replace(/X_ITERATION/g, preset.x.replace(/Re\(c\)/g, c[0]).replace(/Im\(c\)/g, c[1]));

    presetVertexShaderSource = presetVertexShaderSource
        .replace(/Y_ITERATION/g, preset.y.replace(/Re\(c\)/g, c[0]).replace(/Im\(c\)/g, c[1]));

    presetFragmentShaderSource = presetFragmentShaderSource
        .replace(/FADE/g, (preset.fade + '').indexOf('.') === -1 ? preset.fade + '.0' : preset.fade + '');

    presetFragmentShaderSource = presetFragmentShaderSource
        .replace(/ROOTS/g, preset.roots.length + '');

    console.log('Vertex shader:');
    console.log(presetVertexShaderSource);
    
    console.log('Fragment shader:');
    console.log(presetFragmentShaderSource);

    // Update form
    if (updateForm) {
        form.x.value = preset.x;
        form.y.value = preset.y;
        form.re_c.value = c[0];
        form.im_c.value = c[1];
        form.iterations.value = preset.iterations;
        form.fade.value = preset.fade;

        rootsContainer.innerHTML = '';

        preset.roots.forEach((root, index) => {
            const h = (index+ 1)/preset.roots.length;
            const r = Math.floor(hue2rgb(h + 1.0/3.0)*255);
            const g = Math.floor(hue2rgb(h)*255);
            const b = Math.floor(hue2rgb(h - 1.0/3.0)*255);
            const color = 'rgb(' + r + ',' + g + ',' + b + ')';

            rootsContainer.innerHTML += '<div class="root-color" style="background-color: '+color+'"></div>';
            rootsContainer.innerHTML += '<input type="number" step="0.1" value="' + root[0] + '" placeholder="Real part"> + ';
            rootsContainer.innerHTML += '<input type="number" step="0.1" value="' + root[1] + '" placeholder="Imaginary part"> i';
            rootsContainer.innerHTML += ' <button type="button">Remove</button><br>';
        });

        rootsContainer.innerHTML += '<button type="button">Add root</button>';

        // Editing roots
        let inputIndex = 0;
        let buttonIndex = 0;

        rootsContainer.childNodes.forEach((element, index) => {
            if (element.type === 'number') {
                element.addEventListener('input', (function (index) {
                    preset.roots[parseInt(index/2)][index%2] = this.value;
                    setPreset(activePresetIndex, false);
                }).bind(element, inputIndex++));
            } else if (element.type === 'button' && element.innerHTML === 'Remove') {
                element.addEventListener('click', (function (index) {
                    preset.roots.splice(index, 1);
                    setPreset(activePresetIndex);
                }).bind(element, buttonIndex++));
            } else if (element.type === 'button' && element.innerHTML === 'Add root') {
                element.addEventListener('click', () => {
                    preset.roots.push([0, 0]);
                    setPreset(activePresetIndex);
                });
            }
        });
    }

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
    if (updateForm) {
        scale = canvas.width / 5;
        offset[0] = canvas.width / 2;
        offset[1] = canvas.height / 2;
        scaleOutput.innerHTML = (1/scale).toExponential(2);
    }

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

    if (e.deltaY < 0) {
        scale *= 2;
    } else {
        scale /= 2;
    }

    if (scale < 1) {
        scale = 1;
    }

    scaleOutput.innerHTML = (1/scale).toExponential(2);

    offset[0] = scale/previousScale*(offset[0] - canvas.width/2) + canvas.width/2;
    offset[1] = scale/previousScale*(offset[1] - canvas.height/2) + canvas.height/2;

    gl.uniform1f(scaleUniformLocation, scale);
    gl.uniform2f(offsetUniformLocation, offset[0], offset[1]);

    requestAnimationFrame(render);
});

/*
// Change f(z)
form.f.addEventListener('input', () => {
    console.log(mathjs.simplify(form.f.value.replace(/z/g, '(x+i*y)')));
});
*/

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

// Change parameter real part
form.re_c.addEventListener('input', () => {
    const preset = presets[activePresetIndex];
    preset.c[0] = form.re_c.value;
    setPreset(activePresetIndex, false);
})

// Change parameter imaginary part
form.im_c.addEventListener('input', () => {
    const preset = presets[activePresetIndex];
    preset.c[1] = form.im_c.value;
    setPreset(activePresetIndex, false);
})

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