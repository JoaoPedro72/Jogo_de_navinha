const spritesheetSizePixels = 290;
const celulaSizePixels = 19;
const celulaSize = celulaSizePixels/spritesheetSizePixels;
const espacoColunaELinha = (celulaSizePixels+3)/spritesheetSizePixels;

class Entidades {
    constructor(){
        
    }
}

class Prop {
    constructor(id, pos) {
        this.id = id;
        this.pos = pos;

        this.escalaText = celulaSize;
        this.offSetText = [0, 0];
    }
    offSetTextura(offsetX, offsetY){
        offsetX = offsetX * espacoColunaELinha;
        offsetY = offsetY * espacoColunaELinha;

        this.offSetText[0] = offsetX;
        this.offSetText[1] = offsetY;
    }
}

class Parede extends Prop{
    constructor(id, pos) {
        super(id, pos);
        this.tipo = '#';
        this.offSetTextura(1, 0);
    }
}

class Texto extends Prop{
    constructor(id, pos, offSetText, codColetivo) {
        super(id, pos);
        this.tipo = "texto";
        this.codColetivo = codColetivo;
        this.offSetTextura(offSetText[0], offSetText[1]);
    }
    gerarTexto(entidades, texto){ 
        let nextOffSet = 0.8;
        let caracter = texto[0];
        let caracteres_com_menos_espaco = new Set(['t','i','j']);
        if(caracter >= 'a' && caracter <= 'm')this.offSetTextura(caracter.charCodeAt(0) - 'a'.charCodeAt(0), 12);
        if(caracter >= 'n' && caracter <= 'z')this.offSetTextura(caracter.charCodeAt(0) - 'n'.charCodeAt(0), 11);
        if(caracter >= '0' && caracter <= '9')this.offSetTextura(caracter.charCodeAt(0) - '0'.charCodeAt(0), 9);
        if(caracter == ' ')this.offSetTextura(0, 10);
        if(caracteres_com_menos_espaco.has(caracter)) {this.pos[0] -=0.2; nextOffSet = 0.6;}

        if(texto.length > 1){
            let i = this.id;
            while(entidades[i] != null) i++;
            entidades[i] = new Texto(i,[this.pos[0]+nextOffSet,this.pos[1]], [0,0], this.codColetivo);
            entidades[i].gerarTexto(entidades, texto.slice(1));
        }
    }
}

class Pontuacao extends Prop {
    constructor(id, pos, casa, valor){
        super(id, pos);
        this.tipo = "numero";
        this.casa = casa;
        this.valor = valor;
        this.offSetTextura(this.valor,9);
    }
    setValor(valor){
        this.valor = valor;
        this.offSetTextura(this.valor,9);
    }
    calcularValor(numero){
        numero = numero | 0;

        this.valor = (numero - (numero % this.casa)) % (this.casa * 10) / this.casa;
        this.valor = this.valor | 0;

        this.offSetTextura(this.valor, 9);
    }
}

class Vida extends Prop {
    constructor(id, pos, vidaRepresenta) {
        super(id, pos);
        this.tipo = 'v';
        this.vidaRepresenta = vidaRepresenta;
        this.offSetTextura(0, 4);
    }
}

class Entidade extends Prop{
    constructor(id, pos, vel, alvo, tipo) {
        super(id, pos);
        this.vel = vel;
        this.alvo = alvo;
        this.tipo = tipo;
        this.vidas = 1;
        this.morto = false;
        this.animationTime = 0;
        this.pontos = 0;
        this.offSetTextura(0, 0);
    }
    tick(){
        if(this.vidas <= 0) this.animacaoMorte();
        this.mover();
    }
    animacaoMorte(){
        this.animationTime+=4;
        if(this.animationTime > 100){
            this.morto = true;
            this.offSetTextura(2,1);
        }
        else if(this.animationTime > 80) this.offSetTextura(3,1);
        else if(this.animationTime > 60) this.offSetTextura(4,1);
        else if(this.animationTime > 40) this.offSetTextura(4,0);
        else if(this.animationTime > 20) this.offSetTextura(3,0);
        else if(this.animationTime >0) this.offSetTextura(2,0);
    }
    mover(){}
}

class Jogador extends Entidade {
    constructor() {
        super(0, [0, 0], 0.5, null, 'j');
        this.vidas = 5;
        this.velocidade = 0.5;
        this.invencivel = false;
        this.cadenciaDeTiro = 15;
        this.ultimoTiro = 0;
        this.pontos = 0;
        this.offSetTextura(0, 4);
        this.angulo = 0;
        this.anguloAuxiliar = 0;
        this.textura = 0;
    }
    tick(mouseON, mousePos){
        if(this.vidas < 0) {
            this.velocidade = 0;
            this.animacaoMorte();
        }else if(!this.invencivel){
            if(this.textura==0) this.textura =1;
            else this.textura = 0;
            this.offSetTextura(this.textura,4);
        }
        
        let direcao = [(mousePos.x - this.pos[0]) / Math.hypot(mousePos.x - this.pos[0], mousePos.y - this.pos[1]) , (mousePos.y - this.pos[1]) / Math.hypot(mousePos.x - this.pos[0], mousePos.y - this.pos[1])];

        if(mouseON){
            if(direcao[1] > 0) this.angulo = Math.atan(direcao[0] / direcao[1]);
            else this.angulo = Math.atan(direcao[0] / direcao[1]) + Math.PI;
        }
        else this.angulo = this.anguloAuxiliar;
    }
    sofrerDano(){
        if(this.vidas > 0){
            this.invencivel = true;
            if(this.pontos >= 20)this.pontos -= 20;
            else this.pontos = 0;
            
            this.offSetTextura(2,4);
            setTimeout(() => {
                this.offSetTextura(0,4);
            }, 500);
            setTimeout(() => {
                this.offSetTextura(2,4);
            }, 1000);
            setTimeout(() => {
                this.invencivel = false;
                this.offSetTextura(0,4);
            }, 1500);
        }
        this.vidas -= 1;
    }
    moverCima(){
        this.pos[1] += this.velocidade;
        if(this.anguloAuxiliar > Math.PI/50) this.anguloAuxiliar -= Math.PI/20;
        else if(this.anguloAuxiliar < -Math.PI/50) this.anguloAuxiliar += Math.PI/20;
        else this.anguloAuxiliar = 0;
    }
    moverBaixo(){
        this.pos[1] -= this.velocidade;
        if(this.anguloAuxiliar > Math.PI/50) this.anguloAuxiliar -= Math.PI/20;
        else if(this.anguloAuxiliar < -Math.PI/50) this.anguloAuxiliar += Math.PI/20;
        else this.anguloAuxiliar = 0;
    }
    moverEsquerda(){
        this.pos[0] -= this.velocidade;
        if(this.anguloAuxiliar > -Math.PI/4) this.anguloAuxiliar -= Math.PI/20;
    }
    moverDireita(){
        this.pos[0] += this.velocidade;
        if(this.anguloAuxiliar < Math.PI/4) this.anguloAuxiliar += Math.PI/20;
    }
    moverCimaEsquerda(){
        this.pos[0] -= Math.cos(Math.PI/4)*this.velocidade;
        this.pos[1] += Math.sin(Math.PI/4)*this.velocidade;
        if(this.anguloAuxiliar > -Math.PI/4) this.anguloAuxiliar -= Math.PI/20;
    }
    moverCimaDireita(){
        this.pos[0] += Math.cos(Math.PI/4)*this.velocidade;
        this.pos[1] += Math.sin(Math.PI/4)*this.velocidade;
        if(this.anguloAuxiliar < Math.PI/4) this.anguloAuxiliar += Math.PI/20;
    }
    moverBaixoEsquerda(){
        this.pos[0] -= Math.cos(Math.PI/4)*this.velocidade;
        this.pos[1] -= Math.sin(Math.PI/4)*this.velocidade;
        if(this.anguloAuxiliar < Math.PI/4) this.anguloAuxiliar += Math.PI/20;
    }
    moverBaixoDireita(){
        this.pos[0] += Math.cos(Math.PI/4)*this.velocidade;
        this.pos[1] -= Math.sin(Math.PI/4)*this.velocidade;
        if(this.anguloAuxiliar > -Math.PI/4) this.anguloAuxiliar -= Math.PI/20;
        
    }
    parado(){
        //if(this.anguloAuxiliar > Math.PI/50) this.anguloAuxiliar -= Math.PI/50;
        //else if(this.anguloAuxiliar < -Math.PI/50) thiswa.anguloAuxiliar += Math.PI/50;
        //else this.anguloAuxiliar = 0;
        this.anguloAuxiliar += 0;
    }
}

class Inimigo extends Entidade {
    constructor(id, pos, vel, alvo, tipo) {
        super(id, pos, vel, alvo, tipo);
        this.loaded = false;
        this.size = 1;
        this.pontos = 10;
        this.angulo = 0;
    }
    moverAteAlvo(){
        if(this.vidas < 1) return;
        let direcao = [(this.alvo[0] - this.pos[0]) / Math.hypot(this.alvo[0] - this.pos[0], this.alvo[1] - this.pos[1]),(this.alvo[1] - this.pos[1]) / Math.hypot(this.alvo[0] - this.pos[0], this.alvo[1] - this.pos[1])]
        if(Math.abs(this.alvo[1]-this.pos[1]) > 0.5) this.pos[1] += this.vel * direcao[1];
        if(Math.abs(this.alvo[0]-this.pos[0]) > 0.5) {
            this.pos[0] += this.vel * direcao[0];
            if(direcao[1]>0)this.angulo = Math.atan(direcao[0]/direcao[1]) + Math.PI;
            else this.angulo = Math.atan(direcao[0]/direcao[1]);
        }
    }
}

class Tiro extends Entidade {
    constructor(id, pos, vel, angulo) {
        super(id, pos, vel, null, 't');
        this.angulo = angulo;
        this.offSetTextura(0, 1);
    }
    mover(){
        this.pos[0] += Math.cos(this.angulo - Math.PI/2) * this.vel;
        this.pos[1] += Math.sin(this.angulo + Math.PI/2) * this.vel;
    }
}

class TiroInimigo extends Entidade {
    constructor(id, pos, vel, altura, largura, entidades, angulo) {
        super(id, pos, vel, null, "tiroInimigo");
        this.offSetTextura(1, 1);
        this.entidades = entidades;
        this.altura = altura;
        this.largura = largura;
        this.angulo = angulo;
    }
    mover(){
        this.pos[0] -= this.vel * Math.sin(this.angulo);
        this.pos[1] -= this.vel * Math.cos(this.angulo);
        if(this.pos[1] > this.altura+1 || this.pos[1] < 2 || this.pos[0] < -1 || this.pos[0] > this.largura+1) delete this.entidades[this.id];
    }
}

//Inimigo avanço
class InimigoF extends Inimigo {
    constructor(id, pos, altura) {
        super(id, pos, 0.5, [1-pos[0], 0], 'f');
        this.altura = altura;
        this.espera = 30 * 2;
        this.angulo = 0;
        this.pontos = 30;
        this.posInicial = [pos[0], pos[1]];
        this.offSetTextura(2, 2);
        this.tempoDeVoo = 0;
        this.vidas = 2;
    }
    mover(){
        if(this.pos[1]<2) {
            this.pos[1] = this.altura + 3;
            this.pos[0] = this.posInicial[0];
        }
        else {
            if(this.pos[1] >= this.posInicial[1]){
                this.espera = 30 * 5;
                this.pos[1] -= this.vel;
                this.tempoDeVoo = 0;
                this.angulo = 0;
            }
            else {
                this.espera -= 1;
                if(this.espera <= 0){
                    this.angulo = Math.sin(this.tempoDeVoo/4);
                    this.pos[1] -= this.vel * Math.cos(-this.angulo);
                    this.pos[0] += this.vel * Math.sin(-this.angulo);
                    this.tempoDeVoo ++;
                    if(this.vidas > 0) this.offSetTextura(3, 2);
                }else if(this.vidas > 0) this.offSetTextura(2, 2);
            }
        } 
    }
}

//Inimigo Rasante
class InimigoG extends Inimigo {
    constructor(id, pos, altura, largura, jogador) {
        super(id, pos, 0.5, [1-pos[0], 0], 'g');
        this.altura = altura;
        this.largura = largura;
        this.espera = 30 * 5;
        this.angulo = 0;
        this.pontos = 20;
        this.posInicial = [pos[0], pos[1]];
        this.offSetTextura(0, 2);
        this.jogador = jogador;
        this.padrao = 1;
    }
    mover(){
        if(this.pos[1]<2 || this.pos[0]<1 || this.pos[0]>this.largura-2) {
            this.pos[1] = this.altura + 3;
            this.pos[0] = this.posInicial[0];
        }
        else {
            if(this.pos[1] >= this.posInicial[1]){
                this.espera = 30 * 5;
                this.pos[1] -= this.vel;
                this.angulo = 0;
                if(this.pos[0] < this.jogador.pos[0])  this.padrao = -1;
                else this.padrao = 1;
            }
            else {
                this.espera -= 1;
                if(this.espera <= 0){
                    if(this.vidas > 0) this.offSetTextura(1, 2);
                    this.angulo += this.padrao * 1/30;
                    this.pos[1] -= this.vel * Math.cos(-this.angulo);
                    this.pos[0] += this.vel * Math.sin(-this.angulo);
                }else if(this.vidas > 0) this.offSetTextura(0, 2);
            }
        } 
    }
}

// Inimigo classico
class InimigoE extends Inimigo {
    constructor(id, pos, largura, jogador) {
        super(id, pos, 0.2, [1-pos[0], 0], 'e');
        this.loaded = true;
        this.padrao = 1;
        this.areaAcao = largura;
        this.jogador = jogador;
        this.offSetTextura(0, 3);
    }
    mover(){
        if(this.padrao <= 3)this.moverLateral();
        else {
            this.alvo = this.jogador.pos;
            this.moverAteAlvo();
        }
    }
    moverLateral(){
        if(this.pos[1]<8) {
            this.padrao = 4;
            this.offSetTextura(1, 3);
        }
        else {
            if(this.padrao == 1){
                this.pos[0] += this.vel;
                if(this.pos[0] > this.areaAcao-2.5 && this.vidas > 0) {this.padrao = 2; this.offSetTextura(1, 3);}
                this.alvo = [0, this.pos[1] - 1.5];
            }
            else if(this.padrao == 2){
                this.pos[1] -= this.vel;
                if(Math.abs(this.pos[1] - this.alvo[1]) < 0.5 && this.vidas > 0) {this.padrao = 3; this.offSetTextura(0, 3);}
            }else if(this.padrao == 3){
                this.pos[0] -= this.vel;
                if(this.pos[0] < 1.5 && this.vidas > 0) {this.padrao = 0; this.offSetTextura(1, 3);}
                this.alvo = [0, this.pos[1] - 1.5];
            }else if(this.padrao == 0){
                this.pos[1] -= this.vel;
                if(Math.abs(this.pos[1] - this.alvo[1] < 0.5) && this.vidas > 0) {this.padrao = 1; this.offSetTextura(0, 3);}
            }
        }
    }
}

//Inimigo Tiro
class InimigoH extends Inimigo{
    constructor(id, pos, altura, largura, entidades) {
        super(id, pos, 0.2, [1-pos[0], 0], 'g');
        this.altura = altura;
        this.largura = largura;
        this.tempo = 0;
        this.angulo = 0;
        this.pontos = 30;
        this.posInicial = [pos[0], pos[1]];
        this.offSetTextura(1, 5);
        this.padrao = 1;
        this.entidades = entidades;
    }
    mover(){
        this.tempo ++;
        if(this.tempo > 30 * 5 && this.tempo < 30 * 10){
            if(this.pos[1] < this.altura+2 && this.pos[1] > this.posInicial[1]-1) {this.pos[1] += this.vel; if(this.vidas > 0)this.offSetTextura(0, 5);}
            else if(this.vidas > 0)this.offSetTextura(1, 5);
            if(this.pos[1] < 3) this.pos[1] += this.vel;
            if(this.pos[1] >= this.altura+2){
                this.pos[1] = 2;
                this.angulo = Math.PI;
            }
        }
        if(this.tempo > 30 * 10){
            if(this.pos[1] < this.posInicial[1]-1 || this.pos[1] > this.posInicial[1]) {this.pos[1] -= this.vel; if(this.vidas > 0)this.offSetTextura(0, 5);}
            else if(this.vidas > 0)this.offSetTextura(1, 5);
            if(this.pos[1] <= 2){
                this.pos[1] = this.altura+2;
                this.angulo = 0;
            }
        }
        if((this.tempo + 10) % 60 == 0) this.atirar();
        if(this.tempo > 30 *15)this.tempo = 0;
    }
    atirar(){
        let idProcura = 1;
        while(this.entidades[idProcura] != null) idProcura ++;

        this.entidades[idProcura] = new TiroInimigo(idProcura, [this.pos[0],this.pos[1]], 0.5, this.altura, this.largura, this.entidades, this.angulo);
    }
}

// inimigo mira e atira no jogador
class InimigoJ extends Inimigo{
    constructor(id, pos, largura, entidades, jogador) {
        super(id, pos, 0.2, [1-pos[0], 0], 'g');
        this.largura = largura;
        this.tempo = 0;
        this.angulo = 0;
        this.pontos = 30;
        this.offSetTextura(2, 5);
        this.padrao = 1;
        this.anima = 0;
        this.entidades = entidades;
        this.jogador = jogador;
    }
    mover(){
        this.tempo ++;
        if(this.tempo > 30 * 5){
            this.offSetTextura(2, 5);
            if(this.tempo % 30 == 0)this.atirar();
            this.angulo = Math.atan((this.jogador.pos[0] - this.pos[0])/(this.jogador.pos[1] - this.pos[1]));
        }
        if(this.tempo < 30 * 5){

            if(this.anima == 0) this.offSetTextura(3, 5);
            if(this.anima == 2) this.offSetTextura(4, 5);

            this.anima++;
            if(this.anima==4) this.anima = 0;

            if(this.pos[0] <= 2) this.padrao = 1;
            if(this.pos[0] >= this.largura-2) this.padrao = 0;
            if(this.padrao == 1) {
                this.pos[0] += this.vel;
                this.angulo = -Math.PI/2;
            }
            if(this.padrao == 0) {
                this.pos[0] -= this.vel;
                this.angulo = Math.PI/2;
            }
        }
        if(this.tempo > 300) this.tempo = 0;
        
    }
    atirar(){
        let idProcura = 1;
        while(this.entidades[idProcura] != null) idProcura ++;

        let mira = [];
        mira[0] = this.jogador.pos[0] - this.pos[0];
        mira[1] = this.jogador.pos[1] - this.pos[1];

        this.entidades[idProcura] = new TiroInimigo(idProcura, [this.pos[0],this.pos[1]], 0.5, this.altura, this.largura, this.entidades, this.angulo);
    }
}







let vidaCounter = 1;

export function resetviVdaCounter(){
    vidaCounter = 1;
}

function mostrarTelaNivel(id, entidades, numero, largura, altura){

    entidades[id] = new Texto(id, [largura/2 - 2.5, altura/2 - 1], [0, 7], "nivel"); id ++;
    entidades[id] = new Texto(id, [largura/2 - 1.5, altura/2 - 1], [1, 7], "nivel"); id ++;
    entidades[id] = new Texto(id, [largura/2 - 0.5, altura/2 - 1], [2, 7], "nivel"); id ++;
    entidades[id] = new Texto(id, [largura/2 + 0.5, altura/2 - 1], [3, 7], "nivel"); id ++;

    entidades[id] = new Texto(id, [largura/2 - 2.5, altura/2 - 0], [0, 8], "nivel"); id ++;
    entidades[id] = new Texto(id, [largura/2 - 1.5, altura/2 - 0], [1, 8], "nivel"); id ++;
    entidades[id] = new Texto(id, [largura/2 - 0.5, altura/2 - 0], [2, 8], "nivel"); id ++;
    entidades[id] = new Texto(id, [largura/2 + 0.5, altura/2 - 0], [3, 8], "nivel"); id ++;
    
    entidades[id] = new Texto(id, [largura/2 + 2, altura/2 - 0.5], [numero, 9], "nivel"); id ++;

    mostrarDica();
}

function mostrarDica(){
    let dica = (Math.random() * 2) | 0;
    if(dica == 0) escrever("aperte m para mirarcom o mouse",[3,5],19,"dica");
    if(dica == 1) escrever("precionar q liga o tiro automatico",[3,5],19,"dica");
}

function escrever(texto, pos, largMaxTexto, identificador){
    let id = 0;
    while(entidades[id] != null) id++;
    
    if(texto.length > largMaxTexto){
        entidades[id] = new Texto(id, [pos[0], pos[1]], [0, 0], identificador);
        entidades[id].gerarTexto(entidades, texto.slice(0,largMaxTexto));
        escrever(texto.slice(largMaxTexto), [pos[0],pos[1]-1], largMaxTexto, identificador);
    }else{
        entidades[id] = new Texto(id, [pos[0], pos[1]], [0, 0], identificador);
        entidades[id].gerarTexto(entidades, texto);
    }
}

export function esconderTelaNivel(entidades){
    for (const entidade of Object.values(entidades)) {
        if(entidade.codColetivo == "nivel") {
            entidade.pos[0] = -10;
            delete entidades[entidade.id];
        }
    }
    apagarTexto("dica");
}

function telaDerrota(id, entidades, largura, altura){
    entidades[id++] = new Texto(id, [largura/2 - 3, altura/2], [4, 8], "derrota");
    entidades[id++] = new Texto(id, [largura/2 - 2, altura/2], [5, 8], "derrota");
    entidades[id++] = new Texto(id, [largura/2 - 1, altura/2], [6, 8], "derrota");
    entidades[id++] = new Texto(id, [largura/2 - 0, altura/2], [7, 8], "derrota");
    entidades[id++] = new Texto(id, [largura/2 + 1, altura/2], [8, 8], "derrota");
    entidades[id++] = new Texto(id, [largura/2 + 2, altura/2], [9, 8], "derrota");
}

function apagarTexto(codColetivo){
    for (const entidade of Object.values(entidades)){
        if(entidade.tipo == "texto") if(entidade.codColetivo == codColetivo) delete entidades[entidade.id];
    }
}

let entidades;
let largura;
let altura;
export function setDados(ent, larg, alt){
    entidades = ent;
    largura = larg;
    altura = alt;
}

export function contruirEntidade({
    id = 0,
    tipo,
    pos,
    jogador,
    casa,
    valor = 0,
    codColetivo = ""
}){
    while(entidades[id] != null) id++;
    
    console.log("tentando criar " + tipo);
    if(tipo === 'p') return new Jogador();
    if(tipo === 'e') entidades[id] = new InimigoE(id, pos, largura, jogador);
    if(tipo === 'f') entidades[id] =  new InimigoF(id, pos, altura);
    if(tipo === 't') entidades[id] =  new Tiro(id, pos, 0.5, jogador.angulo);
    if(tipo === '#') entidades[id] =  new Parede(id, pos);
    if(tipo === 'g') entidades[id] =  new InimigoG(id, pos, altura, largura, jogador);
    if(tipo === 'v') entidades[id] =  new Vida(id, pos, vidaCounter++);
    if(tipo === 'h') entidades[id] =  new InimigoH(id, pos, altura, largura, entidades);
    if(tipo === 'j') entidades[id] =  new InimigoJ(id, pos, largura, entidades, jogador);
    if(tipo == "numero") entidades[id] =  new Pontuacao(id, pos, casa, valor)
    if(tipo == "esconderNivel") esconderTelaNivel(entidades);
    if(tipo == "nivel") mostrarTelaNivel(id,entidades, valor, largura, altura);
    if(tipo == "derrota") telaDerrota(id, entidades, largura, altura);
    if(tipo == "texto") entidades[id] =  new Texto(id, pos, [0,0], codColetivo);
    if(tipo == "apagar") apagarTexto(codColetivo);
}
