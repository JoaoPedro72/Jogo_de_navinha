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
const paredes = new Set(['#', 'v']);

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
    // movimento baseado em ângulo
    tiro.pos[0] += Math.cos(-tiro.angulo+Math.PI/2) * tiro.vel;
    tiro.pos[1] += Math.sin(-tiro.angulo+Math.PI/2) * tiro.vel;

    // remove se sair da tela
    if (
        tiro.pos[0] < -1 || tiro.pos[0] > dados.largura + 1 ||
        tiro.pos[1] < -1 || tiro.pos[1] > dados.altura + 1
    ){
        delete dados.entidades[tiro.id];
        return;
    }

    // colisão com inimigos
    for (const entidade of Object.values(dados.entidades)) {
        if (inimigos.has(entidade.tipo) && colisao(entidade, tiro)) {
            if (entidade.vidas > 0) {
                entidade.vidas -= 1;
            }

            delete dados.entidades[tiro.id];
            return;
        }
    }
}    

// Função de movimento das entidades, recebe o objeto de entidades e atualiza a posição de cada uma de acordo com seu tipo
export function moverEntidades(entidades){
    dados.jogador.tick();
    for(const entidade of Object.values(entidades)){
        
        if(inimigos.has(entidade.tipo)) entidade.tick();
        
        if(entidade.tipo == 't') movimentoTiro(entidade);
        
        // Vai testar a colisão do jogador com cada entidade
        if(entidade.vidas > 0 && colisao(entidade, dados.jogador) && causaDano.has(entidade.tipo) && !dados.jogador.invencivel){
            dados.jogador.sofrerDano();
        }

        if(entidade.tipo == 'v' && dados.jogador.vidas < entidade.vidaRepresenta) delete dados.entidades[entidade.id];
        if(entidade.morto) delete dados.entidades[entidade.id];
    }
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
    dados.entidades[id] = contruirEntidade(
        id,
        "t",
        [dados.jogador.pos[0], dados.jogador.pos[1]],
        0,
        null,
        dados.jogador,
        null
    );
    id ++;
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
}