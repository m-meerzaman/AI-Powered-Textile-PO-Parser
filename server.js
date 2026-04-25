require('dotenv').config(); // ← MUST be first line

const express = require('express');
const multer  = require('multer');
const fs      = require('fs');
const cors    = require('cors');
const ExcelJS = require('exceljs');

const app = express();
app.use(cors());

// ── Secure env variables ────────────────────────────────────────────
const API_KEY    = process.env.GEMINI_API_KEY;
const MODEL_NAME = "gemini-2.5-flash";
const PORT       = process.env.PORT || 5000;

if (!API_KEY) {
    console.error("❌ GEMINI_API_KEY is missing! Add it to your .env file.");
    process.exit(1);
}

const upload = multer({ dest: 'uploads/' });

// ───────────────────────────────────────────────────────────────────
// POST /upload — Extract PO data from PDF using Gemini AI
// ───────────────────────────────────────────────────────────────────
app.post('/upload', upload.single('po_file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).send("No file uploaded");

        const fileBuffer = fs.readFileSync(req.file.path);
        const base64Data = fileBuffer.toString("base64");

        const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;

        console.log("🔍 Extracting Springfield PO data with full size breakdown...");

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        {
                            text: `You are a data extraction expert reading Springfield / Eurofiel Confeccion purchase order PDFs.

Each page of this PDF is ONE purchase order. Extract data from EVERY page.

FIELD LOCATIONS ON EACH PAGE:
- STYLE       → "Model" field in the top header table (e.g. 4TF284)
- PAT_NO      → "Patron" field at the BOTTOM-LEFT of the page, in the footer row alongside "Unit Price" and "Destination Country" (e.g. 0264200). It is a 7-digit number.
- P.O.        → Large "ORDER number" box at top (e.g. 4800486)
- COLOR       → "Color" column in the size breakdown table (e.g. IVORY, BLACK, WHITE)
- COL         → "Col" column in the size breakdown table — it is a 2-digit number next to the color name (e.g. 96)
- XS          → "xs" column in the "Distribución de Tallas / Size Breakdown" table
- S           → "s" column in the size breakdown table
- M           → "M" column in the size breakdown table
- L           → "L" column in the size breakdown table
- XL          → "XL" column in the size breakdown table
- XXL         → "XXL" column in the size breakdown table
- XXXL        → "XXXL" column in the size breakdown table
- TOTAL       → "Quant." column in the size breakdown table (also shown as "Tot.Quantity" at the bottom)
- DESTINATION → "Destination Country" field at the bottom of the page (e.g. PT PORTUGAL, ES SPAIN)
- DEL.DATE    → "Delivery" date in the top-right header (format: DD/MM/YYYY)

RULES:
1. Process EVERY page — do not skip any.
2. If a size column is blank or missing for a row, use 0.
3. If a page has multiple color rows in the size breakdown table, create one object per color row.
4. TOTAL must be a number (integer). It is always shown in the "Quant." column.
5. DEL.DATE must be in DD/MM/YYYY format.
6. PAT_NO is always in the bottom-left footer area labeled "Patron" — it is NOT the ORDER number.
7. Return ONLY a raw JSON array. No markdown, no code fences, no explanation text.

OUTPUT STRUCTURE (one object per row):
[
  {
    "style": "4TF284",
    "patNo": "0264200",
    "po": "4800486",
    "color": "IVORY",
    "col": "96",
    "xs": 0,
    "s": 126,
    "m": 252,
    "l": 189,
    "xl": 126,
    "xxl": 63,
    "xxxl": 0,
    "total": 756,
    "destination": "PT PORTUGAL",
    "delDate": "21/05/2026"
  }
]`
                        },
                        { inline_data: { mime_type: "application/pdf", data: base64Data } }
                    ]
                }]
            })
        });

        const result = await response.json();
        if (result.error) throw new Error(result.error.message);

        let aiText = result.candidates[0].content.parts[0].text;
        aiText = aiText.replace(/```json|```/g, "").trim();

        const extractedData = JSON.parse(aiText);

        const cleanedData = extractedData.map(item => ({
            style:       String(item.style   || ""),
            patNo:       String(item.patNo   || ""),
            po:          String(item.po      || ""),
            color:       String(item.color   || ""),
            col:         String(item.col     || ""),
            xs:          parseInt(item.xs)    || 0,
            s:           parseInt(item.s)     || 0,
            m:           parseInt(item.m)     || 0,
            l:           parseInt(item.l)     || 0,
            xl:          parseInt(item.xl)    || 0,
            xxl:         parseInt(item.xxl)   || 0,
            xxxl:        parseInt(item.xxxl)  || 0,
            total:       parseInt(item.total) || 0,
            destination: String(item.destination || ""),
            delDate:     String(item.delDate || "")
        }));

        fs.writeFileSync('database.json', JSON.stringify(cleanedData, null, 2));
        fs.unlinkSync(req.file.path);

        console.log(`✅ Success: ${cleanedData.length} rows extracted.`);
        res.json({ message: "Extraction complete", data: cleanedData });

    } catch (error) {
        console.error("❌ Extraction Failed:", error.message);
        res.status(500).send("Error: " + error.message);
    }
});

// ───────────────────────────────────────────────────────────────────
// GET /download — Generate and download Excel file
// ───────────────────────────────────────────────────────────────────
app.get('/download', async (req, res) => {
    const workbook = new ExcelJS.Workbook();
    const sheet    = workbook.addWorksheet('PO_SUMMARY');

    // ── Column definitions ────────────────────────────────────────
    // A=STYLE B=PAT No C=P.O. D=COLOR E=COL F=XS G=S H=M I=L J=XL K=XXL L=XXXL M=TOTAL N=DESTINATION O=DEL.DATE
    sheet.columns = [
        { header: 'STYLE',       key: 'style',       width: 10 },
        { header: 'PAT No',      key: 'patNo',       width: 12 },
        { header: 'P.O.',        key: 'po',          width: 12 },
        { header: 'COLOR',       key: 'color',       width: 10 },
        { header: 'COL',         key: 'col',         width: 6  },
        { header: 'XS',          key: 'xs',          width: 7  },
        { header: 'S',           key: 's',           width: 7  },
        { header: 'M',           key: 'm',           width: 7  },
        { header: 'L',           key: 'l',           width: 7  },
        { header: 'XL',          key: 'xl',          width: 7  },
        { header: 'XXL',         key: 'xxl',         width: 7  },
        { header: 'XXXL',        key: 'xxxl',        width: 7  },
        { header: 'TOTAL',       key: 'total',       width: 9  },
        { header: 'DESTINATION', key: 'destination', width: 26 },
        { header: 'DEL.DATE',    key: 'delDate',     width: 13 }
    ];

    let data = [];
    if (fs.existsSync('database.json')) {
        data = JSON.parse(fs.readFileSync('database.json'));
        sheet.addRows(data);
    }

    const firstDataRow = 2;
    const lastDataRow  = firstDataRow + data.length - 1;
    const totalRow     = lastDataRow + 2; // one blank gap, then TOTAL row

    // ── Shared styles ─────────────────────────────────────────────
    const thinBorder = {
        top:    { style: 'thin' },
        left:   { style: 'thin' },
        bottom: { style: 'thin' },
        right:  { style: 'thin' }
    };
    const greenFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF70AD47' } };
    const zebraFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEEF4FF' } };

    // ── Header row ────────────────────────────────────────────────
    const headerRow = sheet.getRow(1);
    headerRow.height = 22;
    headerRow.eachCell(cell => {
        cell.font      = { bold: true, color: { argb: 'FFFFFFFF' }, name: 'Arial', size: 11 };
        cell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.border    = thinBorder;
    });

    // ── Data rows ─────────────────────────────────────────────────
    for (let r = firstDataRow; r <= lastDataRow; r++) {
        const row = sheet.getRow(r);
        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
            cell.font      = { name: 'Arial', size: 10 };
            cell.border    = thinBorder;
            // Col 14 = DESTINATION → left align, everything else center
            cell.alignment = colNumber === 14
                ? { horizontal: 'left',   vertical: 'middle' }
                : { horizontal: 'center', vertical: 'middle' };
            if (r % 2 === 0) cell.fill = zebraFill;
        });
    }

    // ── TOTAL row ─────────────────────────────────────────────────
    // Columns: XS=6(F), S=7(G), M=8(H), L=9(I), XL=10(J), XXL=11(K), XXXL=12(L), TOTAL=13(M)
    const sumCols = {
        6:  'F',  // XS
        7:  'G',  // S
        8:  'H',  // M
        9:  'I',  // L
        10: 'J',  // XL
        11: 'K',  // XXL
        12: 'L',  // XXXL
        13: 'M'   // TOTAL
    };

    const tRow = sheet.getRow(totalRow);
    tRow.height = 20;

    // "TOTAL" label in COLOR column (col 4 = D)
    const labelCell     = tRow.getCell(4);
    labelCell.value     = 'TOTAL';
    labelCell.font      = { bold: true, name: 'Arial', size: 11, color: { argb: 'FF000000' } };
    labelCell.fill      = greenFill;
    labelCell.alignment = { horizontal: 'center', vertical: 'middle' };
    labelCell.border    = thinBorder;

    // SUM formula cells
    for (const [colNum, letter] of Object.entries(sumCols)) {
        const cell = tRow.getCell(parseInt(colNum));
        cell.value     = { formula: `SUM(${letter}${firstDataRow}:${letter}${lastDataRow})` };
        cell.font      = { bold: true, name: 'Arial', size: 11, color: { argb: 'FF000000' } };
        cell.fill      = greenFill;
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.border    = thinBorder;
    }

    // ── Dynamic filename: {Style} {PatronNo} P.O Summary ─────────
    // Pick style and patNo from first data row
    const style  = data.length > 0 ? data[0].style  : "PO";
    const patNo  = data.length > 0 ? data[0].patNo  : "000000";
    const filename = `${style} ${patNo} P.O Summary.xlsx`;

    // Freeze header row
    sheet.freezePanes = { xSplit: 0, ySplit: 1 };

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    await workbook.xlsx.write(res);
    res.end();
});

app.listen(PORT, () => console.log(`🚀 Server running on Port ${PORT}`));
