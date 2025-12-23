import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

// Styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: "#666",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 10,
    paddingBottom: 5,
    borderBottom: "1 solid #ddd",
  },
  row: {
    flexDirection: "row",
    marginBottom: 5,
  },
  label: {
    width: 150,
    fontSize: 10,
    color: "#666",
  },
  value: {
    fontSize: 10,
    flex: 1,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 20,
  },
  statBox: {
    width: "25%",
    padding: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 8,
    color: "#666",
  },
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f5f5f5",
    padding: 8,
    borderBottom: "1 solid #ddd",
  },
  tableRow: {
    flexDirection: "row",
    padding: 8,
    borderBottom: "1 solid #eee",
  },
  tableCell: {
    fontSize: 9,
    flex: 1,
  },
  tableCellHeader: {
    fontSize: 9,
    fontWeight: "bold",
    flex: 1,
  },
  progressBar: {
    height: 8,
    backgroundColor: "#e0e0e0",
    borderRadius: 4,
  },
  progressFill: {
    height: 8,
    backgroundColor: "#22c55e",
    borderRadius: 4,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 8,
    color: "#999",
    textAlign: "center",
  },
});

const phaseLabels: Record<string, string> = {
  PHASE_1: "Fas 1",
  PHASE_2: "Fas 2",
  PHASE_3: "Fas 3",
  PHASE_4: "Fas 4",
};

type StudentReportProps = {
  student: {
    name: string | null;
    email: string;
    careerGroup: { name: string; education: { name: string } } | null;
    progression: {
      currentPhase: string;
      milestones: { completed: boolean; milestone: { name: string } }[];
    } | null;
    leads: { company: { name: string }; status: string }[];
    liaPlacement: { company: { name: string }; status: string } | null;
  };
};

export function StudentReport({ student }: StudentReportProps) {
  const completedMilestones = student.progression?.milestones.filter((m) => m.completed).length || 0;
  const totalMilestones = student.progression?.milestones.length || 0;
  const progressPercent = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Studeranderapport</Text>
          <Text style={styles.subtitle}>Genererad: {new Date().toLocaleDateString("sv-SE")}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personuppgifter</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Namn:</Text>
            <Text style={styles.value}>{student.name || "—"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{student.email}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Grupp:</Text>
            <Text style={styles.value}>{student.careerGroup?.name || "—"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Utbildning:</Text>
            <Text style={styles.value}>{student.careerGroup?.education.name || "—"}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Progression</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Nuvarande fas:</Text>
            <Text style={styles.value}>{phaseLabels[student.progression?.currentPhase || "PHASE_1"]}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Avklarade moment:</Text>
            <Text style={styles.value}>{completedMilestones} av {totalMilestones} ({progressPercent}%)</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>LIA-plats</Text>
          {student.liaPlacement ? (
            <>
              <View style={styles.row}>
                <Text style={styles.label}>Företag:</Text>
                <Text style={styles.value}>{student.liaPlacement.company.name}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Status:</Text>
                <Text style={styles.value}>{student.liaPlacement.status}</Text>
              </View>
            </>
          ) : (
            <Text style={styles.value}>Ej registrerad</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Leads ({student.leads.length})</Text>
          {student.leads.length > 0 ? (
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={styles.tableCellHeader}>Företag</Text>
                <Text style={styles.tableCellHeader}>Status</Text>
              </View>
              {student.leads.map((lead, i) => (
                <View key={i} style={styles.tableRow}>
                  <Text style={styles.tableCell}>{lead.company.name}</Text>
                  <Text style={styles.tableCell}>{lead.status}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.value}>Inga leads</Text>
          )}
        </View>

        <Text style={styles.footer}>ChasCareer - Genererad automatiskt</Text>
      </Page>
    </Document>
  );
}

type GroupReportProps = {
  group: {
    name: string;
    education: { name: string };
    members: {
      id: string;
      name: string | null;
      email: string;
      progression: {
        currentPhase: string;
        milestones: { completed: boolean }[];
      } | null;
      leads: { id: string }[];
      liaPlacement: { status: string } | null;
    }[];
  };
};

export function GroupReport({ group }: GroupReportProps) {
  const totalStudents = group.members.length;
  const studentsWithLia = group.members.filter((m) => m.liaPlacement).length;
  const totalLeads = group.members.reduce((sum, m) => sum + m.leads.length, 0);

  const avgProgress = totalStudents > 0
    ? Math.round(
        group.members.reduce((sum, m) => {
          const completed = m.progression?.milestones.filter((ms) => ms.completed).length || 0;
          const total = m.progression?.milestones.length || 1;
          return sum + (completed / total) * 100;
        }, 0) / totalStudents
      )
    : 0;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Grupprapport: {group.name}</Text>
          <Text style={styles.subtitle}>{group.education.name} | Genererad: {new Date().toLocaleDateString("sv-SE")}</Text>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{totalStudents}</Text>
            <Text style={styles.statLabel}>Studerande</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{avgProgress}%</Text>
            <Text style={styles.statLabel}>Snitt-progression</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{studentsWithLia}</Text>
            <Text style={styles.statLabel}>Med LIA</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{totalLeads}</Text>
            <Text style={styles.statLabel}>Totalt leads</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Studerande</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableCellHeader}>Namn</Text>
              <Text style={styles.tableCellHeader}>Fas</Text>
              <Text style={styles.tableCellHeader}>Leads</Text>
              <Text style={styles.tableCellHeader}>LIA</Text>
            </View>
            {group.members.map((student) => {
              const completed = student.progression?.milestones.filter((m) => m.completed).length || 0;
              const total = student.progression?.milestones.length || 1;
              const percent = Math.round((completed / total) * 100);

              return (
                <View key={student.id} style={styles.tableRow}>
                  <Text style={styles.tableCell}>{student.name || student.email}</Text>
                  <Text style={styles.tableCell}>{phaseLabels[student.progression?.currentPhase || "PHASE_1"]} ({percent}%)</Text>
                  <Text style={styles.tableCell}>{student.leads.length}</Text>
                  <Text style={styles.tableCell}>{student.liaPlacement ? "Ja" : "Nej"}</Text>
                </View>
              );
            })}
          </View>
        </View>

        <Text style={styles.footer}>ChasCareer - Genererad automatiskt</Text>
      </Page>
    </Document>
  );
}
