const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const waClient = require('./waBot');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = 3000;

const GROUP_IDS = {
  kebersihan: '120363407017205265@g.us',
  infrastruktur: '120363406534336468@g.us'
};

app.post('/api/keluhan', async (req, res) => {
  const { toilet, kategori, keluhan } = req.body;

  console.log('📩 DATA MASUK:', req.body);

  if (!toilet || !kategori || !keluhan) {
    return res.status(400).json({ message: 'Data tidak lengkap' });
  }

  const groupId = GROUP_IDS[kategori];
  console.log('🎯 KIRIM KE GROUP:', groupId);

  if (!groupId) {
    return res.status(400).json({ message: 'Kategori tidak valid' });
  }

  const pesan = `
🚨 *KELUHAN TOILET BARU*

📍 Lokasi: *${toilet}*
📂 Kategori: *${kategori.toUpperCase()}*
📝 Keluhan:
${keluhan}
  `;

  try {
    const chat = await waClient.getChatById(groupId);
    await chat.sendMessage(pesan, { sendSeen: false });

    res.json({ message: 'Keluhan berhasil dikirim ke WhatsApp' });
  } catch (err) {
    console.error('❌ ERROR KIRIM WA:', err);
    res.status(500).json({ message: 'Gagal kirim ke WhatsApp' });
  }
});
    


app.listen(PORT, () => {
  console.log(`🚀 Backend jalan di http://localhost:${PORT}`);
});
