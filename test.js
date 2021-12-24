
function impuls(HZ){
    this.data = 0;
    this.HZ = HZ;
    this.emit = function (){
        if(this.data == 0){
            this.data++;
            return this.data;
        }
        else{
            this.data--;
            return this.data;
        }
    }
} // В целом это генератор импульса - когда мы вызываем emit у обьекта - то мы получаем либо 0 либо 1

function counter(){

    this.data = [0,0,0];
    this.dataHandler = 0;

    this.count = function(){
        if(this.checkUP == true){
            let tmp = this.data;
            this.down();
            return tmp;
        }
        let tmp = this.data;
        this.dataHandler++;
        let i = 0;
        let tempDataHandler = this.dataHandler;
        while(tempDataHandler >= 1){
            let tmp_var = tempDataHandler%2;
            tempDataHandler = Math.floor(tempDataHandler/2);
            this.data[i] = tmp_var;
            i++;
            if(i > 2) break;
            
        }

        return tmp;
    },
    this.checkUP = function(){
        let counter = 0;
        for(let i = 0; i < 3; i++){
            if(this.data[i] == 1) counter++;
        }
        if(counter == 3) return true;
        return false;
    },
    this.down = function(){
        for(let i = 0; i < 3; i++){this.data[i] = 0;}
        this.dataHandler = 0;
    }
} // эта структура делает тоже самое что и impuls, но у нее более сложная реализация. 
// Она возвращает массив из 3х элементов, где каждый элемент может принимать либо 0 либо 1
// Проще говоря с вызовом count мы просчитываем следующее состояние счетчика 
// Возможные состояния
/*
0 0 0
0 0 1
0 1 0
0 1 1
1 0 0
1 0 1
1 1 0
1 1 1
*/


// Линию представить как структуру храняющую текующие координаты и предыдущие 
class line{
    constructor(currentX, firstY, currentY, lastY){
        this.currentX = currentX;
        this.firstY = firstY;
        this.currentY = currentY;
        this.lastY = lastY;
    }
}

function draw(lineARRAY, ctx, canvas){
            ctx.beginPath(); // тут начинается логика отрисовки линий 
            let tmp_x;
            ctx.lineWidth = 5;
            ctx.strokeStyle = 'green'          
            if (lineARRAY.currentY != lineARRAY.lastY){
                ctx.moveTo(lineARRAY.currentX, lineARRAY.lastY);
                ctx.lineTo(lineARRAY.currentX, lineARRAY.currentY);
            }
            tmp_x= lineARRAY.currentX + (canvas.width/20);
            ctx.moveTo(tmp_x, lineARRAY.lastY);
            ctx.lineTo(lineARRAY.currentX, lineARRAY.lastY);
            ctx.stroke();
            let canvasPos = canvas.getBoundingClientRect();
            let x = canvasPos.left - canvas.width - 125;
            if(tmp_x >= (x + canvas.width)){
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                tmp_x = x;
            }
            var tmp = [tmp_x, lineARRAY.lastY];
            return tmp;
}

function emitHandler(emit, lineARRAY, indentY, ctx, canvas){ // массив сигналов, массив с линиями, отсуп на который мы можем поднять Y линии, контекст и канвис
    let tmp = []; // Обработчик подачи сигналов. Мы принимаем по значению массив сигналов, далее в зависимости от полученного сигнала направляем нужные данные
    for(let i = 0; i < 4; i++){ // в функцию draw, так как lineARRAY это массив обьектов - то мы его скопировали по ссылке, поэтому мы его можем менять
        if(emit[i] == 1){
            lineARRAY[i].lastY = lineARRAY[i].firstY + indentY;
            tmp = draw(lineARRAY[i], ctx, canvas);
        }
        else{
            lineARRAY[i].lastY = lineARRAY[i].firstY;
            tmp = draw(lineARRAY[i],ctx, canvas);
        }
        lineARRAY[i].currentX = tmp[0];
        lineARRAY[i].currentY = tmp[1];
    }
}

function Gadjet(HZ,canvasID){ 
    // Эта структура представляет собой сам прибор, в него входит canvas, генератор и счетчики
    this.canvas = /** @type {HTMLCanvasElement} */ (document.getElementById(canvasID));
    this.ctx = this.canvas.getContext('2d');
    let canvasPos = this.canvas.getBoundingClientRect();
    let x = canvasPos.left - this.canvas.width - 125;
    let y = canvasPos.top;
    let indent = this.canvas.height/4;
    // ------------
        this.isRunning = 0;
    // ------------
    this.ctr = new counter();
    this.imp = new impuls(HZ);
    this.firstLine = new line(x, y+(indent*0), y+(indent*0), y+(indent*0));
    this.secondLine = new line(x, y+(indent*1), y+(indent*1), y+(indent*1));
    this.thirdLine = new line(x, y+(indent*2), y+(indent*2), y+(indent*2));
    this.fourLine = new line(x, y+(indent*3), y+(indent*3), y+(indent*3));
    let lineARRAY = [this.firstLine, this.secondLine, this.thirdLine, this.fourLine];
    // ------------
    this.start = function(){
        setInterval(()=>{ // анимацию я сделал интервалом 
            if(this.isRunning == 1){
                let tmp_emit = this.imp.emit();
                let tmp_ctr = this.ctr.count();
                let emits = [];
                emits.unshift(tmp_ctr[2], tmp_ctr[1], tmp_ctr[0], tmp_emit);
                emitHandler(emits,lineARRAY,50,this.ctx,this.canvas);   
            }       
        }, ((this.imp.HZ * 100)/60))
    }
}

function gadjetControl(){
    if(test.isRunning == 1) test.isRunning = 0;
    else test.isRunning = 1;
    test.ctx.clearRect(0, 0, test.canvas.width, test.canvas.height);
}

var test = new Gadjet(20,'canvas'); // передаем частоту и id canvas
test.start();

// todo. обработчик кнопки по нажатию кнопки выключать подачу или включать