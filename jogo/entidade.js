const spritesheetSizePixels = 290;
const celulaSizePixels = 19;
const celulaSize = celulaSizePixels/spritesheetSizePixels;
const espacoColunaELinha = (celulaSizePixels+3)/spritesheetSizePixels;

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
        this.inimigo = true;
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
        this.inimigo = true;
    }
    mover(){
        this.pos[0] -= this.vel * Math.sin(this.angulo);
        this.pos[1] -= this.vel * Math.cos(this.angulo);
        if(this.pos[1] > this.altura+1 || this.pos[1] < 2 || this.pos[0] < -1 || this.pos[0] > this.largura+1) delete this.entidades[this.id];
    }
}

// Inimigo avanço
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

// Inimigo Rasante
class InimigoG extends Inimigo {
    constructor(id, pos, altura, largura, jogador) {
        super(id, pos, 0.5, [1-pos[0], 0], 'g');
        this.altura = altura;
        this.largura = largura;
        this.espera = 15 * 5;
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
                this.espera = 15 * 5;
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

// Inimigo que persegue o jogador
class InimigoR extends Inimigo {
    constructor(id, pos, largura, altura, jogador) {
        super(id, pos, 0.2, [1-pos[0], 0], 'r');
        this.loaded = true;
        this.padrao = 1;
        this.tempo = Math.random() * 280 - 100;

        this.altura = altura;
        this.largura = largura;
        this.jogador = jogador;

        this.offSetTextura(0, 3);
        this.angulo = 0;
        this.posInicial = [pos[0], pos[1]];
    }
    mover(){
        switch (this.padrao) {
            case 4:
                this.perseguir();
                break;
            case 5:
                this.voltarPosicaoInicial();
            default:
                this.moverLateral();
                break;
        }
        if(this.pos[0] > this.largura + 1 || this.pos[0] < -1 || this.pos[1] < 2 || this.pos[1] > this.altura + 2 || isNaN(this.pos[0])){
            this.padrao = 5;
            this.pos = [this.posInicial[0], this.altura + 1];
        }
    }
    moverLateral(){
        this.tempo ++;

        switch (this.padrao) {
            case 1:
                this.pos[0] += this.vel;
                if(this.pos[0] > this.largura-2.5 && this.vidas > 0) {this.padrao = 2; this.offSetTextura(1, 3);}
                this.alvo = [0, this.pos[1] - 1.5];
                break;
            case 2:
                this.pos[1] -= this.vel;
                if(Math.abs(this.pos[1] - this.alvo[1]) < 0.5 && this.vidas > 0) {this.padrao = 3; this.offSetTextura(0, 3);}
                break
            case 3:
                this.pos[0] -= this.vel;
                if(this.pos[0] < 1.5 && this.vidas > 0) {this.padrao = 0; this.offSetTextura(1, 3);}
                this.alvo = [0, this.pos[1] - 1.5];
                break
            case 0:
                this.pos[1] -= this.vel;
                if(Math.abs(this.pos[1] - this.alvo[1] < 0.5) && this.vidas > 0) {this.padrao = 1; this.offSetTextura(0, 3);}
                break
            default:
                break;
        }
        if(this.tempo>200){
            if(this.pos[1] > 5) this.tempo = Math.random() * 20;
            this.padrao = 4;
            this.posInicial = [this.pos[0],this.pos[1]];
            this.angulo = Math.atan((this.jogador.pos[0] - this.pos[0]) / (this.jogador.pos[1] - this.pos[1]));
            if(this.jogador.pos[1] - this.pos[1] >= 0) this.angulo += Math.PI;
            this.vel = 0.5;
            this.offSetTextura(1, 3);
        }
    }
    voltarPosicaoInicial(){
        let vetor = [(this.posInicial[0] - this.pos[0]),(this.posInicial[1] - this.pos[1])]
        this.angulo = Math.atan(vetor[0] / vetor[1]);
        if(this.posInicial[1] - this.pos[1] >= 0) this.angulo += Math.PI;

        this.pos[0] -= this.vel * Math.sin(this.angulo);
        this.pos[1] -= this.vel * Math.cos(this.angulo);

        if(Math.abs(vetor[0]) < 0.5 && Math.abs(vetor[1]) < 0.5) {this.padrao = 1; this.offSetTextura(0, 3); this.vel = 0.2; this.angulo=0;}
    }
    perseguir(){
        //padrao 4
        if(this.vidas < 1) return;
        let velVira = Math.PI/135;
        let anguloAlvo = Math.atan((this.jogador.pos[0] - this.pos[0]) / (this.jogador.pos[1] - this.pos[1]));
        if(this.jogador.pos[1] - this.pos[1] >= 0) anguloAlvo += Math.PI;

        
        if(Math.abs(this.angulo - anguloAlvo) <= Math.PI){
            if(this.angulo > anguloAlvo) this.angulo -= velVira;
            else this.angulo += velVira;
        }else{
            if(this.angulo > anguloAlvo) this.angulo += velVira;
            else this.angulo -= velVira;
        }
        
        if(this.angulo > Math.PI * 2)  this.angulo -= Math.PI * 2;
        if(this.angulo < -Math.PI * 2) this.angulo += Math.PI * 2;
        
        this.pos[0] -= this.vel * Math.sin(this.angulo);
        this.pos[1] -= this.vel * Math.cos(this.angulo);
    }
}

// Inimigo Tiro
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





export class CaixaDeEntidades {
    /**
     * @param {Object} entidades - Objeto que armazena todas as entidades do jogo
     * @param {number} altura - Altura do mapa/tela
     * @param {number} largura - Largura do mapa/tela
     */
    constructor(entidades, altura, largura){
        this.vidaCounter = 1;
        this.entidades = entidades;
        this.largura = largura;
        this.altura = altura;
        this.jogador;
    }

    /**
     * Reseta o contador usado para gerar IDs/ordem de vidas
     */
    resetVidaCounter(){
        this.vidaCounter = 1;
    }

    /**
     * Mostra a tela de início de nível
     * @param {number} id - ID inicial para inserir novas entidades
     * @param {number} numero - Número do nível atual
     */
    mostrarTelaNivel(id, numero){

        this.entidades[id] = new Texto(id, [this.largura/2 - 2.5, this.altura/2 - 1], [0, 7], "nivel"); id ++;
        this.entidades[id] = new Texto(id, [this.largura/2 - 1.5, this.altura/2 - 1], [1, 7], "nivel"); id ++;
        this.entidades[id] = new Texto(id, [this.largura/2 - 0.5, this.altura/2 - 1], [2, 7], "nivel"); id ++;
        this.entidades[id] = new Texto(id, [this.largura/2 + 0.5, this.altura/2 - 1], [3, 7], "nivel"); id ++;

        this.entidades[id] = new Texto(id, [this.largura/2 - 2.5, this.altura/2 - 0], [0, 8], "nivel"); id ++;
        this.entidades[id] = new Texto(id, [this.largura/2 - 1.5, this.altura/2 - 0], [1, 8], "nivel"); id ++;
        this.entidades[id] = new Texto(id, [this.largura/2 - 0.5, this.altura/2 - 0], [2, 8], "nivel"); id ++;
        this.entidades[id] = new Texto(id, [this.largura/2 + 0.5, this.altura/2 - 0], [3, 8], "nivel"); id ++;
        
        this.entidades[id] = new Texto(id, [this.largura/2 + 2, this.altura/2 - 0.5], [numero, 9], "nivel"); id ++;

        this.mostrarDica();
    }

    /**
     * Mostra uma dica aleatória na tela
     */
    mostrarDica(){
        let dica = (Math.random() * 2) | 0;
        if(dica == 0) this.escrever("aperte m para mirarcom o mouse",[3,5],19,"dica");
        if(dica == 1) this.escrever("precionar q liga o tiro automatico",[3,5],19,"dica");
    }

    /**
     * Escreve um texto na tela, quebrando em várias linhas se necessário
     * 
     * @param {string} texto - Texto a ser exibido
     * @param {Array<number>} pos - Posição inicial [x, y]
     * @param {number} largMaxTexto - Número máximo de caracteres por linha
     * @param {string} identificador - Código coletivo para agrupar/remover textos depois
     */
    escrever(texto, pos, largMaxTexto, identificador){
        let id = 0;
        while(this.entidades[id] != null) id++;
        
        if(texto.length > largMaxTexto){
            this.entidades[id] = new Texto(id, [pos[0], pos[1]], [0, 0], identificador);
            this.entidades[id].gerarTexto(this.entidades, texto.slice(0,largMaxTexto));
            this.escrever(texto.slice(largMaxTexto), [pos[0],pos[1]-1], largMaxTexto, identificador);
        }else{
            this.entidades[id] = new Texto(id, [pos[0], pos[1]], [0, 0], identificador);
            this.entidades[id].gerarTexto(this.entidades, texto);
        }
    }

    /**
     * Esconde a tela de nível removendo entidades relacionadas
     * 
     */
    esconderTelaNivel(){
        for (const entidade of Object.values(this.entidades)) {
            if(entidade.codColetivo == "nivel") {
                entidade.pos[0] = -10;
                delete this.entidades[entidade.id];
            }
        }
        this.apagarTexto("dica");
    }

    /**
     * Cria a tela de derrota
     * 
     * @param {number} id - ID inicial para inserção
     */
    telaDerrota(id){
        this.entidades[id++] = new Texto(id, [this.largura/2 - 3, this.altura/2], [4, 8], "derrota");
        this.entidades[id++] = new Texto(id, [this.largura/2 - 2, this.altura/2], [5, 8], "derrota");
        this.entidades[id++] = new Texto(id, [this.largura/2 - 1, this.altura/2], [6, 8], "derrota");
        this.entidades[id++] = new Texto(id, [this.largura/2 - 0, this.altura/2], [7, 8], "derrota");
        this.entidades[id++] = new Texto(id, [this.largura/2 + 1, this.altura/2], [8, 8], "derrota");
        this.entidades[id++] = new Texto(id, [this.largura/2 + 2, this.altura/2], [9, 8], "derrota");
    }

    /**
     * Remove todos os textos com um determinado código coletivo
     * 
     * @param {string} codColetivo - Identificador dos textos a serem removidos
     */
    apagarTexto(codColetivo){
        for (const entidade of Object.values(this.entidades)){
            if(entidade.tipo == "texto") if(entidade.codColetivo == codColetivo) delete this.entidades[entidade.id];
        }
    }

    /**
     * Constrói uma entidade com base em um objeto de configuração
     * 
     * @param {Object} params - Parâmetros da entidade
     * @param {number} params.id - ID inicial (opcional)
     * @param {string} params.tipo - Tipo da entidade ('p', 'e', 'f', etc.)
     * @param {Array<number>} params.pos - Posição [x, y]
     * @param {number} params.casa - Usado para pontuação (exibição numérica)
     * @param {number} params.valor - Valor associado (ex: número do nível ou pontuação)
     * @param {string} params.codColetivo - Identificador de grupo (usado em textos)
     */
    contruirEntidade({
        id = 0,
        tipo,
        pos,
        casa,
        valor = 0,
        codColetivo = ""
    }){
        while(this.entidades[id] != null) id++;
        //console.log("tentando criar " + tipo);
        if(tipo === 'p') {
            this.jogador = new Jogador();
            return this.jogador;
        }
        if(tipo === 'e') this.entidades[id] = new InimigoE(id, pos, this.largura, this.jogador);
        if(tipo === 'f') this.entidades[id] =  new InimigoF(id, pos, this.altura);
        if(tipo === 't') this.entidades[id] =  new Tiro(id, pos, 0.5, this.jogador.angulo);
        if(tipo === '#') this.entidades[id] =  new Parede(id, pos);
        if(tipo === 'g') this.entidades[id] =  new InimigoG(id, pos, this.altura, this.largura, this.jogador);
        if(tipo === 'v') this.entidades[id] =  new Vida(id, pos, this.vidaCounter++);
        if(tipo === 'h') this.entidades[id] =  new InimigoH(id, pos, this.altura, this.largura, this.entidades);
        if(tipo === 'j') this.entidades[id] =  new InimigoJ(id, pos, this.largura, this.entidades, this.jogador);
        if(tipo == "numero") this.entidades[id] =  new Pontuacao(id, pos, casa, valor)
        if(tipo == "esconderNivel") this.esconderTelaNivel();
        if(tipo == "nivel") this.mostrarTelaNivel(id, valor);
        if(tipo == "derrota") this.telaDerrota(id);
        if(tipo == "texto") this.entidades[id] =  new Texto(id, pos, [0,0], codColetivo);
        if(tipo == "apagar") this.apagarTexto(codColetivo);
        if(tipo == 'r') this.entidades[id] = new InimigoR(id, pos, this.largura, this.altura, this.jogador)
    }
}