const spritesheetSizePixels = 217;
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

class Vida extends Parede {
    constructor(id, pos, vidaRepresenta) {
        super(id, pos);
        this.tipo = 'v';
        this.vidaRepresenta = vidaRepresenta;
        console.log(vidaRepresenta);
        this.offSetTextura(0, 4);
    }
}

class Entidade {
    constructor(id, pos, vel, alvo, tipo) {
        this.id = id;
        this.pos = pos;
        this.vel = vel;
        this.alvo = alvo;
        this.tipo = tipo;
        this.vidas = 1;
        this.morto = false;
        this.animationTime =0;
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
        this.vidas = 3;
        this.velocidade = 0.5;
        this.invencivel = false;
        this.cadenciaDeTiro = 30;
        this.ultimoTiro = 0;
        this.pontos = 0;
        this.offSetTextura(0, 4);
        this.angulo = 0;
        this.textura = 0;
    }
    tick(){
        if(this.vidas < 0) {
            this.velocidade = 0;
            this.animacaoMorte();
        }else if(!this.invencivel){
            if(this.textura==0) this.textura =1;
            else this.textura = 0;
            this.offSetTextura(this.textura,4);
        }
    }
    sofrerDano(){
        if(this.vidas > 0){
            this.invencivel = true;
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
    }
    moverBaixo(){
        this.pos[1] -= this.velocidade;
    }
    moverEsquerda(){
        this.pos[0] -= this.velocidade;
        if(this.angulo > -Math.PI/5) this.angulo -= Math.PI/50;
    }
    moverDireita(){
        this.pos[0] += this.velocidade;
        if(this.angulo < Math.PI/5) this.angulo += Math.PI/50;
    }
    moverCimaEsquerda(){
        this.pos[0] -= Math.cos(Math.PI/4)*this.velocidade;
        this.pos[1] += Math.sin(Math.PI/4)*this.velocidade;
        if(this.angulo > -Math.PI/5) this.angulo -= Math.PI/50;
    }
    moverCimaDireita(){
        this.pos[0] += Math.cos(Math.PI/4)*this.velocidade;
        this.pos[1] += Math.sin(Math.PI/4)*this.velocidade;
        if(this.angulo < Math.PI/5) this.angulo += Math.PI/50;
    }
    moverBaixoEsquerda(){
        this.pos[0] -= Math.cos(Math.PI/4)*this.velocidade;
        this.pos[1] -= Math.sin(Math.PI/4)*this.velocidade;
    }
    moverBaixoDireita(){
        this.pos[0] += Math.cos(Math.PI/4)*this.velocidade;
        this.pos[1] -= Math.sin(Math.PI/4)*this.velocidade;
        
    }
    parado(){
        if(this.angulo > Math.PI/50) this.angulo -= Math.PI/50;
        else if(this.angulo < -Math.PI/50) this.angulo += Math.PI/50;
        else this.angulo = 0;
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

class TiroInimigo extends Entidade {
    constructor(id, pos, vel, alvo, altura, largura, entidades) {
        super(id, pos, vel, alvo, "tiroInimigo");
        this.offSetTextura(1, 1);
        this.entidades = entidades;
        this.altura = altura;
        this.largura = largura;
    }
    mover(){
        if(Math.abs(this.alvo[1]-this.pos[1]) > 0.5) this.pos[1] += this.vel * (this.alvo[1] - this.pos[1]) / Math.hypot(this.alvo[0] - this.pos[0], this.alvo[1] - this.pos[1]);
        if(Math.abs(this.alvo[0]-this.pos[0]) > 0.5) this.pos[0] += this.vel * (this.alvo[0] - this.pos[0]) / Math.hypot(this.alvo[0] - this.pos[0], this.alvo[1] - this.pos[1]);
        if(this.pos[1] > this.altura+1 || this.pos[1] < 2 || this.pos[0] < -1 || this.pos[0] > this.largura+1) delete this.entidades[this.id];
    }
}

// A ideia é que esse inimigo realize um avanço seguindo algo como uma senoide avançando e apos sair da tela ele volta para o começo; 
class InimigoF extends Inimigo {
    constructor(id, pos, altura) {
        super(id, pos, 0.5, [1-pos[0], 0], 'f');
        this.altura = altura;
        this.espera = 30 * 2;
        this.angulo = 0;
        this.pontos = 200;
        this.posInicial = [pos[0], pos[1]];
        this.offSetTextura(0, 2);
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
        this.angulo = 0;
        this.pontos = 200;
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
                    this.angulo += this.padrao * 1/30;
                    this.pos[1] -= this.vel * Math.cos(-this.angulo);
                    this.pos[0] += this.vel * Math.sin(-this.angulo);
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
                if(this.pos[0] > this.areaAcao-2.5) {this.padrao = 2; this.offSetTextura(1, 3);}
                this.alvo = [0, this.pos[1] - 1.5];
            }
            else if(this.padrao == 2){
                this.pos[1] -= this.vel;
                if(Math.abs(this.pos[1] - this.alvo[1]) < 0.5) {this.padrao = 3; this.offSetTextura(0, 3);}
            }else if(this.padrao == 3){
                this.pos[0] -= this.vel;
                if(this.pos[0] < 1.5) {this.padrao = 0; this.offSetTextura(1, 3);}
                this.alvo = [0, this.pos[1] - 1.5];
            }else if(this.padrao == 0){
                this.pos[1] -= this.vel;
                if(Math.abs(this.pos[1] - this.alvo[1]) < 0.5) {this.padrao = 1; this.offSetTextura(0, 3);}
            }
        }
    }
}

class InimigoH extends Inimigo{
    constructor(id, pos, altura, largura, entidades) {
        super(id, pos, 0.2, [1-pos[0], 0], 'g');
        this.altura = altura;
        this.largura = largura;
        this.tempo = 0;
        this.angulo = 0;
        this.pontos = 300;
        this.posInicial = [pos[0], pos[1]];
        this.offSetTextura(1, 5);
        this.padrao = 1;
        this.entidades = entidades;
    }
    mover(){
        this.tempo ++;
        if(this.tempo > 30 * 5 && this.tempo < 30 * 10){
            if(this.pos[1] < this.altura+2 && this.pos[1] > this.posInicial[1]-1) {this.pos[1] += this.vel; this.offSetTextura(0, 5);}
            else this.offSetTextura(1, 5);
            if(this.pos[1] < 3) this.pos[1] += this.vel;
            if(this.pos[1] >= this.altura+2){
                this.pos[1] = 2;
                this.angulo = Math.PI;
            }
        }
        if(this.tempo > 30 * 10){
            if(this.pos[1] < this.posInicial[1]-1 || this.pos[1] > this.posInicial[1]) {this.pos[1] -= this.vel; this.offSetTextura(0, 5);}
            else this.offSetTextura(1, 5);
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

        if(this.pos[1] < 5) this.entidades[idProcura] = contruirEntidade(idProcura,"tiroInimigo", [this.pos[0],this.pos[1]], this.largura, this.altura, null, [this.pos[0],this.altura+3],this.entidades);
        else this.entidades[idProcura] = contruirEntidade(idProcura,"tiroInimigo", [this.pos[0],this.pos[1]], this.largura, this.altura, null, [this.pos[0],0-3], this.entidades);
    }
}

let vidaCounter = 1;
export function contruirEntidade(id, tipo, pos, largura, altura, jogador, alvo, entidades){
    if(tipo === 'p') return new Jogador();
    if(tipo === 'e') return new InimigoE(id, pos, largura, jogador);
    if(tipo === 'f') return new InimigoF(id, pos, altura);
    if(tipo === 't') return new Tiro(id, pos, 0.5, alvo);
    if(tipo === '#') return new Parede(id, pos);
    if(tipo === 'g') return new InimigoG(id, pos, altura, largura, jogador);
    if(tipo === 'v') return new Vida(id, pos, vidaCounter++);
    if(tipo === 'h') return new InimigoH(id, pos, altura, largura, entidades);
    if(tipo == "tiroInimigo") return new TiroInimigo(id, pos, 0.5, alvo, altura, largura, entidades);
}