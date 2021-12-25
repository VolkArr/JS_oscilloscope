
const CNST_width = 300; // наши константы
const CNST_height = 450;
const maxHZ = 20;

class line{ // этот класс отвечает за хранение координат линий, которые мы будем рисовать
    constructor(currentX, firstY, currentY, lastY){
        this.currentX = currentX;
        this.firstY = firstY;
        this.currentY = currentY;
        this.lastY = lastY;
    }
}

class impuls{ // генератор импульса, который генерирует массив сигналов в зависимости от поданной частоты
    constructor(HZ){
        this.HZ = HZ;
    }
    setHZ(HZ){
        this.HZ = 21-HZ;
    }
    emit(){
        let tmp = [];
        let counter = this.HZ * gadjet.scan;
        let reversCounter = 0;
        let tmpScan;
        if(gadjet.scanAREA > maxHZ*2) tmpScan = gadjet.scanAREA;
        else tmpScan = maxHZ*2;
        for(let i = 0; i < tmpScan; i ++){ // в двух словах - алгоритм записывает сколько у нас должно быть 1 и столько же нулей пишет в массив из 40 элементов.
            if(counter > 0){
                tmp[i] = 1;
                counter--;
                reversCounter ++;
            }
            else{
                if(reversCounter > 0){
                    tmp[i] = 0;
                    reversCounter--;
                    if(reversCounter <= 0) counter = this.HZ * gadjet.scan;
                }
                
            }
         }
         return tmp;
    }
}

class Gadjet{ // основной класс нашего прибора
    constructor(scanAREA, interval){ // устанавливает скорость прокрутки, и площадь сканирования ( сколько выводит элементов за раз)
        this.scanAREA = scanAREA;
        this.scan = 2; // стандартная развертка это 3 сек
        this.intervalID = null; // id нашего будущего интервала
        this.interval = interval; // скорость анимации
        this.isRunning = 0 // запущен ли прибор
        let indent = cnv.canvas.height/3; // отступ на который будем поднимать 
        this.firstLine = new line(cnv.x, cnv.y+(indent*0), cnv.y+(indent*0), cnv.y+(indent*0)); // обьекты линий - по идее не так делать надо было, но оно работает  и хорошо
        this.secondLine = new line(cnv.x, cnv.y+(indent*1), cnv.y+(indent*1), cnv.y+(indent*1));
        this.thirdLine = new line(cnv.x, cnv.y+(indent*2), cnv.y+(indent*2), cnv.y+(indent*2));
        this.gen1_emits = []; // массивы которые будут хранить сигналы все
        this.gen2_emits = [];
        this.logic_emits = [];


    }
    set_scanAREA(scanAREA){
        this.scanAREA = scanAREA;
    }
    set_scan(scan){
        this.scan = scan;
    }
    start(){
        this.intervalID = setInterval(()=>{
        if(this.isRunning == 1){
           
           this.gen1_emits = gen1.emit(); // получаем массив сигналов от наших генераторов
           this. gen2_emits = gen2.emit();
           this.logic_emits = logicalOR(this.gen1_emits, this.gen2_emits); // логическое !OR
           let tmpArr = [this.gen1_emits, this.gen2_emits, this.logic_emits]; // обьеденям все сигналы
           let lineARRAY = [this.firstLine,this.secondLine,this.thirdLine]; 
           emitHandler(tmpArr,lineARRAY,25); // функция, обработки сигналов
        }
        }, this.interval * 100);
    }
}

class Canvas { // класс canvas, основной для обработки холста
    constructor(width, heigth, canvasID){
        this.canvas = /** @type {HTMLCanvasElement} */ (document.getElementById(canvasID)); // холст канвас с линиями
        this.ctx = this.canvas.getContext('2d'); // рисуем мы засчет контекста
        this.canvas.width = width;
        this.canvas.height = heigth;
        this.canvasPos = this.canvas.getBoundingClientRect(); // берем позицию канваса относительно экрана
        this.x = this.canvasPos.left - this.canvas.width - 275; // считаем x и y для старта отрисовки
        this.y = this.canvasPos.top + 25;
    }
}

// функция выполняют всю логику отрисовки линий на осцилограффе - делает проверки и вывод на экран осцилограффа 
function draw(lineARRAY){
    cnv.ctx.beginPath(); // тут начинается логика отрисовки линий 
    let tmp_x;
    cnv.ctx.lineWidth = 5;
    cnv.ctx.strokeStyle = 'green'          
    if (lineARRAY.currentY != lineARRAY.lastY){
        cnv.ctx.moveTo(lineARRAY.currentX, lineARRAY.lastY);
        cnv.ctx.lineTo(lineARRAY.currentX, lineARRAY.currentY);
    }
    tmp_x= lineARRAY.currentX + (cnv.canvas.width/gadjet.scanAREA);
    cnv.ctx.moveTo(tmp_x, lineARRAY.lastY);
    cnv.ctx.lineTo(lineARRAY.currentX, lineARRAY.lastY);
    cnv.ctx.stroke();
    if(tmp_x >= (cnv.x + cnv.canvas.width+500)){
        tmp_x = cnv.x;
    }
    cnv.ctx.clearRect(tmp_x, lineARRAY.lastY, 50, -100);
    cnv.ctx.clearRect(tmp_x, lineARRAY.lastY, 50, 100);
    var tmp = [tmp_x, lineARRAY.lastY];
    return tmp;
}

function emitHandler(emit, lineARRAY, indentY){ // массив сигналов, массив с линиями, отсуп на который мы можем поднять Y линии, контекст и канвис
    let tmp = []; // тут храняться следующие координаты линии
    for(let i = 0; i < emit.length; i++){
        for(let j = 0; j < emit[i].length; j++){ // в функцию draw, так как lineARRAY это массив обьектов - то мы его скопировали по ссылке, поэтому мы его можем менять
            if(emit[i][j] == 1){
                lineARRAY[i].lastY = lineARRAY[i].firstY + indentY;
                tmp = draw(lineARRAY[i]);
            }
            else{
                lineARRAY[i].lastY = lineARRAY[i].firstY;
                tmp = draw(lineARRAY[i]);
            }
                lineARRAY[i].currentX = tmp[0];
                lineARRAY[i].currentY = tmp[1];
            }
    }
}

function drawGrid(Xnum, Ynum){ // отрисовка заднего фона ( сетки )
    cnv2.ctx.strokeStyle = "black";
    GridLine(0,0,cnv2.canvas.width,0, 5);
    GridLine(cnv2.canvas.width,0,cnv2.canvas.width,cnv2.canvas.height,5);
    GridLine(cnv2.canvas.width, cnv2.canvas.height, 0, cnv2.canvas.height,5);
    GridLine(0, cnv2.canvas.height, 0,0,5);
    cnv2.ctx.strokeStyle = "grey";
    for(var i = 1; i < Xnum; i++){
        var curGridWidth = cnv2.canvas.width/Xnum*i;
        GridLine(curGridWidth,0,curGridWidth,cnv2.canvas.height,1);
    }
    for (var i = 1; i < Ynum; i++){
        var curGridHeight = cnv2.canvas.height/Ynum*i;
        GridLine(0, curGridHeight, cnv2.canvas.width,curGridHeight, 1);
    }
}

function GridLine (x, y, dx, dy, r) { // непосредственно функция, которая рисует задний фон
    cnv2.ctx.beginPath();
    cnv2.ctx.lineWidth = r;
    cnv2.ctx.moveTo(x, y);
    cnv2.ctx.lineTo(dx, dy);
    cnv2.ctx.stroke();
}

function  logicalOR(arr1, arr2) { // принимаем 2 массива сигналов - дальше делаем OR и если он вернул 1 - то пишем 0, если 0 то пишем 1
    let tmp = [];
    for(let i = 0; i < arr1.length; i++){
        if(arr1[i] || arr2[i]){
            tmp[i] = 0;
        }
        else tmp[i] = 1;
    }
    return tmp;
}
// Возможные выходы сигналов после знака восклицания идут наши значения, он значит отрицание
/*
1 1 = 1 !0
0 1 = 1 !0
1 0 = 1 !0 
0 0 = 0 !1
*/

// Функции обработчики нажатий на кнопки в html
function  changeHZ1() {
    if(input1.value > 20) input1.value = 20;
    if(input1.value <= 1) input1.value = 1;
    gen1.setHZ(input1.value);
}



function  changeHZ2() {
    if(input2.value > 20) input2.value = 20;
    if(input2.value <= 1) input2.value = 1;
    gen2.setHZ(input2.value);
}

function offGadjet(){
    gadjet.isRunning = 0;
    cnv.ctx.clearRect(0, 0, cnv.canvas.width, cnv.canvas.height);
}


function onGadjet(){
    if(gen1.HZ <= 0 || gen2.HZ <= 0){
        alert("Укажите частоту от 0 до 20!");
        return false;
    } 
    gadjet.isRunning = 1;
}


function radioButton_Handler(){
    let radio = document.getElementsByName('inlineRadioOptions');
    for(let i = 0; i < radio.length; i++){
        if(radio[i].checked) {
            gadjet.set_scan(radio[i].value);
        }
    }
}

// выделение памяти под обьекты
let cnv = new Canvas(CNST_width*3, CNST_height, 'canvas1');
let cnv2 = new Canvas(CNST_width*3, CNST_height, 'canvas2');
let gadjet = new Gadjet(30,3);
let gen1 = new impuls(input1.value);
let gen2 = new impuls(input2.value);
drawGrid(15,15);


gadjet.start();


