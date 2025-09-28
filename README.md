# Aplikasi Formulir Pesanan - Tritunggal Lancar

Selamat datang di repositori Aplikasi Formulir Pesanan Tritunggal Lancar. Ini adalah aplikasi web *client-side* yang komprehensif, dirancang untuk menyederhanakan proses pencatatan, rekapitulasi, dan kalkulasi pesanan merchandise secara efisien dan akurat.

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

Aplikasi ini dibangun sebagai solusi *frontend* mandiri yang berjalan sepenuhnya di browser. Tidak ada ketergantungan pada backend atau database, membuatnya sangat cepat, portabel, dan dapat diakses secara offline (setelah pemuatan awal). Semua data pesanan disimpan dengan aman di `localStorage` browser pengguna, memastikan data tidak hilang saat halaman ditutup atau dimuat ulang.

Tujuan utamanya adalah untuk menggantikan pencatatan manual, mengurangi kesalahan perhitungan, dan mempercepat proses pembuatan rekapitulasi untuk pelanggan.

---

## Fitur Utama

- 🧾 **Form Input Dinamis**: Form input cerdas yang menampilkan opsi relevan (seperti bahan atau ukuran) berdasarkan jenis barang yang dipilih.
- 🧮 **Kalkulasi Harga Real-time**: Harga satuan ditampilkan secara langsung saat pengguna memilih opsi, memberikan transparansi instan.
- 💾 **Penyimpanan Lokal Otomatis**: Setiap pesanan yang ditambahkan, diubah, atau dihapus akan otomatis tersimpan di `localStorage`.
- 📊 **Rekapitulasi Interaktif**:
    - Menampilkan data pesanan yang dikelompokkan berdasarkan nama pemesan.
    - Opsi untuk **mengubah jumlah** atau **menghapus item individual**.
    - Opsi untuk **menghapus semua pesanan** dari satu pemesan sekaligus.
- 🔍 **Fungsi Pencarian**: Memfilter rekapitulasi pesanan secara instan berdasarkan nama pemesan atau jenis barang.
- 🎨 **Tema Terang & Gelap**: Tombol *toggle* untuk beralih antara tema terang dan gelap, dengan preferensi yang tersimpan di `localStorage`.
- 📤 **Fitur Ekspor Lengkap**: Bagikan atau arsipkan data rekapitulasi dengan mudah melalui:
    - **WhatsApp**: Membuat pesan pre-format untuk dikirim.
    - **Email**: Membuka aplikasi email default dengan rekapitulasi di *body*.
    - **Excel (.xlsx)**: Mengekspor data ke dalam format spreadsheet dengan *library* SheetJS.
    - **PDF**: Menghasilkan dokumen PDF profesional dengan *library* jsPDF dan jsPDF-AutoTable.
- 🛠️ **Manajemen Data**: Tombol untuk mengosongkan semua data pesanan dengan aman melalui dialog konfirmasi.
- ℹ️ **Halaman Informasi**: Halaman kontak dan lokasi yang informatif dengan peta Google Maps terintegrasi.

---

## Teknologi yang Digunakan

-   **Frontend**:
    -   **HTML5**: Struktur semantik untuk konten.
    -   **Tailwind CSS**: *Framework* CSS untuk desain yang cepat dan responsif (dimuat via CDN).
    -   **Vanilla CSS**: *Custom styling* dan *theming* dengan CSS Variables.
    -   **Vanilla JavaScript (ES6+)**: Menangani semua logika aplikasi, manipulasi DOM, dan interaksi pengguna.
-   **Library Eksternal**:
    -   **SheetJS (xlsx.js)**: Untuk fungsionalitas ekspor ke Excel.
    -   **jsPDF & jsPDF-AutoTable**: Untuk fungsionalitas ekspor ke PDF.

---

## Struktur Proyek

Proyek ini disusun dengan memisahkan antara struktur, gaya, logika, dan data untuk kemudahan pengelolaan.

/├── index.html       # File HTML utama yang berisi struktur halaman.├── style.css        # File CSS kustom untuk styling dan theming (terang/gelap).├── script.js        # File JavaScript utama yang berisi semua logika aplikasi.├── prices.json      # File data JSON yang menyimpan semua informasi harga barang.└── /assets/         # Folder untuk aset seperti logo (logo-warna.png, logo-bw.png).
---

## Instalasi dan Penggunaan

Aplikasi ini tidak memerlukan proses *build* atau instalasi yang rumit.

1.  Pastikan semua file (`index.html`, `style.css`, `script.js`, `prices.json`) dan folder `assets` berada dalam direktori yang sama.
2.  Buka file `index.html` di browser modern (Google Chrome, Firefox, Edge, dll.).
3.  Aplikasi siap untuk digunakan.

**Catatan**: Koneksi internet diperlukan pada saat pertama kali memuat halaman untuk mengambil *library* Tailwind CSS, SheetJS, dan jsPDF dari CDN.

---

## Cara Kerja Aplikasi

### Kalkulasi Harga
Logika harga sepenuhnya digerakkan oleh data dari `prices.json`. Fungsi `calculatePrice()` di `script.js` akan:
1.  Mengambil jenis barang, bahan, dan ukuran yang dipilih pengguna.
2.  Membaca harga dasar dari file `prices.json`.
3.  Menambahkan biaya tambahan jika ada (misalnya, untuk ukuran di atas XL) sesuai logika yang ditentukan.
4.  Menampilkan hasil akhir secara real-time di antarmuka.

### Penyimpanan Data
Aplikasi menggunakan `localStorage` browser untuk persistensi data.
- Fungsi `saveDraft(data)` akan mengubah *array* objek pesanan menjadi string JSON dan menyimpannya di `localStorage` dengan *key* `pesananDraft`.
- Fungsi `loadDraft()` akan mengambil string JSON dari `localStorage`, mengubahnya kembali menjadi *array*, dan menggunakannya untuk me-render tabel saat halaman dimuat.

---

## Kredit

-   **Pengembang**: ArkIntelligent ([Facebook](https://www.facebook.com/artcow))
-   **Pemilik Proyek**: Tritunggal Lancar ([Instagram](https://www.instagram.com/ttl_workshop/))

