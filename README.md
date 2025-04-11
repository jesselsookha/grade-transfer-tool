## 📘 Grade Transfer Tool

**A simple web-based tool to transfer student marks from a CSV into an Excel template for grade processing.**

🌐 **Live version**: [Click here to use the tool](https://jesselsookha.github.io/grade-transfer-tool/)

---

### 🛠️ How It Works

1. **Upload CSV file** – contains student numbers and their marks.
2. **Upload Excel template** – official grade sheet with student numbers.
3. **Map columns** – choose the correct student and mark columns in both files.
4. **Transfer** – the tool matches students and inserts marks (zero if missing).
5. **Download** – save the updated Excel document for submission.

---

### 📸 Screenshots

*(Add image links once you have the screenshots)*

- ![Step 1: Upload files](screenshots/upload-files.png)
- ![Step 2: Column mapping](screenshots/column-mapping.png)
- ![Step 3: Preview & Download](screenshots/preview-download.png)

---

### 📂 Files

| File           | Description                            |
|----------------|----------------------------------------|
| `index.html`   | Main interface of the tool             |
| `script.js`    | JavaScript logic for data handling     |
| `style.css`    | Styling and layout                     |
| `README.md`    | This file                              |

---

### 📄 Requirements

- Modern browser (Chrome, Edge, Firefox)
- No installation needed

---

### 🧠 Tips

- Ensure student numbers are consistent across files.
- Blank marks in the CSV are treated as **zero**.
- You can reset and try again without reloading the page.

---

### 📢 Credits

Developed by [Jessel Sookha ](https://www.github.com/jsookha)  
Published with ❤️ using GitHub Pages.

---

### 🔗 GitHub Pages Hosting

If you'd like to host your own copy, simply:

1. Fork this repo
2. Enable GitHub Pages under your repo settings
3. Choose `main` as source (root folder)
