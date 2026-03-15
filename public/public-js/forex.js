async function checkLogin(){

const res = await fetch("/api/trades",{
credentials:"include"
});

if(res.status === 401){
window.location.href="/signin-page.html";
}

}

checkLogin();



let forexlist = [];

let forexwins = 0;
let forexloss = 0;
let reversal = 0;
let continuation = 0;



async function getfromserver(){

const response = await fetch("/api/trades",{
credentials:"include"
});

const tradedata = await response.json();

forexlist = tradedata;

forexdisplaylist();
recalculateforex();
recalculatetrend();
totalprofit();

}

getfromserver();



function forexdisplaylist(){

let forextodohtml = "";

forexlist.forEach((item,i)=>{

const {pair,tradeDate,tradeurl} = item;

const forexhtml = `

<div class="users-class">

<div>${pair}</div>

<div>${tradeDate}</div>

<button onclick="forexmarkwin(${i})" class="win-button">Win</button>

<button onclick="forexmarkloss(${i})" class="loss-button">Loss</button>

<input type="text" placeholder="Tradingview url"
value="${tradeurl||''}"
oninput="forextradelink(${i},this.value)"
class="trade-url">

${tradeurl ? `<p><a href="${tradeurl}" target="_blank">View trade</a></p>` : ''}

<input type="text" placeholder="pnl" class="input-pnl">

<button onclick="tradepnl(${i})">Save</button>

<span class="pnl-display">${item.pnl || ''}</span>

<select onchange="settrend(${i},this.value)">

<option value="">Chart pattern</option>

<option value="reversal" ${item.trend==="reversal"?"selected":""}>reversal</option>

<option value="continuation" ${item.trend==="continuation"?"selected":""}>continuation</option>

</select>

<button onclick="forexdeletetodo(${i})">Delete</button>

</div>

`;

forextodohtml += forexhtml;

});

document.querySelector(".js-project-list").innerHTML = forextodohtml;

}



function forexaddlist(){

const forexinput = document.querySelector(".text-todo");
const forexdate = document.querySelector(".duedate-js");

const pair = forexinput.value.trim();
const tradeDate = forexdate.value.trim();

if(pair === "" || tradeDate === ""){
alert("Enter pair and date");
return;
}

forexlist.push({
pair,
tradeDate,
result:null,
pnl:0,
tradeurl:"",
trend:"",
});

forexinput.value="";
forexdate.value="";

forexstored();

forexdisplaylist();

}



async function forexstored(){

try{

await fetch("/api/trades",{

method:"POST",
credentials:"include",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify(forexlist)

});

}catch(err){

console.log("Server error");

}

}



function forexdeletetodo(i){

forexlist.splice(i,1);

forexstored();

forexdisplaylist();

recalculateforex();

totalprofit();

}



function forexmarkwin(i){

forexlist[i].result="win";

recalculateforex();

forexstored();

forexdisplaylist();

}



function forexmarkloss(i){

forexlist[i].result="loss";

recalculateforex();

forexstored();

forexdisplaylist();

}



function recalculateforex(){

forexwins = 0;
forexloss = 0;

forexlist.forEach(item=>{

if(item.result==="win") forexwins++;

if(item.result==="loss") forexloss++;

});

document.getElementById("wins").textContent = `win: ${forexwins}`;
document.getElementById("losses").textContent = `loss: ${forexloss}`;

}



function tradepnl(index){

const inputs = document.querySelectorAll(".input-pnl");

const value = parseFloat(inputs[index].value);

if(isNaN(value)){
alert("Enter number");
return;
}

forexlist[index].pnl = value;

inputs[index].value="";

forexstored();

forexdisplaylist();

totalprofit();

}



function totalprofit(){

let total = 0;

forexlist.forEach(item=>{

const value = parseFloat(item.pnl);

if(!isNaN(value)){
total += value;
}

});

const display = document.querySelector(".total-profit-display");

if(total > 0){

display.innerHTML = `+$${total}`;

}else if(total < 0){

display.innerHTML = `-$${Math.abs(total)}`;

}else{

display.innerHTML = "$0";

}

}



function settrend(index,value){

forexlist[index].trend = value;

forexstored();

recalculatetrend();

forexdisplaylist();

}



function recalculatetrend(){

reversal = 0;
continuation = 0;

forexlist.forEach(item=>{

if(item.trend==="reversal") reversal++;

if(item.trend==="continuation") continuation++;

});

document.getElementById("rev").textContent = `Reversals: ${reversal}`;
document.getElementById("cont").textContent = `Continuations: ${continuation}`;

}



function forextradelink(index,url){

forexlist[index].tradeurl = url.trim();

forexstored();

}



function forexdarkmode(){

const body = document.querySelector(".forexbody");

body.classList.toggle("dark-mode");

}



async function signupUser(event){

event.preventDefault();

const username = document.getElementById("username").value;
const password = document.getElementById("password").value;

const response = await fetch("/api/signup",{

method:"POST",

credentials:"include",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({
username,
password
})

});

const data = await response.json();

document.getElementById("response").innerText =
data.message || data.error;

}
async function loginUser(event){

event.preventDefault();

const username = document.getElementById("loginUsername").value;
const password = document.getElementById("loginPassword").value;

const response = await fetch("/api/login",{

method:"POST",

credentials:"include",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({
username,
password
})

});

const data = await response.json();

if(data.message){

window.location.href="/index.html";

}else{

document.getElementById("loginResponse").innerText =
data.error;

}

}
async function logoutUser(){

await fetch("/api/logout",{

method:"POST",
credentials:"include"

});

window.location.href="/forex.html";

}