require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const waClient = require("./waBot");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

const GROUP_IDS = {
  kebersihan: process.env.GROUP_ID_KEBERSIHAN,
  infrastruktur: process.env.GROUP_ID_INFRASTRUKTUR,
};

// Validasi environment variables
if (!GROUP_IDS.kebersihan || !GROUP_IDS.infrastruktur) {
  console.error("❌ ERROR: GROUP_IDS tidak ditemukan di .env file");
  process.exit(1);
}

// Endpoint untuk mengecek status bot
app.get("/api/status", (req, res) => {
  res.json({
    botReady: waClient.isReady(),
    message: waClient.isReady()
      ? "Bot siap"
      : "Bot belum siap, tunggu sebentar",
  });
});

app.post("/api/keluhan", async (req, res) => {
  const { toilet, kategori, keluhan } = req.body;

  console.log("📩 DATA MASUK:", req.body);

  if (!toilet || !kategori || !keluhan) {
    return res.status(400).json({ message: "Data tidak lengkap" });
  }

  // Cek apakah bot sudah siap
  if (!waClient.isReady()) {
    return res.status(503).json({
      message:
        "WhatsApp Bot belum siap. Mohon tunggu beberapa saat dan coba lagi.",
    });
  }

  const groupId = GROUP_IDS[kategori];
  console.log("🎯 KIRIM KE GROUP:", groupId);

  if (!groupId) {
    return res.status(400).json({ message: "Kategori tidak valid" });
  }

  const pesan = `
📍 Lokasi: *${toilet}*
📝 Keluhan:
${keluhan}
  `;

  try {
    const chat = await waClient.getChatById(groupId);
    await chat.sendMessage(pesan, { sendSeen: false });

    console.log("✅ Pesan berhasil dikirim ke grup");
    res.json({ message: "Keluhan berhasil dikirim ke WhatsApp" });
  } catch (err) {
    console.error("❌ ERROR KIRIM WA:", err);
    res.status(500).json({
      message: "Gagal kirim ke WhatsApp",
      error: err.message,
    });
  }
});

// Tunggu bot siap sebelum start server
waClient.on("ready", () => {
  app.listen(PORT, () => {
    console.log(`🚀 Backend berjalan di http://localhost:${PORT}`);
    console.log(`📊 Cek status bot: http://localhost:${PORT}/api/status\n`);
  });
});

// Handle jika bot gagal dalam 2 menit
setTimeout(() => {
  if (!waClient.isReady()) {
    console.log("⚠️ Bot belum siap setelah 2 menit, tapi server tetap jalan");
    app.listen(PORT, () => {
      console.log(`🚀 Backend berjalan di http://localhost:${PORT}`);
      console.log(`⚠️ WhatsApp bot masih dalam proses koneksi\n`);
    });
  }
}, 120000);
