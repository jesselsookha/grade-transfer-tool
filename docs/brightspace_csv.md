# Brightspace (D2L) — Exporting Grades (CSV)

This guide explains how to export grades from Brightspace (D2L) so they can be used with the **Grade Transfer Tool**.

> **Important:** When exporting, make sure the file contains the **student identifier** that your campus uses as *Student Number* (often called **Org Defined ID**). If you download multiple grade items it's fine — just make sure to select the matching assessment column inside the Grade Transfer Tool before transferring marks.

---

## Quick summary

Open **Grades → Enter Grades → Export**, choose the key field (select **Org Defined ID** if available), pick the grade items and user details you need, then **Export to CSV** and **Download**.

---

## Step-by-step export (recommended)

1. Sign in to Brightspace and open your **course**.
2. On the course navbar, click **Grades** (sometimes under “My Grades” or “Grades” tool).
3. On the **Enter Grades** page, click **Export**.
4. In **Export Options**:

   * **Export Grade Items For**: choose *All users* (or a specific section if needed).
   * **Key Field** (very important): choose **Org Defined ID** (this corresponds to Student Number / ID used on campus). If your institution’s documentation recommends a different key, follow local policy — but Org Defined ID is typically the recommended identifier for student numbers.
   * **Sort By**: optional — choose how rows should be ordered.
   * **Grade Values**: choose the value format (e.g., Points grade).
   * **User Details**: optionally include First Name, Last Name, Email if you want those columns.
5. In **Choose Grades to Export**, check the grade items (assessments) you want exported. You can select one assessment or multiple assessments — if you export multiple, the Grade Transfer Tool will show you all exported columns and you must select the correct assessment column during mapping.
6. Click **Export to CSV** (recommended when you intend to re-import or use the CSV in tools). If you only want a human-readable copy for archiving, **Export to Excel** is an alternative.
7. After the export finishes, a pop-up will show a **Download** link — click **Download** to save the file to your device. Then click **Close**.

---

## Notes and best-practice tips

* **Use Org Defined ID**: Because the Grade Transfer Tool matches by student number, ensure the exported CSV includes **Org Defined ID** (or whichever identifier your institution uses as the official student number). If Org Defined ID is not available in the Key Field list, ask your administrator.
* **If you plan to import back into Brightspace**: Some sites recommend exporting **Both** key fields (Org Defined ID + Username) when you intend to import later.
* **Multiple grade items**: Exporting multiple assessments is acceptable. The Grade Transfer Tool shows a preview of available columns — **make sure** you select the correct assessment column in the tool before transferring marks.
* **Delimiter / locale**: Brightspace CSVs normally use `,` as the separator, but some institutions/locales may produce `;`-separated CSVs. The Grade Transfer Tool auto-detects comma vs semicolon and will show the detected delimiter on the page — no extra action is usually required.
* **Keep the file intact**: Do not rename or remove the **Org Defined ID / Username** column(s) if you plan to import the file back into Brightspace.

---

## Quick troubleshooting

* **No Org Defined ID in export options?** Contact your LMS administrator; some installations use different fields or restrict which ID options are available.
* **Downloaded CSV opens with odd columns in Excel?** Excel sometimes interprets delimiters based on your system locale. Open the CSV in a text editor to confirm the delimiter (`,` or `;`). The Grade Transfer Tool detects the delimiter automatically.
* **Missing students after transfer?** Verify that the Org Defined ID values in Brightspace exactly match the student number values in the Academia Excel template (no leading `#`, no extra spaces). The tool strips common prefixes and trims spaces automatically, but exact matching is still best practice.

---

## References / official D2L guidance

1. D2L Brightspace Help: *Export Grades* – [https://documentation.brightspace.com/](https://documentation.brightspace.com/)
2. Carleton University Brightspace guides – Key field & Org Defined ID recommendations
3. University instructional materials for Brightspace D2L grade export
