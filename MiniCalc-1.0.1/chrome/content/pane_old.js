
// Make a namespace.
if (typeof MiniCalc == 'undefined') {
  var MiniCalc = {};
}

/**
 * Controller for pane.xul
 */
MiniCalc.PaneController = {

  /**
   * Called when the pane is instantiated
   */
  onLoad: function() {
    this._initialized = true;
    
    // Make a local variable for this controller so that
    // it is easy to access from closures.
    var controller = this;
    
    // Hook up the action button
    this._button = document.getElementById("action-button");
//Vars
var val;
var Numb;
var n1 = 0;
var n2 = 0;
var ncalc=0;
var n=1;
var first=1;
var Func="+";

//Controllers
var lbln1 = document.getElementById("num1");
var lbln2 = document.getElementById("num2");
var lblfunc = document.getElementById("func");
var lblcalc = document.getElementById("calc");
lbln1.value = "0";
lbln2.value = "0";
lblcalc.value = "0";
lblfunc.value = "+";

var bz = document.getElementById("bzero");
var b1 = document.getElementById("b1");
var b2 = document.getElementById("b2");
var b3 = document.getElementById("b3");
var b4 = document.getElementById("b4");
var b5 = document.getElementById("b5");
var b6 = document.getElementById("b6");
var b7 = document.getElementById("b7");
var b8 = document.getElementById("b8");
var b9 = document.getElementById("b9");
var bc = document.getElementById("bc");
var bp = document.getElementById("bp");
var bm = document.getElementById("bm");
var bt = document.getElementById("bt");
var bd = document.getElementById("bd");
var bs = document.getElementById("bs");
var be = document.getElementById("be");
var bclr = document.getElementById("bclr");
var bdot = document.getElementById("bdot");

//Events
bz.addEventListener("command",function() { numbr("0");}, false);
b1.addEventListener("command",function() { numbr("1");}, false);
b2.addEventListener("command",function() { numbr("2");}, false);
b3.addEventListener("command",function() { numbr("3");}, false);
b4.addEventListener("command",function() { numbr("4");}, false);
b5.addEventListener("command",function() { numbr("5");}, false);
b6.addEventListener("command",function() { numbr("6");}, false);
b7.addEventListener("command",function() { numbr("7");}, false);
b8.addEventListener("command",function() { numbr("8");}, false);
b9.addEventListener("command",function() { numbr("9");}, false);
bc.addEventListener("command",function() { numbr("X");}, false);
bdot.addEventListener("command",function() { numbr(".");}, false);
bp.addEventListener("command",function() {fun("+");}, false);
bm.addEventListener("command",function() {fun("-");}, false);
bt.addEventListener("command",function() {fun("*");}, false);
bd.addEventListener("command",function() {fun("/");}, false);
bs.addEventListener("command",function() {fun("sqrt");}, false);
be.addEventListener("command",function() {fun("=");}, false);
bclr.addEventListener("command", function() {clr()}, false);


function clr(){
numbr("CLEAR");
if(n == 1){
n1=0;
}
else{
n2=0;
}
lbln1.value = n1;
lbln2.value = n2;
}

function numbr(val)
{

if(Number(val) >= 0){

		if(first){
		Numb = val;
		
		first = 0;
		}
		else{
		Numb = String(Numb) + val;
		}
}
else if(val == "."){
	if(!first){
		Numb = String(Numb) + val;
	}
else{
Numb = "0.";
first = 0;
}
}
else if(val == "X"){
		Numb = Number(Numb)*-1;

}
else if(val == "GET"){
		return Numb;

}
else
{


		first = 1;
		Numb = 0;
}
if (val != "CLEAR"){
if (n>=0){
lbln2.value = n2;
lbln1.value = Numb;
}
else{
lbln1.value = n1;
lbln2.value = Numb;
}
}
lblcalc.value = ncalc;
}

function fun(mode){
if(mode == "+"){
	if(Numb != 0 && n1 != 0){
	ncalc = Calc();
	n1 = ncalc;
	ncalc = 0;
	n = -1;
	n2 = 0;
	numbr("CLEAR");
	lbln1.value = n1;
	lbln2.value = n2;
	}
	else if(n1 == 0 && n2 == 0 && Numb == 0){
	n1 = ncalc;
	n = -1;
	ncalc = 0;
	lbln1.value = n1;
	lbln2.value = n2;
	}
	else{
	n1 = numbr("GET");
	n = -1;
	}
Func = "+";
}
else if(mode == "-"){
	if(Numb != 0 && n1 != 0){
	ncalc = Calc();
	n1 = ncalc;
	ncalc = 0;
	n = -1;
	n2 = 0;
	numbr("CLEAR");
	lbln1.value = n1;
	lbln2.value = n2;
	}
	else if(n1 == 0 && n2 == 0 && Numb == 0){
	n1 = ncalc;
	n = -1;
	ncalc = 0;
	lbln1.value = n1;
	lbln2.value = n2;
	}
	else{
	n1 = numbr("GET");
	n=-1;
	}
Func = "-";
}
else if(mode == "*"){
	if(Numb != 0 && n1 != 0){
	ncalc = Calc();
	n1 = ncalc;
	ncalc = 0;
	n = -1;
	n2 = 0;
	numbr("CLEAR");
	lbln1.value = n1;
	lbln2.value = n2;
	}
	else if(n1 == 0 && n2 == 0 && Numb == 0){
	n1 = ncalc;
	n = -1;
	ncalc = 0;
	lbln1.value = n1;
	lbln2.value = n2;
	}
	else{
	n1 = numbr("GET");
	n=-1;
	}
Func = "*";
}
else if(mode == "/"){
	if(Numb != 0 && n1 != 0){
	ncalc = Calc();
	n1 = ncalc;
	ncalc = 0;
	n = -1;
	n2 = 0;
	numbr("CLEAR");
	lbln1.value = n1;
	lbln2.value = n2;
	}
	else if(n1 == 0 && n2 == 0 && Numb == 0){
	n1 = ncalc;
	n = -1;
	ncalc = 0;
	lbln1.value = n1;
	lbln2.value = n2;
	}
	else{
	n1 = numbr("GET");
	n=-1;
	}
Func = "/";
}
else if(mode == "sqrt"){
	if(Numb==0){
		n1 = numbr("GET");
	}
	else{
		n2 = numbr("GET");
		n1 = Calc();
		n2 = 0;
	}
	ncalc = Math.sqrt(n1);
	lblcalc.value = ncalc;
	Func = "sqrt";
	numbr("CLEAR");
	n=-1;
	lbln1.value = n1;
	lbln2.value = n2;
	n2 = 0;
	n1 = 0;
}
else{
	ncalc = Calc();
	n2 = 0;
	n1 = 0;
	n=1;
}
numbr("CLEAR");
lblfunc.value = Func;
lblcalc.value = ncalc;
}

function Calc(){
var C;
n2 = numbr("GET");
if(Func == "+"){
	C = Number(n1) + Number(n2);
}
else if(Func == "-"){
	C = Number(n1) - Number(n2);
}
else if(Func == "*"){
	C = Number(n1) * Number(n2);
}
else if(Func == "/"){
	C = Number(n1) / Number(n2);
}
else{
alert("No Function Chosen!");
n=1;
}
numbr("CLEAR");
return C;
}

this._button.addEventListener("command", 
         function() { controller.loadHelpPage();}, false);
  },
  
  /**
   * Called when the pane is about to close
   */
  onUnLoad: function() {
    this._initialized = false;
  },
  
  /**
   * Load the Display Pane documentation in the main browser pane
   */
  loadHelpPage: function() {
    // Ask the window containing this pane (likely the main player window)
    // to load the display pane documentation
    top.loadURI("http://songbirdnest.com/add-on-api/articles/display-panes");
  }
  
};

window.addEventListener("load", function(e) { MiniCalc.PaneController.onLoad(e); }, false);
window.addEventListener("unload", function(e) { MiniCalc.PaneController.onUnLoad(e); }, false);
