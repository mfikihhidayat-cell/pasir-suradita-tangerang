// Toggle class active untuk Hamburger Menu
const navbarNav = document.querySelector(".navbar-nav");
document.querySelector("#hamburger-menu").onclick = () => {
  navbarNav.classList.toggle("active");
};

// Klik di luar sidebar untuk menghilangkan nav
const hamburger = document.querySelector("#hamburger-menu");
document.addEventListener("click", function (e) {
  if (!hamburger.contains(e.target) && !navbarNav.contains(e.target)) {
    navbarNav.classList.remove("active");
  }
});

// --- FUNGSI 1: LOAD PRODUK (DENGAN POPUP) ---
async function loadProducts() {
  const container = document.getElementById("list-produk");
  try {
    const response = await fetch("/api/produk");
    const data = await response.json();

    let cards = "";
    data.forEach((item) => {
      // PERHATIKAN: Ada onclick="lihatDetail(...)" saat gambar diklik
      cards += `
            <div class="produk-card">
                <div class="produk-image" onclick="lihatDetail('${item._id}')" style="cursor: pointer;">
                     <img src="${item.gambar}" alt="${item.nama}" class="produk-card-img" />
                </div>
                <h3 class="produk-card-title">- ${item.nama} -</h3>
                <p class="produk-card-price">${item.harga}</p>
                <div style="text-align:center; margin-top:5px;">
                   <small onclick="lihatDetail('${item._id}')" style="color:var(--primary); cursor:pointer;">Lihat Detail</small>
                </div>
            </div>
            `;
    });

    container.innerHTML = cards;
  } catch (error) {
    console.error("Gagal load produk:", error);
  }
}

// --- FUNGSI BARU: LOGIKA POPUP (MODAL) ---
async function lihatDetail(id) {
  try {
    // Ambil data detail dari server
    const res = await fetch(`/api/produk/${id}`);
    const produk = await res.json();

    // Isi data ke dalam kotak Modal HTML
    document.getElementById("modal-img").src = produk.gambar;
    document.getElementById("modal-title").innerText = produk.nama;
    document.getElementById("modal-price").innerText = produk.harga;

    // Tampilkan deskripsi (kalau kosong, tulis default)
    document.getElementById("modal-desc").innerText =
      produk.deskripsi || "Deskripsi belum tersedia.";

    // Setting Link Tombol WA di dalam Modal
    // GANTI NOMOR WA DI SINI (Pakai 62)
    const nomorAdmin = "6281234567890";
    const pesan =
      `Halo Admin, saya mau pesan produk ini:%0A` +
      `*${produk.nama}* - ${produk.harga}%0A` +
      `Mohon infonya.`;

    document.getElementById(
      "modal-wa"
    ).href = `https://wa.me/${nomorAdmin}?text=${pesan}`;

    // Munculkan Modal
    document.getElementById("modal-detail").style.display = "flex";
  } catch (error) {
    console.log("Gagal ambil detail:", error);
  }
}

// Fungsi Tutup Modal (Tombol X)
function tutupModal() {
  document.getElementById("modal-detail").style.display = "none";
}

// Fungsi Tutup Modal (Klik di luar kotak putih)
window.onclick = function (e) {
  const modal = document.getElementById("modal-detail");
  if (e.target == modal) {
    modal.style.display = "none";
  }
};

// --- FUNGSI 2: LOAD PROFIL WEB ---
async function loadProfilWeb() {
  try {
    const res = await fetch("/api/profil");
    const data = await res.json();

    if (data) {
      document.getElementById("hero-title").innerHTML = data.judulHero;
      document.getElementById("hero-desc").innerText = data.deskripsiHero;
      document.getElementById("about-text").innerText = data.tentangKami;
    }
  } catch (error) {
    console.log("Gagal load profil web");
  }
}

// --- FUNGSI 3: KIRIM PESAN KONTAK + WHATSAPP ---
document.getElementById("form-kontak").addEventListener("submit", async (e) => {
  e.preventDefault();
  const nama = document.getElementById("nama").value;
  const email = document.getElementById("email").value;
  const nohp = document.getElementById("nohp").value;

  const dataKirim = { nama, email, nohp };

  try {
    // Simpan ke database
    await fetch("/api/pesan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dataKirim),
    });

    // Buka WhatsApp
    // GANTI NOMOR WA DI SINI JUGA
    const nomorAdmin = "6281234567890";
    const pesanWA =
      `Halo Admin Toko Pasir, saya mau pesan/tanya:%0A%0A` +
      `Nama: ${nama}%0A` +
      `Email: ${email}%0A` +
      `No HP: ${nohp}%0A%0A` +
      `Mohon infonya.`;

    const linkWA = `https://wa.me/${nomorAdmin}?text=${pesanWA}`;
    window.open(linkWA, "_blank");

    document.getElementById("form-kontak").reset();
  } catch (error) {
    alert("Gagal memproses.");
  }
});

// Jalankan saat web dibuka
document.addEventListener("DOMContentLoaded", () => {
  loadProducts();
  loadProfilWeb();
});
