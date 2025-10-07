
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
  { id: 'p1', name: 'Nike Air Forces 1', price: 3000, stock: 8,
    img: 'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?q=80&w=765&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { id: 'p2', name: 'Nike Sports Shoe', price: 2500, stock: 120,
    img: 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?q=80&w=1471&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { id: 'p3', name: 'Adidas Jersey Shirt', price: 900, stock: 34,
    img: 'https://images.unsplash.com/photo-1511746315387-c4a76990fdce?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { id: 'p4', name: 'Adidas Superstar', price: 2900, stock: 50,
    img: 'https://images.unsplash.com/photo-1593287073863-c992914cb3e3?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { id: 'p5', name: 'Puma Running Shoes', price: 1999, stock: 20,
    img: 'https://images.unsplash.com/photo-1715692965422-280fe6566146?q=80&w=1476&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { id: 'p6', name: 'Puma Sportswear', price: 1200, stock: 15,
    img: 'https://images.unsplash.com/photo-1629753897877-522619845842?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { id: 'p7', name: 'Reebok Classic', price: 2200, stock: 25,
    img: 'https://images.unsplash.com/photo-1726317219474-7f8a98b53743?q=80&w=627&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { id: 'p8', name: 'Reebok Fitness Gear', price: 1500, stock: 40,
    img: 'https://images.unsplash.com/photo-1599989571484-100fa5168bf3?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
];



app.get('/products', (req,res)=> res.json({products: PRODUCTS}));
app.get('/products/:id', (req,res)=>{
  const p = PRODUCTS.find(x=>x.id===req.params.id);
  if(!p) return res.status(404).json({error:'not found'});
  res.json(p);
});


app.listen(PORT, ()=> console.log(`$catalog-service on http://localhost:$4101`));
