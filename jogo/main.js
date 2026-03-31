import { gerarMapa } from '../map/carregar_mapa.js';

document.addEventListener('keydown', function(event) {
    const output = document.getElementById('output');
    
    // Get key information
    const key = event.key; // e.g., "Enter", "a", "Shift"
    const code = event.code; // e.g., "KeyA", "Enter", "ShiftLeft"

    if (key === 'a') {
    }
});

function getMousePos(canvas, evt) {
    const posDisplay = document.getElementById('pos');
    const rect = canvas.getBoundingClientRect();

    let x = Math.floor((evt.clientX - rect.left)*minMapSize/minSize);
    let y = Math.floor((canvas.height - (evt.clientY - rect.top))*minMapSize/minSize);

    posDisplay.textContent = `${x}, ${y}`;

    return {
        x: x,
        y: y
    };
}

let logoAntes = 0;
function update_screen(agora) {
    const quantoPassou = (agora - logoAntes) / 1000
    logoAntes = agora

    

    desenharTela();
    requestAnimationFrame(update_screen);
}

// inicializa o WebGL2
const canvas = document.querySelector('.example-canvas');
const gl = canvas.getContext('webgl2');

if (!gl) {
  console.error('WebGL2 não está disponível');
  throw new Error('WebGL2 não suportado');
}

canvas.addEventListener('mousemove', function(event) {
    const mousePos = getMousePos(canvas, event);
});


const matrizRedimensionamento = new Float32Array([
    2/canvas.width, 2/canvas.height
]);

// inicializa o shader de vértice e fragmento e em seguida os compila
// são programas executados pela GPU sempre que algo precisa ser desenhado


// ===== COMPILAÇÃO =====
async function carregarShader(caminho){
    const response = await fetch(caminho);
    return await response.text();
}

async function initShaders(){
    const vertexShaderCode = await carregarShader("shaders/vertex.glsl");
    const fragmentShaderCode = await carregarShader("shaders/fragment.glsl");

    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexShaderCode);
    gl.compileShader(vertexShader);

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentShaderCode);
    gl.compileShader(fragmentShader);

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    gl.useProgram(program);

    return program;
}

function desenharTela() {
    // ===== LIMPA TELA =====
    gl.clearColor(1, 1, 1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // ativa o VAO antes de desenhar
    gl.bindVertexArray(vao);

    // ===== DESENHA NA TELA =====
    gl.uniform1f(uAnguloLoc, angulo);
    
    for (let i = 0; i < dados.objetos.length; i++) {
        if (dados.objetos[i][0]=='#'){
            gl.uniform2f(uOffsetLoc, dados.objetos[i][1]*minSize/minMapSize, dados.objetos[i][2]*minSize/minMapSize);
            gl.uniform4f(uColorLoc, 0, 0, 0, 1);
            gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
        }
        if (dados.objetos[i][0]=='p'){
            gl.uniform2f(uOffsetLoc, dados.objetos[i][1]*minSize/minMapSize, dados.objetos[i][2]*minSize/minMapSize);
            gl.uniform4f(uColorLoc, 0, 1, 0, 1);
            gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
        }
        if (dados.objetos[i][0]=='e'){
            gl.uniform2f(uOffsetLoc, dados.objetos[i][1]*minSize/minMapSize, dados.objetos[i][2]*minSize/minMapSize);
            gl.uniform4f(uColorLoc, 1, 0, 0, 1);
            gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
        }
    }


    
}

function updateVertices() {
    minMapSize = Math.min(dados.altura, dados.largura);
    const vertices = new Float32Array([
        0,                  0,                  0,
        minSize/minMapSize, 0,                  0,
        minSize/minMapSize, minSize/minMapSize, 0,
        0,                  minSize/minMapSize, 0
    ]);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
}

async function main(){
    const program = await initShaders();
    const positionLoc = gl.getAttribLocation(program, 'position');

    gl.viewport(0, 0, canvas.width, canvas.height);

    dados = await gerarMapa();

    // ====== VAO ======
    buffer = gl.createBuffer();

    vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

    updateVertices();

    gl.enableVertexAttribArray(positionLoc);
    gl.vertexAttribPointer(positionLoc, 3, gl.FLOAT, false, 0, 0);
    // ======     ======

    // ====== unbind ======
    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    // ===== UNIFORMS =====
    uOffsetLoc = gl.getUniformLocation(program, 'uOffset');
    uColorLoc = gl.getUniformLocation(program, 'uColor');
    uRedimensionamentoLoc = gl.getUniformLocation(program, 'uRedimensionamento');
    uAnguloLoc = gl.getUniformLocation(program, 'angulo');

    // Set the redimensionamento uniform
    gl.uniform2fv(uRedimensionamentoLoc, matrizRedimensionamento);

    
    requestAnimationFrame(update_screen);
}

let buffer; 
let vao;
let uOffsetLoc;
let uColorLoc;
let uRedimensionamentoLoc;
let uAnguloLoc;
let dados;
let minSize = Math.min(canvas.width, canvas.height);
let minMapSize;
let angulo = 0;

const posicao = [];
const mapaSize = [];

main();

