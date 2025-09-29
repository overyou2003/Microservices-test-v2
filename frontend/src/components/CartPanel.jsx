
import React, { useEffect, useMemo, useState } from 'react'

export default function CartPanel({cartStatus}){
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const load = async () => {
    setLoading(true); setError(null);
    try{
      const r = await fetch('/api/cart/cart')
      const j = await r.json()
      setItems(j.items||[])
    }catch(e){
      setError(String(e))
    }finally{ setLoading(false) }
  }
  useEffect(()=>{ if(cartStatus==='ok') load() }, [cartStatus])

  const checkout = async () => {
    try{
      const r = await fetch('/api/order/order', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({items, source:'cart'}) })
      const j = await r.json()
      if(!r.ok) throw new Error(j.error||'order failed')
      alert('ชำระสำเร็จ เลขออเดอร์: '+ j.id + ' ('+ j.amount +' บาท)'); 
      await fetch('/api/cart/cart/clear', { method:'DELETE' }).catch(()=>{})
      load()
    }catch(e){
      alert('ชำระเงินไม่สำเร็จ (Order service ล่ม หรือสินค้าไม่พร้อม)')
    }
  }

  if(cartStatus!=='ok'){
    return (
      <div className="card">
        <div className="title">ตะกร้า</div>
        <p className="warn">Cart service ล่ม — ยังสั่งซื้อได้ด้วยปุ่ม <b>Buy Now</b> จากหน้าสินค้า</p>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="title">ตะกร้า</div>
      {loading && <p className="muted">โหลดตะกร้า…</p>}
      {error && <p className="bad">โหลดตะกร้าไม่ได้</p>}
      {!loading && !error && (
        <div>
          {items.length===0 ? <p className="muted">ยังไม่มีสินค้าในตะกร้า</p> :
            <ul>
              {items.map((it,idx)=>(<li key={idx}>{it.productId} × {it.qty}</li>))}
            </ul>
          }
          <div className="row" style={{marginTop:'.5rem'}}>
            <button onClick={checkout} disabled={items.length===0}>Checkout from Cart</button>
            <button onClick={async()=>{ await fetch('/api/cart/cart/clear',{method:'DELETE'}); load()}}>Clear</button>
            <button onClick={load}>Refresh</button>
          </div>
        </div>
      )}
    </div>
  )
}
