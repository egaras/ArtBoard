var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var cw = 700;
var ch = 500;
var dx = 0;
var dy = 0;
var draw = false;
var mode = "move";
var drag = false;
var point = function(x,y){
    this.x = x;
    this.y = y;
}
var shape = function(type,beginX,beginY,endX,endY,stroke,fill,lineWidth){
    this.type = type || "line";
    this.begin = new point(beginX,beginY);
    this.end = new Array();
    this.end.push(new point(endX,endY));
    this.strokeStyle = stroke;
    this.fillStyle = fill;
    this.lineWidth = lineWidth;
}
var board = new Array();
var trash = new Array();
board.push(new shape('rect',0,0,cw,ch,'#ffffff','#ffffff',1));
function drawBoard(board){
    ctx.clearRect(0,0,cw,ch);
    for(var i in board){
        var obj = board[i];
        ctx.lineWidth = obj.lineWidth;
        ctx.fillStyle = obj.fillStyle;
        ctx.strokeStyle = obj.strokeStyle;
        ctx.lineWidth = obj.lineWidth;
        ctx.lineCap = "round";
        switch(obj.type){
            case "line":
                ctx.beginPath();
                ctx.moveTo(obj.begin.x-dx,obj.begin.y-dy);
                ctx.lineTo(obj.end[0].x-dx,obj.end[0].y-dy);
                ctx.stroke();
                break;
            case "rect":
                var w = obj.end[0].x - obj.begin.x;
                var h = obj.end[0].y - obj.begin.y;
                ctx.fillRect(obj.begin.x-dx,obj.begin.y-dy,w,h);
                ctx.strokeRect(obj.begin.x-dx,obj.begin.y-dy,w,h);
                break;
            case "circle":
                ctx.beginPath();
                var r = Math.sqrt(Math.pow((obj.end[0].x - obj.begin.x),2)+Math.pow((obj.end[0].y - obj.begin.y),2));;
                ctx.arc(obj.begin.x-dx,obj.begin.y-dy,Math.abs(r),0,2 * Math.PI);
                ctx.fill();
                ctx.stroke();
                break;
            case "free":
                ctx.beginPath();
                ctx.moveTo(obj.begin.x-dx,obj.begin.y-dy);
                for(var x in obj.end)
                    ctx.lineTo(obj.end[x].x-dx,obj.end[x].y-dy);
                ctx.stroke();
                break;
        }
    }
}
$('#canvas').on('mousedown',function(e){
    if(mode == "move"){
        drag = true;
        dx = e.clientX - canvas.getBoundingClientRect().left;
        dy = e.clientY - canvas.getBoundingClientRect().top;
    }else{
        draw = true;
        dx = $('#paper').position().left;
        dy = $('#paper').position().top;
        if(mode == "erase")
            board.push(new shape("free",e.clientX,e.clientY,e.clientX,e.clientY,"#ffffff","#ffffff",$('#lineWidth').val()));
        else
            board.push(new shape(mode,e.clientX,e.clientY,e.clientX,e.clientY,$('#strokeStyle').val(),$('#fillStyle').val(),$('#lineWidth').val()));
    }
});
$('#canvas').on('mouseup',function(e){
    if(draw)
        draw = false;
    else
        drag = false;
    drawBoard(board);
});
$('#canvas').on('mousemove',function(e){
    if(draw){
        if(mode == "free" || mode == "erase"){
            board[board.length-1].end.push(new point(e.clientX,e.clientY));
        }else{
            board[board.length-1].end[0].x = e.clientX;
            board[board.length-1].end[0].y = e.clientY;
        }
        drawBoard(board);
    }else if(drag){
        $('#paper').css({'left':(e.clientX-dx)+'px'});
        $('#paper').css({'top':(e.clientY-dy)+'px'});
    }
});
$('.shape').on('click',function(e){
    chmode($(this).attr('id'));
});
function chmode(newMode){
    $('#'+mode).removeClass('selected');
    $('#'+mode).css('background-position-x','0');
    $('#'+newMode).addClass('selected');
    $('#'+newMode).css('background-position-x','-30px');
    mode = newMode;
    if(mode == "move")
        $("#canvas").css('cursor','default');
}
$('#undo').on('click',undoDraw)
$('#redo').on('click',redoDraw)
function undoDraw(){
    if(board.length>0){
        trash.push(board.pop());
        drawBoard(board);
    }
}
function redoDraw(){
    if(trash.length>0){
        board.push(trash.pop());
        drawBoard(board);
    }
}
function saveDraw(){
    var image = canvas.toDataURL("image/png").replace(/^data:image\/[^;]/, 'data:application/octet-stream');
    $('<a download="ArtBoard.png" href="'+image+'"></a>')[0].click();
}
$('#save').on('click',saveDraw);

var dh = ($(window).width()-700)/2;
var dv = ($(window).height()-500)/2;
$('#paper').css({'left':dh, 'top':dv});

$(window).on('keydown',function(e){
    var val = parseInt($('#lineWidth').val());
    var max = parseInt($('#lineWidth').attr('max'));
    switch(e.key){
        case 'ArrowDown':
        case 'ArrowLeft':
            $('#lineWidth').val(val > 1 ? --val : val);
            break;
        case 'ArrowUp':
        case 'ArrowRight':
            $('#lineWidth').val(val < max ? ++val : val);
            break;
        case 'l':
        case 'L':
            chmode('line');
            break;
        case 'r':
        case 'R':
            chmode('rect');
            break;
        case 'c':
        case 'C':
            chmode('circle');
            break;
        case 'f':
        case 'F':
            chmode('free');
            break;
        case 'd':
        case 'D':
            chmode('erase');
            break;
        case 'v':
        case 'V':
            chmode('move');
            break;
        case 'z':
        case 'Z':
            undoDraw();
            break;
        case 'y':
        case 'Y':
            redoDraw();
            break;
        case 'x':
        case 'X':
            var color = $('#fillStyle').val();
            $('#fillStyle').val($('#strokeStyle').val());
            $('#strokeStyle').val(color);
            break;
        case 's':
        case 'S':
            saveDraw();
            break;
    }
});