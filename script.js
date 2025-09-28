// APLIKASI UTAMA
document.addEventListener('DOMContentLoaded', async () => {

    // STEP 1: DEKLARASI VARIABEL GLOBAL & KONSTANTA
    let HARGA_BARANG = {};
    const BARANG_PAKAI_UKURAN = ['Kaos', 'Kaos Polo', 'Jaket Hoodie', 'Jaket Gunung', 'PDL', 'Kaos Kaki'];

    // STEP 2: DEKLARASI SEMUA ELEMEN DOM
    const elements = {
        tabs: document.querySelectorAll('.tab-btn'),
        views: document.querySelectorAll('.view-container'),
        form: document.getElementById('form-input'),
        namaInput: document.getElementById('nama'),
        barangSelect: document.getElementById('barang'),
        jumlahInput: document.getElementById('jumlah'),
        bahanPoloSelect: document.getElementById('bahan-polo'),
        tipeLenganSelect: document.getElementById('tipe-lengan'),
        ukuranSelect: document.getElementById('ukuran'),
        opsiBahanPolo: document.getElementById('opsi-bahan-polo'),
        opsiTipeLengan: document.getElementById('opsi-tipe-lengan'),
        opsiUkuran: document.getElementById('opsi-ukuran'),
        tabelHasil: document.getElementById('tabel-hasil'),
        grandTotalEl: document.getElementById('grand-total'),
        rekapContainer: document.getElementById('rekap'),
        searchRekap: document.getElementById('search-rekap'),
        clearBtn: document.getElementById('clear'),
        pdfBtn: document.getElementById('export-pdf-btn'),
        liveDateEl: document.getElementById('live-date'),
        modalOverlay: document.getElementById('modal-overlay'),
        modalContainer: document.getElementById('modal-container'),
        modalTitle: document.getElementById('modal-title'),
        modalMessage: document.getElementById('modal-message'),
        modalInput: document.getElementById('modal-input'),
        modalActions: document.getElementById('modal-actions'),
        modalCloseBtn: document.getElementById('modal-close-btn'),
        waBtn: document.getElementById("wa-btn"),
        excelBtn: document.getElementById("export-excel-btn"),
        emailBtn: document.getElementById("email-btn"),
        livePriceDisplay: document.getElementById('live-price-display'),
        hargaSatuanDisplay: document.getElementById('harga-satuan-display'),
        themeToggleBtn: document.getElementById('theme-toggle'),
        themeToggleDarkIcon: document.getElementById('theme-toggle-dark-icon'),
        themeToggleLightIcon: document.getElementById('theme-toggle-light-icon'),
        headerLogo: document.getElementById('header-logo'),
    };

    // STEP 3: DEKLARASI FUNGSI-FUNGSI UTAMA

    const applyTheme = (isDarkMode) => {
        document.documentElement.classList.toggle('dark', isDarkMode);
        elements.themeToggleLightIcon.classList.toggle('hidden', isDarkMode);
        elements.themeToggleDarkIcon.classList.toggle('hidden', !isDarkMode);
        elements.headerLogo.src = isDarkMode ? 'logo-bw.png' : 'logo-warna.png';
    };

    const toggleTheme = () => {
        const isDarkMode = document.documentElement.classList.contains('dark');
        localStorage.setItem('theme', isDarkMode ? 'light' : 'dark');
        applyTheme(!isDarkMode);
    };

    const initializeTheme = () => {
        const isDarkMode = localStorage.getItem('theme') === 'dark' || 
                           (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
        applyTheme(isDarkMode);
    };
    
    const formatRupiah = (angka) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);

    const loadPrices = async () => {
        try {
            const response = await fetch('prices.json');
            HARGA_BARANG = await response.json();
        } catch (error) {
            console.error('Gagal memuat harga:', error);
        }
    };

    const saveDraft = (data) => localStorage.setItem('pesananDraft', JSON.stringify(data));
    const loadDraft = () => JSON.parse(localStorage.getItem('pesananDraft')) || [];
    
    const toggleModalAnimationClasses = (show) => {
        elements.modalContainer.classList.toggle('scale-95', !show);
        elements.modalContainer.classList.toggle('opacity-0', !show);
        elements.modalContainer.classList.toggle('scale-100', show);
        elements.modalContainer.classList.toggle('opacity-100', show);
    };

    const closeModal = () => {
        toggleModalAnimationClasses(false);
        setTimeout(() => elements.modalOverlay.classList.add('hidden'), 300);
    };

    const showModal = ({ title = 'Info', message = '', type = 'alert', defaultValue = '', confirmText = 'Oke', cancelText = 'Batal' }) => {
        return new Promise((resolve) => {
            elements.modalTitle.textContent = title;
            elements.modalMessage.innerHTML = message;
            elements.modalInput.value = defaultValue;
            elements.modalActions.innerHTML = '';
            elements.modalInput.classList.toggle('hidden', type !== 'prompt');

            if (type === 'confirm' || type === 'prompt') {
                const cancelButton = Object.assign(document.createElement('button'), {
                    textContent: cancelText,
                    className: 'px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500',
                    onclick: () => { closeModal(); resolve(type === 'prompt' ? null : false); }
                });
                elements.modalActions.appendChild(cancelButton);
            }

            const confirmButton = Object.assign(document.createElement('button'), {
                textContent: confirmText,
                className: 'px-4 py-2 btn-primary rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary',
                onclick: () => { closeModal(); resolve(type === 'prompt' ? elements.modalInput.value : true); }
            });
            elements.modalActions.appendChild(confirmButton);
            
            elements.modalOverlay.classList.remove('hidden');
            setTimeout(() => toggleModalAnimationClasses(true), 50);
        });
    };
    
    elements.modalCloseBtn.addEventListener('click', closeModal);

    const renderHasil = (searchTerm = '') => {
        elements.tabelHasil.innerHTML = '';
        elements.rekapContainer.innerHTML = '';
        const pesanan = loadDraft();
        const filteredPesanan = pesanan.filter(p => p.nama.toLowerCase().includes(searchTerm.toLowerCase()) || p.barang.toLowerCase().includes(searchTerm.toLowerCase()));

        if (filteredPesanan.length === 0) {
            elements.tabelHasil.innerHTML = `<tr><td colspan="8" class="text-center p-4 text-text-secondary">Belum ada data pesanan.</td></tr>`;
            elements.grandTotalEl.textContent = formatRupiah(0);
            return;
        }

        let grandTotal = 0;
        const rekapBarang = {};
        filteredPesanan.forEach(item => {
            grandTotal += item.hargaSatuan * item.jumlah;
            const namaBarangRekap = item.barang === 'Kaos Polo' ? `Kaos Polo - ${item.detail.split(',')[0]}` : item.barang;
            rekapBarang[namaBarangRekap] = (rekapBarang[namaBarangRekap] || 0) + item.jumlah;
        });
        elements.grandTotalEl.textContent = formatRupiah(grandTotal);

        for (const barang in rekapBarang) {
            const card = document.createElement('div');
            card.className = 'rekap-card p-4 rounded-lg shadow-md border text-center';
            card.innerHTML = `<p class="text-sm text-text-secondary">Total ${barang}</p><p class="text-3xl font-bold text-brand-dark">${rekapBarang[barang]}</p>`;
            elements.rekapContainer.appendChild(card);
        }

        const groupedPesanan = {};
        filteredPesanan.forEach(p => {
            if (!groupedPesanan[p.nama]) groupedPesanan[p.nama] = [];
            groupedPesanan[p.nama].push(p);
        });

        let groupIndex = 0;
        for (const nama in groupedPesanan) {
            groupIndex++;
            const items = groupedPesanan[nama];
            let totalPerNama = 0;
            let tableRowsHTML = '';

            items.forEach((item, itemIndex) => {
                const subtotal = item.hargaSatuan * item.jumlah;
                totalPerNama += subtotal;
                const isEvenRow = itemIndex > 0 && itemIndex % 2 !== 0;
                const rowClass = isEvenRow ? 'row-even' : '';
                const actionButtons = `<button class="edit-btn text-blue-500 hover:text-blue-700" data-id="${item.id}" title="Ubah Jumlah"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z"></path></svg></button><button class="delete-btn text-red-500 hover:text-red-700" data-id="${item.id}" title="Hapus Item"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>`;
                
                let rowHTML = '';
                if (itemIndex === 0) {
                    rowHTML += `<tr class="border-b text-center"><td class="p-3 align-top" rowspan="${items.length}">${groupIndex}</td><td class="p-3 text-left align-top font-semibold" rowspan="${items.length}">${nama}</td>`;
                } else {
                    rowHTML += `<tr class="border-b text-center ${rowClass}">`;
                }
                rowHTML += `<td class="p-3 text-left">${item.barang}</td><td class="p-3 text-left">${item.detail || '-'}</td><td class="p-3">${item.jumlah}</td><td class="p-3 money text-right">${formatRupiah(item.hargaSatuan)}</td><td class="p-3 money text-right">${formatRupiah(subtotal)}</td><td class="p-3 flex justify-center items-center gap-2">${actionButtons}</td></tr>`;
                tableRowsHTML += rowHTML;
            });
            tableRowsHTML += `<tr class="group-footer"><td colspan="8" class="p-2 text-right font-bold"><span>Total untuk ${nama}</span><span class="inline-block w-32 text-right">${formatRupiah(totalPerNama)}</span><span class="inline-block w-24 text-center"><button class="delete-group-btn text-xs text-white bg-red-500 hover:bg-red-700 px-2 py-1 rounded" data-nama="${nama}">Hapus Semua</button></span></td></tr>`;
            elements.tabelHasil.innerHTML += tableRowsHTML;
        }
    };
    
    const tambahPesanan = async (e) => {
        e.preventDefault();
        const pesanan = loadDraft();
        const selectedBarang = elements.barangSelect.value;
        const detailArray = [];
        if (selectedBarang === 'Kaos Polo' && elements.bahanPoloSelect.value) detailArray.push(elements.bahanPoloSelect.value);
        if (selectedBarang === 'Kaos Polo') detailArray.push('Panjang');
        else if (elements.opsiTipeLengan.style.display !== 'none' && elements.tipeLenganSelect.value) detailArray.push(elements.tipeLenganSelect.value);
        if (elements.opsiUkuran.style.display !== 'none' && elements.ukuranSelect.value) detailArray.push(elements.ukuranSelect.value);
        const newItem = {
            id: Date.now(),
            nama: elements.namaInput.value.trim(),
            barang: selectedBarang,
            detail: detailArray.join(', '),
            jumlah: parseInt(elements.jumlahInput.value),
            hargaSatuan: calculatePrice()
        };
        pesanan.push(newItem);
        saveDraft(pesanan);
        elements.form.reset();
        toggleFormOptions();
        updateLivePriceDisplay();
        await showModal({ title: 'Berhasil!', message: 'Pesanan berhasil ditambahkan.' });
    };

    const calculatePrice = () => {
        const barang = elements.barangSelect.value;
        const bahanPolo = elements.bahanPoloSelect.value;
        return barang === 'Kaos Polo' ? (HARGA_BARANG[bahanPolo] || 0) : (HARGA_BARANG[barang] || 0);
    };
    
    const updateLivePriceDisplay = () => {
        const price = calculatePrice();
        if (price > 0) {
            elements.hargaSatuanDisplay.textContent = formatRupiah(price);
            elements.livePriceDisplay.classList.remove('hidden');
        } else {
            elements.livePriceDisplay.classList.add('hidden');
        }
    };

    const toggleFormOptions = () => {
        const selectedBarang = elements.barangSelect.value;
        elements.opsiBahanPolo.style.display = selectedBarang === 'Kaos Polo' ? 'block' : 'none';
        const showUkuran = BARANG_PAKAI_UKURAN.includes(selectedBarang);
        elements.opsiUkuran.style.display = showUkuran ? 'block' : 'none';
        elements.opsiTipeLengan.style.display = selectedBarang === 'Kaos' ? 'block' : 'none';
    };
    
    const deleteItem = async (id) => {
        const confirmed = await showModal({ title: 'Konfirmasi Hapus', message: 'Hapus item ini dari pesanan?', type: 'confirm', confirmText: 'Ya, Hapus' });
        if (confirmed) {
            saveDraft(loadDraft().filter(item => item.id !== id));
            renderHasil(elements.searchRekap.value);
        }
    };

    const deleteGroup = async (nama) => {
        const confirmed = await showModal({ title: 'Konfirmasi Hapus Grup', message: `Yakin ingin menghapus <b>SEMUA</b> pesanan atas nama <b>${nama}</b>?`, type: 'confirm', confirmText: 'Ya, Hapus Semua' });
        if (confirmed) {
            saveDraft(loadDraft().filter(item => item.nama !== nama));
            renderHasil(elements.searchRekap.value);
        }
    };
    
    const editItem = async (id, jumlahLama) => {
        const jumlahBaruStr = await showModal({ title: 'Ubah Jumlah', message: 'Masukkan jumlah pesanan baru:', type: 'prompt', defaultValue: jumlahLama.toString(), confirmText: 'Simpan' });
        if (jumlahBaruStr && !isNaN(jumlahBaruStr) && parseInt(jumlahBaruStr) > 0) {
            const pesanan = loadDraft();
            const itemIndex = pesanan.findIndex(item => item.id === id);
            if (itemIndex > -1) {
                pesanan[itemIndex].jumlah = parseInt(jumlahBaruStr);
                saveDraft(pesanan);
                renderHasil(elements.searchRekap.value);
            }
        } else if (jumlahBaruStr !== null) {
            await showModal({ title: 'Input Tidak Valid', message: 'Jumlah harus berupa angka lebih dari nol.' });
        }
    };

    const generateWhatsAppBody = () => {
        const pesanan = loadDraft();
        let body = "Halo, berikut rekapitulasi pesanan:\n\n";
        pesanan.forEach(p => { body += `*${p.nama}* - ${p.barang} (${p.detail}) - ${p.jumlah} pcs\n`; });
        const grandTotal = pesanan.reduce((total, p) => total + (p.hargaSatuan * p.jumlah), 0);
        body += `\n*Total Bayar: ${formatRupiah(grandTotal)}*`;
        return body;
    };

    const generateEmailBody = () => {
        const pesanan = loadDraft();
        if (pesanan.length === 0) return "Tidak ada data pesanan.";
        let body = "Halo,\n\nBerikut adalah rekapitulasi pesanan yang telah dibuat:\n\n";
        body += "================================================\n";
        pesanan.forEach((p, index) => {
            body += `Pesanan #${index + 1}\nNama    : ${p.nama}\nBarang  : ${p.barang}\nDetail  : ${p.detail || '-'}\nJumlah  : ${p.jumlah} pcs\nHarga   : ${formatRupiah(p.hargaSatuan)}\nSubtotal: ${formatRupiah(p.jumlah * p.hargaSatuan)}\n------------------------------------------------\n`;
        });
        const grandTotal = pesanan.reduce((total, p) => total + (p.hargaSatuan * p.jumlah), 0);
        body += `\nTOTAL KESELURUHAN: ${formatRupiah(grandTotal)}\n================================================\n\nTerima kasih.`;
        return body;
    };

    const exportToExcel = async () => {
        const pesanan = loadDraft();
        if (pesanan.length === 0) return await showModal({ title: "Gagal", message: "Tidak ada data pesanan untuk diekspor." });
        const dataForExport = pesanan.map((p, index) => ({ 'No.': index + 1, 'Nama Pemesan': p.nama, 'Barang': p.barang, 'Detail': p.detail, 'Jumlah': p.jumlah, 'Harga Satuan': p.hargaSatuan, 'Subtotal': p.jumlah * p.hargaSatuan }));
        const grandTotal = pesanan.reduce((total, p) => total + p.hargaSatuan * p.jumlah, 0);
        const worksheet = XLSX.utils.json_to_sheet(dataForExport);
        XLSX.utils.sheet_add_aoa(worksheet, [['', '', '', '', '', 'GRAND TOTAL', grandTotal]], { origin: -1 });
        worksheet['!cols'] = [{ wch: 5 }, { wch: 25 }, { wch: 20 }, { wch: 30 }, { wch: 10 }, { wch: 15 }, { wch: 15 }];
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Rekap Pesanan");
        XLSX.writeFile(workbook, `Rekap Pesanan_${new Date().toISOString().slice(0, 10)}.xlsx`);
    };

    const exportToPDF = async () => {
        const pesanan = loadDraft();
        if (pesanan.length === 0) return await showModal({ title: "Gagal", message: "Tidak ada data pesanan untuk diekspor." });

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        const tableHead = [['No', 'Nama', 'Barang', 'Detail', 'Jml', 'Harga', 'Subtotal']];
        const tableBody = pesanan.map((p, index) => [
            index + 1, p.nama, p.barang, p.detail, p.jumlah,
            formatRupiah(p.hargaSatuan), formatRupiah(p.jumlah * p.hargaSatuan)
        ]);
        const grandTotal = pesanan.reduce((total, p) => total + p.hargaSatuan * p.jumlah, 0);

        doc.setFontSize(18);
        doc.text("Rekapitulasi Pesanan", 14, 22);
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Tanggal: ${new Date().toLocaleDateString('id-ID')}`, 14, 29);

        doc.autoTable({
            head: tableHead, body: tableBody, startY: 35, theme: 'grid',
            headStyles: { fillColor: [75, 39, 27] }, styles: { fontSize: 8 },
            columnStyles: { 4: { halign: 'center' }, 5: { halign: 'right' }, 6: { halign: 'right' }}
        });
        
        let finalY = doc.lastAutoTable.finalY;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text("Total Bayar:", 140, finalY + 10, {align: 'right'});
        doc.text(formatRupiah(grandTotal), 200, finalY + 10, {align: 'right'});

        doc.save(`Rekap Pesanan_${new Date().toISOString().slice(0, 10)}.pdf`);
    };

    // STEP 4: PASANG EVENT LISTENERS
    elements.liveDateEl.textContent = new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    elements.tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            elements.tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            elements.views.forEach(view => view.classList.add('hidden'));
            const targetView = document.getElementById(tab.id.replace('tab-', 'view-'));
            if (targetView) targetView.classList.remove('hidden');
            if (tab.id === 'tab-rekap') renderHasil(elements.searchRekap.value);
        });
    });
    
    elements.form.addEventListener('submit', tambahPesanan);
    elements.barangSelect.addEventListener('change', () => { toggleFormOptions(); updateLivePriceDisplay(); });
    elements.bahanPoloSelect.addEventListener('change', updateLivePriceDisplay);
    elements.searchRekap.addEventListener('input', (e) => renderHasil(e.target.value));
    elements.tabelHasil.addEventListener('click', async (e) => {
        const deleteBtn = e.target.closest('.delete-btn');
        const editBtn = e.target.closest('.edit-btn');
        const deleteGroupBtn = e.target.closest('.delete-group-btn');
        if (deleteBtn) await deleteItem(parseInt(deleteBtn.dataset.id));
        if (editBtn) {
            const id = parseInt(editBtn.dataset.id);
            const jumlahLama = loadDraft().find(p => p.id === id)?.jumlah || 1;
            await editItem(id, jumlahLama);
        }
        if (deleteGroupBtn) await deleteGroup(deleteGroupBtn.dataset.nama);
    });
    elements.clearBtn.addEventListener('click', async () => {
        const confirmed = await showModal({ title: 'Reset Semua Data', message: 'YAKIN ingin mengosongkan <b>SEMUA</b> data pesanan? Aksi ini tidak dapat dibatalkan.', type: 'confirm', confirmText: 'Ya, Kosongkan' });
        if (confirmed) {
            saveDraft([]);
            renderHasil();
            await showModal({ title: 'Berhasil', message: 'Semua data pesanan telah dikosongkan.' });
        }
    });
    
    elements.waBtn.addEventListener("click", () => {
        const body = generateWhatsAppBody();
        window.open(`https://wa.me/?text=${encodeURIComponent(body)}`, '_blank');
    });
    elements.excelBtn.addEventListener("click", exportToExcel);
    elements.emailBtn.addEventListener("click", () => {
        const subject = "Rekapitulasi Pesanan";
        const body = generateEmailBody();
        window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    });
    elements.pdfBtn.addEventListener("click", exportToPDF);
    elements.themeToggleBtn.addEventListener('click', toggleTheme);

    // STEP 5: INISIALISASI APLIKASI
    initializeTheme();
    await loadPrices();
    elements.views.forEach(view => view.classList.add('hidden'));
    document.getElementById('view-form').classList.remove('hidden');
    toggleFormOptions();
    updateLivePriceDisplay();
});