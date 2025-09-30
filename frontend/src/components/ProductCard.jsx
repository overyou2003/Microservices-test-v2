import React, { useState } from 'react'
import { FaCartArrowDown } from "react-icons/fa";
import { RiShoppingBasket2Fill } from "react-icons/ri";
import toast, { Toaster } from 'react-hot-toast'

export default function ProductCard({product, cartStatus}){
  const [qty, setQty] = useState(1)

  const addToCart = async () => {
    try{
      const r = await fetch('/api/cart/cart/add', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({productId: product.id, qty: Number(qty)||1})
      })
      if(!r.ok) throw new Error('cart error')
      toast.success('เพิ่มลงตะกร้าแล้ว')
    }catch(e){ alert('เพิ่มตะกร้าไม่ได้ (Cart ล่ม)') }
  }

  const buyNow = async () => {
    const items = [{ productId: product.id, qty: Number(qty)||1 }]
    try{
      const r = await fetch('/api/order/order', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({items, source:'direct'})
      })
      const j = await r.json()
      if(!r.ok) throw new Error(j.error||'order failed')
      toast.success('สั่งซื้อสำเร็จ ราคารวมทั้งหมด '+ j.amount +' บาท');
      //alert(`สั่งซื้อสำเร็จ เลขออเดอร์: ${j.id} ยอดรวม ${j.amount} บาท`)
    }catch(e){ alert('สั่งซื้อไม่ได้ (Order service ล่ม)') }
  }

  return (
    <div className="card">
      <img className="product-img" src={product.img} alt={product.name}/>
      <div className="title">{product.name}</div>
      <div className="price">{product.price.toLocaleString()} บาท</div>

      <div className="row" style={{display:'flex',gap:8,alignItems:'center',marginTop:8}}>
        <span className="muted">จำนวน</span>
        <input type="number" min="1" value={qty} onChange={e=>setQty(e.target.value)} />
      </div>

      <div className="row" style={{display:'flex',gap:8,marginTop:10}}>
        <button className="btn" onClick={addToCart} disabled={cartStatus!=='ปกติ'}><FaCartArrowDown size={20}/>เพิ่มลงตะกร้า</button>
        <button className="btn ghost" onClick={buyNow}>ซื้อทันที</button>
      </div>

      {cartStatus!=='ปกติ' && <div className="warn" style={{marginTop:6}}>ตะกร้าล่ม — ยังสามารถกด "ซื้อทันที" ได้</div>}
    </div>
  )
}
