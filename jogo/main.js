import { gerarMapa } from '../jogo/carregar_mapa.js';
import { moverJogador } from '../jogo/carregar_mapa.js';
import { moverEntidades } from '../jogo/carregar_mapa.js';

const teclas = {};
window.addEventListener("keydown", (e) => {
    teclas[e.key] = true;
    console.log(teclas);
});

window.addEventListener("keyup", (e) => {
    teclas[e.key] = false;
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
let segundos = 4.0;
let frames = 0;
let frameRate = 31;
let pause = false;
let toglePause = false;

function update_screen(agora) {
    const quantoPassou = (agora - logoAntes) / 1000
    
    if(quantoPassou > 1/frameRate){
        logoAntes = agora

        if(teclas.Escape && !toglePause) {
            pause = !pause;
            toglePause = true;
        } else if (!teclas.Escape) {
            toglePause = false;
        }

        if(!pause){
            moverJogador(teclas, dados.jogador);
            console.log(dados.jogador.vidas);
            moverEntidades(dados.entidades);
        }

        frames++;
        if(agora/1000 > segundos){
            segundos += 4.0;
            console.log("FPS: " + frames/4.0);
            frames = 0;
        }

        desenharTela();
    }

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
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // ativa o VAO antes de desenhar
    gl.bindVertexArray(vao);

    // ===== DESENHA NA TELA =====
    gl.uniform1f(uAnguloLoc, angulo);
    
    for (const entidade of Object.values(dados.entidades)) {
        gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, entidade.cordenadasTextura, gl.DYNAMIC_DRAW);
        gl.uniform2f(uOffsetLoc, entidade.pos[0]*minSize/minMapSize, entidade.pos[1]*minSize/minMapSize);
        gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
    }

    gl.uniform2f(uOffsetLoc, dados.jogador.pos[0]*minSize/minMapSize, dados.jogador.pos[1]*minSize/minMapSize);
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, dados.jogador.cordenadasTextura, gl.DYNAMIC_DRAW);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);    
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

function carregarTextura(){
    textura = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, textura);

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

    // placeholder (evita bug enquanto carrega)
    gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    1,
    1,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    new Uint8Array([255, 255, 255, 255])
    );

    const imagem = new Image();
    imagem.src = "sprites/spritesheet.png";

    imagem.onload = () => {
        gl.bindTexture(gl.TEXTURE_2D, textura);

        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            imagem
        );

        // 👇 ESSENCIAL PRA NÃO BORRAR
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

        gl.generateMipmap(gl.TEXTURE_2D);
    };
}

async function main(){
    const program = await initShaders();
    carregarTextura();
    
    const positionLoc = gl.getAttribLocation(program, 'position');

    gl.viewport(0, 0, canvas.width, canvas.height);

    dados = await gerarMapa();

    const uTextureLoc = gl.getUniformLocation(program, "uTexture");

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textura);
    gl.uniform1i(uTextureLoc, 0);

    // ====== VAO ======
    buffer = gl.createBuffer();

    vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

    updateVertices();

    gl.enableVertexAttribArray(positionLoc);
    gl.vertexAttribPointer(positionLoc, 3, gl.FLOAT, false, 0, 0);

    uvBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);

    gl.bufferData(gl.ARRAY_BUFFER, dados.jogador.cordenadasTextura, gl.STATIC_DRAW);

    const uvLoc = gl.getAttribLocation(program, "uv");
    gl.enableVertexAttribArray(uvLoc);
    gl.vertexAttribPointer(uvLoc, 2, gl.FLOAT, false, 0, 0);


    //Habilita o blending para lidar com transparências
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
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

    canvas.width = minSize/minMapSize * dados.largura;
    canvas.height = minSize/minMapSize * dados.altura;
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
let textura;
let uvBuffer;

const posicao = [];
const mapaSize = [];

main();

