import { contruirEntidade } from "./entidade.js";


async function lerArquivo() {
    const response = await fetch("map.txt");
    const texto = await response.text();
    return texto;
}

let dados = {};
let id = 0;
const inimigos = new Set(['e', 'f', 'g']);
const causaDano = new Set(['e', 'f', 'g']);
const paredes = new Set(['#']);

export async function gerarMapa() {
    const texto = await lerArquivo();

    const linhas = texto.trim().split("\n");

    const [altura, largura] = [linhas.length, linhas[0].length - 1];

    let entidades = {};
    let jogador = contruirEntidade(null, 'p', null, null, null, null, null);

    for (let y = 0; y < altura; y++){
        for (let x = 0; x < largura; x++){

            const char = linhas[y][x];

            if(char != 'p' && char != ' '){
                entidades[id] = contruirEntidade(id, char, [x, y], largura, altura, jogador);
                id ++;
            }

            if(char === 'p'){
                jogador.pos = [x, y];
            }
        }
    }

    dados = { altura, largura, entidades, jogador };

    return dados;
}

function movimentoTiro(tiro){
    if(Math.abs(tiro.alvo[1]-tiro.pos[1]) > 0.5) tiro.pos[1] += tiro.vel * (tiro.alvo[1] - tiro.pos[1]) / Math.hypot(tiro.alvo[0] - tiro.pos[0], tiro.alvo[1] - tiro.pos[1]);
    if(Math.abs(tiro.alvo[0]-tiro.pos[0]) > 0.5) tiro.pos[0] += tiro.vel * (tiro.alvo[0] - tiro.pos[0]) / Math.hypot(tiro.alvo[0] - tiro.pos[0], tiro.alvo[1] - tiro.pos[1]);
    else if (Math.abs(tiro.alvo[1]-tiro.pos[1]) <= 0.5) {
        delete dados.entidades[tiro.id];
    }

    for(const entidade of Object.values(dados.entidades)){
        if(inimigos.has(entidade.tipo) && colisao(entidade, tiro)){
            dados.jogador.pontos += entidade.pontos;
            delete dados.entidades[entidade.id];
            delete dados.entidades[tiro.id];
            return;
        }
    }
}

// Função de movimento das entidades, recebe o objeto de entidades e atualiza a posição de cada uma de acordo com seu tipo
export function moverEntidades(entidades){
    for(const entidade of Object.values(entidades)){

        if(inimigos.has(entidade.tipo)) entidade.mover();
        
        if(entidade.tipo == 't') movimentoTiro(entidade);
        
        // Vai testar a colisão do jogador com cada entidade
        if(colisao(entidade, dados.jogador) && causaDano.has(entidade.tipo) && !dados.jogador.invencivel){
            dados.jogador.vidas -= 1;
            dados.jogador.invencivel = true;
            setTimeout(() => {
                dados.jogador.invencivel = false;
            }, 2000);
        }
    }
}


// Função de colisão, recebe a entidade com a qual o jogador colidiu e o objeto do jogador, 
// verifica se a entidade causa dano ou é uma parede e retorna true se for uma parede para impedir o movimento do jogador
// Entradas: entidade com a qual o jogador colidiu, objeto do jogador
// Saídas: true se for uma parede, false caso contrário

function colisao(entidade1, entidade2){
    if(entidade1 == null || entidade2 == null) return false;

    if(Math.abs(entidade1.pos[0]-entidade2.pos[0]) < 1 && Math.abs(entidade1.pos[1]-entidade2.pos[1]) < 1){
        console.log("colisão");
        return true;
    }
    return false;
}


// Função de colisão do jogador, recebe a direção do movimento e o objeto do jogador, verifica as 4 pontas do jogador para detectar colisões
function ColisaoPlayerMovendo(direcao, jogador){

    for(const entidade of Object.values(dados.entidades)){
        if(paredes.has(entidade.tipo)){
            if(Math.abs(entidade.pos[0]-jogador.pos[0]-direcao[0]) < 1 && Math.abs(entidade.pos[1]-jogador.pos[1]-direcao[1]) < 1){
                console.log("colisão");
                return true;
            }
        } 
    }
    
    return false;
}

// Função para gerar um tiro, cria um novo objeto de tiro e adiciona ao objeto de entidades
function gerarTiro(){
    dados.entidades[id] = contruirEntidade(id, "t", [dados.jogador.pos[0], dados.jogador.pos[1]], 0, null, null, [dados.jogador.pos[0], dados.altura]);
    id ++;
    console.log("tiro gerado");
}

// Função de movimento do jogador, recebe um objeto com as teclas pressionadas e atualiza a posição do jogador de acordo
// verifica primeiro o movimento diagonal e se ocorrer retorna para evitar que o movimento seja processado mais de uma vez,
// tambem verifica se o jogador esta atirando
// Entradas: objeto com as teclas pressionadas, objeto do jogador
export function moverJogador(tecla, jogador){
    if(jogador.ultimoTiro > 0)jogador.ultimoTiro -= 1;
    if(jogador.ultimoTiro <= 0){
        if(tecla[" "]) {
            gerarTiro();
            jogador.ultimoTiro = jogador.cadenciaDeTiro;
        }
    }

    if(tecla.w && tecla.a && !ColisaoPlayerMovendo([-Math.cos(Math.PI/4)*jogador.velocidade, Math.sin(Math.PI/4)*jogador.velocidade], jogador)){
        jogador.pos[0] -= Math.cos(Math.PI/4)*jogador.velocidade;
        jogador.pos[1] += Math.sin(Math.PI/4)*jogador.velocidade;
        return;
    }
    if(tecla.w && tecla.d && !ColisaoPlayerMovendo([Math.cos(Math.PI/4)*jogador.velocidade, Math.sin(Math.PI/4)*jogador.velocidade], jogador)){
        jogador.pos[0] += Math.cos(Math.PI/4)*jogador.velocidade;
        jogador.pos[1] += Math.sin(Math.PI/4)*jogador.velocidade;
        return;
    }
    if(tecla.s && tecla.a && !ColisaoPlayerMovendo([-Math.cos(Math.PI/4)*jogador.velocidade, -Math.sin(Math.PI/4)*jogador.velocidade], jogador)){
        jogador.pos[0] -= Math.cos(Math.PI/4)*jogador.velocidade;
        jogador.pos[1] -= Math.sin(Math.PI/4)*jogador.velocidade;
        return;
    }
    if(tecla.s && tecla.d && !ColisaoPlayerMovendo([Math.cos(Math.PI/4)*jogador.velocidade, -Math.sin(Math.PI/4)*jogador.velocidade], jogador)){
        jogador.pos[0] += Math.cos(Math.PI/4)*jogador.velocidade;
        jogador.pos[1] -= Math.sin(Math.PI/4)*jogador.velocidade;
        return;
    }
    if(tecla.w && !ColisaoPlayerMovendo([0, jogador.velocidade], jogador)) jogador.pos[1] += jogador.velocidade;
    if(tecla.s && !ColisaoPlayerMovendo([0, -jogador.velocidade], jogador)) jogador.pos[1] -= jogador.velocidade;
    if(tecla.a && !ColisaoPlayerMovendo([-jogador.velocidade, 0], jogador)) jogador.pos[0] -= jogador.velocidade;
    if(tecla.d && !ColisaoPlayerMovendo([jogador.velocidade, 0], jogador)) jogador.pos[0] += jogador.velocidade;
}