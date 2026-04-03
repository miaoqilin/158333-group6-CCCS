import { useEffect, useState } from "react";
import axios from "axios";
import { addToCart } from "../utils/cart";

function Menu() {
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const { data } = await axios.get(
          "http://localhost:5000/api/menu"
        );
        setMenu(data);
      } catch (err) {
        setError("Failed to load menu");
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, []);

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Menu</h2>

     
      {loading && <p style={styles.message}>Loading...</p>}

  
      {error && <p style={styles.error}>{error}</p>}

  
      {!loading && menu.length === 0 && (
        <p style={styles.message}>No menu items available</p>
      )}

      <div style={styles.grid}>
        {menu.map((item) => (
          <div key={item._id} style={styles.card}>
            <h3>{item.name}</h3>

            <p style={styles.price}>${item.price}</p>

            <p style={styles.category}>{item.category}</p>

  
            <button
              style={styles.button}
              onClick={() => {
                addToCart(item);
                alert("Added to cart!");
              }}
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

//

//
const styles = {
  container: {
    padding: "20px",
    maxWidth: "1000px",
    margin: "auto",
  },
  title: {
    textAlign: "center",
    marginBottom: "20px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "20px",
  },
  card: {
    border: "1px solid #ddd",
    borderRadius: "12px",
    padding: "15px",
    backgroundColor: "#f9f9f9",
    textAlign: "center",
    boxShadow: "0 3px 8px rgba(0,0,0,0.1)",
  },
  price: {
    fontWeight: "bold",
    margin: "10px 0",
    fontSize: "18px",
  },
  category: {
    color: "#777",
    fontSize: "14px",
  },
  button: {
    marginTop: "10px",
    padding: "8px 12px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  message: {
    textAlign: "center",
    color: "#555",
  },
  error: {
    textAlign: "center",
    color: "red",
  },
};

export default Menu;