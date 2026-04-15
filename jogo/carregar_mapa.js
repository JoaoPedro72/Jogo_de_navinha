import { ControleSom } from "./tocar_sons.js";
import { CaixaDeEntidades } from "./entidade.js";

async function lerArquivo(arquivo) {
    const response = await fetch(arquivo);
    const texto = await response.text();
    return texto;
}

let texto;
let altura;
let largura;
let controle;
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

    
    
    let listaEntidade = {};
    controle = new CaixaDeEntidades(listaEntidade, altura, largura);

    controle.resetVidaCounter();

    let jogador = controle.contruirEntidade({tipo:'p'});

    controle.contruirEntidade({tipo:"numero", pos:[1,1], casa:1000});
    controle.contruirEntidade({tipo:"numero", pos:[2,1], casa:100});
    controle.contruirEntidade({tipo:"numero", pos:[3,1], casa:10});
    controle.contruirEntidade({tipo:"numero", pos:[4,1], casa:1});


    for (let y = 1; y <= altura; y++){
        for (let x = 0; x < largura; x++){
            const char = linhas[y][x];
            
            if(char != 'p' && char != ' ' && char != '\n' && char != '\r' && char !== undefined){
                controle.contruirEntidade({tipo:char, pos:[x, y-1], jogador:jogador});
            }

            if(char === 'p'){
                jogador.pos = [x, y-1];
            }
        }
    }

    controle.contruirEntidade({tipo:"nivel",valor:numerofase});

    return controle;
}

function movimentoTiro(tiro){
    tiro.mover();
    
    if (tiro.pos[0] < 0 || tiro.pos[0] > controle.largura || tiro.pos[1] > controle.altura || tiro.pos[1] < 2) {
        delete controle.entidades[tiro.id];
        return;
    }

    // colisão com inimigos
    for (const entidade of Object.values(controle.entidades)) {
        if (inimigos.has(entidade.tipo) && colisao(entidade, tiro)) {
            if (entidade.vidas > 0) {
                entidade.vidas -= 1;
            }
            if(entidade.vidas == 0){
                controleSom.tocar("explosion");
            }

            delete controle.entidades[tiro.id];
            return;
        }
    }
}    

let inimigosRestantes = 1;
// Função de movimento das listaEntidade, recebe o objeto de listaEntidade e atualiza a posição de cada uma de acordo com seu tipo
export function moverEntidades(listaEntidade){
    inimigosRestantes = 0;
    for(const entidade of Object.values(listaEntidade)){
        if(inimigos.has(entidade.tipo)) {
            inimigosRestantes ++;
            entidade.tick();
        }
        
        if(entidade.tipo == 't') movimentoTiro(entidade);
        if(entidade.tipo == "numero") entidade.calcularValor(controle.jogador.pontos);
        
        // Vai testar a colisão do jogador com cada entidade
        if(entidade.vidas > 0 && colisao(entidade, controle.jogador) && causaDano.has(entidade.tipo) && !controle.jogador.invencivel){
            controle.jogador.sofrerDano();
            controleSom.tocar("perder uma vida");
        }

        if(entidade.tipo == 'v' && controle.jogador.vidas < entidade.vidaRepresenta) delete controle.entidades[entidade.id];
        if(entidade.morto) {
            controle.jogador.pontos += entidade.pontos;
            delete controle.entidades[entidade.id];
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
function colisaoPlayerMovendo(direcao, jogador){

    for(const entidade of Object.values(controle.entidades)){
        if(paredes.has(entidade.tipo)){
            if(Math.abs(entidade.pos[0]-jogador.pos[0]-direcao[0]) < 1 && Math.abs(entidade.pos[1]-jogador.pos[1]-direcao[1]) < 1){
                return true;
            }
        } 
    }
    
    return false;
}

// Função para gerar um tiro, cria um novo objeto de tiro e adiciona ao objeto de listaEntidade
function gerarTiro(){
    controle.contruirEntidade({
        tipo:"t",
        pos:[controle.jogador.pos[0], controle.jogador.pos[1]],
        jogador:controle.jogador
    });
}

/**
 * Moves the player entity based on keyboard input and mouse state.
 * @param {Object} tecla - Object representando teclas pressionadas (e.g., {w: true, a: false, ...}).
 * @param {Object} jogador - The player entity object to be moved.
 * @param {boolean} mouseON - Whether mouse control is enabled.
 * @param {Array<number>} mousePos - The current mouse position as [x, y].
 */
export function moverJogador(tecla, jogador, mouseON, mousePos){
    if(jogador.ultimoTiro > 0)jogador.ultimoTiro -= 1;
    if(jogador.ultimoTiro <= 0){
    if(tecla[" "] || tecla[0] || tecla.tiro) {
            gerarTiro();
            controleSom.tocar("tiro");
            jogador.ultimoTiro = jogador.cadenciaDeTiro;
        }
    }

    if(tecla.w && tecla.a && !colisaoPlayerMovendo([-Math.cos(Math.PI/4)*jogador.vel, Math.sin(Math.PI/4)*jogador.vel], jogador))
        jogador.moverCimaEsquerda();
    else if(tecla.w && tecla.d && !colisaoPlayerMovendo([Math.cos(Math.PI/4)*jogador.vel, Math.sin(Math.PI/4)*jogador.vel], jogador))
        jogador.moverCimaDireita();
    else if(tecla.s && tecla.a && !colisaoPlayerMovendo([-Math.cos(Math.PI/4)*jogador.vel, -Math.sin(Math.PI/4)*jogador.vel], jogador))
        jogador.moverBaixoEsquerda();
    else if(tecla.s && tecla.d && !colisaoPlayerMovendo([Math.cos(Math.PI/4)*jogador.vel, -Math.sin(Math.PI/4)*jogador.vel], jogador))
        jogador.moverBaixoDireita();
    else if(tecla.w && !colisaoPlayerMovendo([0, jogador.vel], jogador)) 
        jogador.moverCima();
    else if(tecla.s && !colisaoPlayerMovendo([0, -jogador.vel], jogador)) 
        jogador.moverBaixo();
    else if(tecla.a && !colisaoPlayerMovendo([-jogador.vel, 0], jogador)) 
        jogador.moverEsquerda();
    else if(tecla.d && !colisaoPlayerMovendo([jogador.vel, 0], jogador)) 
        jogador.moverDireita();
    else jogador.parado();

    jogador.tick(mouseON, mousePos);
    if(jogador.morto) {
        controle.contruirEntidade({tipo:"derrota"});
    }
}