const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path"); // Wajib ada untuk Vercel
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// --- PERBAIKAN UTAMA DI SINI ---
// Kita gunakan path.join agar Vercel tidak bingung mencari folder public
app.use(express.static(path.join(__dirname, "public")));

// ⚠️ LINK MONGODB ANDA ⚠️
const MONGO_URI =
  "mongodb+srv://mfikihhidayat:admin123@cluster1.pocykpo.mongodb.net/?appName=Cluster1";

const connectOptions = {
  serverSelectionTimeoutMS: 5000,
  family: 4,
};

// Config Upload Gambar (Multer)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Simpan ke folder public/img
    cb(null, path.join(__dirname, "public/img/"));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

// --- 2. MODEL DATABASE ---

// Model Produk
const Produk = mongoose.model(
  "Produk",
  new mongoose.Schema({
    nama: String,
    harga: String,
    gambar: String,
    deskripsi: String, // <-- PENTING
  })
);

// Model Pesan
const Pesan = mongoose.model(
  "Pesan",
  new mongoose.Schema({
    nama: String,
    email: String,
    nohp: String,
    tanggal: { type: Date, default: Date.now },
  })
);

// Model Profil Web
const ProfilWeb = mongoose.model(
  "ProfilWeb",
  new mongoose.Schema({
    judulHero: String,
    deskripsiHero: String,
    tentangKami: String,
  })
);

// --- 3. FUNGSI CEK DATA (SEEDING) ---

async function seedData() {
  try {
    const jumlah = await Produk.countDocuments();
    if (jumlah === 0) {
      console.log("📦 Data produk kosong, mengisi default...");
      await Produk.insertMany([
        {
          nama: "Pasir Rangkas",
          harga: "Rp 1.900.000",
          gambar: "img/truck.jpg",
          deskripsi: "Pasir kualitas terbaik untuk bangunan.",
        },
        {
          nama: "Batu Split",
          harga: "Rp 1.800.000",
          gambar: "img/truck.jpg",
          deskripsi: "Batu split ukuran standar cor.",
        },
      ]);
    }
  } catch (e) {
    console.log("Skip seed produk");
  }
}

async function cekProfil() {
  try {
    const ada = await ProfilWeb.findOne();
    if (!ada) {
      console.log("⚙️ Profil Web kosong, mengisi default...");
      await ProfilWeb.create({
        judulHero: "PASIR BERKUALITAS",
        deskripsiHero:
          "Supply & pengiriman pasir se-Jabodetabek dalam satu layanan.",
        tentangKami: "Kami menyediakan supply pasir dengan kualitas stabil.",
      });
    }
  } catch (e) {
    console.log("Skip seed profil");
  }
}

// --- 4. EKSEKUSI KONEKSI ---

console.log("⏳ Sedang mencoba koneksi ke MongoDB...");

mongoose
  .connect(MONGO_URI, connectOptions)
  .then(() => {
    console.log("✅ BERHASIL KONEK KE MONGODB!");
    seedData();
    cekProfil();
  })
  .catch((err) => {
    console.error("❌ GAGAL KONEK. Cek Link/Internet Anda.");
    console.error(err);
  });

// --- 5. API ENDPOINTS ---

// --- API PRODUK ---
app.get("/api/produk", async (req, res) => {
  const produk = await Produk.find();
  res.json(produk);
});

app.get("/api/produk/:id", async (req, res) => {
  try {
    const produk = await Produk.findById(req.params.id);
    res.json(produk);
  } catch (e) {
    res.status(404).json({ error: "Not found" });
  }
});

app.post("/api/produk", upload.single("gambar"), async (req, res) => {
  try {
    const produkBaru = new Produk({
      nama: req.body.nama,
      harga: req.body.harga,
      deskripsi: req.body.deskripsi,
      gambar: req.file ? "img/" + req.file.filename : "img/truck.jpg",
    });
    await produkBaru.save();
    res.json({ status: "Sukses", pesan: "Produk ditambah!" });
  } catch (error) {
    res.status(500).json({ error: "Gagal" });
  }
});

app.put("/api/produk/:id", upload.single("gambar"), async (req, res) => {
  try {
    const updateData = {
      nama: req.body.nama,
      harga: req.body.harga,
      deskripsi: req.body.deskripsi,
    };
    if (req.file) updateData.gambar = "img/" + req.file.filename;

    await Produk.findByIdAndUpdate(req.params.id, updateData);
    res.json({ status: "Sukses", pesan: "Produk diupdate!" });
  } catch (error) {
    res.status(500).json({ error: "Gagal" });
  }
});

app.delete("/api/produk/:id", async (req, res) => {
  await Produk.findByIdAndDelete(req.params.id);
  res.json({ status: "Sukses" });
});

// --- API PESAN ---
app.get("/api/pesan", async (req, res) => {
  const pesan = await Pesan.find().sort({ tanggal: -1 });
  res.json(pesan);
});
app.post("/api/pesan", async (req, res) => {
  const pesanBaru = new Pesan(req.body);
  await pesanBaru.save();
  res.json({ status: "Sukses", pesan: "Pesan tersimpan!" });
});
app.delete("/api/pesan/:id", async (req, res) => {
  await Pesan.findByIdAndDelete(req.params.id);
  res.json({ status: "Sukses" });
});

// --- API PROFIL WEB ---
app.get("/api/profil", async (req, res) => {
  const profil = await ProfilWeb.findOne();
  res.json(profil);
});
app.put("/api/profil", async (req, res) => {
  await ProfilWeb.findOneAndUpdate({}, req.body);
  res.json({ status: "Sukses", pesan: "Teks web diupdate!" });
});

// --- ROUTE CADANGAN (SOLUSI VERCEL NOT FOUND) ---
// Jika user buka halaman utama, paksa kirim index.html dari folder public
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// --- BAGIAN PALING BAWAH (PENTING UNTUK VERCEL) ---
if (require.main === module) {
  app.listen(port, () => {
    console.log(`🚀 Server nyala di http://localhost:${port}`);
  });
}

module.exports = app;
