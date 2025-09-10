// --- Global Variables ---
let csvData = [];
let excelData = [];
let originalExcelFileName = "";

// --- Helper Functions ---
function parseCSV(file, callback) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const text = e.target.result;
        const rows = text.split(/\r?\n/).map(r => r.split(','));
        callback(rows);
    };
    reader.readAsText(file);
}

function readExcel(file, callback) {
    originalExcelFileName = file.name.replace(/\.[^/.]+$/, ""); // remove extension
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

function populateColumnSelect(selectId, row) {
    const select = document.getElementById(selectId);
    select.innerHTML = "";
    row.forEach((val, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.text = val || `Column ${index + 1}`;
        select.appendChild(option);
    });
}

function renderTable(containerId, dataArray, columns) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = "";

    if (!dataArray || !dataArray.length || !columns.length) return;

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
        columns.forEach(col => {
            const td = document.createElement('td');
            td.textContent = row[col] !== undefined ? row[col] : '';
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    container.appendChild(table);
}

function transferMarks() {
    const csvStudentCol = parseInt(document.getElementById('csvStudentCol').value);
    const csvMarkCol = parseInt(document.getElementById('csvMarkCol').value);
    const excelStudentCol = parseInt(document.getElementById('excelStudentCol').value);
    const excelMarkDestCol = parseInt(document.getElementById('excelMarkDestCol').value);
    const iceTaskMode = document.getElementById('iceTaskCheckbox').checked;

    const updatedExcelData = [...excelData];

    csvData.forEach(csvRow => {
        const csvStudent = csvRow[csvStudentCol];
        const csvMark = csvRow[csvMarkCol];

        for (let i = 0; i < updatedExcelData.length; i++) {
            if (updatedExcelData[i][excelStudentCol] == csvStudent) {
                updatedExcelData[i][excelMarkDestCol] = iceTaskMode
                    ? (csvMark && csvMark !== '0' ? 100 : 0)
                    : csvMark;
                break;
            }
        }
    });

    // Show preview table
    renderTable('logOutput', updatedExcelData, [excelStudentCol, excelMarkDestCol]);

    // Enable download
    document.getElementById('downloadButton').onclick = () => downloadCSV(updatedExcelData);
    document.getElementById('downloadButton').disabled = false;
}

function downloadCSV(dataArray) {
    const dateStr = new Date().toISOString().split('T')[0];
    let customNameInput = document.getElementById('customFilename').value.trim();

    // Extra precaution: remove .csv if user typed it
    customNameInput = customNameInput.replace(/\.csv$/i, '');

    const filename = `${customNameInput || originalExcelFileName}_updated_${dateStr}.csv`;

    const csvContent = dataArray.map(r => r.join(',')).join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
}

// --- Event Listeners ---
document.getElementById('csvFileInput').addEventListener('change', (e) => {
    if (!e.target.files.length) return;
    parseCSV(e.target.files[0], (data) => {
        csvData = data;
        populateColumnSelect('csvStudentCol', data[0]);
        populateColumnSelect('csvMarkCol', data[0]);
        document.getElementById('csvFileName').textContent = e.target.files[0].name;
    });
});

document.getElementById('excelFileInput').addEventListener('change', (e) => {
    if (!e.target.files.length) return;
    readExcel(e.target.files[0], (data) => {
        excelData = data;
        populateColumnSelect('excelStudentCol', data[0]);
        populateColumnSelect('excelMarkDestCol', data[0]);
        document.getElementById('excelFileName').textContent = e.target.files[0].name;
    });
});

document.getElementById('transferButton').addEventListener('click', transferMarks);

document.getElementById('resetButton').addEventListener('click', () => {
    location.reload();
});
