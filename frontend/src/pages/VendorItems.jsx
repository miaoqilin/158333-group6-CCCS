import { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import api from "../services/api";

const links = [
  { to: "/vendor", label: "Dashboard" },
  { to: "/vendor/items", label: "My Items" },
  { to: "/vendor/orders", label: "Orders" },
  { to: "/vendor/analytics", label: "Analytics" },
  { to: "/vendor/feedback", label: "Feedback" },
  { to: "/vendor/profile", label: "Profile" },
];

const emptyForm = {
  name: "",
  description: "",
  price: "",
  category: "food",
  dietaryCategory: "meat",
  itemType: "single",
  image: "",
  packageText: "",
};

function parsePackageText(text) {
  if (!text.trim()) return [];

  return text
    .split("\n")
    .map((line) => {
      const [name, quantity, description] = line.split("|").map((p) => p.trim());

      return {
        name,
        quantity: Number(quantity || 1),
        description: description || "",
      };
    })
    .filter((item) => item.name);
}

function VendorItems() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchItems = async () => {
    const { data } = await api.get("/menu/vendor/my");
    setItems(data);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const changeHandler = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      setError("");
      setMessage("");

      await api.post("/menu/vendor", {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        category: form.category,
        dietaryCategory: form.dietaryCategory,
        itemType: form.itemType,
        image: form.image,
        packageItems: form.itemType === "package" ? parsePackageText(form.packageText) : [],
      });

      setMessage("Item submitted for admin approval.");
      setForm(emptyForm);
      fetchItems();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit item");
    }
  };

  const toggle = async (id) => {
    await api.put(`/menu/vendor/${id}/toggle`);
    fetchItems();
  };

  const editItem = async (item) => {
    const price = window.prompt("New price:", item.price);
    const description = window.prompt("New description:", item.description);
    const image = window.prompt("New image URL:", item.image || "");

    await api.put(`/menu/vendor/${item._id}`, {
      price: Number(price),
      description,
      image,
    });

    alert("Updated item submitted for admin review.");
    fetchItems();
  };

  return (
    <DashboardLayout title="Vendor Panel" links={links}>
      <h2>My Menu Items</h2>

      <div className="grid two">
        <div className="card">
          <h3>Submit New Item or Package</h3>

          {message && <div className="alert success">{message}</div>}
          {error && <div className="alert error">{error}</div>}

          <form className="form" onSubmit={submitHandler}>
            <label>Name</label>
            <input name="name" value={form.name} onChange={changeHandler} required />

            <label>Description</label>
            <textarea name="description" value={form.description} onChange={changeHandler} required />

            <label>Price</label>
            <input name="price" type="number" value={form.price} onChange={changeHandler} required />

            <label>Category</label>
            <select name="category" value={form.category} onChange={changeHandler}>
              <option value="coffee">coffee</option>
              <option value="food">food</option>
              <option value="drink">drink</option>
              <option value="dessert">dessert</option>
              <option value="snack">snack</option>
              <option value="meal">meal</option>
              <option value="catering">catering</option>
            </select>

            <label>Dietary Category</label>
            <select name="dietaryCategory" value={form.dietaryCategory} onChange={changeHandler}>
              <option value="meat">meat</option>
              <option value="vegetarian">vegetarian</option>
              <option value="vegan">vegan</option>
              <option value="gluten_free">gluten_free</option>
            </select>

            <label>Item Type</label>
            <select name="itemType" value={form.itemType} onChange={changeHandler}>
              <option value="single">single</option>
              <option value="package">package</option>
            </select>

            <label>Image URL</label>
            <input name="image" value={form.image} onChange={changeHandler} />

            {form.itemType === "package" && (
              <>
                <label>Package Items</label>
                <textarea
                  name="packageText"
                  value={form.packageText}
                  onChange={changeHandler}
                  placeholder={"One item per line:\nSandwich | 5 | vegetarian sandwich\nJuice | 5 | bottled juice"}
                />
              </>
            )}

            <button className="primary-btn full">Submit for Review</button>
          </form>
        </div>

        <div className="stack">
          {items.map((item) => (
            <div className="card" key={item._id}>
              <div className="card-header-row">
                <h3>{item.name}</h3>
                <span className="badge accent">{item.approvalStatus}</span>
              </div>

              <p>{item.description}</p>
              <p className="price">${Number(item.price).toFixed(2)}</p>
              <p className="small">
                {item.category} · {item.dietaryCategory} · {item.itemType}
              </p>
              <p className="small">Available: {item.isAvailable ? "Yes" : "No"}</p>

              {item.rejectionReason && (
                <p className="alert error">Reason: {item.rejectionReason}</p>
              )}

              <div className="button-row">
                <button className="secondary-btn" onClick={() => editItem(item)}>
                  Edit
                </button>
                <button className="secondary-btn" onClick={() => toggle(item._id)}>
                  Toggle Available
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default VendorItems;