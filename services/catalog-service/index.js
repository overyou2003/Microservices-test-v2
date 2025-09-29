
const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4101;
const NAME = process.env.SERVICE_NAME || "catalog-service";

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


const PRODUCTS = [
  { id: 'p1', name: 'Instant Camera', price: 3990, stock: 8,
    img: 'https://picsum.photos/seed/camera/800/600' },
  { id: 'p2', name: 'Pastel Sticker Pack', price: 120, stock: 120,
    img: 'https://picsum.photos/seed/sticker/800/600' },
  { id: 'p3', name: 'Mini Tripod', price: 590, stock: 34,
    img: 'https://picsum.photos/seed/tripod/800/600' },
  { id: 'p4', name: 'Tote Bag - Lumera', price: 290, stock: 50,
    img: 'https://picsum.photos/seed/totebag/800/600' },
];



app.get('/products', (req,res)=> res.json({products: PRODUCTS}));
app.get('/products/:id', (req,res)=>{
  const p = PRODUCTS.find(x=>x.id===req.params.id);
  if(!p) return res.status(404).json({error:'not found'});
  res.json(p);
});


app.listen(PORT, ()=> console.log(`$catalog-service on http://localhost:$4101`));
