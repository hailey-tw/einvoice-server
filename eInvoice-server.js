require("dotenv").config();
const express = require("express");
const session = require("express-session");
const path = require("path");
const cors = require("cors");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Session
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 2 * 60 * 60 * 1000 } // 2 hours
}));
console.log('static dir:', path.join(__dirname, "eInvoice-frontend"))
    // 靜態檔案, 前端位置
app.use(express.static(path.join(__dirname, "eInvoice-frontend")));

// --- Middleware：檢查是否登入 ---
function requireLogin(req, res, next) {
    if (req.session.loggedIn) return next();
    return res.status(401).json({ error: "Not logged in" });
}

// --- API：登入 ---
app.post("/api/login", (req, res) => {
    const { password } = req.body;
    const correct = process.env.ADMIN_PASSWORD;

    if (password === correct) {
        req.session.loggedIn = true;
        return res.json({ ok: true });
    }

    res.status(403).json({ ok: false, error: "Wrong password" });
});

// // --- API：登出 ---
// app.post("/api/logout", (req, res) => {
//     req.session.destroy(() => {
//         res.json({ ok: true });
//     });
// });

// API：僅登入者可使用
app.get("/api/status", requireLogin, (req, res) => {
    if (req.session.loggedIn) {
        res.json({ loggedIn: true });
    } else {
        res.json({ loggedIn: false });
    }
});

// 啟動 Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
    console.log(`✅ Server running on http://localhost:${PORT}`)
);
