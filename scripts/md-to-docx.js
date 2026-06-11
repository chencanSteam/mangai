const fs = require("fs");
const path = require("path");
const docx = require("docx");

const { Document, Packer, Paragraph, Table, TableCell, TableRow, TextRun, HeadingLevel, AlignmentType, WidthType, BorderStyle } = docx;

function parseMarkdownTable(lines, startIndex) {
  const rows = [];
  let i = startIndex;
  while (i < lines.length && lines[i].trim().startsWith("|")) {
    rows.push(lines[i].trim());
    i++;
  }
  if (rows.length < 2) return null;
  const cells = rows
    .filter((_, idx) => idx !== 1)
    .map((row) =>
      row
        .split("|")
        .slice(1, -1)
        .map((c) => c.trim())
    );
  return { cells, nextIndex: i };
}

function parseInline(text) {
  const children = [];
  const regex = /\*\*(.+?)\*\*|_(.+?)_|`(.+?)`/g;
  let lastIndex = 0;
  let m;
  while ((m = regex.exec(text)) !== null) {
    if (m.index > lastIndex) {
      children.push(new TextRun(text.slice(lastIndex, m.index)));
    }
    const content = m[1] || m[2] || m[3];
    const isCode = !!m[3];
    children.push(
      new TextRun({
        text: content,
        bold: !isCode,
        italics: !!m[2],
        font: isCode ? "Courier New" : undefined,
      })
    );
    lastIndex = m.index + m[0].length;
  }
  if (lastIndex < text.length) {
    children.push(new TextRun(text.slice(lastIndex)));
  }
  if (children.length === 0) {
    children.push(new TextRun(text));
  }
  return children;
}

function mdToDocxChildren(content) {
  const lines = content.split("\n");
  const children = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed === "") {
      i++;
      continue;
    }

    if (trimmed.startsWith("# ")) {
      children.push(
        new Paragraph({
          children: parseInline(trimmed.slice(2)),
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 },
        })
      );
      i++;
      continue;
    }

    if (trimmed.startsWith("## ")) {
      children.push(
        new Paragraph({
          children: parseInline(trimmed.slice(3)),
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 150 },
        })
      );
      i++;
      continue;
    }

    if (trimmed.startsWith("### ")) {
      children.push(
        new Paragraph({
          children: parseInline(trimmed.slice(4)),
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 200, after: 100 },
        })
      );
      i++;
      continue;
    }

    if (trimmed.startsWith("|")) {
      const tableData = parseMarkdownTable(lines, i);
      if (tableData) {
        const { cells, nextIndex } = tableData;
        const rows = cells.map((rowCells) => {
          return new TableRow({
            children: rowCells.map((cellText) => {
              return new TableCell({
                children: [new Paragraph({ children: parseInline(cellText) })],
                borders: {
                  top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                  bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                  left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                  right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                },
              });
            }),
          });
        });
        children.push(
          new Table({
            rows,
            width: { size: 100, type: WidthType.PERCENTAGE },
          })
        );
        i = nextIndex;
        continue;
      }
    }

    if (trimmed.startsWith("- ")) {
      children.push(
        new Paragraph({
          children: parseInline(trimmed.slice(2)),
          bullet: { level: 0 },
          spacing: { before: 60, after: 60 },
        })
      );
      i++;
      continue;
    }

    if (/^\d+\.\s/.test(trimmed)) {
      children.push(
        new Paragraph({
          children: parseInline(trimmed.replace(/^\d+\.\s/, "")),
          numbering: { level: 0, reference: "my-numbering" },
          spacing: { before: 60, after: 60 },
        })
      );
      i++;
      continue;
    }

    children.push(
      new Paragraph({
        children: parseInline(trimmed),
        spacing: { before: 60, after: 60 },
      })
    );
    i++;
  }
  return children;
}

async function convertFile(mdPath, outPath) {
  const content = fs.readFileSync(mdPath, "utf-8");
  const children = mdToDocxChildren(content);

  const doc = new Document({
    sections: [
      {
        properties: {},
        children,
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outPath, buffer);
  console.log("Created:", outPath);
}

async function main() {
  const prdDir = path.join(__dirname, "..", "docs", "prd");
  const outDir = path.join(__dirname, "..", "docs", "prd-docx");
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const entries = fs.readdirSync(prdDir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      const subDir = path.join(prdDir, entry.name);
      const outSubDir = path.join(outDir, entry.name);
      if (!fs.existsSync(outSubDir)) fs.mkdirSync(outSubDir, { recursive: true });

      const files = fs.readdirSync(subDir).filter((f) => f.endsWith(".md"));
      for (const file of files) {
        const mdPath = path.join(subDir, file);
        const outPath = path.join(outSubDir, file.replace(".md", ".docx"));
        await convertFile(mdPath, outPath);
      }
    }
  }
  console.log("\nAll done.");
}

main().catch(console.error);
