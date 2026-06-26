import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [page, setPage] = useState("home");
  const [adminMenu, setAdminMenu] = useState("dashboard");
  const [bookingStep, setBookingStep] = useState(1);

  const [user, setUser] = useState(null);
  const [kosList, setKosList] = useState([]);
  const [pesananList, setPesananList] = useState([]);
  const [selectedKos, setSelectedKos] = useState(null);
  const [lastOrder, setLastOrder] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    nama: "",
    email: "",
    password: ""
  });

  const [formKos, setFormKos] = useState({
    nama: "",
    harga: "",
    gambar: "",
    status: "Tersedia",
    fasilitas: ""
  });

  const [bookingForm, setBookingForm] = useState({
    nama: "",
    noHp: "",
    tanggalMasuk: "",
    metodePembayaran: "QRIS",
    buktiPembayaran: ""
  });

  const getKos = () => {
    fetch("http://localhost:3000/api/kos")
      .then((res) => res.json())
      .then((data) => setKosList(data))
      .catch((err) => console.log(err));
  };

  const getPesanan = () => {
    fetch("http://localhost:3000/api/pesanan")
      .then((res) => res.json())
      .then((data) => setPesananList(data))
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    getKos();
    getPesanan();
  }, []);

  const login = async (e) => {
    e.preventDefault();

    const res = await fetch("http://localhost:3000/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(loginForm)
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message);
      return;
    }

    setUser(data.user);
    setLoginForm({ email: "", password: "" });

    if (data.user.role === "admin") {
      setPage("admin");
      setAdminMenu("dashboard");
      getPesanan();
    } else {
      setPage("home");
    }

    alert("Login berhasil");
  };

  const register = async (e) => {
    e.preventDefault();

    const res = await fetch("http://localhost:3000/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(registerForm)
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message);
      return;
    }

    alert("Register berhasil, silakan login");
    setRegisterForm({ nama: "", email: "", password: "" });
    setPage("login");
  };

  const logout = () => {
    setUser(null);
    setPage("home");
    alert("Logout berhasil");
  };

  const tambahKos = async (e) => {
    e.preventDefault();

    const dataKos = {
      nama: formKos.nama,
      harga: formKos.harga,
      gambar: formKos.gambar,
      status: formKos.status,
      fasilitas: formKos.fasilitas.split(",").map((item) => item.trim())
    };

    await fetch("http://localhost:3000/api/kos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dataKos)
    });

    setFormKos({
      nama: "",
      harga: "",
      gambar: "",
      status: "Tersedia",
      fasilitas: ""
    });

    getKos();
    alert("Data kos berhasil ditambahkan");
  };

  const hapusKos = async (id) => {
    if (confirm("Yakin ingin menghapus data kos ini?")) {
      await fetch(`http://localhost:3000/api/kos/${id}`, {
        method: "DELETE"
      });

      getKos();
      alert("Data kos berhasil dihapus");
    }
  };

  const kirimBooking = async (e) => {
    e.preventDefault();

    const dataPesanan = {
      idUser: user.id,
      namaUser: user.nama,
      emailUser: user.email,
      idKos: selectedKos.id,
      namaKos: selectedKos.nama,
      harga: selectedKos.harga,
      namaPemesan: bookingForm.nama,
      noHp: bookingForm.noHp,
      tanggalMasuk: bookingForm.tanggalMasuk,
      metodePembayaran: bookingForm.metodePembayaran,
      buktiPembayaran: bookingForm.buktiPembayaran
    };

    const res = await fetch("http://localhost:3000/api/pesanan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dataPesanan)
    });

    const data = await res.json();

    if (!res.ok) {
      alert("Pesanan gagal dikirim");
      return;
    }

    setLastOrder(data.pesanan);
    setBookingForm({
      nama: "",
      noHp: "",
      tanggalMasuk: "",
      metodePembayaran: "QRIS",
      buktiPembayaran: ""
    });

    setBookingStep(1);
    getPesanan();
    setPage("waiting");
  };

  const konfirmasiPembayaran = async (id) => {
    await fetch(`http://localhost:3000/api/pesanan/${id}/konfirmasi`, {
      method: "PUT"
    });

    getPesanan();
    alert("Pembayaran berhasil dikonfirmasi");
  };

  const tolakPembayaran = async (id) => {
    await fetch(`http://localhost:3000/api/pesanan/${id}/tolak`, {
      method: "PUT"
    });

    getPesanan();
    alert("Pembayaran ditolak");
  };

  const downloadLaporan = () => {
    let csv =
      "ID,Nama Pemesan,No HP,Nama Kos,Harga,Tanggal Masuk,Metode Pembayaran,Status Pembayaran\n";

    pesananList.forEach((p) => {
      csv += `${p.id},${p.namaPemesan},${p.noHp},${p.namaKos},${p.harga},${p.tanggalMasuk},${p.metodePembayaran},${p.statusPembayaran}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "laporan-pemesanan-kos.csv";
    a.click();
  };

  return (
    <>
      <nav>
        <div className="logo">Kos Telang Indah</div>

        <div className="menu">
          <button onClick={() => setPage("home")}>Home</button>
          <button onClick={() => setPage("home")}>Daftar Kos</button>

          {!user ? (
            <>
              <button onClick={() => setPage("login")}>Login</button>
              <button onClick={() => setPage("register")}>Register</button>
            </>
          ) : (
            <>
              <span className="user-info">Halo, {user.nama}</span>

              {user.role === "admin" && (
                <button onClick={() => setPage("admin")}>Admin</button>
              )}

              <button onClick={logout}>Logout</button>
            </>
          )}
        </div>
      </nav>

      {page === "home" && (
        <>
          <section className="hero">
            <div className="hero-text">
              <span className="badge">Area Telang Indah</span>
              <h1>Temukan Kos Nyaman di Sekitar Kampus</h1>
              <p>
                Pilih kamar kos sesuai kebutuhanmu, lihat fasilitas, lalu pesan
                secara online dengan pembayaran manual.
              </p>
              <a href="#daftar-kos" className="btn-primary">
                Lihat Kos
              </a>
            </div>

            <div className="hero-card">
              <h3>Kenapa pilih kami?</h3>
              <p>✓ Lokasi dekat kampus</p>
              <p>✓ Data kos dikelola admin</p>
              <p>✓ Booking mudah</p>
              <p>✓ Pembayaran QRIS / Transfer</p>
            </div>
          </section>

          <section className="stats">
            <div>
              <h2>{kosList.length}+</h2>
              <p>Pilihan Kos</p>
            </div>
            <div>
              <h2>4</h2>
              <p>Metode Pembayaran</p>
            </div>
            <div>
              <h2>24 Jam</h2>
              <p>Chatbot Informasi</p>
            </div>
          </section>

          <section id="daftar-kos" className="kos-section">
            <h2>Daftar Kos Tersedia</h2>
            <p className="section-desc">
              Berikut beberapa pilihan kamar kos di Telang Indah.
            </p>

            <div className="kos-grid">
              {kosList.map((kos) => (
                <div className="kos-card" key={kos.id}>
                  <div className="kos-img">
                    {kos.gambar ? (
                      <img src={kos.gambar} alt={kos.nama} />
                    ) : (
                      <span>Foto Kos</span>
                    )}
                  </div>

                  <div className="kos-content">
                    <span className="status">{kos.status}</span>
                    <h3>{kos.nama}</h3>
                    <p>{kos.lokasi}</p>
                    <h4>Rp{kos.harga.toLocaleString("id-ID")} / bulan</h4>

                    <div className="fasilitas">
                      {kos.fasilitas.map((item, index) => (
                        <span key={index}>{item}</span>
                      ))}
                    </div>

                    <button
                      onClick={() => {
                        setSelectedKos(kos);
                        setPage("detail");
                      }}
                    >
                      Detail Kos
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {page === "detail" && selectedKos && (
        <section className="detail-page">
          <button className="back-btn" onClick={() => setPage("home")}>
            ← Kembali
          </button>

          <div className="detail-wrapper">
            <div className="detail-left">
              <div className="detail-photo-main">
                {selectedKos.gambar ? (
                  <img src={selectedKos.gambar} alt={selectedKos.nama} />
                ) : (
                  <span>Foto Kos</span>
                )}
              </div>

              <div className="detail-title">
                <span className="kos-label">Kos Andalan Telang</span>
                <h1>{selectedKos.nama}</h1>

                <div className="detail-meta">
                  <span>Kos Mahasiswa</span>
                  <span>📍 {selectedKos.lokasi}</span>
                  <span>⭐ 4.8</span>
                </div>

                <p className="sisa-kamar">Tersedia kamar</p>
              </div>

              <div className="owner-box">
                <h3>Kos disewakan oleh Admin Kos Telang</h3>
                <p>Online 30 menit yang lalu</p>
              </div>

              <div className="detail-section">
                <h2>Keunggulan Kos</h2>
                <ul>
                  <li>Lokasi dekat area kampus</li>
                  <li>Pembayaran bisa melalui QRIS, BRI, BCA, dan BNI</li>
                  <li>Data kos dikelola langsung oleh admin</li>
                  <li>Booking kamar dilakukan secara online</li>
                </ul>
              </div>

              <div className="detail-section">
                <h2>Fasilitas</h2>
                <div className="facility-list">
                  {selectedKos.fasilitas.map((item, index) => (
                    <span key={index}>{item}</span>
                  ))}
                </div>
              </div>

              <div className="detail-section">
                <h2>Deskripsi</h2>
                <p>
                  {selectedKos.nama} berada di kawasan Telang Indah dan cocok
                  untuk mahasiswa karena dekat dengan kampus, tempat makan, dan
                  fasilitas umum.
                </p>
              </div>
            </div>

            <div className="detail-right">
              <div className="booking-card">
                <h2>Rp{selectedKos.harga.toLocaleString("id-ID")}</h2>
                <p>/ bulan</p>

                <button className="chat-owner" onClick={() => setChatOpen(true)}>
                  Tanya Admin
                </button>

                <button
                  className="rent-btn"
                  onClick={() => {
                    if (!user) {
                      alert("Silakan login terlebih dahulu.");
                      setPage("login");
                      return;
                    }

                    setBookingStep(1);
                    setPage("booking");
                  }}
                >
                  Pesan Sekarang
                </button>

                <small>
                  Pembayaran dilakukan manual melalui QRIS, BRI, BCA, atau BNI.
                </small>
              </div>
            </div>
          </div>
        </section>
      )}

      {chatOpen && (
        <div className="chat-popup">
          <div className="chat-box">
            <div className="chat-header">
              <h3>Chat Admin</h3>
              <button onClick={() => setChatOpen(false)}>X</button>
            </div>

            <div className="chat-body">
              <p className="admin-chat">Halo, ada yang bisa kami bantu?</p>
              <p className="admin-chat">
                Kos ini masih tersedia. Kamu bisa klik Pesan Sekarang untuk
                booking kamar.
              </p>
            </div>

            <div className="chat-input">
              <input type="text" placeholder="Ketik pertanyaan..." />
              <button>Kirim</button>
            </div>
          </div>
        </div>
      )}

      {page === "booking" && selectedKos && (
        <section className="booking-page">
          <div className="booking-form-card">
            <h1>Form Pemesanan Kos</h1>
            <p>{selectedKos.nama}</p>

            {bookingStep === 1 && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setBookingStep(2);
                }}
              >
                <label>Nama Lengkap</label>
                <input
                  type="text"
                  value={bookingForm.nama}
                  onChange={(e) =>
                    setBookingForm({ ...bookingForm, nama: e.target.value })
                  }
                  required
                />

                <label>No HP</label>
                <input
                  type="text"
                  value={bookingForm.noHp}
                  onChange={(e) =>
                    setBookingForm({ ...bookingForm, noHp: e.target.value })
                  }
                  required
                />

                <label>Tanggal Masuk</label>
                <input
                  type="date"
                  value={bookingForm.tanggalMasuk}
                  onChange={(e) =>
                    setBookingForm({
                      ...bookingForm,
                      tanggalMasuk: e.target.value
                    })
                  }
                  required
                />

                <label>Metode Pembayaran</label>
                <div className="payment-options">
                  {["QRIS", "BRI", "BCA", "BNI"].map((metode) => (
                    <div
                      key={metode}
                      className={
                        bookingForm.metodePembayaran === metode
                          ? "payment-card active"
                          : "payment-card"
                      }
                      onClick={() =>
                        setBookingForm({
                          ...bookingForm,
                          metodePembayaran: metode
                        })
                      }
                    >
                      <input
                        type="radio"
                        checked={bookingForm.metodePembayaran === metode}
                        readOnly
                      />
                      <div className="payment-logo">{metode}</div>
                    </div>
                  ))}
                </div>

                <button type="submit">Next</button>
              </form>
            )}

            {bookingStep === 2 && (
              <div className="payment-page">
                <button
                  className="back-btn-payment"
                  onClick={() => setBookingStep(1)}
                >
                  ← Kembali
                </button>

                <h2>Pembayaran {bookingForm.metodePembayaran}</h2>

                <div className="payment-summary">
                  <p>
                    <b>Nama Kos:</b> {selectedKos.nama}
                  </p>
                  <p>
                    <b>Nama Pemesan:</b> {bookingForm.nama}
                  </p>
                  <p>
                    <b>Total:</b> Rp{selectedKos.harga.toLocaleString("id-ID")}
                  </p>
                  <p>
                    <b>Metode:</b> {bookingForm.metodePembayaran}
                  </p>
                </div>

                {bookingForm.metodePembayaran === "QRIS" ? (
                  <div className="qris-box">
                    <h3>Scan QR Code</h3>
                    <p>Gunakan aplikasi E-Wallet atau Mobile Banking.</p>
                    <div className="qr-code">QRIS</div>
                  </div>
                ) : (
                  <div className="rekening-box">
                    <h3>Nomor Rekening</h3>

                    {bookingForm.metodePembayaran === "BRI" && (
                      <>
                        <p>Bank BRI</p>
                        <h2>1234567890</h2>
                        <p>a.n Admin Kos Telang</p>
                      </>
                    )}

                    {bookingForm.metodePembayaran === "BCA" && (
                      <>
                        <p>Bank BCA</p>
                        <h2>9876543210</h2>
                        <p>a.n Admin Kos Telang</p>
                      </>
                    )}

                    {bookingForm.metodePembayaran === "BNI" && (
                      <>
                        <p>Bank BNI</p>
                        <h2>1122334455</h2>
                        <p>a.n Admin Kos Telang</p>
                      </>
                    )}
                  </div>
                )}

                <form onSubmit={kirimBooking}>
                  <label>Upload Bukti Pembayaran</label>
                  <input
                    type="file"
                    onChange={(e) =>
                      setBookingForm({
                        ...bookingForm,
                        buktiPembayaran: e.target.files[0]?.name
                      })
                    }
                    required
                  />

                  <button type="submit">Kirim Bukti Pembayaran</button>
                </form>
              </div>
            )}
          </div>
        </section>
      )}

      {page === "waiting" && lastOrder && (
        <section className="waiting-page">
          <div className="waiting-card">
            <h1>Menunggu Verifikasi Admin</h1>
            <div className="loader"></div>
            <p>Bukti pembayaran kamu sudah kami terima.</p>
            <p>Silakan tunggu, admin sedang memverifikasi pembayaran.</p>
            <h3>ID Order: {lastOrder.id}</h3>
            <small>Halaman ini akan diperbarui setelah admin konfirmasi.</small>
            <button onClick={() => setPage("home")}>Kembali ke Home</button>
          </div>
        </section>
      )}

      {page === "login" && (
        <section className="auth-page">
          <div className="auth-card">
            <h1>Login</h1>
            <p>Masuk ke akun Kos Telang Indah.</p>

            <form onSubmit={login}>
              <label>Email</label>
              <input
                type="email"
                value={loginForm.email}
                onChange={(e) =>
                  setLoginForm({ ...loginForm, email: e.target.value })
                }
                required
              />

              <label>Password</label>
              <input
                type="password"
                value={loginForm.password}
                onChange={(e) =>
                  setLoginForm({ ...loginForm, password: e.target.value })
                }
                required
              />

              <button type="submit">Login</button>
            </form>

            <p className="auth-link">
              Belum punya akun?{" "}
              <span onClick={() => setPage("register")}>Register</span>
            </p>
          </div>
        </section>
      )}

      {page === "register" && (
        <section className="auth-page">
          <div className="auth-card">
            <h1>Register</h1>
            <p>Buat akun untuk melakukan pemesanan kos.</p>

            <form onSubmit={register}>
              <label>Nama Lengkap</label>
              <input
                type="text"
                value={registerForm.nama}
                onChange={(e) =>
                  setRegisterForm({ ...registerForm, nama: e.target.value })
                }
                required
              />

              <label>Email</label>
              <input
                type="email"
                value={registerForm.email}
                onChange={(e) =>
                  setRegisterForm({ ...registerForm, email: e.target.value })
                }
                required
              />

              <label>Password</label>
              <input
                type="password"
                value={registerForm.password}
                onChange={(e) =>
                  setRegisterForm({
                    ...registerForm,
                    password: e.target.value
                  })
                }
                required
              />

              <button type="submit">Register</button>
            </form>

            <p className="auth-link">
              Sudah punya akun?{" "}
              <span onClick={() => setPage("login")}>Login</span>
            </p>
          </div>
        </section>
      )}

      {page === "admin" && user?.role === "admin" && (
        <section className="admin-panel">
          <aside className="admin-sidebar">
            <h2>Admin Kos</h2>
            <p>{user.nama}</p>

            <button onClick={() => setAdminMenu("dashboard")}>Dashboard</button>
            <button onClick={() => setAdminMenu("kost")}>Kelola Kost</button>
            <button onClick={() => setAdminMenu("pembayaran")}>
              Kelola Pembayaran
            </button>
            <button onClick={() => setAdminMenu("pemesanan")}>
              Kelola Pemesanan
            </button>
            <button onClick={logout}>Logout</button>
          </aside>

          <main className="admin-content">
            {adminMenu === "dashboard" && (
              <>
                <h1>Dashboard Admin</h1>

                <div className="admin-stats">
                  <div>
                    <h3>Jumlah Kost</h3>
                    <h2>{kosList.length}</h2>
                  </div>
                  <div>
                    <h3>Total Pesanan</h3>
                    <h2>{pesananList.length}</h2>
                  </div>
                  <div>
                    <h3>Pembayaran Menunggu</h3>
                    <h2>
                      {
                        pesananList.filter(
                          (p) =>
                            p.statusPembayaran ===
                            "Menunggu Verifikasi Admin"
                        ).length
                      }
                    </h2>
                  </div>
                </div>

                <div className="admin-welcome">
                  <h2>Selamat datang di Panel Admin</h2>
                  <p>Dari sini admin dapat:</p>
                  <ul>
                    <li>Mengelola data kost</li>
                    <li>Memverifikasi pembayaran user</li>
                    <li>Melihat riwayat pemesanan</li>
                    <li>Mengunduh laporan pemesanan</li>
                  </ul>
                </div>
              </>
            )}

            {adminMenu === "kost" && (
              <>
                <h1>Kelola Kost</h1>

                <div className="admin-layout">
                  <form className="admin-form" onSubmit={tambahKos}>
                    <h2>Tambah Data Kos</h2>

                    <label>Nama Kos</label>
                    <input
                      type="text"
                      value={formKos.nama}
                      onChange={(e) =>
                        setFormKos({ ...formKos, nama: e.target.value })
                      }
                      required
                    />

                    <label>Harga</label>
                    <input
                      type="number"
                      value={formKos.harga}
                      onChange={(e) =>
                        setFormKos({ ...formKos, harga: e.target.value })
                      }
                      required
                    />

                    <label>Link Gambar</label>
                    <input
                      type="text"
                      value={formKos.gambar}
                      onChange={(e) =>
                        setFormKos({ ...formKos, gambar: e.target.value })
                      }
                      placeholder="Masukkan URL gambar"
                    />

                    <label>Fasilitas</label>
                    <input
                      type="text"
                      value={formKos.fasilitas}
                      onChange={(e) =>
                        setFormKos({ ...formKos, fasilitas: e.target.value })
                      }
                      placeholder="Kasur, Lemari, WiFi"
                      required
                    />

                    <label>Status</label>
                    <select
                      value={formKos.status}
                      onChange={(e) =>
                        setFormKos({ ...formKos, status: e.target.value })
                      }
                    >
                      <option value="Tersedia">Tersedia</option>
                      <option value="Penuh">Penuh</option>
                    </select>

                    <button type="submit">Tambah Kos</button>
                  </form>

                  <div className="admin-table">
                    <h2>Data Kos</h2>

                    <table>
                      <thead>
                        <tr>
                          <th>Nama</th>
                          <th>Harga</th>
                          <th>Status</th>
                          <th>Aksi</th>
                        </tr>
                      </thead>

                      <tbody>
                        {kosList.map((kos) => (
                          <tr key={kos.id}>
                            <td>{kos.nama}</td>
                            <td>Rp{kos.harga.toLocaleString("id-ID")}</td>
                            <td>{kos.status}</td>
                            <td>
                              <button
                                className="btn-delete"
                                onClick={() => hapusKos(kos.id)}
                              >
                                Hapus
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {adminMenu === "pembayaran" && (
              <>
                <h1>Kelola Pembayaran</h1>

                <div className="admin-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Nama</th>
                        <th>Kos</th>
                        <th>Metode</th>
                        <th>Bukti</th>
                        <th>Status</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>

                    <tbody>
                      {pesananList.map((p) => (
                        <tr key={p.id}>
                          <td>{p.namaPemesan}</td>
                          <td>{p.namaKos}</td>
                          <td>{p.metodePembayaran}</td>
                          <td>
                            {p.buktiPembayaran ? (
                              <button
                                className="btn-view"
                                onClick={() =>
                                  alert(`Bukti pembayaran: ${p.buktiPembayaran}`)
                                }
                              >
                                Lihat Bukti
                              </button>
                            ) : (
                              "Belum ada bukti"
                            )}
                          </td>
                          <td>{p.statusPembayaran}</td>
                          <td>
                            <button
                              className="btn-confirm"
                              onClick={() => konfirmasiPembayaran(p.id)}
                            >
                              Konfirmasi
                            </button>
                            <button
                              className="btn-delete"
                              onClick={() => tolakPembayaran(p.id)}
                            >
                              Tolak
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {adminMenu === "pemesanan" && (
              <>
                <h1>Kelola Pemesanan</h1>

                <button className="download-btn" onClick={downloadLaporan}>
                  Download Laporan CSV
                </button>

                <div className="admin-stats">
                  <div>
                    <h3>Total Pesanan</h3>
                    <h2>{pesananList.length}</h2>
                  </div>
                  <div>
                    <h3>Dikonfirmasi</h3>
                    <h2>
                      {
                        pesananList.filter(
                          (p) => p.statusPemesanan === "Dikonfirmasi"
                        ).length
                      }
                    </h2>
                  </div>
                  <div>
                    <h3>Menunggu</h3>
                    <h2>
                      {
                        pesananList.filter(
                          (p) => p.statusPemesanan === "Menunggu Konfirmasi"
                        ).length
                      }
                    </h2>
                  </div>
                </div>

                <div className="admin-table">
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Nama Pemesan</th>
                        <th>No HP</th>
                        <th>Kos</th>
                        <th>Tanggal Masuk</th>
                        <th>Status</th>
                      </tr>
                    </thead>

                    <tbody>
                      {pesananList.map((p) => (
                        <tr key={p.id}>
                          <td>{p.id}</td>
                          <td>{p.namaPemesan}</td>
                          <td>{p.noHp}</td>
                          <td>{p.namaKos}</td>
                          <td>{p.tanggalMasuk}</td>
                          <td>{p.statusPemesanan}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </main>
        </section>
      )}
    </>
  );
}

export default App;