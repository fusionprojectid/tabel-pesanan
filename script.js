document.addEventListener('DOMContentLoaded', function() {
    const sizes = ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
    const types = ['Pen', 'Pan'];
    const dataCols = ['LINMAS', 'RW 01', 'RW 02', 'RW 03', 'RW 04', 'RW 05', 'RW 06', 'RW 07', 'RW 08', 'RW 09', 'PKK', 'POSYANDU', 'BKM', 'KELTAN', 'KADERLIN', 'LPMK', 'KIM', 'KELSI', 'POKJA', 'KATAR', 'KELURAHAN'];
    const numDataCols = dataCols.length;
    const initialData = {
         S: { Pen: ['', '', '', '', '', '', '', '', '', '', '', '', '4', '', '', '', '', '', '', '', ''], Pan: ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''] },
        M: { Pen: ['', '10', '1', '2', '', '', '2', '', '', '', '6', '3', '1', '', '', '1', '', '', '9', '', ''], Pan: ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''] },
        L: { Pen: ['15', '3', '2', '3', '1', '3', '2', '5', '1', '1', '1', '17', '15', '2', '1', '10', '1', '1', '6', '7', ''], Pan: ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '1'] },
        XL: { Pen: ['21', '2', '', '3', '1', '1', '2', '', '2', '2', '3', '5', '33', '4', '', '1', '', '3', '12', '8', ''], Pan: ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '1'] },
        XXL: { Pen: ['5', '1', '2', '', '1', '2', '3', '1', '1', '1', '1', '6', '17', '', '', '1', '', '', '4', '1', ''], Pan: ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '1'] },
        XXXL: { Pen: ['', '1', '', '2', '1', '', '1', '', '', '', '1', '9', '', '1', '', '', '', '', '1', '', ''], Pan: ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '10'] }
    };

    function generateTable() {
        const tableBody = document.getElementById('table-body');
        const totalRow = document.getElementById('total-row');
        tableBody.innerHTML = '';
        sizes.forEach(size => {
            types.forEach((type, typeIndex) => {
                const row = document.createElement('tr');
                if (typeIndex === 0) row.innerHTML += `<td rowspan="2" class="size-header border-r border-gray-200 p-2">${size}</td>`;
                const typeBg = type === 'Pan' ? 'bg-red-50' : 'bg-yellow-50';
                row.innerHTML += `<td class="font-medium border-r border-gray-200 p-2 ${typeBg}">${type}</td>`;
                for (let i = 0; i < numDataCols; i++) {
                    const input = document.createElement('input');
                    input.type = 'text';
                    input.id = `cell-${size}-${type}-${i}`;
                    input.className = 'data-input';
                    input.value = initialData[size][type][i] || '';
                    const cell = document.createElement('td');
                    cell.className = 'border-r border-gray-200 last:border-r-0';
                    cell.appendChild(input);
                    row.appendChild(cell);
                }
                row.innerHTML += `<td id="total-${size}-${type}" class="readonly-cell p-2">0</td>`;
                tableBody.appendChild(row);
            });
        });
        totalRow.innerHTML = `<td colspan="2" class="border-r border-gray-200 p-2 readonly-cell">TOTAL</td>`;
        for (let i = 0; i < numDataCols; i++) totalRow.innerHTML += `<td id="col-total-${i}" class="border-r last:border-r-0 border-gray-200 p-2 font-semibold">0</td>`;
        totalRow.innerHTML += `<td id="grand-total" class="readonly-cell p-2">0</td>`;
        document.querySelectorAll('.data-input').forEach(input => input.addEventListener('input', calculateTotals));
    }

    function calculateTotals() {
        const colTotals = Array(numDataCols).fill(0);
        let grandTotal = 0, totalPendek = 0, totalPanjang = 0;
        sizes.forEach(size => {
            types.forEach(type => {
                let rowTotal = 0;
                for (let i = 0; i < numDataCols; i++) {
                    const input = document.getElementById(`cell-${size}-${type}-${i}`);
                    const value = parseInt(input.value) || 0;
                    rowTotal += value;
                    colTotals[i] += value;
                }
                document.getElementById(`total-${size}-${type}`).textContent = rowTotal;
                grandTotal += rowTotal;
                if (type === 'Pen') totalPendek += rowTotal; else totalPanjang += rowTotal;
            });
        });
        for (let i = 0; i < numDataCols; i++) document.getElementById(`col-total-${i}`).textContent = colTotals[i];
        document.getElementById('grand-total').textContent = grandTotal;
        document.getElementById('summary-pendek').textContent = totalPendek;
        document.getElementById('summary-panjang').textContent = totalPanjang;
        document.getElementById('summary-grand-total').textContent = grandTotal;
    }

    generateTable();
    calculateTotals();
    
    // View Switching Logic
    const tabs = [
        { btn: document.getElementById('tab-form'), view: document.getElementById('view-form') },
        { btn: document.getElementById('tab-rekap'), view: document.getElementById('view-rekap') },
        { btn: document.getElementById('tab-lokasi'), view: document.getElementById('view-lokasi') }
    ];

    tabs.forEach(tab => {
        tab.btn.addEventListener('click', () => {
            tabs.forEach(otherTab => {
                otherTab.view.style.display = 'none';
                otherTab.btn.classList.remove('active');
            });
            tab.view.style.display = 'block';
            tab.btn.classList.add('active');
        });
    });

    // Form Input Logic with Confirmation
    const addDataForm = document.getElementById('add-data-form');
    const formBidang = document.getElementById('form-bidang');
    const saveConfirmModal = document.getElementById('save-confirm-modal');
    const confirmSaveBtn = document.getElementById('confirm-save');
    const cancelSaveBtn = document.getElementById('cancel-save');

    dataCols.forEach(colName => {
        formBidang.innerHTML += `<option value="${colName}">${colName}</option>`;
    });

    addDataForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const jumlah = document.getElementById('form-jumlah').value;
        if (!jumlah || jumlah < 1) { alert('Mohon isi jumlah pesanan.'); return; }

        document.getElementById('confirm-bidang').textContent = document.getElementById('form-bidang').value;
        document.getElementById('confirm-ukuran').textContent = document.getElementById('form-ukuran').value;
        document.getElementById('confirm-tipe').textContent = document.getElementById('form-tipe').value;
        document.getElementById('confirm-jumlah').textContent = jumlah;
        
        saveConfirmModal.style.display = 'flex';
    });

    cancelSaveBtn.addEventListener('click', () => {
        saveConfirmModal.style.display = 'none';
    });

    confirmSaveBtn.addEventListener('click', () => {
        const bidang = document.getElementById('confirm-bidang').textContent;
        const ukuran = document.getElementById('confirm-ukuran').textContent;
        const tipe = document.getElementById('confirm-tipe').textContent;
        const jumlah = document.getElementById('confirm-jumlah').textContent;

        const colIndex = dataCols.indexOf(bidang);
        const cellId = `cell-${ukuran}-${tipe}-${colIndex}`;
        const targetCell = document.getElementById(cellId);
        
        if (targetCell) {
            targetCell.value = (parseInt(targetCell.value) || 0) + parseInt(jumlah);
            calculateTotals();
            addDataForm.reset();
            saveConfirmModal.style.display = 'none';
            const toast = document.getElementById('success-toast');
            toast.style.display = 'block';
            setTimeout(() => { toast.style.display = 'none'; }, 2000);
        }
    });

    // Other Modals Logic (Clear, WhatsApp)
    const clearDataBtn = document.getElementById('clear-data-btn');
    const confirmModal = document.getElementById('confirm-modal');
    const cancelClearBtn = document.getElementById('cancel-clear');
    const confirmClearBtn = document.getElementById('confirm-clear');
    clearDataBtn.addEventListener('click', () => { confirmModal.style.display = 'flex'; });
    cancelClearBtn.addEventListener('click', () => { confirmModal.style.display = 'none'; });
    confirmClearBtn.addEventListener('click', () => {
        document.querySelectorAll('.data-input').forEach(input => { input.value = ''; });
        calculateTotals();
        confirmModal.style.display = 'none';
    });
    const printBtn = document.getElementById('print-btn');
    const whatsappBtn = document.getElementById('whatsapp-btn');
    const whatsappModal = document.getElementById('whatsapp-modal');
    const closeWhatsappModalBtn = document.getElementById('close-whatsapp-modal');
    const modalPrintBtn = document.getElementById('modal-print-btn');
    printBtn.addEventListener('click', () => window.print());
    modalPrintBtn.addEventListener('click', () => window.print());
    whatsappBtn.addEventListener('click', () => { whatsappModal.style.display = 'flex'; });
    closeWhatsappModalBtn.addEventListener('click', () => { whatsappModal.style.display = 'none'; });
    
    window.addEventListener('click', (event) => {
        if (event.target == confirmModal) { confirmModal.style.display = "none"; }
        if (event.target == whatsappModal) { whatsappModal.style.display = "none"; }
        if (event.target == saveConfirmModal) { saveConfirmModal.style.display = "none"; }
    });

    // Live Date and Time
    function updateDateTime() {
        const now = new Date();
        const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
        const timeString = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
        const dateString = `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
        document.getElementById('live-time').textContent = timeString;
        document.getElementById('live-date').textContent = dateString;
    }
    updateDateTime();
    setInterval(updateDateTime, 1000);
});
