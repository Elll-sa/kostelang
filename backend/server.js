const express = require("express");
const fs = require("fs");
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const dbPath = "./data/database.json";

function readDB() {
  return JSON.parse(fs.readFileSync(dbPath));
}

function writeDB(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

app.get("/", (req, res) => {
  res.send("Backend Kos Telang Indah berjalan");
});

// GET DATA KOS
app.get("/api/kos", (req, res) => {
  const db = readDB();
  res.json(db.kos);
});

// REGISTER
app.post("/api/register", (req, res) => {
  const db = readDB();
  const { nama, email, password } = req.body;

  const userAda = db.users.find((user) => user.email === email);

  if (userAda) {
    return res.status(400).json({ message: "Email sudah terdaftar" });
  }

  const userBaru = {
    id: Date.now(),
    nama,
    email,
    password,
    role: "user"
  };

  db.users.push(userBaru);
  writeDB(db);

  res.json({ message: "Register berhasil", user: userBaru });
});

// LOGIN
app.post("/api/login", (req, res) => {
  const db = readDB();
  const { email, password } = req.body;

  const user = db.users.find(
    (u) => u.email === email && u.password === password
  );

  if (!user) {
    return res.status(401).json({ message: "Email atau password salah" });
  }

  res.json({
    message: "Login berhasil",
    user
  });
});

// TAMBAH KOS
app.post("/api/kos", (req, res) => {
  const db = readDB();

  const kosBaru = {
    id: Date.now(),
    nama: req.body.nama,
    harga: Number(req.body.harga),
    lokasi: "Telang Indah",
    fasilitas: req.body.fasilitas,
    gambar: req.body.gambar,
    status: req.body.status || "Tersedia"
  };

  db.kos.push(kosBaru);
  writeDB(db);

  res.json({ message: "Kos berhasil ditambahkan", kos: kosBaru });
});

// HAPUS KOS
app.delete("/api/kos/:id", (req, res) => {
  const db = readDB();

  db.kos = db.kos.filter((kos) => kos.id != req.params.id);

  writeDB(db);

  res.json({ message: "Kos berhasil dihapus" });
});

// EDIT KOS
app.put("/api/kos/:id", (req, res) => {
  const db = readDB();

  const index = db.kos.findIndex((kos) => kos.id == req.params.id);

  if (index === -1) {
    return res.status(404).json({ message: "Data kos tidak ditemukan" });
  }

  db.kos[index] = {
    ...db.kos[index],
    nama: req.body.nama,
    harga: Number(req.body.harga),
    lokasi: "Telang Indah",
    fasilitas: req.body.fasilitas,
    gambar: req.body.gambar,
    status: req.body.status
  };

  writeDB(db);

  res.json({ message: "Kos berhasil diedit", kos: db.kos[index] });
});

// TAMBAH PESANAN
app.post("/api/pesanan", (req, res) => {
  const db = readDB();

  if (!db.pesanan) {
    db.pesanan = [];
  }

  const pesananBaru = {
    id: Date.now(),
    idUser: req.body.idUser,
    namaUser: req.body.namaUser,
    emailUser: req.body.emailUser,
    idKos: req.body.idKos,
    namaKos: req.body.namaKos,
    harga: Number(req.body.harga),
    namaPemesan: req.body.namaPemesan,
    noHp: req.body.noHp,
    tanggalMasuk: req.body.tanggalMasuk,
    metodePembayaran: req.body.metodePembayaran,
    buktiPembayaran: req.body.buktiPembayaran,
    statusPemesanan: "Menunggu Konfirmasi",
    statusPembayaran: "Menunggu Verifikasi Admin",
    tanggalPesan: new Date().toLocaleString("id-ID")
  };

  db.pesanan.push(pesananBaru);
  writeDB(db);

  res.json({
    message: "Pesanan berhasil dikirim",
    pesanan: pesananBaru
  });
});

// GET SEMUA PESANAN
app.get("/api/pesanan", (req, res) => {
  const db = readDB();
  res.json(db.pesanan || []);
});

// GET PESANAN BERDASARKAN USER
app.get("/api/pesanan/user/:idUser", (req, res) => {
  const db = readDB();

  const pesananUser = (db.pesanan || []).filter(
    (pesanan) => pesanan.idUser == req.params.idUser
  );

  res.json(pesananUser);
});

// KONFIRMASI PEMBAYARAN
app.put("/api/pesanan/:id/konfirmasi", (req, res) => {
  const db = readDB();

  const index = db.pesanan.findIndex(
    (pesanan) => pesanan.id == req.params.id
  );

  if (index === -1) {
    return res.status(404).json({ message: "Pesanan tidak ditemukan" });
  }

  db.pesanan[index].statusPemesanan = "Dikonfirmasi";
  db.pesanan[index].statusPembayaran = "Pembayaran Berhasil";

  writeDB(db);

  res.json({
    message: "Pembayaran berhasil dikonfirmasi",
    pesanan: db.pesanan[index]
  });
});

// TOLAK PEMBAYARAN
app.put("/api/pesanan/:id/tolak", (req, res) => {
  const db = readDB();

  const index = db.pesanan.findIndex(
    (pesanan) => pesanan.id == req.params.id
  );

  if (index === -1) {
    return res.status(404).json({ message: "Pesanan tidak ditemukan" });
  }

  db.pesanan[index].statusPemesanan = "Ditolak";
  db.pesanan[index].statusPembayaran = "Pembayaran Ditolak";

  writeDB(db);

  res.json({
    message: "Pembayaran ditolak",
    pesanan: db.pesanan[index]
  });
});

app.listen(PORT, () => {
  console.log(`Backend berjalan di http://localhost:${PORT}`);
});
// GET SEMUA PESANAN
app.get("/api/pesanan", (req, res) => {
  const db = readDB();
  res.json(db.pesanan || []);
});

// TAMBAH PESANAN
app.post("/api/pesanan", (req, res) => {
  const db = readDB();

  const pesananBaru = {
    id: Date.now(),
    idUser: req.body.idUser,
    namaUser: req.body.namaUser,
    emailUser: req.body.emailUser,
    idKos: req.body.idKos,
    namaKos: req.body.namaKos,
    harga: Number(req.body.harga),
    namaPemesan: req.body.namaPemesan,
    noHp: req.body.noHp,
    tanggalMasuk: req.body.tanggalMasuk,
    metodePembayaran: req.body.metodePembayaran,
    buktiPembayaran: req.body.buktiPembayaran,
    statusPemesanan: "Menunggu Konfirmasi",
    statusPembayaran: "Menunggu Verifikasi Admin",
    tanggalPesan: new Date().toLocaleString("id-ID")
  };

  db.pesanan.push(pesananBaru);
  writeDB(db);

  res.json({
    message: "Pesanan berhasil dikirim",
    pesanan: pesananBaru
  });
});