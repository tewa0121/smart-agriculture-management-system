export default function Footer() {
  const linkStyle = {
    color: "#b7f7d0",
    textDecoration: "none",
    margin: "5px 10px",
    display: "inline-block",
    overflowWrap: "anywhere",
  };

  return (
    <footer
      style={{
        background: "#123c2b",
        color: "#fff",
        padding: "28px 16px 16px",
        textAlign: "center",
        fontSize: "14px",
        lineHeight: 1.8,
      }}
    >
      <h3 style={{ margin: "0 0 6px", fontSize: "21px" }}>
        Tewachew Melaku
      </h3>

      <p style={{ margin: "0 0 12px", color: "#d1fae5" }}>
        Smart Agriculture Management System
      </p>

      <p style={{ margin: "5px 0" }}>
        Email:{" "}
        <a href="mailto:tewachewmelaku6@gmail.com" style={linkStyle}>
          tewachewmelaku6@gmail.com
        </a>
      </p>

      <p style={{ margin: "5px 0" }}>
        Phone:{" "}
        <a href="tel:+251920954224" style={linkStyle}>
          +251920954224
        </a>
      </p>

      <div style={{ marginTop: "10px" }}>
        <a
          href="https://github.com/tewa0121"
          target="_blank"
          rel="noopener noreferrer"
          style={linkStyle}
        >
          GitHub (@tewa0121)
        </a>

        <a
          href="https://www.facebook.com/profile.php?id=100076656763350"
          target="_blank"
          rel="noopener noreferrer"
          style={linkStyle}
        >
          Facebook
        </a>

        <a
          href="https://www.linkedin.com/in/tewachew-melaku-6b5094408"
          target="_blank"
          rel="noopener noreferrer"
          style={linkStyle}
        >
          LinkedIn
        </a>

        <a
          href="https://t.me/tewa0121"
          target="_blank"
          rel="noopener noreferrer"
          style={linkStyle}
        >
          Telegram (@tewa0121)
        </a>
      </div>

      <div
        style={{
          borderTop: "1px solid rgba(255,255,255,0.2)",
          marginTop: "18px",
          paddingTop: "12px",
          color: "#d1fae5",
        }}
      >
        © {new Date().getFullYear()} Tewachew Melaku. All rights reserved.
      </div>
    </footer>
  );
}