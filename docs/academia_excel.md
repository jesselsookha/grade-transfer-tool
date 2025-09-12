# 📘 Academia ERP – Import Marks (Bulk Upload) Guide

This guide explains how Admin users can download the official Excel template from **Academia by Serosoft**, use our **Grade Transfer Tool** to populate it with marks, and then re-upload the CSV back into Academia.

---

## 🔹 What is “Import Marks” / Bulk Mark Entry?

The **Import Marks** feature (sometimes called **Import Marks/Remarks**) in the **Examinations → Manage Marks Entry** module allows administrators to upload marks in bulk via a template file.

Instead of entering marks manually for each student, you download a pre-formatted Excel template, fill or update it, and upload it back to the system.

---

## 🔹 How to Retrieve / Download the Template

1. Navigate to **Examinations → Manage Marks Entry**.
2. Select the **Import Marks** tab.

   * Ensure the **Download Template** option is selected.
3. Fill in the required filters:

   * **Assessment Type** – Academic or Other.
   * **Assessment Scheme** – Select from dropdown.
   * **Course** – Pick the course.
   * **Course Variant** – You may select multiple.
   * **Anonymous Event** – Yes/No.
   * **Assessment Event** – Select one or more events for mark entry.
   * **Sorting Sequence** – Decide how students should be sorted in the template:

     * Admission ID
     * Student ID
     * Student Name
     * Program
     * Section
4. Click **Download Template**.

   * The system generates an Excel file pre-populated with student details.
   * Columns for marks will be blank (unless existing editable marks are present).

---

## 🔹 Template Format (Detailed Example)

The following is a sample of **2 rows** and the columns in the Excel document downloaded after selecting a specific ICE Task assessment for a group:

| Column Headings                     | Values                                                                    | Example / Comments                                                                                |
| ----------------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Admission ID                        | 184927                                                                    | This is the key identifier column; must match what “Validation On” is set to in your system.      |
| Module Class Id                     | 438548                                                                    |                                                                                                   |
| Period Id                           | 78567                                                                     |                                                                                                   |
| Class Id                            | 562361                                                                    |                                                                                                   |
| Admission ID                        | AD10912849                                                                |                                                                                                   |
| Student ID                          | ST10567348                                                                | The official Student Number assigned to a student.                                                |
| Student Name                        | Jax Grey Hall                                                             | Auto-populated from system, for human readability. Likely non-editable, but included for clarity. |
| Student First Name                  | Jax                                                                       |                                                                                                   |
| Student Middle Name                 | Grey                                                                      |                                                                                                   |
| Student Last Name                   | Hall                                                                      |                                                                                                   |
| Qualification                       | Higher Certificate in Mobile Application and Web Development              |                                                                                                   |
| Intake                              | 2025-Full Time                                                            |                                                                                                   |
| Period                              | Semester 2                                                                |                                                                                                   |
| Module Class                        | MAST5112/Mobile App Scripting/2025-Jan\_FT\_HMAW0501\_VCGPSD\_Term2\_GR01 |                                                                                                   |
| Class                               | MAST5112\_2025-Jan\_FT\_HMAW0501\_VCGPSD\_Term2\_GR01                     |                                                                                                   |
| Hall Ticket No.                     |                                                                           | Blank                                                                                             |
| ICE Task 1 (Max - 100.0, WT - 2.5%) |                                                                           | Blank initially; fill in the mark for that event. Must respect the max value (0–100).             |

### Explanation:

* **System Columns (IDs, Names, Class Info)**
  → These are auto-generated by Academia. Do **not** edit or delete them.

* **Student Identifiers (Admission ID, Student ID)**
  → These must remain exactly as provided. They are used by the system to validate uploads.

* **Assessment Columns (e.g., ICE Task 1)**
  → These are the only fields you need to populate with marks. Initially blank.

---

## 🔹 Using the Grade Transfer Tool

Once you have:

* The **CSV file** from Brightspace (student numbers + marks).
* The **Excel template** from Academia.

Steps:

1. Open the [Grade Transfer Tool](https://jesselsookha.github.io/grade-transfer-tool/).
2. Upload both files.
3. Map the correct **Student Number** and **Marks** columns.
4. Transfer the marks (zeros are assigned automatically if missing).

   * If it’s an ICE Task, select the checkbox so marks are converted to **100 (attempted)** or **0 (not attempted)**.
5. Download the updated file as **CSV** (the tool automatically converts).

This CSV is now ready for upload into Academia.

---

## 🔹 Uploading the Completed Template

1. Return to **Examinations → Manage Marks Entry → Import Marks**.
2. Choose **Upload Template** (or **Upload CSV File**).
3. Select your completed CSV file.
4. Upload it.
5. Monitor the **status**:

   * **Pending** – still processing.
   * **Completed** – all records uploaded successfully.
   * **Partially Processed** – some records failed.
6. If there are errors:

   * Click **Download** in the **Bad Records** column to see which rows failed.
   * Optionally, download the **Log File** for detailed error reasons.
   * Correct issues, remove already successful rows, and re-upload.

---

## 🔹 Key Things to Check

* ✅ You have the correct **permissions** to use Import Marks.
* ✅ You’re using the **latest template** generated by your institution.
* ✅ Marks entered are within valid ranges (no decimals if not allowed).
* ✅ File is saved in **CSV (Comma delimited)** format.
* ✅ Avoid special characters in student names or remarks fields.

---

## 📎 References

* [Academia User Guide – Manage Marks Entry](https://sites.google.com/serosoft.in/academiauserguide/examinations/exam-execution/manage-marks-entry)
* [Academia User Guide – Mark Entry](https://sites.google.com/serosoft.in/academiauserguide/employees/employee-portal/my-examination/mark-entry)
* [Examinations – Release Notes](https://releases.academiaerp.com/kb/examinations-11/)
* [Examinations – General Docs](https://releases.academiaerp.com/kb/examinations/)

---
