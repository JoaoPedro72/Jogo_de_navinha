async function lerArquivo() {
    const response = await fetch("map.txt");
    const texto = await response.text();
    return texto;
}

export async function gerarMapa() {
    const texto = await lerArquivo();

    const linhas = texto.trim().split("\n");
    

    const [altura, largura] = [linhas.length, linhas[0].length-1];

    let mapa = [];
    let objetos = [];
    let size = 0;

    linhas.forEach(linha => mapa.push(linha.split("")));


    for (let y = 0; y < altura; y++){
        for (let x = 0; x < largura; x++){
            if(mapa[y][x] != ' '){
                objetos.push([mapa[y][x], x, y]);
                size++;
            }
        }
    }

    console.log(altura, largura);
    return { altura, largura, objetos, size };
}
