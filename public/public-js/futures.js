let futureslist = [
  { name: 'BTC/USDT', tradedate: '2025-10-28', result: null,futurestradeurl: '',pnl:''},
  { name: 'SOL/USDT', tradedate: '2025-10-24', result:null,futurestradeurl:'',pnl : '' }
];

let futureswins = 0;
let futuresloss = 0;
let reversal = 0;
let continuation = 0;
futuresshowstorage();// Load from localStorage
recalculatefutures();
recalculatetrend()
futuresdisplaylist();
showcapital();
totalprofit()

function futuresdisplaylist() {
  let futurestodohtml = '';
  futureslist.forEach((item, i) => {
    const { name, tradedate, result ,futurestradeurl} = item;
    const futureshtml = `
  <div class = "users-class">   
   <div>${name}</div>
      <div>${tradedate}</div>

      <button onclick="futuresmarkwin(${i})"class="win-button">Win</button>
      <button onclick="futuresmarkloss(${i})" class="loss-button">Loss</button>
       <input type="text" name="futurestrade" placeholder="Trading view url" value="${futurestradeurl||''}" oninput = "futurestradelink(${i},this.value)" class = "trade-url">
    ${futurestradeurl? `<p><a href="${futurestradeurl}" target="_blank" class = "url-redirect">View trade</a></p>`:'' } 


 <input type="text" name="" id="" placeholder=" pnl" class="input-pnl"   >
        <button class="save-pnl" onclick="tradepnl(${i})">save</button>
        <span class="pnl-display">${item.pnl || ''}</span>

       <select   onchange = "settrend(${i},this.value)"> 
       <option  value = "">Chart pattern</option>
       <option value = "reversal" ${item.settrend === 'reversal'? 'selected' : '' }>reversal</option>
          <option value = "continuation" ${item.settrend === 'continuation'? 'selected' : '' }>continuation</option>
       
       </select>
      <button onclick="sure(${i})">Delete</button>

    </div>`;
    futurestodohtml += futureshtml;
  });

  document.querySelector('.js-project-list').innerHTML = futurestodohtml;
  document.querySelectorAll('.input-pnl').forEach((input,index)=>{
  input.addEventListener('keydown',(e)=>{
    if (e.key === 'Enter'){
      e.preventDefault()
      tradepnl(index)
    }
  })
})

futuresupdate();
}

function settrend(index,value){
futureslist[index].settrend = value;
futuresstored()
recalculatetrend()
futuresdisplaylist()
}
/**the parameters index,value 
     add he new property to the array forextodo[index].setup = value* 
  save it* 
   then render*/

   /**then select tag,onchange = the function and the parameters index,this.value  
    options ,inside the firstoption value is null and the label is select* 
    the second option,value = 'reversal'then ask rreversal ? 'selected':''*/
function tradepnl(index){
const userpnl = document.querySelectorAll('.input-pnl')[index];

 const trimmedpnl = parseFloat(userpnl.value.trim());

 if (isNaN(trimmedpnl)) {alert('Type in a valid pnl in numerals');
return;
 }
futureslist[index].pnl = trimmedpnl
userpnl.value = '';
futuresstored()
futuresdisplaylist()
totalprofit()

}

function totalprofit(){
  let totalpnl = 0
futureslist.forEach((item)=>
{const  value = parseFloat(item.pnl)

if(!isNaN(value)){totalpnl+= value}
}
)
const displaypnl = document.querySelector('.total-profit-display')
if (totalpnl > 0 ) {displaypnl.innerHTML = `+$${totalpnl}`}
else if(totalpnl < 0){displaypnl.innerHTML = `-$${Math.abs(totalpnl)}`}
else{displaypnl.innerHTML = `$0.00`;
}

/**if statement for +,toggle css class then tyle to green,else if - create css style to red */


displaypnl.classList.remove('red','green')
if(totalpnl<0){displaypnl.classList.toggle('red')}
else if (totalpnl>0){displaypnl.classList.toggle('green')}
}
function futurestradelink(index,futuresurl){
  futureslist[index].futurestradeurl = futuresurl.trim()
  futuresstored()
  futuresdisplaylist()
}
function futuresaddlist() {
  const futuresinput = document.querySelector('.text-todo');
  const futuresusertext = futuresinput.value.trim();
  const futuresdate = document.querySelector('.duedate-js');
  const futuresduedate = futuresdate.value.trim();

  if (futuresusertext === '' || futuresduedate === '') {
    alert('Type in project name and date');
return;
  }

  futureslist.push({ name: futuresusertext, tradedate: futuresduedate, result: null,pnl:'' });
  futuresinput.value = '';
  futuresdate.value = '';
recalculatefutures()
  futuresstored();
  futuresdisplaylist();
  totalprofit();
  weeklygrowth()
}
const enterinput = document.querySelector('.text-todo');

enterinput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    futuresaddlist();
  }
});

function futuresstored() {
  localStorage.setItem('futurestodo', JSON.stringify(futureslist));
  localStorage.setItem('futureswins', futureswins);
  localStorage.setItem('futuresloss', futuresloss);
}

function futuresshowstorage() {
  const futuressavedtodo = localStorage.getItem('futurestodo');
  const futuressavedwins = localStorage.getItem('futureswins');
  const futuressavedloss = localStorage.getItem('futuresloss');

  if (futuressavedtodo) futureslist = JSON.parse(futuressavedtodo);
  if (futuressavedwins) futureswins = parseInt(futuressavedwins);
  if (futuressavedloss) futuresloss =  parseInt(futuressavedloss);
}
function futuresdeletetodo(i) {
  futureslist.splice(i, 1);
      recalculatefutures()
      recalculatetrend()
        futuresstored();
  futuresdisplaylist();
totalprofit();
}
function sure(i){
  const proceed = confirm('Are you sure you want to personally delete this pair from your journal?')
  if (proceed){futuresdeletetodo(i)};
}
function futuresmarkwin(i) {

  futureslist[i].result = 'wins';
      recalculatefutures()
        futuresstored();
  futuresdisplaylist();

}

function futuresmarkloss(i) {
  futureslist[i].result = 'loss';
recalculatefutures()
        futuresstored();
  futuresdisplaylist();
weeklygrowth()
}
function futuresupdate() {
  document.getElementById('wins').textContent = `wins: ${futureswins}`;
  document.getElementById('losses').textContent = `loss: ${futuresloss}`;
}
function trendupdate(){
document.getElementById('rev').textContent =`Reversals :${reversal}`
document.getElementById('cont').textContent=`Continuations:${continuation}`
}

function futureswinrate() {

  const total = futureswins + futuresloss;
  if (total === 0) return alert('No wins yet');
  const rate = ((futureswins / total) * 100).toFixed(1);
  alert(`Your win rate is ${rate}%, Wins: ${futureswins}, Losses: ${futuresloss}`);
 
}
function recalculatefutures(){
  futureswins = 0
  futuresloss = 0
futureslist.forEach(item=>{
if (item.result === 'wins')futureswins++
if(item.result ==='loss')futuresloss++

}) 
futuresupdate()
}
function recalculatetrend(){
reversal = 0
continuation = 0
futureslist.forEach(item =>{
  if (item.settrend === 'reversal')reversal++
  if(item.settrend === 'continuation')continuation++
}

)
trendupdate()
}
function futuresdarkmode() {
  const body = document.querySelector('.futuresbody');
  body.classList.toggle('dark-mode');
   document.querySelectorAll(`a`).forEach((link)=>{
  link.classList.toggle('link-color')
  }) 
}

function balance(){
 
const usercapital = document.querySelector('.input-capital')
const trimmed = usercapital.value.trim();
 if (!trimmed) return;
document.querySelector('.capital-display').innerHTML=`$${trimmed}`; 
 usercapital.value = ''
    localStorage.setItem('trimmed',JSON.stringify(trimmed))
}
const entercapital = document.querySelector('.input-capital');
entercapital.addEventListener('keydown',(e)=>{
if (e.key === 'Enter') {
  e.preventDefault()
  balance()
}


}


)
function showcapital(){
 const savedbalance = localStorage.getItem('trimmed')
 if (savedbalance) {document.querySelector('.capital-display').innerHTML = `$${(JSON.parse(savedbalance))}`
 }
}
