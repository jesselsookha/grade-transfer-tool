// ====================
// Grade Transfer Tool - script.js
// ====================
//
// - Matches current HTML element IDs
// - Shows small previews (10 rows) for selected columns
// - Detects CSV delimiter and shows it in csvInfo
// - ICE-Task logic (100 if attempted, 0 if not) optional
// - Download updated file as CSV with _updated_[YYYY-MM-DD].csv
//
// NOTE: This implementation uses simple CSV splitting (no external CSV library).
//       It is robust for typical LMS exports that use comma or semicolon delimiters.
// ====================

// ---------- Global state ----------
let csvData = [];         // array of objects keyed by csvHeaders
let csvHeaders = [];      // array of header names (CSV row 1)
let rawCsvRows = [];      // raw 2D array of CSV (for counts or other checks)

let rawExcelArray = [];   // full 2D array from XLSX (preserves row1, row2, etc.)
let excelHeaders = [];    // headers from row 2
let excelData = [];       // array of objects for rows (from row3 onwards)
let originalExcelFileName = "";

// ---------- Utility helpers ----------
function normalizeID(id) {
    return id ? id.toString().replace(/^#/, '').trim() : "";
}

// safe DOM getter
function el(id) { return document.getElementById(id); }

// append log entry with timestamp
function showLog(message, append = true) {
    const logDiv = el('logOutput');
    if (!logDiv) return;
    const time = new Date().toLocaleTimeString();
    const entry = `[${time}] ${message}\n`;
    if (append) logDiv.textContent += entry;
    else logDiv.textContent = entry;
    logDiv.scrollTop = logDiv.scrollHeight;
}

// ---------- CSV: detect delimiter + parse ----------
function detectDelimiter(sampleText) {
    // look at first few lines
    const lines = sampleText.split(/\r?\n/).slice(0, 8).filter(l => l.trim() !== '');
    let commaCount = 0, semiCount = 0;
    lines.forEach(l => {
        commaCount += (l.match(/,/g) || []).length;
        semiCount += (l.match(/;/g) || []).length;
    });
    return semiCount > commaCount ? ';' : ',';
}

function parseCsvText(text, delimiter) {
    // produce raw 2D array
    const rows = text.split(/\r?\n/).filter(r => r.trim() !== '').map(r => r.split(delimiter));
    return rows;
}

// convert raw CSV rows (2D) + header row -> array of objects
function rowsToObjects(rows) {
    if (!rows || rows.length === 0) return [];
    const headers = rows[0].map(h => h ? h.toString().trim() : '');
    const data = rows.slice(1).map(r => {
        const obj = {};
        headers.forEach((h, i) => { obj[h] = r[i] !== undefined ? r[i].toString().trim() : ''; });
        return obj;
    });
    return { headers, data };
}

// ---------- Populate dropdown helper ----------
function populateDropdown(id, headers) {
    const select = el(id);
    if (!select) return;
    select.innerHTML = '';
    headers.forEach(h => {
        const opt = document.createElement('option');
        opt.value = h;
        opt.textContent = h;
        select.appendChild(opt);
    });
}

// ---------- Small preview rendering (10 rows) ----------
function showPreview(type) {
    // type: 'csv', 'excel', or 'result'
    const previewDiv = el(type === 'csv' ? 'csvPreview' : (type === 'excel' ? 'excelPreview' : 'resultPreview'));
    const infoEl = el(type === 'csv' ? 'csvInfo' : (type === 'excel' ? 'excelInfo' : 'resultInfo'));
    if (!previewDiv) return;
    previewDiv.innerHTML = '';
    if (infoEl) infoEl.textContent = '';

    if (type === 'csv') {
        if (!csvData.length) {
            previewDiv.textContent = 'Upload CSV and select columns to preview.';
            return;
        }
        const studentCol = el('csvStudentCol')?.value;
        const markCol = el('csvMarkCol')?.value;
        if (!studentCol || !markCol) {
            previewDiv.textContent = 'Select Student and Mark columns to preview CSV.';
            return;
        }
        // show header + up to 10 rows
        const headerRow = [studentCol, markCol];
        const rows = csvData.slice(0, 10).map(obj => [obj[studentCol] ?? '', obj[markCol] ?? '']);
        renderPreviewTable(previewDiv, headerRow, rows);
        if (infoEl) infoEl.textContent = `Showing ${Math.min(10, csvData.length)} of ${csvData.length} students`;
    } else if (type === 'excel') {
        if (!excelData.length) {
            previewDiv.textContent = 'Upload Excel template and select columns to preview.';
            return;
        }
        const studentCol = el('excelStudentCol')?.value;
        const markCol = el('excelMarkDestCol')?.value;
        if (!studentCol || !markCol) {
            previewDiv.textContent = 'Select Student and Destination columns to preview Excel.';
            return;
        }
        const headerRow = [studentCol, markCol];
        const rows = excelData.slice(0, 10).map(obj => [obj[studentCol] ?? '', obj[markCol] ?? '']);
        renderPreviewTable(previewDiv, headerRow, rows);
        if (infoEl) infoEl.textContent = `Showing ${Math.min(10, excelData.length)} of ${excelData.length} students`;
    } else if (type === 'result') {
        if (!excelData.length) {
            previewDiv.textContent = 'No results to preview yet. Click Transfer first.';
            return;
        }
        const studentCol = el('excelStudentCol')?.value;
        const markCol = el('excelMarkDestCol')?.value;
        if (!studentCol || !markCol) {
            previewDiv.textContent = 'Select Student and Destination columns to preview results.';
            return;
        }
        const headerRow = [studentCol, markCol];
        const rows = excelData.slice(0, 10).map(obj => [obj[studentCol] ?? '', obj[markCol] ?? '']);
        renderPreviewTable(previewDiv, headerRow, rows);
        if (infoEl) infoEl.textContent = `Showing ${Math.min(10, excelData.length)} of ${excelData.length} students (result preview)`;
    }
}

function renderPreviewTable(container, headerRow, rows) {
    container.innerHTML = '';
    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const trh = document.createElement('tr');
    headerRow.forEach(h => { const th = document.createElement('th'); th.textContent = h; trh.appendChild(th); });
    thead.appendChild(trh);
    table.appendChild(thead);
    const tbody = document.createElement('tbody');
    rows.forEach(r => {
        const tr = document.createElement('tr');
        r.forEach(c => { const td = document.createElement('td'); td.textContent = c; tr.appendChild(td); });
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    container.appendChild(table);
}

// ---------- Event handlers for file inputs ----------
el('csvFileInput')?.addEventListener('change', (ev) => {
    const file = ev.target.files[0];
    if (!file) return;
    el('csvFileName') && (el('csvFileName').textContent = file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
        const text = e.target.result;
        const delimiter = detectDelimiter(text); // ',' or ';'
        el('csvInfo') && (el('csvInfo').textContent = `Detected delimiter: "${delimiter}"`);

        // parse rows and convert to objects
        rawCsvRows = parseCsvText(text, delimiter);
        const { headers, data } = rowsToObjects(rawCsvRows);
        csvHeaders = headers;
        csvData = data;

        // populate dropdowns and attach change listeners to update preview
        populateDropdown('csvStudentCol', csvHeaders);
        populateDropdown('csvMarkCol', csvHeaders);
        // update preview when user changes selection
        el('csvStudentCol')?.addEventListener('change', () => showPreview('csv'));
        el('csvMarkCol')?.addEventListener('change', () => showPreview('csv'));

        // initial preview if both selects exist & have default values
        showPreview('csv');

        showLog(`CSV loaded (${csvData.length} rows) — delimiter "${delimiter}".`);
    };
    reader.readAsText(file);
});

el('excelFileInput')?.addEventListener('change', (ev) => {
    const file = ev.target.files[0];
    if (!file) return;
    el('excelFileName') && (el('excelFileName').textContent = file.name);
    originalExcelFileName = file.name.replace(/\.[^/.]+$/, '');

    const reader = new FileReader();
    reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        // Keep entire sheet as 2D array so row1 (maybe metadata) and row2 headers are preserved
        rawExcelArray = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        // Row 2 (index 1) contains the headers in Serosoft template
        excelHeaders = rawExcelArray[1] || [];
        // Data rows start from index 2
        excelData = rawExcelArray.slice(2).map(r => {
            const obj = {};
            excelHeaders.forEach((h, i) => { obj[h] = r[i] !== undefined ? r[i] : ''; });
            return obj;
        });

        populateDropdown('excelStudentCol', excelHeaders);
        populateDropdown('excelMarkDestCol', excelHeaders);
        el('excelStudentCol')?.addEventListener('change', () => showPreview('excel'));
        el('excelMarkDestCol')?.addEventListener('change', () => showPreview('excel'));

        showPreview('excel');
        showLog(`Excel template loaded (${excelData.length} data rows). Headers detected: ${excelHeaders.join(', ')}`);
    };
    reader.readAsArrayBuffer(file);
});

// ---------- Transfer marks ----------
el('transferButton')?.addEventListener('click', () => {
    if (!csvData.length) { alert('Please upload CSV file and select columns.'); return; }
    if (!excelData.length) { alert('Please upload Excel template and select columns.'); return; }

    const csvSN = el('csvStudentCol')?.value;
    const csvMark = el('csvMarkCol')?.value;
    const excelSN = el('excelStudentCol')?.value;
    const excelDest = el('excelMarkDestCol')?.value;
    const iceMode = el('iceCheckbox')?.checked;

    if (!csvSN || !csvMark || !excelSN || !excelDest) {
        alert('Please select all four columns (CSV student, CSV mark, Excel student, Excel destination).');
        return;
    }

    // Build CSV lookup map (student -> mark)
    const csvMap = {};
    csvData.forEach(r => {
        const id = normalizeID(r[csvSN]);
        if (id) csvMap[id] = r[csvMark]; // may be empty string
    });

    // Transfer into excelData (objects)
    let transferCount = 0;
    excelData.forEach(row => {
        const id = normalizeID(row[excelSN]);
        if (!id) { row[excelDest] = row[excelDest] ?? ''; return; }

        if (Object.prototype.hasOwnProperty.call(csvMap, id)) {
            const rawMark = csvMap[id];
            if (iceMode) {
                // ICE: any non-empty mark → 100, else 0
                row[excelDest] = (rawMark !== undefined && rawMark !== null && String(rawMark).trim() !== '') ? '100' : '0';
            } else {
                // Normal transfer, but empty → 0
                row[excelDest] = (rawMark !== undefined && String(rawMark).trim() !== '') ? rawMark : '0';
            }
            transferCount++;
            showLog(`Transferred ${id} → ${row[excelDest]}`);
        } else {
            // Not found in CSV → set 0
            row[excelDest] = '0';
            showLog(`No CSV entry for ${id}; set ${excelDest}=0`);
        }
    });

    showLog(`✅ Transfer complete — ${transferCount} students updated.`, true);

    // Update result preview
    showPreview('result');

    // Enable download
    if (el('downloadButton')) el('downloadButton').disabled = false;
});

// ---------- Download updated CSV (from preserved rawExcelArray) ----------
el('downloadButton')?.addEventListener('click', () => {
    if (!rawExcelArray || rawExcelArray.length === 0) { alert('No data to download.'); return; }

    // Update rawExcelArray rows (row index 2 onwards) with excelData objects
    for (let i = 0; i < excelData.length; i++) {
        const rowObj = excelData[i];
        excelHeaders.forEach((h, colIndex) => {
            // ensure the underlying row array exists
            rawExcelArray[i + 2] = rawExcelArray[i + 2] || [];
            rawExcelArray[i + 2][colIndex] = rowObj[h] ?? '';
        });
    }

    // Build CSV text from rawExcelArray. Escape quotes by doubling.
    function csvEscapeCell(cell) {
        const s = cell === undefined || cell === null ? '' : String(cell);
        // If contains comma, semicolon, quote or newlines, wrap in quotes and escape quotes
        if (/[,"\r\n;]/.test(s)) {
            return '"' + s.replace(/"/g, '""') + '"';
        }
        return s;
    }

    const csvLines = rawExcelArray.map(row => {
        // If row is undefined (possible), output empty line
        if (!row) return '';
        // ensure we map through the full length (some rows may be shorter)
        const maxCols = row.length;
        return row.map((c) => csvEscapeCell(c)).join(',');
    });

    const csvText = csvLines.join('\r\n');

    // Filename handling: custom name or originalExcelFileName, always append _updated_YYYY-MM-DD
    const rawCustom = el('customFilename') ? el('customFilename').value.trim() : '';
    let baseName = rawCustom !== '' ? rawCustom.replace(/\.csv$/i, '') : (originalExcelFileName || 'updated_file');
    const dateStr = new Date().toISOString().slice(0,10); // YYYY-MM-DD
    const filename = `${baseName}_updated_${dateStr}.csv`;

    // Trigger download
    const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showLog(`Downloaded file: ${filename}`);
});

// ---------- Reset ----------
el('resetButton')?.addEventListener('click', () => {
    // reset in-memory
    csvData = []; csvHeaders = []; rawCsvRows = [];
    rawExcelArray = []; excelHeaders = []; excelData = []; originalExcelFileName = '';

    // reset UI fields (if present)
    if (el('csvFileInput')) el('csvFileInput').value = '';
    if (el('excelFileInput')) el('excelFileInput').value = '';
    if (el('csvFileName')) el('csvFileName').textContent = 'No file selected';
    if (el('excelFileName')) el('excelFileName').textContent = 'No file selected';
    if (el('csvPreview')) el('csvPreview').innerHTML = '';
    if (el('excelPreview')) el('excelPreview').innerHTML = '';
    if (el('resultPreview')) el('resultPreview').innerHTML = '';
    if (el('csvInfo')) el('csvInfo').textContent = '';
    if (el('excelInfo')) el('excelInfo').textContent = '';
    if (el('resultInfo')) el('resultInfo').textContent = '';
    if (el('customFilename')) el('customFilename').value = '';
    if (el('iceCheckbox')) el('iceCheckbox').checked = false;
    if (el('downloadButton')) el('downloadButton').disabled = true;
    if (el('csvStudentCol')) el('csvStudentCol').innerHTML = '';
    if (el('csvMarkCol')) el('csvMarkCol').innerHTML = '';
    if (el('excelStudentCol')) el('excelStudentCol').innerHTML = '';
    if (el('excelMarkDestCol')) el('excelMarkDestCol').innerHTML = '';

    showLog('🔄 Tool reset. Ready for a new transfer.', false);
});
