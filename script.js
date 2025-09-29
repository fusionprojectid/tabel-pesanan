// APLIKASI UTAMA
document.addEventListener('DOMContentLoaded', async () => {

    // STEP 1: DEKLARASI VARIABEL GLOBAL, KONSTANTA, & STATE
    let HARGA_BARANG = {};
    const GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/AKfycbwyZBFrO7zaSc3MYeq3Km64nc_qojZQjXEurVCfVwrSpZC1ZdqoIDatuEjpDfrRMBeh/exec';
    const BARANG_PAKAI_UKURAN = ['Kaos', 'Kaos Polo', 'Jaket Hoodie', 'Jaket Gunung', 'PDL', 'Kaos Kaki'];
    let currentSort = { column: 'nama', order: 'asc' };
    let currentFilter = 'Semua';
    let chartBarangInstance = null;

    // STEP 2: DEKLARASI SEMUA ELEMEN DOM
    const elements = {
        tabs: document.querySelectorAll('.tab-btn'),
        hamburgerBtn: document.getElementById('hamburger-btn'),
        sidebarMenu: document.getElementById('sidebar-menu'),
        sidebarOverlay: document.getElementById('sidebar-overlay'),
        sidebarBtns: document.querySelectorAll('.sidebar-btn'),
        sidebarLogo: document.getElementById('sidebar-logo'),
        views: document.querySelectorAll('.view-container'),
        form: document.getElementById('form-input'),
        namaInput: document.getElementById('nama'),
        barangSelect: document.getElementById('barang'),
        jumlahInput: document.getElementById('jumlah'),
        bahanPoloSelect: document.getElementById('bahan-polo'),
        bahanTopiSelect: document.getElementById('bahan-topi'),
        tipeLenganSelect: document.getElementById('tipe-lengan'),
        ukuranSelect: document.getElementById('ukuran'),
        opsiBahanPolo: document.getElementById('opsi-bahan-polo'),
        opsiBahanTopi: document.getElementById('opsi-bahan-topi'),
        opsiTipeLengan: document.getElementById('opsi-tipe-lengan'),
        opsiUkuran: document.getElementById('opsi-ukuran'),
        tabelHasil: document.getElementById('tabel-hasil'),
        grandTotalEl: document.getElementById('grand-total'),
        rekapContainer: document.getElementById('rekap'),
        searchRekap: document.getElementById('search-rekap'),
        filterSelect: document.getElementById('filter-select'),
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
        themeToggleBtnSidebar: document.getElementById('theme-toggle-sidebar'),
        themeToggleDarkIconSidebar: document.getElementById('theme-toggle-dark-icon-sidebar'),
        themeToggleLightIconSidebar: document.getElementById('theme-toggle-light-icon-sidebar'),
        sortableHeaders: document.querySelectorAll('.sortable'),
        submitBtn: document.getElementById('submit-btn'),
        submitBtnText: document.getElementById('submit-btn-text'),
    };

    // STEP 3: DEKLARASI FUNGSI-FUNGSI UTAMA

    const applyTheme = (isDarkMode) => {
        document.documentElement.classList.toggle('dark', isDarkMode);
        elements.themeToggleLightIconSidebar.classList.toggle('hidden', isDarkMode);
        elements.themeToggleDarkIconSidebar.classList.toggle('hidden', !isDarkMode);
        const logoPath = isDarkMode ? 'assets/logo-bw.png' : 'assets/logo-warna.png';
        if (elements.sidebarLogo) elements.sidebarLogo.src = logoPath;
    };
    const toggleTheme = () => {
        const isDarkMode = document.documentElement.classList.contains('dark');
        localStorage.setItem('theme', isDarkMode ? 'light' : 'dark');
        applyTheme(!isDarkMode);
    };
    const initializeTheme = () => {
        const isDarkMode = localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
        applyTheme(isDarkMode);
    };
    const toggleSidebar = () => {
        elements.sidebarMenu.classList.toggle('-translate-x-full');
        elements.sidebarOverlay.classList.toggle('hidden');
    };
    const setActiveView = (tabName) => {
        const activeClasses = 'border-b-2 border-[--brand-primary] text-[--brand-dark] font-semibold'.split(' ');
        const inactiveClasses = 'text-[--text-secondary]'.split(' ');
        elements.views.forEach(view => view.classList.add('hidden'));
        document.getElementById(`view-${tabName}`)?.classList.remove('hidden');
        elements.tabs.forEach(t => {
            const tabIdName = t.id.replace('tab-', '');
            if (tabIdName === tabName) {
                t.classList.remove(...inactiveClasses);
                t.classList.add(...activeClasses);
            } else {
                t.classList.remove(...activeClasses);
                t.classList.add(...inactiveClasses);
            }
        });
        elements.sidebarBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.tab === tabName));
        if (tabName === 'rekap') renderHasil();
        if (tabName === 'statistik') renderStatistik();
        if (!elements.sidebarMenu.classList.contains('-translate-x-full')) {
            toggleSidebar();
        }
    };
    const formatRupiah = (angka) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
    const loadDataFromSheet = async () => {
        const loadingModalPromise = showModal({ title: 'Sinkronisasi Data', message: 'Sedang memuat data terbaru...' });
        try {
            const ordersResponse = await fetch(`${GOOGLE_SHEET_URL}?action=getOrders`);
            if (!ordersResponse.ok) throw new Error('Gagal mengambil data pesanan.');
            const ordersData = await ordersResponse.json();
            const validOrdersData = ordersData.filter(order => order && order["ID Unik"] && order["Nama Pemesan"]);
            const formattedOrders = validOrdersData.map(order => ({
                id: order["ID Unik"],
                timestamp: order.Timestamp,
                nama: order["Nama Pemesan"],
                barang: order.Barang,
                detail: order.Detail,
                jumlah: Number(order.Jumlah) || 0,
                hargaSatuan: Number(order["Harga Satuan"]) || 0
            }));
            saveDraft(formattedOrders);
            const pricesResponse = await fetch(`${GOOGLE_SHEET_URL}?action=getPrices`);
            if (!pricesResponse.ok) throw new Error('Gagal mengambil daftar harga.');
            HARGA_BARANG = await pricesResponse.json();
            console.log("Sinkronisasi berhasil. Data pesanan dan harga telah dimuat.");
        } catch (error) {
            console.error('Sinkronisasi gagal:', error);
            await showModal({
                title: 'Koneksi Gagal',
                message: 'Tidak dapat mengambil data terbaru dari server. Menampilkan data yang tersimpan di perangkat ini (jika ada).',
            });
            if (Object.keys(HARGA_BARANG).length === 0) {
                await loadPricesFromFile();
            }
        } finally {
            closeModal();
        }
    };
    const loadPricesFromFile = async () => {
        try {
            const response = await fetch('prices.json');
            HARGA_BARANG = await response.json();
            console.log("Memuat harga dari file prices.json (cadangan).");
        } catch (error) {
            console.error('Gagal memuat harga dari file cadangan:', error);
        }
    };
    const saveDraft = (data) => localStorage.setItem('pesananDraft', JSON.stringify(data));
    const loadDraft = () => {
        try {
            return JSON.parse(localStorage.getItem('pesananDraft')) || [];
        } catch (e) {
            console.error("Gagal memuat data dari localStorage:", e);
            return [];
        }
    };
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
                className: 'px-4 py-2 bg-[--brand-primary] text-[#4b271b] font-semibold rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary hover:bg-[--brand-secondary] hover:text-white transition-colors',
                onclick: () => { closeModal(); resolve(type === 'prompt' ? elements.modalInput.value : true); }
            });
            elements.modalActions.appendChild(confirmButton);
            elements.modalOverlay.classList.remove('hidden');
            setTimeout(() => toggleModalAnimationClasses(true), 50);
        });
    };
    const renderHasil = () => {
        const searchTerm = elements.searchRekap.value.toLowerCase();
        let pesanan = loadDraft();
        const filteredByCategory = pesanan.filter(p => {
            if (currentFilter === 'Semua') return true;
            if (currentFilter === 'Kaos') return p.barang.includes('Kaos');
            if (currentFilter === 'Jaket') return p.barang.includes('Jaket');
            if (currentFilter === 'Merchandise') return !p.barang.includes('Kaos') && !p.barang.includes('Jaket') && p.barang !== 'PDL';
            return true;
        });
        let filteredPesanan = filteredByCategory.filter(p => p.nama.toLowerCase().includes(searchTerm) || p.barang.toLowerCase().includes(searchTerm));
        filteredPesanan.sort((a, b) => {
            const valA = getSortValue(a, currentSort.column);
            const valB = getSortValue(b, currentSort.column);
            if (typeof valA === 'string') {
                return currentSort.order === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
            }
            return currentSort.order === 'asc' ? valA - valB : valB - valA;
        });
        updateSortIndicators();
        elements.tabelHasil.innerHTML = '';
        elements.rekapContainer.innerHTML = '';
        if (filteredPesanan.length === 0) {
            elements.tabelHasil.innerHTML = `<tr><td colspan="8" class="text-center p-4 text-text-secondary">Tidak ada data yang cocok.</td></tr>`;
            elements.grandTotalEl.textContent = formatRupiah(0);
            return;
        }
        let grandTotal = 0;
        const rekapBarang = {};
        filteredPesanan.forEach(item => {
            grandTotal += item.hargaSatuan * item.jumlah;
            let namaBarangRekap = item.barang;
            const detailSplit = item.detail ? item.detail.split(',')[0] : '';
            if (item.barang === 'Kaos Polo' && detailSplit) {
                namaBarangRekap = `Kaos Polo - ${detailSplit}`;
            } else if (item.barang === 'Topi' && detailSplit) {
                namaBarangRekap = `Topi - ${detailSplit}`;
            }
            rekapBarang[namaBarangRekap] = (rekapBarang[namaBarangRekap] || 0) + item.jumlah;
        });
        elements.grandTotalEl.textContent = formatRupiah(grandTotal);
        for (const barang in rekapBarang) {
            const card = document.createElement('div');
            card.className = 'bg-[--bg-secondary] border border-[--border-primary] p-4 rounded-lg shadow-md text-center';
            card.innerHTML = `<p class="text-sm text-text-secondary">Total ${barang}</p><p class="text-3xl font-bold text-[--brand-dark]">${rekapBarang[barang]}</p>`;
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
                const rowClass = 'even:bg-black/5 dark:even:bg-white/5';
                const actionButtons = `<button class="edit-btn text-blue-500 hover:text-blue-700" data-id="${item.id}" title="Ubah Jumlah"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z"></path></svg></button><button class="delete-btn text-red-500 hover:text-red-700" data-id="${item.id}" title="Hapus Item"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>`;
                let rowHTML = '';
                if (itemIndex === 0) {
                    rowHTML += `<tr class="border-b text-center ${rowClass}"><td class="p-3 align-top" rowspan="${items.length}">${groupIndex}</td><td class="p-3 text-left align-top font-semibold" rowspan="${items.length}">${nama}</td>`;
                } else {
                    rowHTML += `<tr class="border-b text-center ${rowClass}">`;
                }
                rowHTML += `<td class="p-3 text-left">${item.barang}</td><td class="p-3 text-left">${item.detail || '-'}</td><td class="p-3">${item.jumlah}</td><td class="p-3 tabular-nums text-right">${formatRupiah(item.hargaSatuan)}</td><td class="p-3 tabular-nums text-right">${formatRupiah(subtotal)}</td><td class="p-3 flex justify-center items-center gap-2">${actionButtons}</td></tr>`;
                tableRowsHTML += rowHTML;
            });
            const escapedNama = nama.replace(/"/g, '"');
            tableRowsHTML += `<tr class="bg-[--bg-brand-light]"><td colspan="8" class="text-right font-bold py-3"><div class="flex justify-end items-center px-3 gap-x-4"><span class="mr-4">Total untuk ${nama}</span><span class="inline-block w-32 text-right tabular-nums">${formatRupiah(totalPerNama)}</span><span class="inline-flex items-center gap-x-2 w-48 justify-end"><button class="cetak-struk-btn text-xs text-white bg-blue-600 hover:bg-blue-800 px-2 py-1 rounded" data-nama="${escapedNama}">Cetak Struk</button><button class="delete-group-btn text-xs text-white bg-red-600 hover:bg-red-800 px-2 py-1 rounded" data-nama="${escapedNama}">Hapus Semua</button></span></div></td></tr>`;
            elements.tabelHasil.innerHTML += tableRowsHTML;
        }
    };
    const getSortValue = (item, column) => {
        switch (column) {
            case 'nama': return item.nama.toLowerCase();
            case 'barang': return item.barang.toLowerCase();
            case 'jumlah': return item.jumlah;
            case 'subtotal': return item.jumlah * item.hargaSatuan;
            default: return item.nama.toLowerCase();
        }
    };
    const updateSortIndicators = () => {
        elements.sortableHeaders.forEach(header => {
            const indicator = header.querySelector('.sort-indicator');
            if (header.dataset.sort === currentSort.column) {
                indicator.textContent = currentSort.order === 'asc' ? '▲' : '▼';
            } else {
                indicator.textContent = '';
            }
        });
    };
    const sendDataToGoogleSheet = async (data) => {
        const formData = new FormData();
        formData.append('action', 'addOrder');
        
        for (const key in data) {
            formData.append(key, data[key]);
        }
        try {
            await fetch(GOOGLE_SHEET_URL, {
                method: 'POST',
                body: formData,
            });
            return true;
        } catch (error) {
            console.error('Error sending data to Google Sheet:', error);
            return false;
        }
    };
    const tambahPesanan = async (e) => {
        e.preventDefault();
        const submitButton = elements.submitBtn;
        const submitButtonText = elements.submitBtnText;
        const originalButtonText = submitButtonText.textContent;
        submitButton.disabled = true;
        submitButtonText.textContent = 'Menyimpan...';

        const pesanan = loadDraft();
        const detailArray = [];
        const selectedBarang = elements.barangSelect.value;
        if (selectedBarang === 'Kaos Polo' && elements.bahanPoloSelect.value) detailArray.push(elements.bahanPoloSelect.value);
        if (selectedBarang === 'Topi' && elements.bahanTopiSelect.value) detailArray.push(elements.bahanTopiSelect.value);
        if (elements.opsiTipeLengan.style.display !== 'none' && elements.tipeLenganSelect.value) detailArray.push(elements.tipeLenganSelect.value);
        if (elements.opsiUkuran.style.display !== 'none' && elements.ukuranSelect.value) detailArray.push(elements.ukuranSelect.value);

        const newItem = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            nama: elements.namaInput.value.trim(),
            barang: selectedBarang,
            detail: detailArray.join(', '),
            jumlah: parseInt(elements.jumlahInput.value),
            hargaSatuan: calculatePrice()
        };

        if (!newItem.nama || !newItem.barang || newItem.jumlah <= 0) {
             await showModal({ title: 'Input Tidak Lengkap', message: 'Nama, jenis barang, dan jumlah harus diisi.' });
             submitButton.disabled = false;
             submitButtonText.textContent = originalButtonText;
             return;
        }
        if (newItem.hargaSatuan <= 0) {
            await showModal({ title: 'Input Tidak Lengkap', message: 'Silakan pilih bahan atau detail lain yang diperlukan untuk menghitung harga.' });
            submitButton.disabled = false;
            submitButtonText.textContent = originalButtonText;
            return;
        }

        const isSynced = await sendDataToGoogleSheet(newItem);

        pesanan.push(newItem);
        saveDraft(pesanan);
        elements.form.reset();
        toggleFormOptions();
        updateLivePriceDisplay();

        if (isSynced) {
            await showModal({ title: 'Berhasil!', message: 'Pesanan berhasil ditambahkan dan disinkronkan.' });
        } else {
            await showModal({ title: 'Peringatan', message: 'Gagal melakukan sinkronisasi. Data hanya tersimpan di perangkat ini.' });
        }
        setActiveView('rekap');
        submitButton.disabled = false;
        submitButtonText.textContent = originalButtonText;
    };
    const calculatePrice = () => {
        const barang = elements.barangSelect.value;
        const bahanPolo = elements.bahanPoloSelect.value;
        const bahanTopi = elements.bahanTopiSelect.value;
        const ukuran = elements.ukuranSelect.value;
        let basePrice = 0;
        if (barang === 'Kaos Polo') basePrice = HARGA_BARANG[bahanPolo] || 0;
        else if (barang === 'Topi') basePrice = HARGA_BARANG[bahanTopi] || 0;
        else basePrice = HARGA_BARANG[barang] || 0;
        if (BARANG_PAKAI_UKURAN.includes(barang) && ['XXL', 'XXXL'].includes(ukuran)) {
            basePrice += 10000;
        }
        return basePrice;
    };
    const updateLivePriceDisplay = () => {
        const price = calculatePrice();
        elements.hargaSatuanDisplay.textContent = formatRupiah(price > 0 ? price : 0);
        elements.livePriceDisplay.classList.toggle('hidden', price <= 0);
    };
    const toggleFormOptions = () => {
        const selectedBarang = elements.barangSelect.value;
        elements.opsiBahanPolo.style.display = selectedBarang === 'Kaos Polo' ? 'block' : 'none';
        elements.opsiBahanTopi.style.display = selectedBarang === 'Topi' ? 'block' : 'none';
        elements.opsiUkuran.style.display = BARANG_PAKAI_UKURAN.includes(selectedBarang) ? 'block' : 'none';
        elements.opsiTipeLengan.style.display = selectedBarang === 'Kaos' ? 'block' : 'none';
    };
    const deleteItem = async (id) => {
        const confirmed = await showModal({ title: 'Konfirmasi Hapus', message: 'Hapus item ini dari pesanan?', type: 'confirm', confirmText: 'Ya, Hapus' });
        if (!confirmed) return;

        const action = 'deleteItem';
        const payload = { id: id.toString() };
        
        const isSynced = await syncActionToSheet(action, payload);
        if (isSynced) {
            saveDraft(loadDraft().filter(item => item.id != id));
            renderHasil();
            showModal({ title: 'Berhasil', message: 'Item telah dihapus.' });
        } else {
            showModal({ title: 'Gagal Sinkronisasi', message: 'Gagal menghapus item dari server. Periksa koneksi dan coba lagi.' });
        }
    };
    const deleteGroup = async (nama) => {
        const confirmed = await showModal({ title: 'Konfirmasi Hapus Grup', message: `Yakin ingin menghapus <b>SEMUA</b> pesanan atas nama <b>${nama}</b>?`, type: 'confirm', confirmText: 'Ya, Hapus Semua' });
        if (!confirmed) return;

        const action = 'deleteGroup';
        const payload = { nama: nama };

        const isSynced = await syncActionToSheet(action, payload);
        if(isSynced) {
            saveDraft(loadDraft().filter(item => item.nama !== nama));
            renderHasil();
            showModal({ title: 'Berhasil', message: `Semua pesanan a/n ${nama} telah dihapus.`});
        } else {
            showModal({ title: 'Gagal Sinkronisasi', message: 'Gagal menghapus grup dari server. Periksa koneksi dan coba lagi.' });
        }
    };
    const syncActionToSheet = async (action, payload) => {
        const formData = new FormData();
        formData.append('action', action);
        for (const key in payload) {
            formData.append(key, payload[key]);
        }
        try {
            const response = await fetch(GOOGLE_SHEET_URL, {
                method: 'POST',
                body: formData,
            });
            const result = await response.json();
            return result.status === 'success';
        } catch (error) {
            console.error('Error syncing action to Google Sheet:', error);
            return false;
        }
    };
    const editItem = async (id) => {
        const pesanan = loadDraft();
        const item = pesanan.find(p => p.id == id);
        if (!item) return;
        const jumlahBaruStr = await showModal({ title: 'Ubah Jumlah', message: 'Masukkan jumlah pesanan baru:', type: 'prompt', defaultValue: item.jumlah.toString(), confirmText: 'Simpan' });
        if (jumlahBaruStr && !isNaN(jumlahBaruStr) && parseInt(jumlahBaruStr) > 0) {
            // Logika untuk sinkronisasi edit akan ditambahkan di langkah selanjutnya
            item.jumlah = parseInt(jumlahBaruStr);
            saveDraft(pesanan);
            renderHasil();
            showModal({title: 'Catatan', message: 'Perubahan jumlah baru tersimpan di web. Fitur sinkronisasi edit akan ditambahkan selanjutnya.'});
        } else if (jumlahBaruStr !== null) {
            await showModal({ title: 'Input Tidak Valid', message: 'Jumlah harus berupa angka lebih dari nol.' });
        }
    };
    const renderStatistik = () => {
        const pesanan = loadDraft();
        const ctx = document.getElementById('chart-barang-terlaris').getContext('2d');
        const rekapBarang = {};
        pesanan.forEach(item => {
            rekapBarang[item.barang] = (rekapBarang[item.barang] || 0) + item.jumlah;
        });
        const sortedBarang = Object.entries(rekapBarang).sort(([, a], [, b]) => b - a).slice(0, 10);
        const labels = sortedBarang.map(item => item[0]);
        const data = sortedBarang.map(item => item[1]);
        if (chartBarangInstance) {
            chartBarangInstance.destroy();
        }
        chartBarangInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Jumlah Dipesan',
                    data: data,
                    backgroundColor: 'rgba(235, 104, 37, 0.6)',
                    borderColor: 'rgba(75, 39, 27, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                indexAxis: 'y',
                scales: { x: { beginAtZero: true } },
                responsive: true,
                maintainAspectRatio: false,
            }
        });
    };
    const generateWhatsAppBody = () => {
        const pesanan = loadDraft();
        if (pesanan.length === 0) return "Tidak ada data pesanan.";
        let body = "Halo, berikut rekapitulasi pesanan:\n\n";
        const grouped = pesanan.reduce((acc, p) => {
            if(!acc[p.nama]) acc[p.nama] = [];
            acc[p.nama].push(p);
            return acc;
        }, {});
        for(const nama in grouped) {
            body += `*Pesanan a/n ${nama}*:\n`;
            let totalPerNama = 0;
            grouped[nama].forEach(p => {
                body += `- ${p.barang} (${p.detail || '-'}) ${p.jumlah} pcs = ${formatRupiah(p.jumlah * p.hargaSatuan)}\n`;
                totalPerNama += p.jumlah * p.hargaSatuan;
            });
            body += `_Subtotal: ${formatRupiah(totalPerNama)}_\n\n`;
        }
        const grandTotal = pesanan.reduce((total, p) => total + (p.hargaSatuan * p.jumlah), 0);
        body += `*TOTAL KESELURUHAN: ${formatRupiah(grandTotal)}*`;
        return body;
    };
    const selectAdminAndSendWhatsApp = async () => {
        const pesanan = loadDraft();
        if (pesanan.length === 0) {
            return await showModal({ title: "Gagal", message: "Tidak ada data pesanan untuk dikirim." });
        }
        const admins = [
            { name: 'Pusat (Wendit)', number: '6281335359499' },
            { name: 'Cabang (Kota Batu)', number: '6281333418777' }
        ];
        elements.modalTitle.textContent = 'Pilih Kontak Admin';
        elements.modalMessage.innerHTML = '<p class="mb-4">Pilih admin yang ingin Anda kirimi rekap pesanan via WhatsApp:</p>';
        elements.modalInput.classList.add('hidden');
        elements.modalActions.innerHTML = ''; 
        const body = generateWhatsAppBody();
        admins.forEach(admin => {
            const adminButton = Object.assign(document.createElement('button'), {
                textContent: admin.name,
                className: 'w-full text-left px-4 py-3 bg-gray-100 dark:bg-slate-700 rounded-md hover:bg-gray-200 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-primary transition-colors mb-2',
                onclick: () => {
                    window.open(`https://wa.me/${admin.number}?text=${encodeURIComponent(body)}`, '_blank');
                    closeModal();
                }
            });
            elements.modalMessage.appendChild(adminButton);
        });
        const cancelButton = Object.assign(document.createElement('button'), {
            textContent: 'Batal',
            className: 'px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 mt-2',
            onclick: closeModal
        });
        elements.modalActions.appendChild(cancelButton);
        elements.modalOverlay.classList.remove('hidden');
        setTimeout(() => toggleModalAnimationClasses(true), 50);
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
        body += `\nTOTAL KESELURUHAN: ${formatRupiah(grandTotal)}\n================================================\n\nTerima kasih atas pesanannya.`;
        return body;
    };
    const sendEmailWithAttachmentGuidance = async () => {
        const pesanan = loadDraft();
        if (pesanan.length === 0) {
            return await showModal({ title: "Gagal", message: "Tidak ada data pesanan untuk dikirim." });
        }
        try {
            await exportToPDF({ autoDownload: true });
            const openEmail = await showModal({
                title: 'PDF Telah Diunduh',
                message: 'Rekap pesanan PDF telah disimpan ke folder Unduhan Anda. Silakan lampirkan file tersebut secara manual ke email yang akan segera terbuka.',
                type: 'confirm',
                confirmText: 'Lanjutkan & Buka Email',
                cancelText: 'Batal'
            });
            if (openEmail) {
                const subject = "Rekapitulasi Pesanan";
                const body = generateEmailBody();
                window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            }
        } catch (error) {
            console.log("PDF export dibatalkan atau gagal, email tidak dibuka.");
        }
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
    const exportToPDF = async ({ autoDownload = true } = {}) => {
        const pesanan = loadDraft();
        if (pesanan.length === 0) {
            if (autoDownload) {
                 await showModal({ title: "Gagal", message: "Tidak ada data pesanan untuk diekspor." });
            }
            return Promise.reject('No data');
        }
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const tableHead = [['No', 'Nama', 'Barang', 'Detail', 'Jml', 'Harga', 'Subtotal']];
        const tableBody = pesanan.map((p, index) => [ index + 1, p.nama, p.barang, p.detail, p.jumlah, formatRupiah(p.hargaSatuan), formatRupiah(p.jumlah * p.hargaSatuan) ]);
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
        if (autoDownload) {
            doc.save(`Rekap Pesanan_${new Date().toISOString().slice(0, 10)}.pdf`);
        }
        return Promise.resolve();
    };
    const cetakStruk = (nama) => {
        const pesanan = loadDraft().filter(p => p.nama === nama);
        if (pesanan.length === 0) return;
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ unit: 'mm', format: [80, 150] });
        let y = 10;
        let total = 0;
        doc.setFontSize(12).setFont('helvetica', 'bold');
        doc.text('TRITUNGGAL LANCAR', 40, y, { align: 'center' });
        y += 5;
        doc.setFontSize(8).setFont('helvetica', 'normal');
        doc.text('Pusat Sablon & Merchandise', 40, y, { align: 'center' });
        y += 7;
        doc.line(5, y, 75, y);
        y += 5;
        doc.text(`Nama Pemesan: ${nama}`, 5, y);
        y += 4;
        doc.text(`Tanggal: ${new Date().toLocaleDateString('id-ID')}`, 5, y);
        y += 7;
        doc.setFont('courier', 'normal');
        pesanan.forEach(item => {
            const subtotal = item.jumlah * item.hargaSatuan;
            total += subtotal;
            doc.text(`${item.barang} ${item.detail || ''}`.substring(0, 30), 5, y);
            y += 4;
            const priceText = `${item.jumlah}x @${(item.hargaSatuan/1000).toFixed(0)}k`;
            const subtotalText = formatRupiah(subtotal);
            doc.text(priceText, 5, y);
            doc.text(subtotalText, 75, y, { align: 'right' });
            y += 5;
        });
        doc.line(5, y, 75, y);
        y += 5;
        doc.setFont('courier', 'bold');
        doc.text('TOTAL', 5, y);
        doc.text(formatRupiah(total), 75, y, { align: 'right' });
        y += 7;
        doc.setFontSize(8).setFont('helvetica', 'italic');
        doc.text('Terima kasih atas pesanan Anda!', 40, y, { align: 'center' });
        doc.save(`Struk_${nama}_${new Date().toISOString().slice(0, 10)}.pdf`);
    };
    
    // STEP 4: PASANG EVENT LISTENERS
    elements.liveDateEl.textContent = new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    
    elements.tabs.forEach(tab => {
        tab.addEventListener('click', () => setActiveView(tab.id.replace('tab-', '')));
    });
    elements.sidebarBtns.forEach(btn => {
        btn.addEventListener('click', () => setActiveView(btn.dataset.tab));
    });
    elements.hamburgerBtn.addEventListener('click', toggleSidebar);
    elements.sidebarOverlay.addEventListener('click', toggleSidebar);
    
    elements.form.addEventListener('submit', tambahPesanan);
    elements.barangSelect.addEventListener('change', () => { toggleFormOptions(); updateLivePriceDisplay(); });
    ['bahanPoloSelect', 'bahanTopiSelect', 'ukuranSelect', 'tipeLenganSelect'].forEach(id => {
        elements[id]?.addEventListener('change', updateLivePriceDisplay);
    });
    
    elements.searchRekap.addEventListener('input', () => renderHasil());
    
    elements.filterSelect.addEventListener('change', (e) => {
        currentFilter = e.target.value;
        renderHasil();
    });

    elements.sortableHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const column = header.dataset.sort;
            if (currentSort.column === column) {
                currentSort.order = currentSort.order === 'asc' ? 'desc' : 'asc';
            } else {
                currentSort.column = column;
                currentSort.order = 'asc';
            }
            renderHasil();
        });
    });
    elements.tabelHasil.addEventListener('click', async (e) => {
        const deleteBtn = e.target.closest('.delete-btn');
        const editBtn = e.target.closest('.edit-btn');
        const strukBtn = e.target.closest('.cetak-struk-btn');
        const deleteGroupBtn = e.target.closest('.delete-group-btn');
        if (deleteBtn) await deleteItem(parseInt(deleteBtn.dataset.id));
        if (editBtn) await editItem(parseInt(editBtn.dataset.id));
        if (strukBtn) cetakStruk(strukBtn.dataset.nama);
        if (deleteGroupBtn) await deleteGroup(deleteGroupBtn.dataset.nama);
    });
    
    elements.clearBtn.addEventListener('click', async () => {
        const confirmed = await showModal({
            title: 'Reset Semua Data',
            message: 'YAKIN ingin mengosongkan <b>SEMUA</b> data pesanan dari aplikasi dan server secara permanen?',
            type: 'confirm',
            confirmText: 'Ya, Kosongkan Semua'
        });

        if (confirmed) {
            const isSynced = await syncActionToSheet('clearAll', {});
            
            if (isSynced) {
                saveDraft([]);
                renderHasil();
                await showModal({ title: 'Berhasil', message: 'Semua data pesanan telah dikosongkan.' });
            } else {
                await showModal({ title: 'Gagal Sinkronisasi', message: 'Gagal mengosongkan data di server. Tidak ada data yang dihapus.' });
            }
        }
    });
    
    elements.waBtn.addEventListener("click", selectAdminAndSendWhatsApp);
    elements.excelBtn.addEventListener("click", exportToExcel);
    elements.emailBtn.addEventListener("click", sendEmailWithAttachmentGuidance);
    elements.pdfBtn.addEventListener("click", exportToPDF);
    
    elements.themeToggleBtnSidebar.addEventListener('click', toggleTheme);
    elements.modalCloseBtn.addEventListener('click', closeModal);

    // STEP 5: INISIALISASI APLIKASI
    const initializeApp = async () => {
        initializeTheme();
        await loadDataFromSheet();
        setActiveView('form');
        toggleFormOptions();
        updateLivePriceDisplay();
    };

    initializeApp();

});