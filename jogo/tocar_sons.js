export class ControleSom {
    constructor(){
        this.explosion1 = new Audio("sons/explosion1.wav");
        this.explosion2 = new Audio("sons/explosion2.wav");
        this.explosion3 = new Audio("sons/explosion3.wav");

        this.tiro1 = new Audio("sons/tiro1.wav");
    }

    explosion(){
        let rand = ((Math.random() * 3) | 0) + 1;
        if(rand==1)this.play(this.explosion1);
        if(rand==2)this.play(this.explosion2);
        if(rand==3)this.play(this.explosion3);
    }
    atirar(){
        this.play(this.tiro1);
    }

    tocar(tiposom){
        if(tiposom == "explosion") this.explosion();
        if(tiposom == "tiro") this.atirar();
    }

    play(audio) {
        const clone = audio.cloneNode();
        clone.playbackRate = Math.random() + 0.5;
        clone.play();
    }
}