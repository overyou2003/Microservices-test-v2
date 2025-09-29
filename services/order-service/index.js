
const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4103;
const NAME = process.env.SERVICE_NAME || "order-service";

// Health
app.get('/health', (req,res)=> res.json({service: NAME, status:'ok', time: new Date().toISOString()}));

// Chaos: random 500s
app.use((req,res,next)=>{
  if(process.env.CHAOS==='true' && Math.random()<0.15){
    return res.status(500).json({service: NAME, error:'Random chaos error'});
  }
  next();
});

// Delay simulation
app.use((req,res,next)=>{
  const ms = parseInt(req.query.ms||'0',10);
  if(!ms) return next();
  setTimeout(next, ms);
});

// Crash
app.post('/crash', (req,res)=>{
  res.json({service: NAME, crashed:true});
  setTimeout(()=>process.exit(1), 20);
});


const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
let orders = [];
function totalFromItems(items){
  // in a real app we'd read catalog; here we call catalog-service
  return Promise.all(items.map(async it => {
    const res = await fetch(`http://localhost:4101/products/${it.productId}`);
    const p = await res.json();
    return p.price * it.qty;
  })).then(vals => vals.reduce((a,b)=>a+b,0));
}

// place order: body {items:[{productId,qty}], source:'cart'|'direct'}
app.post('/order', async (req,res)=>{
  const {items, source='direct'} = req.body||{};
  if(!Array.isArray(items) || items.length===0) return res.status(400).json({error:'items required'});
  try{
    const amount = await totalFromItems(items);
    const id = 'ord_'+Math.random().toString(36).slice(2,8);
    const order = { id, amount, items, source, time: new Date().toISOString() };
    orders.push(order);
    res.json(order);
  }catch(e){
    res.status(500).json({error: String(e)});
  }
});

// list orders
app.get('/orders', (req,res)=> res.json({orders}));


app.listen(PORT, ()=> console.log(`$order-service on http://localhost:$4103`));
