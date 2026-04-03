import { useState, useEffect } from "react";

function Home() {
  // 🎞️ 图片轮播
  const images = [
    "/images/banner1.jpeg", // 👉 放你的图片在 public/images/
    "/images/banner2.jpg",
    "/images/banner3.jpg",
  ];

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ fontFamily: "Arial, sans-serif" }}>
      
      {/* 🎯 1️⃣ 滚动大图 Banner */}
      <div
        style={{
          width: "100%",
          height: "300px",
          overflow: "hidden",
        }}
      >
        <img
          src={images[index]} // 👉 图片放这里
          alt="banner"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </div>

      {/* 🎯 2️⃣ 欢迎文字 */}
      <div style={{ padding: "30px", textAlign: "center" }}>
        <h1>Welcome to Campus Coffee ☕</h1>
        <p>
          Your favorite place for coffee, snacks, and meals on campus.
        </p>
      </div>

      {/* 🎯 3️⃣ 学校介绍（Massey University） */}
      <div
        style={{
          padding: "30px",
          backgroundColor: "#f5f5f5",
        }}
      >
        <h2>About Massey University</h2>
        <p>
          Massey University is one of New Zealand’s leading universities,
          known for its innovative teaching and strong research culture.
        </p>
        <p>
          With campuses in Palmerston North, Auckland, and Wellington,
          Massey provides a vibrant student life and a diverse academic environment.
        </p>
      </div>

      {/* 🎯 4️⃣ 功能卡片 */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          padding: "30px",
          flexWrap: "wrap",
        }}
      >
        {/* 卡片1 */}
        <div
          style={{
            width: "250px",
            border: "1px solid #ddd",
            borderRadius: "10px",
            padding: "20px",
            textAlign: "center",
            margin: "10px",
          }}
        >
          <h3>Browse Menu</h3>
          <p>Explore our delicious food and drinks.</p>
        </div>

        {/* 卡片2 */}
        <div
          style={{
            width: "250px",
            border: "1px solid #ddd",
            borderRadius: "10px",
            padding: "20px",
            textAlign: "center",
            margin: "10px",
          }}
        >
          <h3>Fast Ordering</h3>
          <p>Order quickly and skip the queue.</p>
        </div>

        {/* 卡片3 */}
        <div
          style={{
            width: "250px",
            border: "1px solid #ddd",
            borderRadius: "10px",
            padding: "20px",
            textAlign: "center",
            margin: "10px",
          }}
        >
          <h3>Student Friendly</h3>
          <p>Affordable meals designed for students.</p>
        </div>
      </div>

      {/* 🎯 5️⃣ Footer */}
      <div
        style={{
          backgroundColor: "#222",
          color: "white",
          textAlign: "center",
          padding: "15px",
        }}
      >
        <p>© 2026 Campus Coffee | Massey University</p>
      </div>
    </div>
  );
}

export default Home;