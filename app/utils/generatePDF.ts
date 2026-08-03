import jsPDF from "jspdf";
import { MeetingData } from "../types";
import { formatDate } from "./formatDate";

async function loadImageAsBase64(url: string): Promise<string> {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
}

export async function generatePDF(data: MeetingData) {
  const doc = new jsPDF();
  const left = 15;
  const pageWidth = 180;
  let y = 15;

  // Add actual logo image
  try {
    const logoBase64 = await loadImageAsBase64("/logo.png");
    doc.addImage(logoBase64, "PNG", 70, y, 70, 20);
    y += 28;
  } catch {
    // Fallback text if image fails
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(102, 51, 153);
    doc.text("mitoo", 105, y + 10, { align: "center" });
    y += 20;
  }

  // Title
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("MINUTES OF MEETING", 105, y, { align: "center" });
  y += 12;

  // Horizontal line
  doc.setDrawColor(102, 51, 153);
  doc.setLineWidth(0.5);
  doc.line(left, y, left + pageWidth, y);
  y += 10;

  // Table helper
  const addTableSection = (title: string, rows: [string, string][]) => {
    if (y > 250) { doc.addPage(); y = 20; }

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(102, 51, 153);
    doc.text(title, left, y);
    y += 8;

    doc.setTextColor(0, 0, 0);
    rows.forEach((row, i) => {
      if (y > 270) { doc.addPage(); y = 20; }

      const bgColor = i % 2 === 0 ? 248 : 255;
      doc.setFillColor(bgColor, bgColor, bgColor);
      doc.rect(left, y - 4, pageWidth, 8, "F");

      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text(`${i + 1}`, left + 2, y);
      doc.text(row[0], left + 10, y);
      doc.setFont("helvetica", "normal");
      doc.text(row[1] || "—", left + 80, y);
      y += 8;
    });

    y += 8;
  };

  // Details of Meeting
  addTableSection("Details of Meeting :-", [
    ["Participants (from our side)", data.participant],
    ["Time of meeting", data.meetingTime],
    ["Date of meeting", formatDate(data.meetingDate)],
  ]);

  // Customer Details
  addTableSection("Customers Details :-", [
    ["Company Name", data.companyName],
    ["Meeting with", data.meetingWith],
    ["Designation", data.designation],
    ["Industry", data.industry],
    ["Location", data.location],
    ["Total Number of Employees", data.totalEmployees],
    ["Currently Using", data.currentlyUsing],
    ["Other remarks", data.otherRemarks],
  ]);

  // Points Discussed
  if (y > 200) { doc.addPage(); y = 20; }
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(102, 51, 153);
  doc.text("Points Discussed :-", left, y);
  y += 6;
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  doc.text(`Plan: ${data.plan}`, left + 5, y);
  y += 10;

  const pointsRows: [string, string][] = [
    ["Lead Creation", data.leadCreation],
    ["Lead Assignment", data.leadAssignment],
    ["Follow-up Management", data.followUpManagement],
    ["Customer Management", data.customerManagement],
    ["Quotation Management", data.quotationManagement],
    ["Task & Reminder Management", data.taskReminderManagement],
    ["Lead sources", data.leadSources],
    ["Follow-up process", data.followUpProcess],
    ["WhatsApp/Email integrations", data.whatsappEmailIntegration],
    ["Mobile app requirements", data.mobileAppRequirements],
    ["Reports & Dashboard", data.reportsDashboard],
    ["Data Migrations", data.dataMigrations],
    ["Customization requirements", data.customizationRequirements],
  ];

  pointsRows.forEach((row, i) => {
    if (y > 270) { doc.addPage(); y = 20; }
    const bgColor = i % 2 === 0 ? 248 : 255;
    doc.setFillColor(bgColor, bgColor, bgColor);
    doc.rect(left, y - 4, pageWidth, 8, "F");

    doc.setFontSize(9);
    const letter = String.fromCharCode(97 + i);
    doc.setFont("helvetica", "normal");
    doc.text(letter, left + 5, y);
    doc.text(row[0], left + 15, y);
    doc.setFont("helvetica", "bold");
    doc.text(row[1] || "—", left + 100, y);
    y += 8;
  });

  y += 10;

  // Next Follow-up & Remarks
  if (y > 240) { doc.addPage(); y = 20; }

  doc.setDrawColor(102, 51, 153);
  doc.setLineWidth(0.3);
  doc.line(left, y, left + pageWidth, y);
  y += 8;

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("Next follow update:", left, y);
  doc.setFont("helvetica", "normal");
  doc.text(formatDate(data.nextFollowUpDate) || "—", left + 50, y);
  y += 10;

  doc.setFont("helvetica", "bold");
  doc.text("Remarks:", left, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  const remarks = doc.splitTextToSize(data.remarks || "—", pageWidth - 5);
  doc.text(remarks, left + 5, y);

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text("Generated by Mitoo MOM Generator", 105, 290, { align: "center" });
  }

  doc.save(`MOM-${data.companyName || "Meeting"}-${formatDate(data.meetingDate)}.pdf`);
}
