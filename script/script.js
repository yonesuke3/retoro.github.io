(() => {
    window.isKeyDown = {};
    const CANVAS_WIDTH = 375;  
    const CANVAS_HEIGHT = 612;
    const ACTORSIZE_X = 110;
    const ACTORSIZE_Y = 110;
    const ITEMSIZE_X = 50;
    const ITEMSIZE_Y = 50;
    const TIME_LIMIT = 60;
    const TITLE = 1;
    const ONGAME = 2;
    const GAMEOVER = 3;
    const BTN_X = 30;
    const BTN_X_GAP = 220;
    const BTN_Y = 520;
    const BTN_HEIGHT = 140;
    const BTN_WIDTH = 150;
    const ITEM_G_RATE = 95;
    const EFFECT_TIME = 700;
    const TIMELIMIT = 200;

    let item = [];
    let imageArray = [];
    let Effect = [];
    let text_arr = [];
    let zanzou = [];
    let messageArr = [];
    let taraiArray = [];

    let Elixir_time = new Array(50,30,20);
    let Elixir_flag = new Array('ー','ー','ー');

    let isInit = 0;
    let util = null;
    let canvas = null;
    let ctx = null;
    let actor = null;
    let score = null;
    let gen = null;
    let backGround = null;
    let titleokina = null;
    let scene = 1;
    let transit = null;
    let nowTime = null;
    let grade = null;
    let over = null;
    let btn_left = null;
    let btn_right = null;
    let mouse_X = null;
    let mouse_Y = null;
    let btnStatus = 0;
    let flashingPoint = null;
    let Sound_onGame = null;
    let Sound_Surume = null;
    let SoundConfirm = true;
    let gameover_text_init = false;
    let offset_X = null;
    let offset_Y = null;
    let sake_eff = null;
    let sake_up_rate = 1;
    let sakeTime = 0;
    let lucky = 0;
    let now_elixir = 0;
    let got_Elixir = 0;
    let surume = 0; 
    let ti = 0;
    let tempItem = null;

    
    window.addEventListener('load',() => {
        util = new Canvas2DUtility(document.body.querySelector('#main_canvas')); 
        canvas = util.canvas;
        ctx = util.context;
        target = document.getElementById('#main_canvas');


        //BGM再生の許可をとる
        SoundConfirm = window.confirm('音楽を再生しますか？');
        if(SoundConfirm == true){SoundConfirm = false;}
        else{SoundConfirm = true;}

        //画像のプリロード
        imageArray[0] = new Image();
        imageArray[0].src = "./image/matinami.jpg";
        imageArray[1] = new Image();
        imageArray[1].src = "./image/negi.png";
        imageArray[2] = new Image();
        imageArray[2].src = "./image/chashu.png";
        imageArray[3] = new Image();
        imageArray[3].src = "./image/yatai_left.png";
        imageArray[4] = new Image();
        imageArray[4].src = "./image/yatai_right.png";
        imageArray[5] = new Image();
        imageArray[5].src = "./image/akabeko.png";
        imageArray[6] = new Image();
        imageArray[6].src = "./image/akabeko.png";
        imageArray[7] = new Image();
        imageArray[7].src = "./image/men.png";
        imageArray[8] = new Image();
        imageArray[8].src = "./image/tarai.png";
        imageArray[9] = new Image(CANVAS_WIDTH,CANVAS_HEIGHT);
        imageArray[9].src = "./image/ULOCO2.png";//frame

        titleokina = new Character(ctx,300,600,1000,1200,imageArray[3]);
        

        initialize();
    },false);

    function initialize(){
        //canvasの大きさを設定する
        canvas.width = CANVAS_WIDTH;
        canvas.height = CANVAS_HEIGHT;

        score = 0;
        now_elixir = 0;
        got_Elixir = 0;
        surume = 0;
        over = null; 
        gameover_text_init = false; 
        item = [];
        Effect = [];
        text_arr = [];
        zanzou = [];
        messageArr = [];

        if(isInit == 0){
            //BGM,SEの宣言、SoundConfirm変数でmuteにするか判断
            Sound_onGame = new Audio('./sound/bgm.mp3');
            Sound_onGame.volume = 0.12;
            Sound_onGame.muted = SoundConfirm;

            //背景・actor・ボタンの宣言. キー・タップ操作のセッティング.
            backGround = new BackGround(ctx,imageArray[0]);
            actor = new Actor(ctx,0,ACTORSIZE_X,ACTORSIZE_Y,imageArray[4],imageArray[3]);
            btn_left = new My_Button(ctx,"←",BTN_X,BTN_Y,BTN_WIDTH,BTN_HEIGHT,0);
            btn_right = new My_Button(ctx,"→",BTN_X+BTN_X_GAP,BTN_Y,BTN_WIDTH,BTN_HEIGHT,1);
            eventSetting();
        }
        isInit=1;

        //アイテム「酒」の初期化
        for(let i=0; i<Elixir_flag.length; i++){Elixir_flag[i]='-';}
        sake_up_rate = 0;
        lucky=0;

        //BGM再生時間の初期化
        Sound_onGame.currentTime = 0;

        console.log(screen.width);

        //ゲームオーバー確認画面時間の初期化
        ti = 0;

        //titleシーンへ
        if(scene == TITLE){
            Sound_onGame.pause();
            title();
        }
        
        //位置、時間の初期化、ゲームスタート
        actor.position.set(CANVAS_WIDTH/2,400);
        startTime = Date.now();
        if(scene == ONGAME){
            Sound_onGame.play();
            render();
        }

    };

    function render(){
        ctx.globalAlpha = 1.0;
        util.drawRect(0,0,canvas.width,canvas.height,'#eeeeee');
        nowTime = Date.now()-startTime;
        transit = TIME_LIMIT-Math.floor(nowTime/1000);

        if(transit == 0){gameOver();}

        //アイテムの生成
        if((myrand(100)+surume) > ITEM_G_RATE){
            tempItem = generateItem();
        }

        //酒の生成
        if(Elixir_time[now_elixir] == transit){
            item.push(new Item(ctx,0,imageArray[5]));
            now_elixir++;   
        }

        ctx.drawImage(imageArray[9],0,0);
        backGround.update();
        actor.update();
        
        //アイテムの更新と取得に関する処理
        for(let i=0; i<item.length;i++){
            item[i].update();
            if(iscollide(item[i]) === true){
                score += item[i].getItem(SoundConfirm) * sake_up_rate;
                if(score<0){score = 0;}

                //取得したアイテムが酒だった場合の抽選
                if(item[i].getScore() == 0){
                    got_Elixir++;
                    Elixir_flag[now_elixir-1] = '酒';
                    if(got_Elixir == 3){
                        surume = 7;
                        actor.setElixir(2,1000);
                        Sound_onGame.volume += 0.05;
                        messageArr[messageArr.length] = new MessageLog(ctx,"スーパーするめタイム！！");
                    }else{
                        sake_eff = myrand(4);
                        sakeTime = EFFECT_TIME;
                        if(sake_eff == 0){
                            actor.setElixir(-1,EFFECT_TIME);
                            console.log('reverse!!');
                            messageArr[messageArr.length] = new MessageLog(ctx,"移動方向が逆転した！");
                        }else if(sake_eff == 1){
                            actor.setElixir(2,EFFECT_TIME);
                            console.log('acceleration!!');
                            messageArr[messageArr.length] = new MessageLog(ctx,"移動が速くなった！");
                        }else if(sake_eff == 2){
                            sake_up_rate += 0.5;
                            console.log('score up!!');
                            messageArr[messageArr.length] = new MessageLog(ctx,"アイテムスコアUP！");
                        }else{
                            lucky = 1;
                            console.log('lucky singorou!!');
                            messageArr[messageArr.length] = new MessageLog(ctx,"しんごろうが降り注ぐ！");
                        }
                    }    
                }
            }
        }
        if(sakeTime > 0){sakeTime--;}
        //効果時間終了時、数値をもとに戻す
        if(sakeTime == 0){
            if(sake_up_rate != 1){sake_up_rate = 1;}
            if(lucky != 0){lucky = 0;}
        }

        //メッセージログの描写
        for(var i=0; i<messageArr.length; i++){
            messageArr[i].update(i);
        }

        util.drawRect(0,0,400,40,'#4C6473');

        //スコアの描写
        ctx.fillStyle = '#ffffff';
        ctx.font = '20px serif';
        ctx.fillText(`SCORE: ${score}`,15,30);

        //酒カウンターの描写
        ctx.fillText(`[${Elixir_flag[0]} ${Elixir_flag[1]} ${Elixir_flag[2]}]`,150,30);

        //タイマーの描写
        ctx.fillText('--のこり--',CANVAS_WIDTH/2-45,CANVAS_HEIGHT-110)
        ctx.font = '55px serif'
        ctx.fillText(`${transit}`,CANVAS_WIDTH/2-20,CANVAS_HEIGHT-40);

        //移動ボタンの描写
        btn_left.drawButton(btnStatus);
        btn_right.drawButton(btnStatus);

        //アイテム入手エフェクトの描写
        for(var i=0; i<Effect.length; i++){
            Effect[i].drawEffect();
        }
          
        //アイテムの生存判定
        item = item.filter(function(itm){
            return itm.life>0;
        });

        taraiArray = taraiArray.filter(function(itm){
            return itm.getY() > 400;
        });

        //Effect配列の整理
        Effect = Effect.filter(function(eff){
            return eff.progress>0;
        });

        //messageArr配列の整理
        messageArr = messageArr.filter(function(m){
            return m.isLive();
        });

        //残像の発生およびzanzou配列の整理
        if((sake_eff == 1 && sakeTime>0) || surume != 0){
            if(nowTime%5 == 0){
                zanzou.push(new Zanzou(ctx,actor.getPosition(),ACTORSIZE_X,ACTORSIZE_Y,actor.getPath()));
            }
        }
        zanzou = zanzou.filter(function(z){
            return z.clearRate>0;
        });
        for(var i=0; i<zanzou.length; i++){
            zanzou[i].update();
        }

        
        if(transit > 0){requestAnimationFrame(render);}
    }

    function title(){
        ctx.globalAlpha = 1.0;
        util.drawRect(0,0,canvas.width,canvas.height,'#ffffff');

        titleokina.draw();

        //白抜き
        ctx.fillStyle = '#ffffff';
        ctx.font = '35px serif';
        ctx.fillText('炎のラーメン屋台！！',(CANVAS_WIDTH/5-25)+2,(CANVAS_HEIGHT/3)+2);
        ctx.fillText('炎のラーメン屋台',(CANVAS_WIDTH/5-25)+2,(CANVAS_HEIGHT/3)-2);
        ctx.fillText('炎のラーメン屋台',(CANVAS_WIDTH/5-25)-2,(CANVAS_HEIGHT/3)+2);
        ctx.fillText('炎のラーメン屋台',(CANVAS_WIDTH/5-25)-2,(CANVAS_HEIGHT/3)-2);
        ctx.fillStyle = '#000000';
        ctx.fillText('炎のラーメン屋台',CANVAS_WIDTH/5-25,CANVAS_HEIGHT/3);

        flashingPoint = Math.abs(Math.sin(Date.now()/450));
        
        ctx.font = '20px serif';
        ctx.fillStyle ='#ffffff'
        ctx.globalAlpha = flashingPoint;
        ctx.fillText('ボタンを押して開始',CANVAS_WIDTH/4+14,CANVAS_HEIGHT/3+99);
        ctx.fillText('ボタンを押して開始',CANVAS_WIDTH/4+14,CANVAS_HEIGHT/3+101);
        ctx.fillText('ボタンを押して開始',CANVAS_WIDTH/4+16,CANVAS_HEIGHT/3+101);
        ctx.fillText('ボタンを押して開始',CANVAS_WIDTH/4+16,CANVAS_HEIGHT/3+99);
        ctx.fillStyle = '#000000'
        ctx.fillText('ボタンを押して開始',CANVAS_WIDTH/4+15,CANVAS_HEIGHT/3+100);
        ctx.globalAlpha = 1.0;
        
        if(scene == TITLE){
            requestAnimationFrame(title);
        }

    }

    function gameOver(){
        ctx.globalAlpha = 1.0;
        util.drawRect(0,0,canvas.width,canvas.height,'#ffffff');
        if(scene != TITLE){scene = GAMEOVER;}

        if(score >= 8000){
            grade = 'ラーメン屋は大繁盛だった！';
        }else if(score >= 5000){
            grade = 'まぁまぁの繁盛ぶりだ';
        }else if(score >= 4000){
            grade = 'そこそこお店は繁盛した';
        }else if(score >= 3000){
            grade = 'あまり客足は振るわなかった';
        }else if(score >= 1){
            grade = '一人もお店に来なかった…';
        }else{
            grade = 'たらいは取ってはいけませんよ？';
        }

        if(gameover_text_init == false){
            text_arr.push(new Text_FadeIn(ctx,'結果',40,CANVAS_WIDTH/2-40,CANVAS_HEIGHT/3-50,40,0));
            text_arr.push(new Text_FadeIn(ctx,`${score}点`,50,CANVAS_WIDTH/2-60,CANVAS_HEIGHT/3+40,40,30));
            text_arr.push(new Text_FadeIn(ctx,`${grade}`,20,CANVAS_WIDTH/2-90,CANVAS_HEIGHT/2+10,40,60));

            gameover_text_init = true;

            actor.statusInit();
        }

        for(var i=0; i<text_arr.length; i++){
            text_arr[i].fadeIn();
        }
        
        ctx.font = '20px serif';
        ctx.fillText('ボタンでタイトルへ戻る',CANVAS_WIDTH/2-110,CANVAS_HEIGHT/2+170);
        
        ti++;
        if(over == null){requestAnimationFrame(gameOver);}
        if(scene == TITLE){initialize();}
    }
    

    function eventSetting(){
        window.addEventListener('keydown',(event) =>{
            isKeyDown[`key_${event.key}`] = true;
        },false);

        window.addEventListener('keyup',(event) =>{
            isKeyDown[`key_${event.key}`] = false;
        },{passive: false});

        //スマートフォン用
        
        window.addEventListener('touchstart', (e)=>{
            if(screen.width <=900){
                console.log("touchstart");
                getPosition(e);
                if(scene == TITLE){
                    console.log('game start!');
                    scene = ONGAME;
    
                    initialize();
                }else if(scene == GAMEOVER){
                    if(ti>TIMELIMIT){
                        console.log('init is called');
                        scene = TITLE;
                        over = 1;
                    } 
                }else if(scene == ONGAME){
                    var touchObject = e.changedTouches[0];
                    mouse_X = touchObject.pageX;
                    mouse_Y = Math.floor(touchObject.pageY);
    
                    if(btn_left.isPushed(mouse_X,screen.width)){
                        window.isKeyDown.key_ArrowLeft = true;
                        btnStatus = 1;
                        console.log("left");
                    }
                    if(btn_right.isPushed(mouse_X,screen.width)){
                        window.isKeyDown.key_ArrowRight = true;
                        btnStatus = 1;
                        console.log("right");
                    }
                }
            }   
        },{passive: false});
        
        

        //PC用
        
        window.addEventListener('mousedown', (e)=>{
            if(screen.width > 900){
                if(scene == TITLE){
                    console.log('game start!');
                    scene = ONGAME;
                    initialize();
                }else if(scene == GAMEOVER){
                    if(ti>TIMELIMIT){
                        console.log('init is called');
                        Sound_onGame.pause();
                        scene = TITLE;
                        over = 1;
                    }    
                }else if(scene == ONGAME){
                    getPosition(e);
                    console.log(`X=${offset_X}`);
                    console.log(`Y=${offset_Y}`);
                    if(btn_left.isPushed(offset_X,window.innerWidth)){
                        //isKeyDown[`key_ArrowLeft`] = true;
                        window.isKeyDown.key_ArrowLeft = true;
                        btnStatus = 1;
                        console.log("left");
                    }
                    if(btn_right.isPushed(offset_X,window.innerWidth)){
                        //isKeyDown[`key_ArrowRight`] = true;
                        window.isKeyDown.key_ArrowRight = true;
                        btnStatus = 1;
                        console.log("right");
                    }
                }
            }    
        },{passive: false});

        window.addEventListener('mouseup',()=>{
            console.log("mouseup");
            if(scene == ONGAME){
                window.isKeyDown.key_ArrowLeft = false;
                window.isKeyDown.key_ArrowRight = false;
                btnStatus = 0;
            }
        },false);

        window.addEventListener('touchend',()=>{
            console.log("touchend");
            if(scene == ONGAME){
                window.isKeyDown.key_ArrowLeft = false;
                window.isKeyDown.key_ArrowRight = false;
                btnStatus = 0;
            }
        },false);
    }

    function iscollide(itm){
        let ax,ay,ix,iy;
        ax = actor.position.x + ACTORSIZE_X/2;
        ay = actor.position.y + ACTORSIZE_Y/2;
        ix = itm.position.x + ITEMSIZE_X/2;
        iy = itm.position.y + ITEMSIZE_Y/2;
        if(Math.abs(ax-ix) > (ITEMSIZE_X+ACTORSIZE_X)/2.5){return;}
        if(Math.abs(ay-iy) > (ITEMSIZE_Y+ACTORSIZE_Y)/3){return;}
        var pef = new effect(ctx,actor.position.x,itm.score*sake_up_rate);
        Effect.push(pef);
        return true;
    }

    function generateItem(){
        gen = myrand(10);
        var itm;
        if(surume != 0){
            itm = new Item(ctx,50,imageArray[7]);
        }else{
            if(gen > 4){
                itm = new Item(ctx,50,imageArray[1]);
            }else if(gen > 2){
                itm = new Item(ctx,100,imageArray[2]);
            }else{
                if(lucky == 1){
                    itm = new Item(ctx,30,imageArray[6]);
                }else{
                    itm = new Item(ctx,-100,imageArray[8]);
                }   
            }
        }
        itm.setXmodify(taraiArray);
        if(itm.getScore() != -100){
            taraiArray[taraiArray.length] = itm;
        }
        item.push(itm);
        return(itm);
        
    }

    function myrand(range){
        return Math.floor(Math.random()*range);
    }

    function getPosition(e){
        offset_X = e.offsetX;
        offset_Y = e.offsetY;
    }
   
})();
