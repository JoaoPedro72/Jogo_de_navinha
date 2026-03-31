async function lerArquivo() {
    const response = await fetch("map.txt");
    const texto = await response.text();
    return texto;
}

let dados = {};
const inimigos = new Set(['e', 'f', 'g']);
const causaDano = new Set(['e', 'f', 'g','t']);
const paredes = new Set(['#']);

export async function gerarMapa() {
    const texto = await lerArquivo();

    const linhas = texto.trim().split("\n");

    const [altura, largura] = [linhas.length, linhas[0].length - 1];

    let entidades = {};
    let jogador = { pos: [0, 0], vidas: 3, velocidade: 0.1, invencivel: false };

    for (let y = 0; y < altura; y++){
        for (let x = 0; x < largura; x++){

            const char = linhas[y][x];

            if(char !== ' ' && char !== 'p'){
                const key = `${x},${y}`;

                entidades[key] = {
                    tipo: char,
                    pos: [x, y]
                };
            }

            if(char === 'p'){
                jogador.pos = [x, y];
            }
        }
    }

    dados = { altura, largura, entidades, jogador };

    return dados;
}

export function moverInimigos(){

}

function colisao(entidade){
    if(entidade == null) return false;

    console.log("colidiu com", entidade.tipo);



    if(causaDano.has(entidade.tipo) && !dados.jogador.invencivel){
        dados.jogador.vidas--;
        dados.jogador.invencivel = true;
        
        setTimeout(() => {
            dados.jogador.invencivel = false;
        }, 2000);
    }

    if(paredes.has(entidade.tipo)){
        return true;
    }

    return false;
}

function testarColisao(direcao){

    let ponta1 = [Math.floor(dados.jogador.pos[0] + direcao[0]), Math.floor(dados.jogador.pos[1] + direcao[1])];
    let ponta2 = [ponta1[0] + 1, ponta1[1] + 1];
    let ponta3 = [ponta1[0], ponta1[1] + 1];
    let ponta4 = [ponta1[0] + 1, ponta1[1]];

    let key = `${ponta1[0]},${ponta1[1]}`;
    let entidade = dados.entidades[key];
    if(colisao(entidade)) return true;

    key = `${ponta2[0]},${ponta2[1]}`;
    entidade = dados.entidades[key];
    if(colisao(entidade)) return true;

    key = `${ponta3[0]},${ponta3[1]}`;
    entidade = dados.entidades[key];
    if(colisao(entidade)) return true;

    key = `${ponta4[0]},${ponta4[1]}`;
    entidade = dados.entidades[key];
    if(colisao(entidade)) return true;

    return false;
}

//Função de movimento do jogador, recebe um objeto com as teclas pressionadas e atualiza a posição do jogador de acordo
//verifica primeiro o movimento diagonal e se ocorrer retorna para evitar que o movimento seja processado mais de uma vez
export function moverJogador(tecla){
    if(tecla.w && tecla.a && !testarColisao([-Math.cos(Math.PI/4)*dados.jogador.velocidade, Math.sin(Math.PI/4)*dados.jogador.velocidade])){
        dados.jogador.pos[0] -= Math.cos(Math.PI/4)*dados.jogador.velocidade;
        dados.jogador.pos[1] += Math.sin(Math.PI/4)*dados.jogador.velocidade;
        return;
    }
    if(tecla.w && tecla.d && !testarColisao([Math.cos(Math.PI/4)*dados.jogador.velocidade, Math.sin(Math.PI/4)*dados.jogador.velocidade])){
        dados.jogador.pos[0] += Math.cos(Math.PI/4)*dados.jogador.velocidade;
        dados.jogador.pos[1] += Math.sin(Math.PI/4)*dados.jogador.velocidade;
        return;
    }
    if(tecla.s && tecla.a && !testarColisao([-Math.cos(Math.PI/4)*dados.jogador.velocidade, -Math.sin(Math.PI/4)*dados.jogador.velocidade])){
        dados.jogador.pos[0] -= Math.cos(Math.PI/4)*dados.jogador.velocidade;
        dados.jogador.pos[1] -= Math.sin(Math.PI/4)*dados.jogador.velocidade;
        return;
    }
    if(tecla.s && tecla.d && !testarColisao([Math.cos(Math.PI/4)*dados.jogador.velocidade, -Math.sin(Math.PI/4)*dados.jogador.velocidade])){
        dados.jogador.pos[0] += Math.cos(Math.PI/4)*dados.jogador.velocidade;
        dados.jogador.pos[1] -= Math.sin(Math.PI/4)*dados.jogador.velocidade;
        return;
    }
    if(tecla.w && !testarColisao([0, dados.jogador.velocidade])) dados.jogador.pos[1] += dados.jogador.velocidade;
    if(tecla.s && !testarColisao([0, -dados.jogador.velocidade])) dados.jogador.pos[1] -= dados.jogador.velocidade;
    if(tecla.a && !testarColisao([-dados.jogador.velocidade, 0])) dados.jogador.pos[0] -= dados.jogador.velocidade;
    if(tecla.d && !testarColisao([dados.jogador.velocidade, 0])) dados.jogador.pos[0] += dados.jogador.velocidade;
}