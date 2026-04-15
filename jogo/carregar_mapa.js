import { contruirEntidade } from "./entidade.js";
import { resetviVdaCounter } from "./entidade.js";
import { ControleSom } from "./tocar_sons.js";
import { setDados } from "./entidade.js";

async function lerArquivo(arquivo) {
    const response = await fetch(arquivo);
    const texto = await response.text();
    return texto;
}

let dados = {};
let id = 0;
let texto;
let altura;
let largura;
const controleSom = new ControleSom();
const inimigos =  new Set(['e', 'f', 'g', 'h', 'j', "tiroInimigo"]);
const causaDano = new Set(['e', 'f', 'g', 'h', 'j', "tiroInimigo"]);
const paredes = new Set(['#', 'v']);

export async function gerarMapa(numerofase) {
    
    let fase = "fases/mapateste.txt"

    switch(numerofase){
        case 1:
            fase = "fases/1.txt";
            break;
        case 2:
            fase = "fases/2.txt";
            break;
        case 3:
            fase = "fases/3.txt";
            break;
        case 4:
            fase = "fases/4.txt";
            break;
        case 5:
            fase = "fases/5.txt";
            break;
        default:
            fase = "fases/mapateste.txt";
            break;
    }
    
    texto = await lerArquivo(fase);

    const linhas = texto.trim().split("\n");

    const primeiraLinha = linhas[0];

    [largura, altura] = primeiraLinha.split(" ").map(Number);

    resetviVdaCounter();
    
    let entidades = {};
    setDados(entidades, largura, altura);

    let jogador = contruirEntidade({tipo:'p'});

    contruirEntidade({tipo:"numero", pos:[1,1], casa:1000});
    contruirEntidade({tipo:"numero", pos:[2,1], casa:100});
    contruirEntidade({tipo:"numero", pos:[3,1], casa:10});
    contruirEntidade({tipo:"numero", pos:[4,1], casa:1});


    for (let y = 1; y <= altura; y++){
        for (let x = 0; x < largura; x++){
            const char = linhas[y][x];
            
            if(char != 'p' && char != ' ' && char != '\n' && char != '\r' && char !== undefined){
                contruirEntidade({tipo:char, pos:[x, y-1], jogador:jogador});
            }

            if(char === 'p'){
                jogador.pos = [x, y-1];
            }
        }
    }

    dados = { altura, largura, entidades, jogador };

    contruirEntidade({tipo:"nivel",valor:numerofase});

    return dados;
}

function movimentoTiro(tiro){
    tiro.mover();
    
    if (tiro.pos[0] < 0 || tiro.pos[0] > dados.largura || tiro.pos[1] > dados.altura || tiro.pos[1] < 2) {
        delete dados.entidades[tiro.id];
        return;
    }

    // colisão com inimigos
    for (const entidade of Object.values(dados.entidades)) {
        if (inimigos.has(entidade.tipo) && colisao(entidade, tiro)) {
            if (entidade.vidas > 0) {
                entidade.vidas -= 1;
            }
            if(entidade.vidas == 0){
                controleSom.tocar("explosion");
            }

            delete dados.entidades[tiro.id];
            return;
        }
    }
}    

let inimigosRestantes = 1;
// Função de movimento das entidades, recebe o objeto de entidades e atualiza a posição de cada uma de acordo com seu tipo
export function moverEntidades(entidades){
    inimigosRestantes = 0;
    for(const entidade of Object.values(entidades)){
        if(inimigos.has(entidade.tipo)) {
            inimigosRestantes ++;
            entidade.tick();
        }
        
        if(entidade.tipo == 't') movimentoTiro(entidade);
        if(entidade.tipo == "numero") entidade.calcularValor(dados.jogador.pontos);
        
        // Vai testar a colisão do jogador com cada entidade
        if(entidade.vidas > 0 && colisao(entidade, dados.jogador) && causaDano.has(entidade.tipo) && !dados.jogador.invencivel){
            dados.jogador.sofrerDano();
            controleSom.tocar("perder uma vida");
        }

        if(entidade.tipo == 'v' && dados.jogador.vidas < entidade.vidaRepresenta) delete dados.entidades[entidade.id];
        if(entidade.morto) {
            dados.jogador.pontos += entidade.pontos;
            delete dados.entidades[entidade.id];
        }
    }
    return inimigosRestantes;
}


// Função de colisão, recebe a entidade com a qual o jogador colidiu e o objeto do jogador, 
// verifica se a entidade causa dano ou é uma parede e retorna true se for uma parede para impedir o movimento do jogador
// Entradas: entidade com a qual o jogador colidiu, objeto do jogador
// Saídas: true se for uma parede, false caso contrário

function colisao(entidade1, entidade2){
    if(entidade1 == null || entidade2 == null) return false;

    if(Math.abs(entidade1.pos[0]-entidade2.pos[0]) < 1 && Math.abs(entidade1.pos[1]-entidade2.pos[1]) < 1){
        return true;
    }
    return false;
}


// Função de colisão do jogador, recebe a direção do movimento e o objeto do jogador, verifica as 4 pontas do jogador para detectar colisões
function ColisaoPlayerMovendo(direcao, jogador){

    for(const entidade of Object.values(dados.entidades)){
        if(paredes.has(entidade.tipo)){
            if(Math.abs(entidade.pos[0]-jogador.pos[0]-direcao[0]) < 1 && Math.abs(entidade.pos[1]-jogador.pos[1]-direcao[1]) < 1){
                return true;
            }
        } 
    }
    
    return false;
}

// Função para gerar um tiro, cria um novo objeto de tiro e adiciona ao objeto de entidades
function gerarTiro(){
    contruirEntidade({
        tipo:"t",
        pos:[dados.jogador.pos[0], dados.jogador.pos[1]],
        jogador:dados.jogador
    });
}

// Função de movimento do jogador, recebe um objeto com as teclas pressionadas e atualiza a posição do jogador de acordo
// verifica primeiro o movimento diagonal e se ocorrer retorna para evitar que o movimento seja processado mais de uma vez,
// tambem verifica se o jogador esta atirando
// Entradas: objeto com as teclas pressionadas, objeto do jogador
export function moverJogador(tecla, jogador, mouseON, mousePos){
    if(jogador.ultimoTiro > 0)jogador.ultimoTiro -= 1;
    if(jogador.ultimoTiro <= 0){
    if(tecla[" "] || tecla[0] || tecla.tiro) {
            gerarTiro();
            controleSom.tocar("tiro");
            jogador.ultimoTiro = jogador.cadenciaDeTiro;
        }
    }

    if(tecla.w && tecla.a && !ColisaoPlayerMovendo([-Math.cos(Math.PI/4)*jogador.vel, Math.sin(Math.PI/4)*jogador.vel], jogador))
        jogador.moverCimaEsquerda();
    else if(tecla.w && tecla.d && !ColisaoPlayerMovendo([Math.cos(Math.PI/4)*jogador.vel, Math.sin(Math.PI/4)*jogador.vel], jogador))
        jogador.moverCimaDireita();
    else if(tecla.s && tecla.a && !ColisaoPlayerMovendo([-Math.cos(Math.PI/4)*jogador.vel, -Math.sin(Math.PI/4)*jogador.vel], jogador))
        jogador.moverBaixoEsquerda();
    else if(tecla.s && tecla.d && !ColisaoPlayerMovendo([Math.cos(Math.PI/4)*jogador.vel, -Math.sin(Math.PI/4)*jogador.vel], jogador))
        jogador.moverBaixoDireita();
    else if(tecla.w && !ColisaoPlayerMovendo([0, jogador.vel], jogador)) 
        jogador.moverCima();
    else if(tecla.s && !ColisaoPlayerMovendo([0, -jogador.vel], jogador)) 
        jogador.moverBaixo();
    else if(tecla.a && !ColisaoPlayerMovendo([-jogador.vel, 0], jogador)) 
        jogador.moverEsquerda();
    else if(tecla.d && !ColisaoPlayerMovendo([jogador.vel, 0], jogador)) 
        jogador.moverDireita();
    else jogador.parado();

    jogador.tick(mouseON, mousePos);
    if(jogador.morto) {
        contruirEntidade({tipo:"derrota"});
    }
}