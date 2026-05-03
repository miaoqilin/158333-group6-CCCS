import { useEffect, useState } from "react";
import axios from "axios";
import { getCart, saveCart } from "../utils/cart";
import { useNavigate } from "react-router-dom";

function Cart() {
  const [cart, setCart] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

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
    const updated = cart.map((item) =>
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

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const placeOrderHandler = async () => {
    try {
      setError("");

      const userInfo = JSON.parse(localStorage.getItem("userInfo"));

      if (!userInfo || !userInfo.token) {
        setError("Please login before placing an order.");
        navigate("/login");
        return;
      }

      if (cart.length === 0) {
        setError("Your cart is empty.");
        return;
      }

      setSubmitting(true);

      const orderItems = cart.map((item) => ({
        menuItem: item._id,
        name: item.name,
        qty: item.qty,
        price: item.price,
      }));

      await axios.post(
        "http://localhost:5000/api/orders",
        {
          orderItems,
          totalPrice: total,
        },
        {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        }
      );

      saveCart([]);
      setCart([]);
      alert("Order placed successfully!");
      navigate("/orders");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to place order");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Your Cart 🛒</h2>

      {error && <p style={styles.error}>{error}</p>}

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
                <button style={styles.qtyBtn} onClick={() => decreaseQty(item._id)}>
                  -
                </button>
                <span>{item.qty}</span>
                <button style={styles.qtyBtn} onClick={() => increaseQty(item._id)}>
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

          <h3 style={styles.total}>Total: ${total.toFixed(2)}</h3>

          <div style={styles.actions}>
            <button style={styles.clear} onClick={clearCart}>
              Clear Cart
            </button>

            <button
              style={styles.checkout}
              onClick={placeOrderHandler}
              disabled={submitting}
            >
              {submitting ? "Placing Order..." : "Place Order"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "750px",
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
  error: {
    color: "red",
    textAlign: "center",
    marginBottom: "15px",
  },
  card: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    border: "1px solid #ddd",
    padding: "15px",
    marginBottom: "12px",
    borderRadius: "10px",
    backgroundColor: "#fafafa",
  },
  controls: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  qtyBtn: {
    padding: "5px 10px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  remove: {
    backgroundColor: "#dc3545",
    color: "white",
    border: "none",
    padding: "8px 12px",
    borderRadius: "5px",
    cursor: "pointer",
  },
  total: {
    marginTop: "20px",
    textAlign: "right",
  },
  actions: {
    display: "flex",
    gap: "10px",
    marginTop: "20px",
  },
  clear: {
    flex: 1,
    padding: "10px",
    backgroundColor: "#333",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  checkout: {
    flex: 1,
    padding: "10px",
    backgroundColor: "green",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
};

export default Cart;