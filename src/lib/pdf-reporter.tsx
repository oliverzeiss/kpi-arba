import React from 'react';
import { Document, Page, Text, View, StyleSheet, pdf, Font } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import { ExecutiveReportData, KPISubmission } from '@/types/kpi';

// Define styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
  },
  header: {
    marginBottom: 30,
    borderBottomWidth: 2,
    borderBottomColor: '#06b6d4', // Cyan
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    color: '#0f172a', // Slate 900
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 12,
    color: '#64748b', // Slate 500
    marginTop: 4,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0f172a',
    backgroundColor: '#e2e8f0', // Slate 200
    padding: 6,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  label: {
    width: 150,
    fontSize: 10,
    color: '#475569', // Slate 600
  },
  value: {
    flex: 1,
    fontSize: 10,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  table: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    marginBottom: 15,
  },
  tableRowHeader: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderBottomWidth: 1,
    borderColor: '#cbd5e1',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#e2e8f0',
  },
  tableCol: {
    padding: 6,
  },
  tableColName: { width: '40%', padding: 6 },
  tableColNum: { width: '20%', padding: 6, textAlign: 'center' },
  tableColStatus: { width: '40%', padding: 6 },
  tableCellHeader: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  tableCell: {
    fontSize: 9,
    color: '#334155',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 8,
    color: '#94a3b8', // Slate 400
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 10,
  },
  dangerText: {
    color: '#e11d48', // Rose 600
    fontWeight: 'bold',
  },
});

interface ReportProps {
  report: ExecutiveReportData;
  submissions: KPISubmission[];
}

const KPIReportPDF: React.FC<ReportProps> = ({ report, submissions }) => {
  const pipCandidates = submissions.filter(s => {
    const grade = s.finalGrade ?? s.supervisorGrade ?? s.grade;
    return grade === 'C' || grade === 'D';
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>LAPORAN KPI ARBA GROUP</Text>
          <Text style={styles.subtitle}>
            Generated: {new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
          </Text>
        </View>

        {/* SUMMARY SECTION */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Executive Summary</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Total Submission:</Text>
            <Text style={styles.value}>{report.totalSubmissions} Karyawan</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Rata-Rata Perusahaan:</Text>
            <Text style={styles.value}>{report.averageCompanyScore} / 100</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Memuaskan (A/A+):</Text>
            <Text style={styles.value}>
              {report.totalSubmissions > 0 
                ? Math.round(((report.gradeCounts['A+'] || 0) + (report.gradeCounts['A'] || 0)) / report.totalSubmissions * 100)
                : 0}%
            </Text>
          </View>
        </View>

        {/* DIVISION PERFORMANCE */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Analisis Kinerja Divisi</Text>
          <View style={styles.table}>
            <View style={styles.tableRowHeader}>
              <View style={styles.tableColName}><Text style={styles.tableCellHeader}>Nama Divisi</Text></View>
              <View style={styles.tableColNum}><Text style={styles.tableCellHeader}>Rata-Rata Skor</Text></View>
              <View style={styles.tableColStatus}><Text style={styles.tableCellHeader}>Status Kinerja</Text></View>
            </View>
            {Object.entries(report.divisionAverages).map(([div, score], i) => (
              <View style={styles.tableRow} key={i}>
                <View style={styles.tableColName}><Text style={styles.tableCell}>{div}</Text></View>
                <View style={styles.tableColNum}><Text style={styles.tableCell}>{score}</Text></View>
                <View style={styles.tableColStatus}>
                  <Text style={[styles.tableCell, score < 75 ? styles.dangerText : {}]}>
                    {score >= 75 ? 'Memenuhi Target' : 'Di Bawah Target'}
                  </Text>
                </View>
              </View>
            ))}
            {Object.keys(report.divisionAverages).length === 0 && (
              <View style={styles.tableRow}>
                <View style={{ padding: 6, width: '100%' }}><Text style={styles.tableCell}>Belum ada data penilaian divisi.</Text></View>
              </View>
            )}
          </View>
        </View>

        {/* PIP CANDIDATES */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Daftar Performance Improvement Plan (PIP)</Text>
          <View style={styles.table}>
            <View style={styles.tableRowHeader}>
              <View style={styles.tableColName}><Text style={styles.tableCellHeader}>Karyawan</Text></View>
              <View style={styles.tableColName}><Text style={styles.tableCellHeader}>Jabatan / Divisi</Text></View>
              <View style={styles.tableColNum}><Text style={styles.tableCellHeader}>Grade</Text></View>
            </View>
            {pipCandidates.map((s, i) => (
              <View style={styles.tableRow} key={i}>
                <View style={styles.tableColName}><Text style={styles.tableCell}>{s.employeeName}</Text></View>
                <View style={styles.tableColName}><Text style={styles.tableCell}>{s.positionTitle}</Text></View>
                <View style={styles.tableColNum}>
                  <Text style={[styles.tableCell, styles.dangerText]}>
                    {s.finalGrade ?? s.supervisorGrade ?? s.grade}
                  </Text>
                </View>
              </View>
            ))}
            {pipCandidates.length === 0 && (
              <View style={styles.tableRow}>
                <View style={{ padding: 6, width: '100%' }}><Text style={styles.tableCell}>Tidak ada karyawan dalam kategori PIP (Semua Grade Baik).</Text></View>
              </View>
            )}
          </View>
        </View>

        <Text style={styles.footer} fixed>
          Kerahasiaan Dokumen (Confidential) | Laporan Penilaian Kinerja KPI Arba Group | {new Date().getFullYear()}
        </Text>
      </Page>
    </Document>
  );
};

export async function exportToPDF(report: ExecutiveReportData, submissions: KPISubmission[]) {
  const blob = await pdf(<KPIReportPDF report={report} submissions={submissions} />).toBlob();
  saveAs(blob, 'Laporan_KPI_Arba.pdf');
}
