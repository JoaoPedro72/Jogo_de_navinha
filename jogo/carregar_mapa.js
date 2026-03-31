async function lerArquivo() {
    const response = await fetch("map.txt");
    const texto = await response.text();
    return texto;
}

let dados = {};
export async function gerarMapa() {
    const texto = await lerArquivo();

    const linhas = texto.trim().split("\n");
    

    const [altura, largura] = [linhas.length, linhas[0].length-1];

    let mapa = [];
    let objetos = [];
    let size = 0;
    let jogador = {pos: [0, 0], vidas: 3, velocidade: 0.1, invencivel: false};

    linhas.forEach(linha => mapa.push(linha.split("")));


    for (let y = 0; y < altura; y++){
        for (let x = 0; x < largura; x++){
            if(mapa[y][x] != ' ' && mapa[y][x] != 'p'){
                objetos.push([mapa[y][x], x, y]);
                size++;
            }
            if(mapa[y][x] == 'p'){
                jogador.pos = [x, y];
            }
        }
    }

    dados = { altura, largura, objetos, size, jogador };
    return dados;
}

export function moverInimigos(){

}

function testarColisao(direcao){
    for (let i = 0; i < dados.size; i++) {
        if (dados.objetos[i][1] <= dados.jogador.pos[0] + direcao[0] + 1 && dados.objetos[i][1] + 1 > dados.jogador.pos[0] + direcao[0] &&
            dados.objetos[i][2] <= dados.jogador.pos[1] + direcao[1] + 1 && dados.objetos[i][2] + 1 > dados.jogador.pos[1] + direcao[1] ) {
            console.log("colidiu com " + dados.objetos[i][0]);

            if(dados.objetos[i][0] == 'e' && !dados.jogador.invencivel){
                dados.jogador.vidas--;
                dados.jogador.invencivel = true;
                setTimeout(() => {
                    dados.jogador.invencivel = false;
                    console.log("invencibilidade acabou");
                }, 1000);
            }

            return true;
        }
    }
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