import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import {
  getCart,
  saveCart,
  clearCart,
  updateCartItemQty,
  removeCartItem,
} from "../utils/cart";
import { getUserInfo, updateStoredUserProfile } from "../utils/auth";

function Cart() {
  const navigate = useNavigate();

  const [cart, setCart] = useState([]);
  const [profile, setProfile] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("credit_card");
  const [deliveryTime, setDeliveryTime] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [note, setNote] = useState("");
  const [useCoupon, setUseCoupon] = useState(true);
  const [saveNoteAsPreference, setSaveNoteAsPreference] = useState(false);
  const [saveAddressAsPreference, setSaveAddressAsPreference] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const availableCoupon = profile?.coupons?.find((coupon) => !coupon.isUsed);
  const discount = useCoupon && availableCoupon ? Math.min(availableCoupon.amount, subtotal) : 0;
  const total = Math.max(subtotal - discount, 0);

  useEffect(() => {
    setCart(getCart());

    const fetchProfile = async () => {
      const user = getUserInfo();

      if (!user?.token) {
        return;
      }

      try {
        const { data } = await api.get("/auth/profile");
        setProfile(data);
        setNote(data.defaultOrderNote || "");
        setDeliveryAddress(data.deliveryPreferences?.defaultAddress || "");
        setDeliveryTime(data.deliveryPreferences?.defaultDeliveryTime || "");
      } catch {
        // profile auto-fill is optional
      }
    };

    fetchProfile();
  }, []);

  const qtyHandler = (item, nextQty) => {
    const updated = updateCartItemQty(item._id, item.specialInstructions, nextQty);
    setCart(updated);
  };

  const removeHandler = (item) => {
    const updated = removeCartItem(item._id, item.specialInstructions);
    setCart(updated);
  };

  const placeOrderHandler = async () => {
    try {
      setError("");

      const user = getUserInfo();

      if (!user?.token) {
        navigate("/login");
        return;
      }

      if (cart.length === 0) {
        setError("Your cart is empty.");
        return;
      }

      if (!deliveryTime || !deliveryAddress) {
        setError("Delivery time and delivery address are required.");
        return;
      }

      const confirmed = window.confirm(
        `Confirm your order?\nSubtotal: $${subtotal.toFixed(2)}\nDiscount: $${discount.toFixed(2)}\nTotal: $${total.toFixed(2)}`
      );

      if (!confirmed) {
        return;
      }

      setSubmitting(true);

      const orderItems = cart.map((item) => ({
        menuItem: item._id,
        qty: item.qty,
        specialInstructions: item.specialInstructions || note,
      }));

      const { data } = await api.post("/orders", {
        orderItems,
        paymentMethod,
        deliveryTime,
        deliveryAddress,
        note,
        useCoupon,
        saveNoteAsPreference,
        saveAddressAsPreference,
      });

      clearCart();
      setCart([]);

      try {
        const profileResponse = await api.get("/auth/profile");
        updateStoredUserProfile(profileResponse.data);
      } catch {
        // optional refresh
      }

      alert(data.message || "Order placed successfully.");
      navigate("/orders");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to place order");
    } finally {
      setSubmitting(false);
    }
  };

  const clearHandler = () => {
    clearCart();
    setCart([]);
  };

  return (
    <div className="page">
      <div className="section-title">
        <h2>Your Cart</h2>
        <p>Review your items, choose payment method and enter delivery details.</p>
      </div>

      {error && <div className="alert error">{error}</div>}

      {cart.length === 0 ? (
        <div className="card center">Your cart is empty.</div>
      ) : (
        <div className="cart-layout">
          <div>
            {cart.map((item, index) => (
              <div className="cart-item" key={`${item._id}-${index}`}>
                <div>
                  <h3>{item.name}</h3>
                  <p className="muted">
                    {item.itemType} · {item.dietaryCategory}
                  </p>

                  {item.itemType === "package" && item.packageItems?.length > 0 && (
                    <ul className="small">
                      {item.packageItems.map((p, i) => (
                        <li key={i}>
                          {p.name} × {p.quantity}
                        </li>
                      ))}
                    </ul>
                  )}

                  {item.specialInstructions && (
                    <p className="small">Note: {item.specialInstructions}</p>
                  )}

                  <strong>${Number(item.price).toFixed(2)}</strong>
                </div>

                <div className="qty-control">
                  <button onClick={() => qtyHandler(item, item.qty - 1)}>-</button>
                  <span>{item.qty}</span>
                  <button onClick={() => qtyHandler(item, item.qty + 1)}>+</button>
                </div>

                <button className="danger-btn" onClick={() => removeHandler(item)}>
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="checkout-card">
            <h3>Checkout</h3>

            <label>Payment Method</label>
            <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
              <option value="credit_card">Credit Card</option>
              <option value="debit_card">Debit Card</option>
              <option value="campus_account">Campus Account</option>
              <option value="mobile_wallet">Mobile Wallet</option>
            </select>

            <label>Delivery Time</label>
            <input
              placeholder="e.g. 2026-05-06 12:30"
              value={deliveryTime}
              onChange={(e) => setDeliveryTime(e.target.value)}
            />

            <label>Delivery Address</label>
            <input
              placeholder="Enter delivery location"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
            />

            <label>Order Note</label>
            <textarea
              placeholder="Extra instructions for this order"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />

            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={saveNoteAsPreference}
                onChange={(e) => setSaveNoteAsPreference(e.target.checked)}
              />
              Save this note as my default preference
            </label>

            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={saveAddressAsPreference}
                onChange={(e) => setSaveAddressAsPreference(e.target.checked)}
              />
              Save this delivery address
            </label>

            {availableCoupon && (
              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={useCoupon}
                  onChange={(e) => setUseCoupon(e.target.checked)}
                />
                Use ${availableCoupon.amount} coupon
              </label>
            )}

            <div className="price-summary">
              <p>
                <span>Subtotal</span>
                <strong>${subtotal.toFixed(2)}</strong>
              </p>
              <p>
                <span>Discount</span>
                <strong>-${discount.toFixed(2)}</strong>
              </p>
              <p className="total-line">
                <span>Total</span>
                <strong>${total.toFixed(2)}</strong>
              </p>
            </div>

            <button className="primary-btn full" onClick={placeOrderHandler} disabled={submitting}>
              {submitting ? "Placing Order..." : "Pay and Place Order"}
            </button>

            <button className="secondary-btn full" onClick={clearHandler}>
              Clear Cart
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;