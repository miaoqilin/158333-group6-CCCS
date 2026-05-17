import { useEffect, useState } from "react";
import api from "../services/api";
import { addToCart } from "../utils/cart";

const categories = ["", "coffee", "food", "drink", "dessert", "snack", "meal", "catering"];
const dietaryCategories = ["", "meat", "vegetarian", "vegan", "gluten_free"];
const itemTypes = ["", "single", "package"];

function Menu() {
  const [menu, setMenu] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    dietaryCategory: "",
    itemType: "",
  });
  const [notes, setNotes] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchMenu = async () => {
    try {
      setLoading(true);
      setError("");

      const params = {};

      Object.keys(filters).forEach((key) => {
        if (filters[key]) {
          params[key] = filters[key];
        }
      });

      const { data } = await api.get("/menu", { params });
      setMenu(data);
    } catch {
      setError("Failed to load menu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filterChangeHandler = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const addHandler = (item) => {
    addToCart(item, notes[item._id] || "");
    alert(item.itemType === "package" ? "Package added to cart!" : "Item added to cart!");
  };

  return (
    <div className="page">
      <div className="section-title">
        <h2>Online Menu</h2>
        <p>Browse approved items and catering packages from campus vendors.</p>
      </div>

      <div className="filter-bar">
        <input
          name="search"
          placeholder="Search menu..."
          value={filters.search}
          onChange={filterChangeHandler}
        />

        <select name="category" value={filters.category} onChange={filterChangeHandler}>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c || "All categories"}
            </option>
          ))}
        </select>

        <select
          name="dietaryCategory"
          value={filters.dietaryCategory}
          onChange={filterChangeHandler}
        >
          {dietaryCategories.map((c) => (
            <option key={c} value={c}>
              {c || "All dietary types"}
            </option>
          ))}
        </select>

        <select name="itemType" value={filters.itemType} onChange={filterChangeHandler}>
          {itemTypes.map((c) => (
            <option key={c} value={c}>
              {c || "Single and packages"}
            </option>
          ))}
        </select>

        <button className="primary-btn" onClick={fetchMenu}>
          Apply
        </button>
      </div>

      {loading && <p className="center">Loading...</p>}
      {error && <div className="alert error">{error}</div>}

      {!loading && menu.length === 0 && (
        <div className="card center">No menu items available.</div>
      )}

      <div className="grid three">
        {menu.map((item) => (
          <div key={item._id} className="menu-card">
            <div className="image-box">
              {item.image ? (
                <img src={item.image} alt={item.name} />
              ) : (
                <span>No Image</span>
              )}
            </div>

            <div className="card-body">
              <div className="card-header-row">
                <h3>{item.name}</h3>
                <span className="price">${Number(item.price).toFixed(2)}</span>
              </div>

              <p className="muted">{item.description}</p>

              <div className="badge-row">
                <span className="badge">{item.category}</span>
                <span className="badge">{item.dietaryCategory}</span>
                <span className="badge accent">{item.itemType}</span>
              </div>

              {item.vendor?.businessName && (
                <p className="small">Vendor: {item.vendor.businessName}</p>
              )}

              {item.itemType === "package" && item.packageItems?.length > 0 && (
                <div className="package-box">
                  <strong>Package includes:</strong>
                  <ul>
                    {item.packageItems.map((p, index) => (
                      <li key={index}>
                        {p.name} × {p.quantity}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <textarea
                placeholder="Add note for this item..."
                value={notes[item._id] || ""}
                onChange={(e) =>
                  setNotes({
                    ...notes,
                    [item._id]: e.target.value,
                  })
                }
              />

              <button className="primary-btn full" onClick={() => addHandler(item)}>
                {item.itemType === "package" ? "Add Package" : "Add to Cart"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Menu;