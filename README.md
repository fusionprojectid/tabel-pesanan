# Rekapitulasi Pesanan "Tritunggal Lancar"

Aplikasi web *client-side* yang dirancang untuk input, rekapitulasi, dan kalkulasi pesanan *merchandise* secara efisien dan modern.

---

## Tampilan Aplikasi

| Input Pesanan | Rekapitulasi Pesanan | Lokasi & Kontak |
| :---: | :---: | :---: |
| ![Input Pesanan](input-pesanan.png) | ![Rekapitulasi Pesanan](rekap-pesanan.png) | ![Lokasi dan Kontak](lokasi-kontak.png) |

---

## Deskripsi

Proyek ini adalah sebuah aplikasi web yang dibangun untuk membantu "Tritunggal Lancar" dalam mengelola, merekapitulasi, dan menghitung total pesanan berbagai produk. Aplikasi ini berjalan sepenuhnya di sisi klien (*client-side*), artinya tidak memerlukan server *backend* atau *database*. Semua data disimpan secara lokal di `localStorage` browser pengguna, memastikan kecepatan, privasi, dan kemudahan penggunaan.

---

## Fitur Utama

- 📝 **Input Pesanan Intuitif**: Menambahkan pesanan baru melalui form dengan opsi dinamis yang muncul berdasarkan jenis barang (misal: pilihan bahan untuk Kaos Polo dan Topi).
- 🧮 **Kalkulasi Harga *Real-time***: Harga satuan ditampilkan langsung di form, dengan kalkulasi otomatis berdasarkan jenis barang, bahan, hingga tambahan biaya untuk ukuran besar (XXL+).
- 📊 **Rekapitulasi Cerdas**: Data pesanan ditampilkan dalam tabel yang dikelompokkan otomatis berdasarkan nama pemesan, lengkap dengan subtotal per pemesan dan total keseluruhan.
- 📈 **Ringkasan Visual**: Kartu rekapitulasi menampilkan total jumlah pesanan untuk setiap jenis barang secara terpisah.
- 🔍 **Pencarian Langsung**: Filter dan cari data pesanan di tabel rekapitulasi secara instan berdasarkan nama pemesan atau jenis barang.
- ✏️ **Manajemen Data**: Ubah jumlah pesanan atau hapus item satu per satu, bahkan hapus semua pesanan per nama pelanggan dengan mudah.
- 💾 **Penyimpanan Lokal**: Aplikasi menggunakan `localStorage` untuk menyimpan semua data secara otomatis. Data tidak akan hilang meskipun Anda me-*refresh* atau menutup halaman.
- 🚀 **Opsi Ekspor Lengkap**:
    - **Simpan ke PDF**: Membuat dokumen PDF profesional dari data rekapitulasi.
    - **Ekspor ke Excel**: Mengunduh data dalam format `.xlsx` untuk diolah lebih lanjut.
    - **Bagikan via WhatsApp & Email**: Membuat format pesan siap kirim untuk dibagikan.
- 🎨 **Antarmuka Modern & Responsif**: Didesain menggunakan Tailwind CSS, nyaman digunakan di berbagai ukuran layar dan dilengkapi pilihan **Tema Terang & Gelap**.
- 🗺️ **Informasi Kontak & Lokasi**: Tab khusus untuk menampilkan alamat *workshop* dengan peta Google Maps yang interaktif serta detail kontak.
- 🕰️ **Tanggal *Live***: Menampilkan tanggal terkini di *header* untuk konteks.

---

## Teknologi yang Digunakan

-   **HTML5** & **CSS3** (dengan *custom properties* untuk *theming*)
-   **Tailwind CSS** (dimuat via CDN)
-   **JavaScript (Vanilla JS)**: Digunakan untuk semua logika aplikasi, termasuk manipulasi DOM, kalkulasi, dan penyimpanan data.
-   **SheetJS (xlsx.js)**: Untuk fungsionalitas ekspor ke Excel.
-   **jsPDF** & **jsPDF-AutoTable**: Untuk fungsionalitas simpan ke PDF.

---

## Struktur Folder
/
├── index.html              (File struktur utama HTML)
├── style.css               (File styling kustom untuk tema dan layout)
├── script.js               (File logika utama aplikasi)
├── prices.json             (File konfigurasi harga barang)
├── README.md               (File dokumentasi ini)
├── logo-warna.png          (Aset gambar logo berwarna)
├── logo-bw.png             (Aset gambar logo hitam-putih)
├── apple-touch-icon.png    (Ikon untuk perangkat Apple)
├── favicon-32x32.png       (Favicon ukuran 32x32)
├── favicon-16x16.png       (Favicon ukuran 16x16)
├── site.webmanifest        (File manifest untuk PWA)
├── input-pesanan.png       (Screenshot halaman input)
├── rekap-pesanan.png       (Screenshot halaman rekap)
└── lokasi-kontak.png       (Screenshot halaman lokasi)

---

## Instalasi dan Penggunaan

Aplikasi ini tidak memerlukan proses instalasi atau *build tools* yang kompleks.

1.  Pastikan semua file dan folder di atas berada dalam satu direktori yang sama.
2.  Cukup buka file **`index.html`** pada browser modern (seperti Google Chrome, Mozilla Firefox, Microsoft Edge).
3.  Aplikasi siap digunakan.

**Catatan:** Koneksi internet diperlukan saat pertama kali membuka halaman agar *library* Tailwind CSS, SheetJS, dan jsPDF dapat dimuat dari CDN.

---

## Cara Kerja Penyimpanan Data

-   Data pesanan ditambahkan melalui form di tab **"Input Pesanan"**.
-   Setiap pesanan yang disimpan akan ditambahkan ke dalam sebuah *array* data yang kemudian disimpan di **`localStorage`** browser Anda.
-   Saat Anda membuka tab **"Rekapitulasi Hasil"**, skrip akan membaca data dari `localStorage` dan menampilkannya dalam bentuk tabel dan ringkasan.
-   Karena data tersimpan di `localStorage`, data tidak akan hilang saat halaman ditutup atau di-*refresh*.
-   Mengklik tombol **"Kosongkan Data"** akan menghapus semua data pesanan dari `localStorage`.

---

## Kredit

-   Powered by **ArkIntelligent** ([https://www.facebook.com/artcow](https://www.facebook.com/artcow))
