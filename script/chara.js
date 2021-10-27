class Position {
    constructor(x,y){
        this.x = x;
        this.y = y;
    }

    set(x,y){
        if(x != null){this.x = x;}
        if(y != null){this.y = y;}
    }
}

class BackGround{
    constructor(ctx,image){
        this.ctx = ctx;
        this.image = image;
    }

    draw(){
        this.ctx.drawImage(this.image,0,40,411,440);
    }
    update(){
        this.draw();
    }
}

class Character{
    constructor(ctx, x, y, w, h, image){
        this.ctx = ctx;
        this.position = new Position(x,y);
        this.width = w;
        this.height = h;
        this.image = image;
    }

    draw(){
        let offsetX = this.width / 2;
        let offsetY = this.height / 2;
        this.ctx.drawImage(
            this.image,
            this.position.x - offsetX,
            this.position.y - offsetY,
            this.width,
            this.height
        );
    }
}

class Actor extends Character{
    constructor(ctx,x,w,h,imageRight,imageLeft){
        super(ctx,x,400,w,h,imageRight);
        this.imageLeft = imageLeft;
        this.speed = 4;
        this.bufTime = 0;
        this.status = 1;
        this.vec = 1;
    }

    update(){
        if(window.isKeyDown.key_ArrowRight === true){
            this.position.x += this.speed * this.status;
            this.vec = 1;
        }
        if(window.isKeyDown.key_ArrowLeft === true){
            this.position.x -= this.speed * this.status;
            this.vec = 0;
        }

        if(this.bufTime > 0){this.bufTime--;}
        if(this.bufTime == 0){this.status = 1;}
        let canvasWidth = this.ctx.canvas.width;

        let tx = Math.min(Math.max(this.position.x,0),canvasWidth);
        this.position.set(tx,this.position.y);

        this.draw();
    }

    draw(){
        let offsetX = this.width / 2;
        let offsetY = this.height / 2;

        if(this.vec == 1){
            this.ctx.drawImage(
                this.image,
                this.position.x - offsetX,
                this.position.y - offsetY,
                this.width,
                this.height
            );
        }else{
            this.ctx.drawImage(
                this.imageLeft,
                this.position.x - offsetX,
                this.position.y - offsetY,
                this.width,
                this.height
            );
        }
        
    }

    setElixir(elixir,time){
        this.bufTime = time;
        this.status = elixir;
    }

    statusInit(){
        this.bufTime = 0;
        this.status = 1;
    }

    getPosition(){
        return this.position.x;
    }

    getPath(){
        if(this.vec == 1){
            return this.image;
        }else{
            return this.imageLeft;
        }
    }
} 

class Zanzou extends Character{
    constructor(ctx,x,w,h,image){
        super(ctx,x,400,w,h,image);
        this.clearRate = 0.8;
    }

    update(){
        this.ctx.globalAlpha = this.clearRate;
        this.clearRate -= 0.04;
        this.draw();
    }
}

class Item extends Character{
    constructor(ctx,score,image){
        super(ctx,Math.floor(Math.random()*375),0,50,50,image);
        this.speed = Math.floor(Math.random()*3 + 4);
        this.score = score;
        this.life = 1;
        this.bufTime = 0;
        this.bufValue = null;
    }

    getItem(soundConfirm){
        if(soundConfirm == false){
            if(this.score >= 0){
                var getSound = new Audio('./sound/get.mp3');
            }else{
                var getSound = new Audio('./sound/tarai.mp3');
            }
            getSound.volume = 0.2;
            getSound.play();
        }
        this.life = 0;
        return this.score;
    }

    update(){
        if(this.life <= 0){return;}
        if(this.position.y >= 450){
            this.life=0;
        }
        this.position.y += this.speed;
        this.ctx.globalAlpha= 1.0;
        this.draw();   
    }

    getScore(){
        return this.score;
    }

    getY(){
        return this.y;
    }

    setXmodify(arr){
        for(let i=0; i < arr.length; i++){
            if(this.score == -100 && Math.abs(this.x - arr[i])<20){
                this.x = Math.random() *375;
                i=0;
            }
        }
    }

}

class My_Button{
    constructor(ctx,text,x,y,width,height,side){
        this.ctx = ctx;
        this.text = text;
        this.x = x;
        this.y = y;
        this.height = height;
        this.width = width;
        this.side = side;
    }

    isPushed(mouse_x,w_width){

        if(this.side == 1){
            if(mouse_x >= (w_width/2)){
                return true;
            }
        }else{
            if(mouse_x < (w_width/2)){
                return true;
            }
        }
        return false;
    }

    drawButton(btnStatus){
        if(btnStatus == 1){
            this.ctx.fillStyle = '#afeeee';
        }else{
            this.ctx.fillStyle = '#e0ffff';
        }
        this.ctx.font = '40px serif';
        this.ctx.fillRect(this.x,this.y,100,70);
        this.ctx.fillStyle = '#000080';
        this.ctx.fillText(this.text,this.x+30,this.y+50,80);
    }
}

class effect{
    constructor(ctx,x,point){
        this.ctx = ctx;
        this.getPlace = x;
        this.point = point;
        this.progress = 50;
        this.clearPoint = 1.0;
        this.hugou = '';
    }

    drawEffect(){
        this.ctx.font = '30px arial black';
        this.ctx.globalAlpha = this.clearPoint;
        if(this.point >= 0){
            this.ctx.fillStyle = '#c9171e';
            this.hugou = '+';
        }else{
            this.ctx.fillStyle = '#38a1db';
        }
        this.ctx.fillText(`${this.hugou}${this.point}pt`,this.getPlace,350+(this.progress/5),80);
        this.progress -= 1;
        this.clearPoint -= 0.02;
    }

}

class Text_FadeIn{
    constructor(ctx,text,textSize,location_x,location_y,time,delay){
        this.ctx = ctx;
        this.text = text;
        this.textSize = textSize;
        this.x = location_x;
        this.y = location_y;
        this.now_y = 0;
        this.time = time;
        this.delay = delay;
        this.progress = 1;
        this.abobeLimit = 20;
        this.nowGA = 0;
    }

    fadeIn(){
        if(this.delay > 0){this.delay--;}else{
            if(this.progress < this.time){
                this.now_y = (this.y-this.abobeLimit) + Math.floor(this.abobeLimit * (this.progress/this.time));
                this.nowGA = this.progress/this.time;
            }
            this.ctx.globalAlpha = this.nowGA;
            this.ctx.font = `${this.textSize}px serif`;
            this.ctx.fillStyle = '#000000';
    
            this.ctx.fillText(`${this.text}`,this.x,this.now_y);
    
            this.ctx.globalAlpha = 1.0;
            this.progress++;
        }  
    }
}
/*
class MessageLog{
    constructor(ctx,message){
        this.message = message;
        this.ctx = ctx;
        this.fadeTime = 30;
        this.keepTime = 250;
        this.progress = 0;
        this.place = 150;
        this.x = 0;
        this.y = 0;
    }

    update(i){
        if(this.progress < this.fadeTime){
            this.y = i*30 + 50;
            this.x = (this.place-this.fadeTime)+Math.floor(Math.sin(this.progress/this.fadeTime)*this.fadeTime);
            this.ctx.globalAlpha = (Math.floor(this.x/this.place *10)/10)*0.6;

        }else if(this.progress < (this.fadeTime+this.keepTime)){
            this.y = i*30 + 50;
            this.x = this.place;
            this.ctx.globalAlpha = 0.6;

        }else if(this.progress < ((this.fadeTime*2)+this.keepTime)){
            this.y = i*30 + 50;
            this.x = this.place + Math.floor(Math.sin(this.progress / ((this.fadeTime*2)+this.keepTime))*20);
            this.ctx.globalAlpha = (Math.floor(this.place/this.x *10)/10)*0.6;
        }
        this.progress++;

        this.ctx.fillStyle = "#708090";
        this.ctx.font = "18px serif";
        this.ctx.fillRect(this.x,this.y,250,30);

        this.ctx.globalAlpha = 1.0;
        this.ctx.fillStyle = "#ffffff";
        this.ctx.fillText(`${this.message}`,this.x+40,this.y+20,180);
    }

    isLive(){
        return this.progress < ((this.fadeTime*2)+this.keepTime);
    }
}
*/
class MessageLog{
    constructor(ctx,message){
        this.message = message;
        this.ctx = ctx;
        this.fadeTime = 30;
        this.keepTime = 250;
        this.progress = 0;
        this.place = 50;
        this.x = 0;
        this.y = 0;
    }

    update(i){
        if(this.progress < this.fadeTime){
            this.y = (this.place-this.fadeTime)+this.progress;

        }else if(this.progress < (this.fadeTime+this.keepTime)){
            this.y = this.place;

        }else if(this.progress < ((this.fadeTime*2)+this.keepTime)){
            this.y = (this.place)-(this.progress-(this.fadeTime+this.keepTime));
        }
        this.progress++;
        this.ctx.globalAlpha= 0.5;

        this.ctx.fillStyle = "#708090";
        this.ctx.font = `18px serif`;
        this.ctx.fillRect(this.x,this.y-10,650,30);

        this.ctx.globalAlpha = 1.0;
        this.ctx.fillStyle = "#ffffff";
        this.ctx.fillText(`${this.message}`,this.x+13,this.y+12,200);
    }

    isLive(){
        return this.progress < ((this.fadeTime*2)+this.keepTime);
    }
}



