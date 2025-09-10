// ====== Global Variables ======
let csvData = [];
let excelData = [];
let updatedCsvData = [];
let originalExcelFileName = "";

// ====== CSV File Handling ======
document.getElementById('csvFileInput').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    document.getElementById('csvFileName').textContent = file.name;

    const reader = new FileReader();
    reader.onload = function(event) {
        const text = event.target.result;
        csvData = parseCSV(text);
        populateColumns('csvStudentCol', csvData);
        populateColumns('csvMarkCol', csvData);
        log("CSV file loaded. Select columns for student number and marks.");
    };
    reader.readAsText(file);
});

// ====== Excel File Handling ======
document.getElementById('excelFileInput').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    document.getElementById('excelFileName').textContent = file.name;
    originalExcelFileName = file.name.split('.').slice(0, -1).join('.'); // Remove extension

    const reader = new FileReader();
    reader.onload = function(event) {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        excelData = XLSX.utils.sheet_to_json(sheet, { header: 1 }); // 2D array

        // Populate columns with headers or fallback
        populateColumns('excelStudentCol', excelData);
        populateColumns('excelMarkDestCol', excelData);
        log("Excel template loaded. Select student and destination columns.");
    };
    reader.readAsArrayBuffer(file);
});

// ====== Populate Column Dropdown ======
function populateColumns(selectId, data) {
    const select = document.getElementById(selectId);
    select.innerHTML = "";
    if (!data || data.length === 0) return;

    // Use first row as headers if present, otherwise fallback to Column 1, 2, ...
    const headers = data[0].map((colName, idx) => {
        return colName && colName.toString().trim() !== "" ? colName : `Column ${idx + 1}`;
    });

    headers.forEach((colName, idx) => {
        const option = document.createElement('option');
        option.value = idx;
        option.text = colName;
        select.appendChild(option);
    });
}

// ====== Parse CSV ======
function parseCSV(text) {
    const lines = text.split(/\r?\n/);
    return lines.map(line => line.split(','));
}

// ====== Transfer Marks ======
function transferMarks() {
    if (!csvData.length || !excelData.length) {
        log("Please load both CSV and Excel files.");
        return;
    }

    const csvStudentCol = parseInt(document.getElementById('csvStudentCol').value);
    const csvMarkCol = parseInt(document.getElementById('csvMarkCol').value);
    const excelStudentCol = parseInt(document.getElementById('excelStudentCol').value);
    const excelMarkDestCol = parseInt(document.getElementById('excelMarkDestCol').value);
    const iceTask = document.getElementById('iceTaskCheckbox').checked;

    // Clone Excel data for updated output
    updatedCsvData = excelData.map(row => [...row]);

    // Create a map of student -> mark from CSV
    const csvMap = {};
    csvData.forEach(row => {
        const student = row[csvStudentCol];
        const mark = row[csvMarkCol];
        if (student) csvMap[student] = mark;
    });

    // Transfer marks into Excel
    updatedCsvData.forEach((row, idx) => {
        if (idx === 0) return; // Skip header
        const studentId = row[excelStudentCol];
        if (!studentId) return;

        if (iceTask) {
            // ICE Task logic: 100 if student exists, else 0
            row[excelMarkDestCol] = csvMap.hasOwnProperty(studentId) ? 100 : 0;
        } else {
            row[excelMarkDestCol] = csvMap[studentId] || "";
        }
    });

    log("Marks transferred. You can now download the updated CSV.");
    renderTable('logOutput', updatedCsvData, updatedCsvData[0]);
    document.getElementById('downloadButton').disabled = false;
}

// ====== Render Preview Table ======
function renderTable(containerId, dataArray, columns) {
    const container = document.getElementById(containerId);
    if (!container) return; // Extra precaution
    container.innerHTML = "";

    if (!dataArray || dataArray.length === 0) return;

    const table = document.createElement('table');

    // Header row
    const headerRow = document.createElement('tr');
    columns.forEach(col => {
        const th = document.createElement('th');
        th.textContent = col;
        headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    // Data rows
    dataArray.slice(1).forEach(row => {
        const tr = document.createElement('tr');
        row.forEach(cell => {
            const td = document.createElement('td');
            td.textContent = cell !== undefined ? cell : "";
            tr.appendChild(td);
        });
        table.appendChild(tr);
    });

    container.appendChild(table);
}

// ====== Download CSV ======
document.getElementById('downloadButton').addEventListener('click', () => {
    if (!updatedCsvData || updatedCsvData.length === 0) return;

    const dateStr = new Date().toISOString().split('T')[0];
    const customName = document.getElementById('customFilename').value.trim();
    const filename = customName
        ? `${customName}_updated_${dateStr}.csv`
        : `${originalExcelFileName}_updated_${dateStr}.csv`;

    const csvContent = updatedCsvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', filename);
    link.click();
    log(`Downloaded CSV: ${filename}`);
});

// ====== Transfer Button ======
document.getElementById('transferButton').addEventListener('click', transferMarks);

// ====== Reset ======
document.getElementById('resetButton').addEventListener('click', () => {
    csvData = [];
    excelData = [];
    updatedCsvData = [];
    originalExcelFileName = "";

    document.getElementById('csvFileInput').value = "";
    document.getElementById('excelFileInput').value = "";
    document.getElementById('csvStudentCol').innerHTML = "";
    document.getElementById('csvMarkCol').innerHTML = "";
    document.getElementById('excelStudentCol').innerHTML = "";
    document.getElementById('excelMarkDestCol').innerHTML = "";
    document.getElementById('customFilename').value = "";
    document.getElementById('downloadButton').disabled = true;
    document.getElementById('logOutput').innerHTML = "";
});

// ====== Logging ======
function log(message) {
    const logDiv = document.getElementById('logOutput');
    logDiv.textContent += message + "\n";
    logDiv.scrollTop = logDiv.scrollHeight;
}
