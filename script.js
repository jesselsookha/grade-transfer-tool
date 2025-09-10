// ====================
// GLOBAL STATE
// ====================
let csvData = [];
let csvHeaders = [];

let excelData = [];
let excelHeaders = [];
let workbookRef = null;
let worksheetName = "";
let originalExcelFileName = "";
let rawExcelArray = []; // stores full Excel data row-by-row

function normalizeID(id) {
    return id ? id.replace(/^#/, '').trim() : "";
}

function populateDropdown(id, headers) {
    const select = document.getElementById(id);
    select.innerHTML = '';
    headers.forEach(header => {
        const option = document.createElement('option');
        option.value = header;
        option.textContent = header;
        select.appendChild(option);
    });
}

function showLog(message, append = true) {
    const logDiv = document.getElementById('logOutput');
    const time = new Date().toLocaleTimeString();
    const entry = `[${time}] ${message}\n`;
    if (append) {
        logDiv.textContent += entry;
    } else {
        logDiv.textContent = entry;
    }
}

function renderTable(containerId, dataArray, columns) {
    const container = document.getElementById(containerId);
    container.innerHTML = "";

    if (!dataArray || dataArray.length === 0 || !columns.length) return;

    const table = document.createElement('table');
    const thead = table.createTHead();
    const row = thead.insertRow();
    columns.forEach(col => {
        const th = document.createElement('th');
        th.textContent = col;
        row.appendChild(th);
    });

    const tbody = table.createTBody();
    dataArray.forEach(item => {
        const tr = tbody.insertRow();
        columns.forEach(col => {
            const td = tr.insertCell();
            td.textContent = item[col] ?? '';
        });
    });

    container.appendChild(table);
}

// ====================
// CSV PARSING
// ====================
document.getElementById('csvFileInput').addEventListener('change', function (e) {
    const file = e.target.files[0];
    document.getElementById('csvFileName').textContent = file ? file.name : 'No file selected';

    const reader = new FileReader();
    reader.onload = function (event) {
        const lines = event.target.result.split('\n').filter(l => l.trim() !== "");
        csvHeaders = lines[0].split(',').map(h => h.trim());

        csvData = lines.slice(1).map(row => {
            const values = row.split(',').map(v => v.trim());
            return csvHeaders.reduce((obj, header, i) => {
                obj[header] = values[i];
                return obj;
            }, {});
        });

        populateDropdown('csvStudentCol', csvHeaders);
        populateDropdown('csvMarkCol', csvHeaders);
        renderTable("csvPreview", csvData, csvHeaders.slice(0, 2));
    };

    reader.readAsText(file);
});

// ====================
// EXCEL PARSING
// ====================
document.getElementById('excelFileInput').addEventListener('change', function (e) {
    const file = e.target.files[0];
    originalExcelFileName = file.name.replace(/\.xlsx$/, '');
    document.getElementById('excelFileName').textContent = file ? file.name : 'No file selected';

    const reader = new FileReader();
    reader.onload = function (event) {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        workbookRef = workbook;
        worksheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[worksheetName];

        rawExcelArray = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        // Row 2 = headers
        excelHeaders = rawExcelArray[1];

        // Slice from row 3 onwards = data
        excelData = rawExcelArray.slice(2).map(row => {
            let obj = {};
            excelHeaders.forEach((header, i) => {
                obj[header] = row[i];
            });
            return obj;
        });

        populateDropdown('excelStudentCol', excelHeaders);
        populateDropdown('excelMarkDestCol', excelHeaders);
        renderTable("excelPreview", excelData, excelHeaders.slice(0, 2));
    };

    reader.readAsArrayBuffer(file);
});

// ====================
// TRANSFER MARKS
// ====================
document.getElementById('transferButton').addEventListener('click', function () {
    const csvSN = document.getElementById('csvStudentCol').value;
    const csvMark = document.getElementById('csvMarkCol').value;
    const excelSN = document.getElementById('excelStudentCol').value;
    const excelDest = document.getElementById('excelMarkDestCol').value;
    const iceMode = document.getElementById('iceCheckbox').checked; // ⭐ NEW: ICE mode toggle

    if (!csvSN || !csvMark || !excelSN || !excelDest) {
        alert("Please select all column options.");
        return;
    }

    let transferCount = 0;
    const csvMap = {};
    csvData.forEach(row => {
        const id = normalizeID(row[csvSN]);
        if (id) csvMap[id] = row[csvMark];
    });

    showLog("Starting mark transfer...", true);

    excelData.forEach(row => {
        const id = normalizeID(row[excelSN]);
        if (id in csvMap) {
            let mark = csvMap[id];

            if (iceMode) {
                // ⭐ NEW: ICE task rule → any value = 100, missing = 0
                row[excelDest] = mark && mark.trim() !== "" ? "100" : "0";
                showLog(`✔ ICE Task for ${id}: ${row[excelDest]}`);
            } else {
                // normal mark transfer
                if (mark !== undefined && mark !== "") {
                    row[excelDest] = mark;
                    showLog(`✔ Mark for ${id}: ${mark}`);
                } else {
                    row[excelDest] = "0";
                    showLog(`⚠ No mark for ${id}, assigning 0`);
                }
            }
            transferCount++;
        } else {
            row[excelDest] = "0";
            showLog(`⚠ ${id} not found in CSV, assigning 0`);
        }
    });

    showLog(`✅ Transferred marks for ${transferCount} student(s).`);
    document.getElementById('downloadButton').disabled = false;

    renderTable("resultPreview", excelData, [excelSN, excelDest]);
});

// ====================
// DOWNLOAD NEW CSV (⭐ NEW)
// ====================
document.getElementById('downloadButton').addEventListener('click', function () {
    if (!excelData.length) return;

    // reassemble data
    const rows = [excelHeaders, ...excelData.map(row => excelHeaders.map(h => row[h] ?? ""))];
    const csvContent = rows.map(r => r.map(v => `"${v}"`).join(",")).join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

    const dateStr = new Date().toISOString().split('T')[0];
    const customName = document.getElementById('customFilename').value.trim(); // ⭐ NEW
    const filename = customName
        ? `${customName}.csv`
        : `${originalExcelFileName}_updated_${dateStr}.csv`;

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});

// ====================
// RESET BUTTON
// ====================
document.getElementById('resetButton').addEventListener('click', function () {
    csvData = [];
    csvHeaders = [];
    excelData = [];
    excelHeaders = [];
    rawExcelArray = [];
    workbookRef = null;
    worksheetName = "";
    originalExcelFileName = "";

    document.getElementById('csvFileInput').value = "";
    document.getElementById('excelFileInput').value = "";
    document.getElementById('csvFileName').textContent = "No file selected";
    document.getElementById('excelFileName').textContent = "No file selected";
    document.getElementById('customFilename').value = ""; // ⭐ NEW reset custom filename
    document.getElementById('iceCheckbox').checked = false; // ⭐ NEW reset ICE mode

    ['csvStudentCol', 'csvMarkCol', 'excelStudentCol', 'excelMarkDestCol'].forEach(id => {
        const select = document.getElementById(id);
        select.innerHTML = "";
    });

    ['csvPreview', 'excelPreview', 'resultPreview'].forEach(id => {
        document.getElementById(id).innerHTML = "";
    });

    document.getElementById('logOutput').textContent = "";
    document.getElementById('downloadButton').disabled = true;

    showLog("🔄 Tool reset. Ready for a new transfer.", false);
});
