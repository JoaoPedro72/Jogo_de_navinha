const spritesheetSizePixels = 107;
const celulaSizePixels = 19;
const celulaSize = celulaSizePixels/spritesheetSizePixels;
const espacoColunaELinha = (celulaSizePixels+3)/spritesheetSizePixels;


class Parede {
    constructor(id, pos) {
        this.id = id;
        this.pos = pos;
        this.tipo = '#';
        this.cordenadasTextura = new Float32Array([
            0.0, 0.0, 
            0.2, 0.0, 
            0.2, 0.2,
            0.0, 0.2
        ]);
        this.offSetTextura(1, 0);
    }
    offSetTextura(offsetX, offsetY){
        offsetX = offsetX * espacoColunaELinha;
        offsetY = offsetY * espacoColunaELinha;

        this.cordenadasTextura[0] = offsetX;
        this.cordenadasTextura[1] = offsetY;
        this.cordenadasTextura[2] = offsetX + celulaSize;
        this.cordenadasTextura[3] = offsetY;
        this.cordenadasTextura[4] = offsetX + celulaSize;
        this.cordenadasTextura[5] = offsetY + celulaSize;
        this.cordenadasTextura[6] = offsetX;
        this.cordenadasTextura[7] = offsetY + celulaSize;
    }
}

class Entidade {
    constructor(id, pos, vel, alvo, tipo) {
        this.id = id;
        this.pos = pos;
        this.vel = vel;
        this.alvo = alvo;
        this.tipo = tipo;
        this.cordenadasTextura = new Float32Array([
            0.0, 0.0, 
            0.2, 0.0, 
            0.2, 0.2, 
            0.0, 0.2
        ]);
        this.offSetTextura(0, 0);
    }
    offSetTextura(offsetX, offsetY){
        offsetX = offsetX * espacoColunaELinha;
        offsetY = offsetY * espacoColunaELinha;

        this.cordenadasTextura[0] = offsetX;
        this.cordenadasTextura[1] = offsetY;
        this.cordenadasTextura[2] = offsetX + celulaSize;
        this.cordenadasTextura[3] = offsetY;
        this.cordenadasTextura[4] = offsetX + celulaSize;
        this.cordenadasTextura[5] = offsetY + celulaSize;
        this.cordenadasTextura[6] = offsetX;
        this.cordenadasTextura[7] = offsetY + celulaSize;
    }
}

class Jogador extends Entidade {
    constructor() {
        super(0, [0, 0], 0.5, null, 'j');
        this.vidas = 3;
        this.velocidade = 0.5;
        this.invencivel = false;
        this.cadenciaDeTiro = 30;
        this.ultimoTiro = 0;
        this.pontos = 0;
        this.offSetTextura(0, 4);
    }
}

class Inimigo extends Entidade {
    constructor(id, pos, vel, alvo, tipo) {
        super(id, pos, vel, alvo, tipo);
        this.loaded = false;
        this.size = 1;
        this.pontos = 100;
    }
    moverAteAlvo(){
        if(Math.abs(this.alvo[1]-this.pos[1]) > 0.5) this.pos[1] += this.vel * (this.alvo[1] - this.pos[1]) / Math.hypot(this.alvo[0] - this.pos[0], this.alvo[1] - this.pos[1]);
        if(Math.abs(this.alvo[0]-this.pos[0]) > 0.5) this.pos[0] += this.vel * (this.alvo[0] - this.pos[0]) / Math.hypot(this.alvo[0] - this.pos[0], this.alvo[1] - this.pos[1]);
    }
}

class Tiro extends Entidade {
    constructor(id, pos, vel, alvo) {
        super(id, pos, vel, alvo, 't');
        this.offSetTextura(0, 1);
    }
    mover(){
        if(Math.abs(this.alvo[1]-this.pos[1]) > 0.5) this.pos[1] += this.vel * (this.alvo[1] - this.pos[1]) / Math.hypot(this.alvo[0] - this.pos[0], this.alvo[1] - this.pos[1]);
        if(Math.abs(this.alvo[0]-this.pos[0]) > 0.5) this.pos[0] += this.vel * (this.alvo[0] - this.pos[0]) / Math.hypot(this.alvo[0] - this.pos[0], this.alvo[1] - this.pos[1]);
    }
}

// A ideia é que esse inimigo realize um avanço seguindo algo como uma senoide avançando e apos sair da tela ele volta para o começo; 
class InimigoF extends Inimigo {
    constructor(id, pos, altura) {
        super(id, pos, 0.5, [1-pos[0], 0], 'f');
        this.altura = altura;
        this.espera = 30 * 5;
        this.pontos = 200;
        this.posInicial = [pos[0], pos[1]];
        this.offSetTextura(0, 2);
    }
    mover(){
        if(this.pos[1]<-3) {
            this.pos[1] = this.altura + 3;
            this.pos[0] = this.posInicial[0];
        }
        else {
            if(this.pos[1] >= this.posInicial[1]){
                this.espera = 30 * 5;
                this.pos[1] -= this.vel;
            }
            else {
                this.espera -= 1;
                if(this.espera <= 0){
                    this.pos[1] -= this.vel;
                    this.pos[0] = this.posInicial[0] + 0.2 * Math.sin((this.posInicial[1] - this.pos[1])); // /2
                }
            }
        } 
    }
}

class InimigoG extends Inimigo {
    constructor(id, pos, altura, largura, jogador) {
        super(id, pos, 0.5, [1-pos[0], 0], 'g');
        this.altura = altura;
        this.largura = largura;
        this.espera = 30 * 5;
        this.tempoDeVoo = 0;
        this.pontos = 200;
        this.posInicial = [pos[0], pos[1]];
        this.offSetTextura(0, 2);
        this.jogador = jogador;
        this.padrao = 1;
    }
    mover(){
        if(this.pos[1]<-3 || this.pos[0]<-3 || this.pos[0]>this.largura+3) {
            this.pos[1] = this.altura + 3;
            this.pos[0] = this.posInicial[0];
        }
        else {
            if(this.pos[1] >= this.posInicial[1]){
                this.espera = 30 * 5;
                this.pos[1] -= this.vel;
                console.log(this.tempoDeVoo);
                this.tempoDeVoo = 0;
                if(this.pos[0] < this.jogador.pos[0])  this.padrao = 1;
                else this.padrao = -1;
            }
            else {
                this.espera -= 1;
                if(this.espera <= 0){
                    this.tempoDeVoo += 1;
                    this.pos[1] -= this.vel * Math.cos(this.tempoDeVoo/40);
                    this.pos[0] += this.padrao * this.vel * Math.sin(this.tempoDeVoo/40);
                }
            }
        } 
    }
}

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
        if(this.pos[1]<8) this.padrao = 4;
        else {
            if(this.padrao == 1){
                this.pos[0] += this.vel;
                if(this.pos[0] > this.areaAcao-2.5) this.padrao = 2;
                this.alvo = [0, this.pos[1] - 1.5];
            }
            else if(this.padrao == 2){
                this.pos[1] -= this.vel;
                if(Math.abs(this.pos[1] - this.alvo[1]) < 0.5) this.padrao = 3;
            }else if(this.padrao == 3){
                this.pos[0] -= this.vel;
                if(this.pos[0] < 1.5) this.padrao = 0;
                this.alvo = [0, this.pos[1] - 1.5];
            }else if(this.padrao == 0){
                this.pos[1] -= this.vel;
                if(Math.abs(this.pos[1] - this.alvo[1]) < 0.5) this.padrao = 1;
            }
        }
    }
}

export function contruirEntidade(id, tipo, pos, largura, altura, jogador, alvo){
    if(tipo === 'p') return new Jogador();
    if(tipo === 'e') return new InimigoE(id, pos, largura, jogador);
    if(tipo === 'f') return new InimigoF(id, pos, altura);
    if(tipo === 't') return new Tiro(id, pos, 0.5, alvo);
    if(tipo === '#') return new Parede(id, pos);
    if(tipo === 'g') return new InimigoG(id, pos, altura, largura, jogador);
}