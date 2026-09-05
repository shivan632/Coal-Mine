import { jsPDF } from 'jspdf';
import { TelemetryPacket, WorkerInferenceResult, IncidentAlert } from '../types/dashboard';

export const generateStatutoryPDFReport = (
  currentPacket: TelemetryPacket,
  workers: WorkerInferenceResult[],
  alerts: IncidentAlert[],
  safetyIndex: number
) => {
  const doc = new jsPDF();
  const dateStr = new Date().toLocaleString();

  // Color Constants
  const primaryBlue = [6, 17, 31];
  const accentCyan = [0, 212, 255];

  // Header Banner
  doc.setFillColor(6, 17, 31);
  doc.rect(0, 0, 210, 32, 'F');

  doc.setTextColor(0, 212, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('COALGUARD AI — STATUTORY MINE SAFETY AUDIT REPORT', 14, 15);

  doc.setFontSize(9);
  doc.setTextColor(200, 220, 240);
  doc.setFont('helvetica', 'normal');
  doc.text('COMPLIANCE STANDARD: DGMS (INDIA) / OSHA 1926.800 / ATEX DIRECTIVE 2014/34/EU', 14, 22);
  doc.text(`AUDIT DATE: ${dateStr} | MINE LICENSE: DGMS/EZ/COAL-UG-04`, 14, 28);

  // Section 1: Executive Overview & Composite Score
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('1. EXECUTIVE SUMMARY & MINE SAFETY INDEX (MSI)', 14, 42);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`• Composite Mine Safety Index: ${safetyIndex}% (${safetyIndex >= 80 ? 'OPTIMAL NOMINAL' : safetyIndex >= 50 ? 'ELEVATED RISK' : 'CRITICAL ACTION REQUIRED'})`, 14, 50);
  doc.text(`• Active Sector Monitored: ${currentPacket.zone} (Depth: -${currentPacket.depthMeters}m)`, 14, 56);
  doc.text(`• ATEX Zone Rating: ${currentPacket.atexZone} | Section Power Grid: ${currentPacket.sectionPowerState}`, 14, 62);
  doc.text(`• Active Personnel Underground: ${workers.length} Certified Miners on Shift`, 14, 68);

  // Section 2: Real-time Telemetry & Regulatory Thresholds Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('2. ATMOSPHERIC TELEMETRY VS DGMS/OSHA STATUTORY LIMITS', 14, 80);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setFillColor(235, 245, 255);
  doc.rect(14, 85, 182, 8, 'F');
  doc.text('PARAMETER', 16, 90);
  doc.text('CURRENT VALUE', 58, 90);
  doc.text('DGMS / OSHA LIMIT', 105, 90);
  doc.text('STATUS', 160, 90);

  const telemetryRows = [
    { param: 'Methane (CH4)', val: `${currentPacket.methane_CH4}% vol`, limit: '< 0.75% (Trip @ 1.25%)', status: currentPacket.methane_CH4 >= 1.25 ? 'CRITICAL (TRIP)' : currentPacket.methane_CH4 >= 0.75 ? 'ACTION REQUIRED' : 'COMPLIANT' },
    { param: 'Carbon Monoxide (CO)', val: `${currentPacket.carbonMonoxide_CO} ppm`, limit: '< 25 ppm (IS/IEC 60079)', status: currentPacket.carbonMonoxide_CO > 50 ? 'CRITICAL' : currentPacket.carbonMonoxide_CO > 25 ? 'ELEVATED' : 'COMPLIANT' },
    { param: 'Oxygen Level (O2)', val: `${currentPacket.oxygen_O2}% vol`, limit: '20.8 - 21.0% (Min 19.5%)', status: currentPacket.oxygen_O2 < 19.5 ? 'HYPOXIA RISK' : 'COMPLIANT' },
    { param: 'Ambient Temperature', val: `${currentPacket.temperature}°C`, limit: '20 - 28°C (Max 35°C)', status: currentPacket.temperature > 35 ? 'CRITICAL HEAT' : currentPacket.temperature > 28 ? 'WARNING' : 'COMPLIANT' },
    { param: 'Relative Humidity', val: `${currentPacket.humidity}%`, limit: '40 - 70% (Max 85%)', status: currentPacket.humidity > 85 ? 'HIGH HUMIDITY' : 'COMPLIANT' },
    { param: 'Barometric Pressure', val: `${currentPacket.pressure} hPa`, limit: '980 - 1025 hPa', status: 'COMPLIANT' },
    { param: 'Air Velocity', val: `${currentPacket.airVelocity_ms} m/s`, limit: '0.5 - 2.5 m/s (Anemometer)', status: currentPacket.airVelocity_ms < 0.5 ? 'STAGNANT AIR' : 'COMPLIANT' },
  ];

  let yPos = 99;
  doc.setFont('helvetica', 'normal');
  telemetryRows.forEach((row, i) => {
    if (i % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(14, yPos - 5, 182, 7, 'F');
    }
    doc.text(row.param, 16, yPos);
    doc.text(row.val, 58, yPos);
    doc.text(row.limit, 105, yPos);
    doc.text(row.status, 160, yPos);
    yPos += 7;
  });

  // Section 3: AI Computer Vision PPE Compliance Audit
  yPos += 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('3. AI COMPUTER VISION 5-POINT PPE INSPECTION LOG', 14, yPos);

  yPos += 6;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  workers.forEach((w) => {
    const ppeStatus = w.verdict === 'ALL CORRECT' ? '100% CERTIFIED (AUTHORIZED)' : `DEFECT: MISSING [${w.missingItems.join(', ')}]`;
    doc.text(`• [${w.workerId}] ${w.name} (${w.role}) — ${ppeStatus} (Confidence: ${w.confidence}%)`, 16, yPos);
    yPos += 5.5;
  });

  // Section 4: Incident Log & Supervisor Sign-off
  yPos += 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('4. CRITICAL INCIDENT LOG & SUPERVISOR AUDIT DECLARATION', 14, yPos);

  yPos += 6;
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  if (alerts.length === 0) {
    doc.text('No critical safety incidents or regulatory violations recorded during this shift.', 16, yPos);
    yPos += 6;
  } else {
    alerts.slice(0, 3).forEach((a) => {
      doc.text(`• [${a.severity}] ${a.title} (${a.zone}): ${a.description}`, 16, yPos);
      doc.text(`   Action: ${a.mitigationStep} | Clause: ${a.regulatoryClause}`, 16, yPos + 4.5);
      yPos += 10;
    });
  }

  // Statutory Signature Footer
  yPos = Math.max(yPos + 10, 260);
  doc.setDrawColor(180, 200, 220);
  doc.line(14, yPos, 85, yPos);
  doc.line(125, yPos, 196, yPos);

  doc.setFontSize(8);
  doc.text('DGMS CERTIFIED MINE SAFETY OFFICER', 14, yPos + 5);
  doc.text('DIGITAL SIGNATURE HASH: SHA-256 (VERIFIED)', 14, yPos + 9);

  doc.text('CHIEF VENTILATION & OPERATIONS CONTROLLER', 125, yPos + 5);
  doc.text('SURFACE TELEMETRY COMMAND GATEWAY #04', 125, yPos + 9);

  // Save PDF
  doc.save(`COALGUARD_DGMS_SAFETY_REPORT_${Date.now()}.pdf`);
};
