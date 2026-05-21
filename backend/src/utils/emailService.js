const nodemailer = require("nodemailer");

const createTransporter = () => {
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error("Email configuration is missing in .env");
  }

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: Number(process.env.EMAIL_PORT) === 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const sendOrderConfirmationEmail = async ({ user, order }) => {
  const transporter = createTransporter();

  const itemRows = order.orderItems
    .map((item) => {
      return `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.qty}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">$${Number(item.price).toFixed(2)}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.specialInstructions || "-"}</td>
        </tr>
      `;
    })
    .join("");

  const html = `
    <div style="font-family: Arial, sans-serif; color: #222; max-width: 650px; margin: auto;">
      <div style="background: #4b2e2b; color: white; padding: 20px; border-radius: 12px 12px 0 0;">
        <h2 style="margin: 0;">Campus Coffee Order Confirmation</h2>
      </div>

      <div style="background: #fff; border: 1px solid #eee; padding: 20px; border-radius: 0 0 12px 12px;">
        <p>Hi ${user.name},</p>

        <p>Your order has been successfully placed and paid.</p>

        <h3>Order Details</h3>
        <p><strong>Order ID:</strong> ${order._id}</p>
        <p><strong>Status:</strong> ${order.status}</p>
        <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
        <p><strong>Payment Status:</strong> ${order.paymentStatus}</p>
        <p><strong>Delivery Time:</strong> ${order.deliveryTime}</p>
        <p><strong>Delivery Address:</strong> ${order.deliveryAddress}</p>
        <p><strong>Order Note:</strong> ${order.note || "-"}</p>

        <h3>Items</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr>
              <th style="text-align: left; padding: 8px; border-bottom: 2px solid #ddd;">Item</th>
              <th style="text-align: left; padding: 8px; border-bottom: 2px solid #ddd;">Qty</th>
              <th style="text-align: left; padding: 8px; border-bottom: 2px solid #ddd;">Price</th>
              <th style="text-align: left; padding: 8px; border-bottom: 2px solid #ddd;">Note</th>
            </tr>
          </thead>
          <tbody>
            ${itemRows}
          </tbody>
        </table>

        <h3>Payment Summary</h3>
        <p><strong>Subtotal:</strong> $${Number(order.subtotalPrice).toFixed(2)}</p>
        <p><strong>Discount:</strong> -$${Number(order.discountAmount || 0).toFixed(2)}</p>
        <p style="font-size: 18px;"><strong>Total Paid:</strong> $${Number(order.totalPrice).toFixed(2)}</p>

        <p style="margin-top: 24px;">
          Thank you for ordering from Campus Coffee.
        </p>
      </div>
    </div>
  `;

  const text = `
Campus Coffee Order Confirmation

Hi ${user.name},

Your order has been successfully placed.

Order ID: ${order._id}
Status: ${order.status}
Payment Method: ${order.paymentMethod}
Payment Status: ${order.paymentStatus}
Delivery Time: ${order.deliveryTime}
Delivery Address: ${order.deliveryAddress}
Total Paid: $${Number(order.totalPrice).toFixed(2)}

Thank you for ordering from Campus Coffee.
`;

  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: user.email,
    subject: `Campus Coffee Order Confirmation - ${order._id}`,
    text,
    html,
  });

  return info;
};

module.exports = {
  sendOrderConfirmationEmail,
};