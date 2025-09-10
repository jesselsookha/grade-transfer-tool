// ---------------------------
// Global Variables
// ---------------------------
let csvData = [];              // Stores CSV file data
let excelData = [];            // Stores Excel template data
let updatedExcelData = [];     // Stores the transferred marks data globally

let originalExcelFileName = ""; // Stores original Excel file name for default download

// ---------------------------
// Helper Functions
// ---------------------------

// Parse CSV file into 2D array
function parseCSV(file, callback) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const text = e.target.result;
        const rows = text.split(/\r?\n/).map(row => row.split(','));
        callback(rows);
    };
    reader.readAsText(file);
}

// Read Excel (XLSX) file into 2D array
function readExcel(file, callback) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        callback(jsonData);
    };
    reader.readAsArrayBuffer(file);
}

// Populate column selectors based on first row headers
function populateColumns(selectId, data) {
    const select = document.getElementById(selectId);
    select.innerHTML = "";
    if (!data || data.length === 0) return;
    data[0].forEach((colName, idx) => {
        const option = document.createElement('option');
        option.value = idx;
        option.text = colName || `Column ${idx + 1}`;
        select.appendChild(option);
    });
}

// Render preview table (optional for UI preview)
function renderTable(containerId, dataArray, columns) {
    const container = document.getElementById(containerId);
    container.innerHTML = "";

    if (!dataArray || dataArray.length === 0 || !columns.length) return;

    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    columns.forEach(col => {
        const th = document.createElement('th');
        th.textContent = col;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    dataArray.forEach(row => {
        const tr = document.createElement('tr');
        columns.forEach((col, idx) => {
            const td = document.createElement('td');
            td.textContent = row[idx] !== undefined ? row[idx] : "";
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    container.appendChild(table);
}

// ---------------------------
// Transfer Marks Logic
// ---------------------------
function transferMarks() {
    if (!csvData.length || !excelData.length) {
        alert("Please upload both CSV and Excel files first.");
        return;
    }

    const csvStudentCol = parseInt(document.getElementById('csvStudentCol').value);
    const csvMarkCol = parseInt(document.getElementById('csvMarkCol').value);

    const excelStudentCol = parseInt(document.getElementById('excelStudentCol').value);
    const excelMarkDestCol = parseInt(document.getElementById('excelMarkDestCol').value);

    const iceTaskMode = document.getElementById('iceTaskCheckbox').checked;

    // Clone the Excel data to avoid overwriting the original array
    updatedExcelData = excelData.map(row => [...row]);

    // Build a map of student marks from CSV
    const csvMap = new Map();
    csvData.slice(1).forEach(row => {
        const student = row[csvStudentCol];
        const mark = row[csvMarkCol];
        csvMap.set(student, mark);
    });

    // Transfer marks to Excel template
    updatedExcelData.slice(1).forEach((row) => {
        const studentNum = row[excelStudentCol];
        if (csvMap.has(studentNum)) {
            let mark = csvMap.get(studentNum);
            if (iceTaskMode) {
                // If ICE Task mode: 100 if attempted, 0 if missing or 0
                mark = (mark && mark !== "0") ? 100 : 0;
            }
            row[excelMarkDestCol] = mark;
        }
    });

    document.getElementById('logOutput').textContent = "Marks transferred successfully!";
    document.getElementById('downloadButton').disabled = false;
}

// ---------------------------
// CSV Download Logic
// ---------------------------
function downloadCSV(dataArray) {
    if (!dataArray || !dataArray.length) return;

    // Get custom filename input
    const customName = document.getElementById('customFilename').value.trim();

    // Ensure originalExcelFileName exists
    if (!originalExcelFileName) originalExcelFileName = "updated_file";

    const dateStr = new Date().toISOString().split('T')[0];
    const filename = customName
        ? `${customName}_updated_${dateStr}.csv`
        : `${originalExcelFileName}_updated_${dateStr}.csv`;

    const csvContent = dataArray.map(e => e.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    document.getElementById('logOutput').textContent = `File downloaded: ${filename}`;
}

// ---------------------------
// File Input Handlers
// ---------------------------
document.getElementById('csvFileInput').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    document.getElementById('csvFileName').textContent = file.name;
    parseCSV(file, (data) => {
        csvData = data;
        populateColumns('csvStudentCol', data);
        populateColumns('csvMarkCol', data);
    });
});

document.getElementById('excelFileInput').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    document.getElementById('excelFileName').textContent = file.name;
    originalExcelFileName = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
    readExcel(file, (data) => {
        excelData = data;
        populateColumns('excelStudentCol', data);
        populateColumns('excelMarkDestCol', data);
    });
});

// ---------------------------
// Button Event Listeners
// ---------------------------
document.getElementById('transferButton').addEventListener('click', transferMarks);

document.getElementById('downloadButton').addEventListener('click', () => {
    downloadCSV(updatedExcelData);
});

document.getElementById('resetButton').addEventListener('click', () => {
    // Clear all inputs and selections
    document.getElementById('csvFileInput').value = "";
    document.getElementById('excelFileInput').value = "";
    document.getElementById('csvFileName').textContent = "No file selected";
    document.getElementById('excelFileName').textContent = "No file selected";
    document.getElementById('customFilename').value = "";
    document.getElementById('iceTaskCheckbox').checked = false;

    document.getElementById('csvStudentCol').innerHTML = "";
    document.getElementById('csvMarkCol').innerHTML = "";
    document.getElementById('excelStudentCol').innerHTML = "";
    document.getElementById('excelMarkDestCol').innerHTML = "";

    document.getElementById('logOutput').textContent = "";
    updatedExcelData = [];
    csvData = [];
    excelData = [];
    originalExcelFileName = "";
    document.getElementById('downloadButton').disabled = true;
});
