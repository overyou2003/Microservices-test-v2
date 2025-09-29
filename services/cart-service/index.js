
const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4102;
const NAME = process.env.SERVICE_NAME || "cart-service";

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


// single in-memory cart by sessionless demo
let cart = [];
// Add item: { productId, qty }
app.post('/cart/add', (req,res)=>{
  const {productId, qty=1} = req.body||{};
  if(!productId) return res.status(400).json({error:'productId required'});
  const found = cart.find(i=>i.productId===productId);
  if(found) found.qty += qty; else cart.push({productId, qty});
  res.json({ok:true, cart});
});
app.get('/cart', (req,res)=> res.json({items: cart}));
app.delete('/cart/clear', (req,res)=>{ cart=[]; res.json({ok:true}) });


app.listen(PORT, ()=> console.log(`$cart-service on http://localhost:$4102`));
