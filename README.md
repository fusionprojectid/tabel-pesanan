# Aplikasi Formulir Pesanan - v4.5.6

Selamat datang di repositori Aplikasi Formulir Pesanan Tritunggal Lancar. Ini adalah aplikasi web komprehensif yang dirancang untuk menyederhanakan proses pencatatan, rekapitulasi, dan kalkulasi pesanan merchandise secara efisien, akurat, dan tersinkronisasi.

---

### Daftar Isi

1.  [Tampilan Aplikasi](#tampilan-aplikasi)
2.  [Deskripsi Proyek](#deskripsi-proyek)
3.  [Fitur Utama](#fitur-utama)
4.  [Teknologi yang Digunakan](#teknologi-yang-digunakan)
5.  [Struktur Proyek](#struktur-proyek)
6.  [Instalasi dan Penggunaan](#instalasi-dan-penggunaan)
7.  [Cara Kerja Aplikasi](#cara-kerja-aplikasi)
8.  [Kredit](#kredit)

---

## Tampilan Aplikasi

Antarmuka aplikasi dirancang agar bersih, modern, dan responsif, dengan dukungan tema terang dan gelap.

| Halaman Input Pesanan (Tema Terang) | Halaman Rekapitulasi (Tema Gelap) | Modal Konfirmasi |
| :---: | :---: | :---: |
| ![Tampilan Input Pesanan](https://placehold.co/600x400/f8fafc/4b271b?text=Halaman+Input+Pesanan) | ![Tampilan Rekapitulasi Hasil](https://placehold.co/600x400/18110e/fef3c7?text=Rekapitulasi+Hasil) | ![Tampilan Modal Dialog](https://placehold.co/600x400/f8fafc/4b271b?text=Modal+Dialog) |

---

## Deskripsi Proyek

Aplikasi ini dibangun sebagai **Progressive Web App (PWA)** yang berjalan di browser namun dapat di-install pada perangkat mobile seperti aplikasi native. Aplikasi ini menggunakan **Google Sheets sebagai database pusat** melalui Google Apps Script, dengan `localStorage` browser sebagai cache untuk **kemampuan offline yang andal**.

Tujuan utamanya adalah untuk menggantikan pencatatan manual, mengurangi kesalahan perhitungan, dan menyediakan satu sumber data yang tersinkronisasi untuk semua pesanan.

---

## Fitur Utama

- 🧾 **Form Input Dinamis**: Form cerdas yang menampilkan opsi relevan (seperti bahan atau ukuran) berdasarkan jenis barang.
- 🧮 **Kalkulasi Harga Real-time**: Harga satuan ditampilkan secara langsung saat pengguna memilih opsi.
- 🌐 **Sinkronisasi Google Sheets**: Semua data pesanan (tambah, hapus item, hapus grup, hapus semua) disinkronkan secara *real-time* dengan Google Sheet, menjadikannya database pusat yang bisa diakses di mana saja.
- 💾 **Penyimpanan Lokal & Mode Offline**: `localStorage` digunakan sebagai cache. Jika koneksi gagal, data tetap tersimpan aman di perangkat dan aplikasi tetap fungsional menggunakan data harga cadangan.
- 📱 **Progressive Web App (PWA)**: Dapat di-install di layar utama ponsel, memberikan pengalaman seperti aplikasi native dan kemampuan berjalan secara offline.
- 📊 **Rekapitulasi Interaktif**:
    - Data pesanan dikelompokkan berdasarkan nama pemesan.
    - Opsi untuk **mengubah jumlah** atau **menghapus item individual** (tersinkronisasi).
    - Opsi untuk **menghapus semua pesanan** dari satu pemesan (tersinkronisasi).
- 🔍 **Fungsi Pencarian & Filter**: Memfilter rekapitulasi secara instan berdasarkan nama, barang, atau kategori.
- 🎨 **Tema Terang & Gelap**: Tombol *toggle* untuk beralih tema dengan preferensi yang tersimpan.
- 📤 **Fitur Ekspor Lengkap**:
    - **WhatsApp**, **Email**, **Excel (.xlsx)**, dan **PDF profesional**.
    - Cetak **Struk Thermal (PDF)** individual per pesanan, lengkap dengan logo.
- 🛠️ **Manajemen Data**: Tombol untuk mengosongkan semua data pesanan di aplikasi dan Google Sheet secara bersamaan.
- ℹ️ **Halaman Informasi**: Halaman kontak dan lokasi dengan peta Google Maps terintegrasi.

---

## Teknologi yang Digunakan

-   **Frontend**:
    -   **HTML5**: Struktur semantik untuk konten.
    -   **Tailwind CSS**: *Framework* CSS untuk desain yang cepat dan responsif (via CDN).
    -   **Vanilla CSS**: *Custom styling* dan *theming* dengan CSS Variables.
    -   **Vanilla JavaScript (ES6+)**: Menangani semua logika aplikasi, manipulasi DOM, dan interaksi pengguna.
-   **Backend**:
    -   **Google Sheets**: Berfungsi sebagai database utama untuk menyimpan data pesanan dan daftar harga.
    -   **Google Apps Script**: Bertindak sebagai *backend* sederhana untuk mengelola operasi CRUD (Create, Read, Update, Delete) pada Google Sheet.
-   **Fitur PWA**:
    -   **Manifest.json**: Mendefinisikan metadata aplikasi untuk instalasi.
    -   **Service Worker**: Mengelola caching untuk fungsionalitas offline.
-   **Library Eksternal**:
    -   **SheetJS (xlsx.js)**: Untuk fungsionalitas ekspor ke Excel.
    -   **jsPDF & jsPDF-AutoTable**: Untuk fungsionalitas ekspor ke PDF.

---

## Struktur Proyek

Proyek ini disusun dengan rapi untuk memisahkan struktur (HTML), gaya (CSS), logika (JS), dan aset.

```
/
/
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── script.js
│   ├── prices.json      # Backup harga untuk mode offline.
│   ├── manifest.json
│   └── sw.js            # Service Worker untuk PWA.
└── assets/
├── logo-warna.png
├── logo-bw.png
└── icons/
└── android-chrome-192x192.png
└── ... (file ikon lainnya)
```

---

## Instalasi dan Penggunaan

Karena ini adalah PWA, cara terbaik untuk menjalankannya adalah melalui web server.

1.  Letakkan semua file dan folder proyek di *root* direktori sebuah web server.
2.  Akses alamat server tersebut melalui browser.
3.  Untuk penggunaan lokal, Anda bisa menggunakan server pengembangan sederhana seperti "Live Server" di Visual Studio Code.

**Catatan**: Menjalankan melalui server (bukan membuka `index.html` langsung) diperlukan agar Service Worker (fitur offline PWA) dapat berfungsi dengan benar karena kebijakan keamanan browser.

---

## Cara Kerja Aplikasi

### Alur Data
Aplikasi ini menggunakan Google Sheet sebagai *single source of truth* (sumber data utama).

1.  **Memuat Data**: Saat aplikasi dibuka, ia mengambil daftar pesanan dan harga terbaru dari Google Sheet. Jika gagal, ia akan menggunakan data dari `localStorage` dan `prices.json`.
2.  **Modifikasi Data**: Setiap kali pengguna menambah, menghapus, atau mengosongkan data, aplikasi mengirim perintah ke Google Apps Script.
3.  **Update Server**: Google Apps Script memperbarui data di dalam Google Sheet.
4.  **Update Lokal**: Jika pembaruan di server berhasil, aplikasi kemudian memperbarui data yang ada di `localStorage` agar tetap sinkron.

---

## Kredit

-   **Pengembang**: ArkIntelligent ([Facebook](https://www.facebook.com/artcow))
-   **Pemilik Proyek**: Tritunggal Lancar ([Instagram](https://www.instagram.com/ttl_workshop/))
