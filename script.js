// KONSTANTA & DATA HARGA
const HARGA_BARANG = {
    // Harga Kaos Biasa
    'Kaos': 85000,
    
    // Harga dasar Kaos Polo berdasarkan bahan
    'Lacoste, Sablon': 95000,
    'Lacoste, Bordir': 105000,
    'Katun Combed 24s, Sablon': 85000,

    // Harga barang lain
    'Jaket Hoodie': 150000,
    'Jaket Gunung': 250000,
    'PDL': 185000,
    'Topi (Bahan Rafael)': 55000,
    'Kaos Kaki': 0, // Harga belum ditentukan
    'Pin (4.4mm)': 8000,
    'Gantungan Kunci': 8000,
    'Pulpen': 8000,
    'Block Note': 8000,
};
const BARANG_PAKAI_UKURAN = ['Kaos', 'Kaos Polo', 'Jaket Hoodie', 'Jaket Gunung', 'PDL', 'Kaos Kaki'];
const UKURAN_BIAYA_TAMBAHAN_UMUM = ['XXL', 'XXXL'];

// FUNGSI HELPER
function formatRupiah(n) { return "Rp" + new Intl.NumberFormat("id-ID").format(n); }
function getPesanan() { return JSON.parse(localStorage.getItem("pesananKaos") || "[]"); }
function setPesanan(data) { localStorage.setItem("pesananKaos", JSON.stringify(data)); }
function formatTanggal(date) { return date.toLocaleString("id-ID", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }); }

function hitungHargaSatuan(item) {
    let harga = 0;

    if (item.barang === 'Kaos Polo') {
        harga = HARGA_BARANG[item.bahanPolo] || 0;
        // Cek biaya tambahan ukuran untuk Kaos Polo
        if (UKURAN_BIAYA_TAMBAHAN_UMUM.includes(item.ukuran)) {
            if (item.bahanPolo.includes('Lacoste')) {
                harga += 10000; // Biaya tambahan Lacoste
            } else if (item.bahanPolo.includes('Katun')) {
                harga += 7000; // Biaya tambahan Katun
            }
        }
    } else if (item.barang === 'Kaos') {
        harga = HARGA_BARANG[item.barang] || 0;
        // Cek biaya tambahan lengan & ukuran untuk Kaos biasa
        if (item.tipeLengan === 'Panjang') {
            harga += 10000;
        }
        if (UKURAN_BIAYA_TAMBAHAN_UMUM.includes(item.ukuran)) {
            harga += 10000;
        }
    } else {
        harga = HARGA_BARANG[item.barang] || 0;
    }
    
    return harga;
}

function generateEmailBody() {
    const pesanan = getPesanan();
    if (pesanan.length === 0) return "Tidak ada data pesanan untuk dikirim.";

    const grup = {};
    pesanan.forEach(p => { (grup[p.nama.toLowerCase()] = grup[p.nama.toLowerCase()] || []).push(p); });

    let body = "Berikut adalah rekapitulasi pesanan:\n\n";
    let grandTotalAkhir = 0;

    Object.values(grup).forEach(group => {
        body += `================================\n`;
        body += `NAMA PEMESAN: ${group[0].nama}\n`;
        body += `--------------------------------\n`;

        let totalPerNama = 0;

        group.forEach(p => {
            const hargaSatuan = hitungHargaSatuan(p);
            const subtotal = hargaSatuan * p.jumlah;
            totalPerNama += subtotal;
            
            let detail = p.barang;
            if (p.barang === 'Kaos Polo') {
                detail += ` (${p.bahanPolo}, ${p.ukuran})`;
            } else if (p.barang === 'Kaos') {
                detail += ` (${p.tipeLengan}, ${p.ukuran})`;
            } else if (BARANG_PAKAI_UKURAN.includes(p.barang)) {
                detail += ` (${p.ukuran})`;
            }
            
            body += `${p.jumlah}x ${detail} @ ${formatRupiah(hargaSatuan)} = ${formatRupiah(subtotal)}\n`;
        });
        
        grandTotalAkhir += totalPerNama;

        body += `--------------------------------\n`;
        body += `TOTAL: ${formatRupiah(totalPerNama)}\n\n`;
    });
    
    body += `================================\n`;
    body += `TOTAL KESELURUHAN: ${formatRupiah(grandTotalAkhir)}\n\n`;
    body += `Terima kasih atas pesanannya.\n`;

    return body;
}


// FUNGSI RENDER TABEL DAN REKAP
function renderHasil() {
  const pesanan = getPesanan();
  const tbody = document.getElementById("tabel-hasil");
  tbody.innerHTML = "";

  const grup = {};
  pesanan.forEach(p => { (grup[p.nama.toLowerCase()] = grup[p.nama.toLowerCase()] || []).push(p); });

  let grandTotal = 0;
  const itemCounts = {};
  let i = 1;

  Object.values(grup).forEach(group => {
    let namaTotal = 0;

    group.forEach((p, idx) => {
      const hargaSatuan = hitungHargaSatuan(p);
      const subtotal = hargaSatuan * p.jumlah;
      namaTotal += subtotal;

      const itemCounterKey = p.barang === 'Kaos Polo' ? `${p.barang} - ${p.bahanPolo}` : p.barang;
      itemCounts[itemCounterKey] = (itemCounts[itemCounterKey] || 0) + p.jumlah;

      let detail = '-';
      if (p.barang === 'Kaos Polo') {
          detail = `${p.bahanPolo}, ${p.ukuran}`;
      } else if (p.barang === 'Kaos') {
          detail = `${p.tipeLengan}, ${p.ukuran}`;
      } else if (p.ukuran && BARANG_PAKAI_UKURAN.includes(p.barang)) {
          detail = p.ukuran;
      }

      const tr = document.createElement("tr");
      tr.className = "hover:bg-gray-50 text-center";
      tr.innerHTML = `
        <td class="border p-2 text-xs">${i++}</td>
        ${idx === 0 ? `<td class="border p-2 font-semibold text-left align-top" rowspan="${group.length + 1}">${p.nama}</td>` : ""}
        <td class="border p-2 text-left">${p.barang}</td>
        <td class="border p-2 text-left">${detail}</td>
        <td class="border p-2">${p.jumlah}</td>
        <td class="border p-2 money text-right">${formatRupiah(hargaSatuan)}</td>
        <td class="border p-2 money text-right">${formatRupiah(subtotal)}</td>
        <td class="border p-2">
            <div class="flex justify-center items-center space-x-1">
                <button class="edit-item-btn p-1.5 rounded-full text-gray-500 hover:bg-blue-100 hover:text-blue-600 transition-colors duration-200" data-id="${p.id}" title="Ubah jumlah">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z"></path></svg>
                </button>
                <button class="delete-item-btn p-1.5 rounded-full text-gray-500 hover:bg-red-100 hover:text-red-600 transition-colors duration-200" data-id="${p.id}" title="Hapus item ini">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
            </div>
        </td>
      `;
      tbody.appendChild(tr);
    });
    
    grandTotal += namaTotal;

    const trTotal = document.createElement("tr");
    trTotal.className = "font-semibold";
    trTotal.style.backgroundColor = 'var(--brand-light)';
    trTotal.innerHTML = `
      <td colspan="5" class="border p-2 text-right text-sm font-bold" style="color: var(--brand-dark);">Total untuk ${group[0].nama}</td>
      <td class="border p-2 money text-right text-sm font-bold" style="color: var(--brand-dark);">${formatRupiah(namaTotal)}</td>
      <td class="border p-2 text-center">
        <button class="delete-group-btn bg-red-100 text-red-700 hover:bg-red-200 text-xs font-semibold px-2 py-1 rounded-md transition-colors" data-name="${group[0].nama}" title="Hapus semua pesanan ${group[0].nama}">Hapus Semua</button>
      </td>
    `;
    tbody.appendChild(trTotal);
  });
  
  document.getElementById("grand-total").textContent = formatRupiah(grandTotal);
  
  let rekapHTML = '';
  for (const barang in itemCounts) {
      rekapHTML += `
        <div class="bg-white p-6 rounded-lg shadow-md border-t-4" style="border-color: var(--brand-primary);">
            <h3 class="font-semibold text-gray-600">Total ${barang}</h3>
            <p class="text-3xl font-bold mt-1" style="color: var(--brand-dark);">${itemCounts[barang]}</p>
        </div>
      `;
  }
  document.getElementById("rekap").innerHTML = rekapHTML;
}

// MODAL FUNCTIONS
const modalOverlay = document.getElementById('modal-overlay');
const modalTitle = document.getElementById('modal-title');
const modalMessage = document.getElementById('modal-message');
const modalInput = document.getElementById('modal-input');
const modalActions = document.getElementById('modal-actions');
const modalCloseBtn = document.getElementById('modal-close-btn');

function hideModal() { modalOverlay.classList.add('hidden'); }
function showModal(options) {
    modalTitle.textContent = options.title || 'Pemberitahuan';
    modalMessage.textContent = options.message || '';
    modalActions.innerHTML = ''; 
    modalInput.classList.toggle('hidden', options.type !== 'prompt');
    if (options.type === 'prompt') {
        modalInput.value = options.defaultValue || '';
        const saveBtn = document.createElement('button');
        saveBtn.textContent = 'Simpan';
        saveBtn.className = 'btn-primary font-bold py-2 px-4 rounded-lg';
        saveBtn.onclick = () => { if (options.onOk) options.onOk(modalInput.value); hideModal(); };
        modalActions.appendChild(saveBtn);
    }
    if (options.type === 'confirm') {
        const okBtn = document.createElement('button');
        okBtn.textContent = 'Ya';
        okBtn.className = 'btn-primary font-bold py-2 px-4 rounded-lg';
        okBtn.onclick = () => { if (options.onOk) options.onOk(); hideModal(); };
        modalActions.appendChild(okBtn);
    }
    if (options.type === 'alert') {
        const okBtn = document.createElement('button');
        okBtn.textContent = 'OK';
        okBtn.className = 'btn-primary font-bold py-2 px-4 rounded-lg';
        okBtn.onclick = hideModal;
        modalActions.appendChild(okBtn);
    }
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = (options.type === 'confirm') ? 'Tidak' : 'Batal';
    cancelBtn.className = 'bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg';
    cancelBtn.onclick = () => { if (options.onCancel) options.onCancel(); hideModal(); };
    if (options.type !== 'alert') { modalActions.appendChild(cancelBtn); }
    modalOverlay.classList.remove('hidden');
    if (options.type === 'prompt') modalInput.focus();
}


// EVENT LISTENER
document.addEventListener('DOMContentLoaded', () => {
    modalCloseBtn.addEventListener('click', hideModal);
    document.getElementById('live-date').textContent = new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    const tabs = document.querySelectorAll('.tab-btn');
    const views = document.querySelectorAll('.view-container');

    views.forEach(view => view.classList.add('hidden'));
    document.getElementById('view-form').classList.remove('hidden');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            views.forEach(view => view.classList.add('hidden'));
            const targetView = document.getElementById(tab.id.replace('tab-', 'view-'));
            if(targetView) targetView.classList.remove('hidden');
            if(tab.id === 'tab-rekap') renderHasil();
        });
    });

    // --- LOGIKA FORM INTERAKTIF ---
    const form = document.getElementById("form-input");
    const barangSelect = document.getElementById("barang");
    const bahanPoloSelect = document.getElementById("bahan-polo");
    const tipeLenganSelect = document.getElementById("tipe-lengan");
    const ukuranSelect = document.getElementById("ukuran");
    const jumlahInput = document.getElementById("jumlah");

    const opsiBahanPolo = document.getElementById("opsi-bahan-polo");
    const opsiTipeLengan = document.getElementById("opsi-tipe-lengan");
    const opsiUkuran = document.getElementById("opsi-ukuran");

    const livePriceDisplay = document.getElementById("live-price-display");
    const hargaSatuanDisplay = document.getElementById("harga-satuan-display");
    const hargaTotalDisplay = document.getElementById("harga-total-display");
    
    function toggleFormOptions() {
        const selectedBarang = barangSelect.value;
        opsiBahanPolo.classList.toggle('hidden', selectedBarang !== 'Kaos Polo');
        opsiTipeLengan.classList.toggle('hidden', selectedBarang !== 'Kaos');
        opsiUkuran.classList.toggle('hidden', !BARANG_PAKAI_UKURAN.includes(selectedBarang));
    }
    
    function updateLivePrice() {
        // Tampilkan blok harga
        livePriceDisplay.classList.remove('hidden');

        const item = {
          barang: barangSelect.value,
          bahanPolo: bahanPoloSelect.value,
          tipeLengan: tipeLenganSelect.value,
          ukuran: ukuranSelect.value,
        };
        const jumlah = parseInt(jumlahInput.value) || 0;
        
        const hargaSatuan = hitungHargaSatuan(item);
        const hargaTotal = hargaSatuan * jumlah;
        
        hargaSatuanDisplay.textContent = formatRupiah(hargaSatuan);
        hargaTotalDisplay.textContent = formatRupiah(hargaTotal);
    }

    // Event listener untuk semua input form yang relevan
    [barangSelect, bahanPoloSelect, tipeLenganSelect, ukuranSelect].forEach(el => {
        el.addEventListener('change', () => {
            if (el === barangSelect) {
                toggleFormOptions();
            }
            updateLivePrice();
        });
    });
    jumlahInput.addEventListener('input', updateLivePrice);

    // Panggil fungsi toggle saat pertama kali halaman dimuat
    toggleFormOptions();

    form.addEventListener("submit", e => {
      e.preventDefault();
      const pesanan = getPesanan();
      const newItem = {
          id: Date.now() + Math.random(),
          nama: document.getElementById("nama").value.trim(),
          barang: barangSelect.value,
          bahanPolo: bahanPoloSelect.value,
          tipeLengan: tipeLenganSelect.value,
          ukuran: ukuranSelect.value,
          jumlah: parseInt(jumlahInput.value) || 1,
          tanggal: formatTanggal(new Date())
      };

      const keyGenerator = (item) => [
          item.nama.toLowerCase(), 
          item.barang,
          item.barang === 'Kaos Polo' ? item.bahanPolo : 'no-bahan',
          item.barang === 'Kaos' ? item.tipeLengan : 'no-sleeve',
          BARANG_PAKAI_UKURAN.includes(item.barang) ? item.ukuran : 'no-size'
      ].join('-');

      const newItemKey = keyGenerator(newItem);
      const existingIndex = pesanan.findIndex(p => keyGenerator(p) === newItemKey);

      if (existingIndex > -1) {
        pesanan[existingIndex].jumlah += newItem.jumlah;
        pesanan[existingIndex].tanggal = newItem.tanggal;
        showModal({ type: 'alert', title: 'Berhasil', message: 'Jumlah pesanan untuk item yang sama berhasil diperbarui!' });
      } else {
        pesanan.push(newItem);
        showModal({ type: 'alert', title: 'Berhasil', message: 'Pesanan baru berhasil ditambahkan!' });
      }
      
      setPesanan(pesanan);
      e.target.reset();
      toggleFormOptions();
      livePriceDisplay.classList.add('hidden'); // Sembunyikan lagi setelah submit
      document.getElementById("nama").focus();
    });
    
    document.getElementById("tabel-hasil").addEventListener('click', function(e) {
        const target = e.target.closest('button');
        if (!target) return;

        if (target.classList.contains('edit-item-btn')) {
            const itemId = parseFloat(target.getAttribute('data-id'));
            const pesanan = getPesanan();
            const itemToEdit = pesanan.find(p => p.id === itemId);
            if (!itemToEdit) return;
            
            showModal({
                type: 'prompt',
                title: 'Ubah Jumlah Pesanan',
                message: `Masukkan jumlah baru untuk ${itemToEdit.barang}:`,
                defaultValue: itemToEdit.jumlah,
                onOk: (newQuantityStr) => {
                    const newQuantity = parseInt(newQuantityStr);
                    if (!isNaN(newQuantity) && newQuantity > 0) {
                        itemToEdit.jumlah = newQuantity;
                        itemToEdit.tanggal = formatTanggal(new Date());
                        setPesanan(pesanan);
                        renderHasil();
                    } else {
                        showModal({ type: 'alert', title: 'Gagal', message: 'Jumlah tidak valid. Harap masukkan angka lebih dari 0.' });
                    }
                }
            });
        }
        
        if (target.classList.contains('delete-item-btn')) {
            const itemId = parseFloat(target.getAttribute('data-id'));
            showModal({
                type: 'confirm',
                title: 'Konfirmasi Hapus',
                message: 'Anda yakin ingin menghapus item ini?',
                onOk: () => {
                    let pesanan = getPesanan();
                    pesanan = pesanan.filter(p => p.id !== itemId);
                    setPesanan(pesanan);
                    renderHasil();
                }
            });
        }
        
        if (target.classList.contains('delete-group-btn')) {
            const groupName = target.getAttribute('data-name');
            showModal({
                type: 'confirm',
                title: 'Konfirmasi Hapus',
                message: `Anda yakin ingin menghapus semua pesanan atas nama "${groupName}"?`,
                onOk: () => {
                    let pesanan = getPesanan();
                    pesanan = pesanan.filter(p => p.nama.toLowerCase() !== groupName.toLowerCase());
                    setPesanan(pesanan);
                    renderHasil();
                }
            });
        }
    });

    document.getElementById("email-btn").addEventListener("click", () => {
        const emailTo = "kustomofamily@gmail.com";
        const subject = "Rekapitulasi Pesanan Baru";
        const body = generateEmailBody();
        window.location.href = `mailto:${emailTo}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    });

    document.getElementById("cetak").addEventListener("click", () => window.print());
    document.getElementById("clear").addEventListener("click", () => {
        showModal({
            type: 'confirm',
            title: 'Konfirmasi',
            message: 'Anda yakin ingin mengosongkan seluruh data pesanan?',
            onOk: () => {
                setPesanan([]);
                renderHasil();
            }
        });
    });
});