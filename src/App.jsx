import { useMemo, useState } from "react";
import { products } from "./products.js";

// ▼▼▼ ĐỔI CÁC GIÁ TRỊ NÀY RỒI COMMIT ĐỂ THẤY GIAO DIỆN ĐỔI ▼▼▼
const SITE_VERSION = "v1";
const BANNER = "🎉 Khai trương Orbit Store — freeship toàn quốc! Sale 11/06";
// ▲▲▲ ---------------------------------------------------------- ▲▲▲

const formatVND = (n) => n.toLocaleString("vi-VN") + "₫";

function App() {
  // cart: { [productId]: quantity }
  const [cart, setCart] = useState({});

  const addToCart = (id) =>
    setCart((c) => ({ ...c, [id]: (c[id] || 0) + 1 }));

  const { count, total } = useMemo(() => {
    let count = 0;
    let total = 0;
    for (const p of products) {
      const q = cart[p.id] || 0;
      count += q;
      total += q * p.price;
    }
    return { count, total };
  }, [cart]);

  return (
    <div className="page">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">◐</span> Orbit Store
        </div>
        <div className="cart">
          <span className="cart-icon">🛒</span>
          <span className="cart-count">{count}</span>
          <span className="cart-total">{formatVND(total)}</span>
        </div>
      </header>

      <div className="banner">{BANNER}</div>

      <main className="grid">
        {products.map((p) => (
          <article key={p.id} className="product">
            {p.tag && <span className="tag">{p.tag}</span>}
            <div className="thumb">{p.emoji}</div>
            <h3 className="name">{p.name}</h3>
            <div className="price-row">
              <span className="price">{formatVND(p.price)}</span>
              <button className="buy" onClick={() => addToCart(p.id)}>
                Thêm{cart[p.id] ? ` (${cart[p.id]})` : ""}
              </button>
            </div>
          </article>
        ))}
      </main>

      <footer className="foot">
        <span>Deploy tự động bằng CI/CD Platform</span>
        <span className="dot">•</span>
        <span>apicicd.orbitai.vn</span>
        <span className="dot">•</span>
        <span className="ver">{SITE_VERSION}</span>
      </footer>
    </div>
  );
}

export default App;
