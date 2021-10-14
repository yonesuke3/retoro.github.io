class Canvas2DUtility{

    constructor(canvas){
        this.canvasElement = canvas;
        this.context2d = canvas.getContext('2d');
    }

    get canvas(){return this.canvasElement;}
    get context(){return this.context2d;}

    drawRect(x,y,width,height,color){
        if(color != null){
            this.context2d.fillStyle = color;
        }
        this.context2d.fillRect(x,y,width,height);
    }

    imageLoader(path, callback){
        let target = new Image();
        // 画像がロード完了したときの処理を先に記述する
        target.addEventListener('load', () => {
            // もしコールバックがあれば呼び出す
            if(callback != null){
                // コールバック関数の引数に画像を渡す
                callback(target);
            }
        }, false);
        // 画像のロードを開始するためにパスを指定する
        target.src = path;
    }
}
