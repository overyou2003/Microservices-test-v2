import React, { useEffect, useMemo, useState } from 'react'

const formatBaht = (n) => (n || 0).toLocaleString('th-TH')

export default function CartModal({open, onClose, cartStatus}){
  if(!open) return null
  return (
    <div className="modal-overlay" onMouseDown={onClose}>
      <div className="modal" onMouseDown={e=>e.stopPropagation()}>
        <header style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <h3 style={{margin:0}}>ตะกร้าสินค้า</h3>
          <button className="btn ghost" onClick={onClose}>ปิด</button>
        </header>
        <div style={{marginTop:8}}>
          <CartBody cartStatus={cartStatus}/>
        </div>
      </div>
    </div>
  )
}

function CartBody({cartStatus}){
  const [cartItems, setCartItems] = useState([])        // [{productId, qty}]
  const [catalog, setCatalog] = useState([])            // [{id,name,price,img,...}]
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const load = async () => {
    setLoading(true); setError(null);
    try{
      // ดึงตะกร้า
      const c = await fetch('/api/cart/cart').then(r=>r.json())
      setCartItems(Array.isArray(c.items) ? c.items : [])

      // ดึงแคตตาล็อก เพื่อ join หา name/price/img
      const p = await fetch('/api/catalog/products').then(r=>r.json())
      setCatalog(Array.isArray(p.products) ? p.products : [])
    }catch(e){
      setError(String(e))
    }finally{ setLoading(false) }
  }

  useEffect(()=>{ if(cartStatus==='ปกติ') load() }, [cartStatus])

  // join ข้อมูลเพื่อแสดงรายละเอียด
  const detailed = useMemo(()=>{
    const map = new Map(catalog.map(p=>[p.id, p]))
    return cartItems.map(it=>{
      const p = map.get(it.productId) || {}
      const price = Number(p.price || 0)
      const qty = Number(it.qty || 0)
      const line = price * qty
      return {
        id: it.productId, qty,
        name: p.name || it.productId,
        price, img: p.img, line
      }
    })
  }, [cartItems, catalog])

  const grandTotal = useMemo(
    ()=> detailed.reduce((s,i)=>s+i.line,0), [detailed]
  )

  const checkout = async () => {
    try{
      const r = await fetch('/api/order/order', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({items: cartItems, source:'cart'})
      })
      const j = await r.json()
      if(!r.ok) throw new Error(j.error || 'order failed')
      alert(`ชำระสำเร็จ เลขออเดอร์: ${j.id} (รวม ${formatBaht(j.amount)} บาท)`)
      await fetch('/api/cart/cart/clear', { method:'DELETE' }).catch(()=>{})
      load()
    }catch(e){
      alert('ชำระเงินไม่สำเร็จ (Order service ล่ม หรือสินค้าไม่พร้อม)')
    }
  }

  if(cartStatus!=='ปกติ'){
    return <p className="warn">Cart service ล่ม — ยังสั่งซื้อได้ด้วยปุ่ม <b>Buy Now</b> จากหน้าสินค้า</p>
  }
  if(loading) return <p className="muted">โหลดตะกร้า…</p>
  if(error) return <p className="bad">โหลดตะกร้าไม่ได้</p>

  return (
    <div>
      {detailed.length===0 ? (
        <p className="muted">ยังไม่มีสินค้าในตะกร้า</p>
      ) : (
        <>
          <ul style={{listStyle:'none', padding:0, margin:0, display:'grid', gap:'10px'}}>
            {detailed.map(it=>(
              <li key={it.id} style={{display:'grid', gridTemplateColumns:'72px 1fr auto', gap:'12px', alignItems:'center', border:'1px solid var(--soft)', borderRadius:'12px', padding:'8px'}}>
                <img src={it.img} alt={it.name} style={{width:72, height:72, objectFit:'cover', borderRadius:'10px'}} 
                  onError={(e)=>{ e.currentTarget.src='https://picsum.photos/seed/fallback/144/144' }}/>
                <div>
                  <div style={{fontWeight:700}}>{it.name}</div>
                  <div className="muted">฿{formatBaht(it.price)} × {it.qty}</div>
                </div>
                <div style={{fontWeight:800}}>฿{formatBaht(it.line)}</div>
              </li>
            ))}
          </ul>

          <div style={{display:'flex', justifyContent:'space-between', marginTop:'12px', alignItems:'center'}}>
            <div className="muted">รวมทั้งหมด</div>
            <div style={{fontSize:'1.15rem', fontWeight:900}}>฿{formatBaht(grandTotal)}</div>
          </div>

          <div className="footer">
            <button className="btn ghost" onClick={async()=>{ await fetch('/api/cart/cart/clear',{method:'DELETE'}); load()}}>ล้างตะกร้า</button>
            <button className="btn" onClick={checkout} disabled={detailed.length===0}>ชำระเงิน</button>
          </div>
        </>
      )}
    </div>
  )
}
