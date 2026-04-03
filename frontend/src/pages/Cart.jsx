import { useEffect, useState } from "react";
import { getCart, saveCart } from "../utils/cart";

function Cart() {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    setCart(getCart());
  }, []);


  const increaseQty = (id) => {
    const updated = cart.map((item) =>
      item._id === id ? { ...item, qty: item.qty + 1 } : item
    );
    setCart(updated);
    saveCart(updated);
  };


  const decreaseQty = (id) => {
    const updated = cart
      .map((item) =>
        item._id === id
          ? { ...item, qty: item.qty > 1 ? item.qty - 1 : 1 }
          : item
      );
    setCart(updated);
    saveCart(updated);
  };


  const removeItem = (id) => {
    const updated = cart.filter((item) => item._id !== id);
    setCart(updated);
    saveCart(updated);
  };


  const clearCart = () => {
    setCart([]);
    saveCart([]);
  };


  const total = cart.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Your Cart 🛒</h2>

      {cart.length === 0 ? (
        <p style={styles.empty}>Your cart is empty</p>
      ) : (
        <>
          {cart.map((item) => (
            <div key={item._id} style={styles.card}>
              <div>
                <h3>{item.name}</h3>
                <p>${item.price}</p>
              </div>

              <div style={styles.controls}>
                {/* ➖ */}
                <button onClick={() => decreaseQty(item._id)}>
                  -
                </button>

                <span>{item.qty}</span>

                {/* ➕ */}
                <button onClick={() => increaseQty(item._id)}>
                  +
                </button>
              </div>

              <button
                style={styles.remove}
                onClick={() => removeItem(item._id)}
              >
                Remove
              </button>
            </div>
          ))}


          <h3 style={styles.total}>Total: ${total}</h3>


          <button style={styles.clear} onClick={clearCart}>
            Clear Cart
          </button>
        </>
      )}
    </div>
  );
}

//

//
const styles = {
  container: {
    maxWidth: "700px",
    margin: "auto",
    padding: "20px",
  },
  title: {
    textAlign: "center",
    marginBottom: "20px",
  },
  empty: {
    textAlign: "center",
    color: "#777",
  },
  card: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    border: "1px solid #ddd",
    padding: "15px",
    marginBottom: "10px",
    borderRadius: "10px",
    backgroundColor: "#fafafa",
  },
  controls: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  remove: {
    backgroundColor: "red",
    color: "white",
    border: "none",
    padding: "5px 10px",
    borderRadius: "5px",
    cursor: "pointer",
  },
  clear: {
    marginTop: "20px",
    width: "100%",
    padding: "10px",
    backgroundColor: "#333",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  total: {
    marginTop: "20px",
    textAlign: "right",
  },
};

export default Cart;