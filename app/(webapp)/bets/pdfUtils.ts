import jsPDF from "jspdf";
import "jspdf-autotable";

export interface Odds {
  H: number;
  D: number;
  A: number;
}

export interface PDFData {
  title: string;
  oddsList?: Odds[];
  results?: string[];
  actualOutcomes?: string[];
  base?: string;
  jackpot?: string;
  resultsMap?: Record<number, number>;
  combinations?: string[];
}

export function generateBetPDF(data: PDFData) {
  const doc = new jsPDF();
  let currentY = 10;

  // Title
  doc.setFontSize(16);
  doc.text(data.title, 10, currentY);
  currentY += 15;

  // Odds table (if available)
  if (data.oddsList && data.oddsList.length > 0) {
    doc.setFontSize(12);
    const oddsData = data.oddsList.map((odds, i) => [
      i + 1,
      odds.H,
      odds.D,
      odds.A,
    ]);
    (doc as any).autoTable({
      head: [["Match", "H", "D", "A"]],
      body: oddsData,
      startY: currentY,
    });
    currentY = (doc as any).lastAutoTable.finalY + 10;
  }

  // Base pattern (if available)
  if (data.base) {
    doc.setFontSize(12);
    doc.text(`Base Pattern: ${data.base}`, 10, currentY);
    currentY += 10;
  }

  // Jackpot pattern (if available)
  if (data.jackpot) {
    doc.setFontSize(12);
    doc.text(`Jackpot Pattern: ${data.jackpot}`, 10, currentY);
    currentY += 10;
  }

  // Results map (for betsc)
  if (data.resultsMap) {
    doc.setFontSize(12);
    doc.text("Match Frequencies:", 10, currentY);
    currentY += 8;

    const resultsData = Object.entries(data.resultsMap)
      .sort((a, b) => Number(b[0]) - Number(a[0]))
      .map(([matches, count]) => [matches, count]);

    (doc as any).autoTable({
      head: [["Matches", "Count"]],
      body: resultsData,
      startY: currentY,
    });
    currentY = (doc as any).lastAutoTable.finalY + 10;
  }

  // Top combinations (if available)
  if (data.results && data.results.length > 0) {
    doc.setFontSize(12);
    doc.text("Top Combinations:", 10, currentY);
    currentY += 8;

    const comboData = [];
    const matchingRows: number[] = [];

    for (let i = 0; i < data.results.length; i += 3) {
      const row = [];
      for (let j = 0; j < 3; j++) {
        if (i + j < data.results.length) {
          const combo = data.results[i + j];
          row.push(`${i + j + 1}. ${combo}`);

          // Check if this combo matches actual outcomes
          if (
            data.actualOutcomes &&
            data.actualOutcomes.some((outcome) => outcome !== "")
          ) {
            const isMatch = data.actualOutcomes.every(
              (outcome, idx) => outcome === "" || combo[idx] === outcome,
            );
            if (isMatch) {
              matchingRows.push(comboData.length);
            }
          }
        } else {
          row.push("");
        }
      }
      comboData.push(row);
    }

    (doc as any).autoTable({
      head: [["Combo 1", "Combo 2", "Combo 3"]],
      body: comboData,
      startY: currentY,
      didDrawCell: (cellData: any) => {
        if (
          cellData.section === "body" &&
          matchingRows.includes(cellData.row.index)
        ) {
          cellData.cell.styles.fillColor = [76, 175, 80];
          cellData.cell.styles.textColor = [255, 255, 255];
          cellData.cell.styles.fontStyle = "bold";
        }
      },
    });
    currentY = (doc as any).lastAutoTable.finalY + 10;
  }

  // Generated combinations (for betsc)
  if (data.combinations && data.combinations.length > 0) {
    doc.setFontSize(12);
    doc.text("Generated Combinations:", 10, currentY);
    currentY += 8;

    const comboData = [];
    for (let i = 0; i < data.combinations.length; i += 4) {
      const row = [];
      for (let j = 0; j < 4; j++) {
        if (i + j < data.combinations.length) {
          row.push(data.combinations[i + j]);
        } else {
          row.push("");
        }
      }
      comboData.push(row);
    }

    (doc as any).autoTable({
      head: [["Combo 1", "Combo 2", "Combo 3", "Combo 4"]],
      body: comboData,
      startY: currentY,
    });
    currentY = (doc as any).lastAutoTable.finalY + 10;
  }

  // Actual outcomes table (if available)
  if (data.actualOutcomes && data.actualOutcomes.some((o) => o !== "")) {
    doc.setFontSize(12);
    doc.text("Actual Outcomes:", 10, currentY);
    currentY += 8;

    const outcomesData =
      data.oddsList?.map((odds, i) => [
        i + 1,
        odds.H,
        odds.D,
        data.actualOutcomes![i] || "Not set",
      ]) || [];

    (doc as any).autoTable({
      head: [["Match", "H", "D", "Actual"]],
      body: outcomesData,
      startY: currentY,
      didDrawCell: (cellData: any) => {
        if (cellData.section === "body" && cellData.column.index === 3) {
          if (
            data.actualOutcomes![cellData.row.index] !== "" &&
            data.actualOutcomes![cellData.row.index] !== undefined
          ) {
            cellData.cell.styles.fillColor = [76, 175, 80];
            cellData.cell.styles.textColor = [255, 255, 255];
            cellData.cell.styles.fontStyle = "bold";
          }
        }
      },
    });
  }

  doc.save("bet-report.pdf");
}
