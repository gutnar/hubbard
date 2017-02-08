// Get canvas
export const canvas = document.getElementById('canvas');

// Canvas drawing buffer size
canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

// Initialize the GL context
export const gl = canvas.getContext('webgl', {alpha: false}) || canvas.getContext('experimental-webgl', {alpha: false});

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
export function createShader(gl, type, source) {
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
export function createProgram(gl, vertexShader, fragmentShader) {
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