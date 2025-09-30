import React, { useEffect, useState } from 'react'
import ProductCard from './components/ProductCard.jsx'
import CartModal from './components/CartModal.jsx'
import { FaCartShopping } from "react-icons/fa6";

const useStatus = (path) => {
  const [st, setSt] = useState('checking')
  const load = async () => {
    try{
      const r = await fetch(path + '/health')
      setSt(r.ok ? 'ok' : 'down')
    }catch{ setSt('down') }
  }
  useEffect(()=>{ load(); const t = setInterval(load, 4000); return ()=>clearInterval(t) }, [path])
  return st
}

export default function App(){
  const catalogStatus = useStatus('/api/catalog')
  const cartStatus = useStatus('/api/cart')
  const orderStatus = useStatus('/api/order')
  const [openCart, setOpenCart] = useState(false)

  return (
    <div>
      <header>
        <div className="brand">DREAMSHOP | <span style={{color:'yellow'}}>MICROSERVICES</span></div>
        <div className="actions">
          <span className="pill">Catalog: <b className={catalogStatus==='ok'?'ok':'bad'}>{catalogStatus}</b></span>
          <span className="pill">Cart: <b className={cartStatus==='ok'?'ok':'bad'}>{cartStatus}</b></span>
          <span className="pill">Order: <b className={orderStatus==='ok'?'ok':'bad'}>{orderStatus}</b></span>
          <button className="btn" onClick={()=>setOpenCart(true)}><FaCartShopping size={20}/>เปิดตะกร้า</button>
        </div>
      </header>

      <main>
        <div>
          <h3 className="section-title">สินค้า</h3>
          <ProductGrid cartStatus={cartStatus}/>
        </div>
      </main>

      <CartModal open={openCart} onClose={()=>setOpenCart(false)} cartStatus={cartStatus}/>
    </div>
  )
}

function ProductGrid({cartStatus}){
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const load = async () => {
    setLoading(true); setError(null);
    try{
      const r = await fetch('/api/catalog/products')
      const j = await r.json()
      setProducts(j.products || [])
    }catch(e){ setError(String(e)) }
    finally{ setLoading(false) }
  }
  useEffect(()=>{ load() },[])
  if(loading) return <p className="muted">กำลังโหลดสินค้า…</p>
  if(error) return <p className="bad">โหลดสินค้าไม่สำเร็จ: {error}</p>
  return <div className="grid">
    {products.map(p => <ProductCard key={p.id} product={p} cartStatus={cartStatus}/>)}
  </div>
}
