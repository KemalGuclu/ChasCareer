import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { PhaseNumber, Role, LeadStatus, LiaStatus } from "@prisma/client";

async function main() {
  console.log("🌱 Seeding database...");

  // Rensa befintlig data (i omvänd ordning pga foreign keys)
  console.log("🧹 Cleaning existing data...");
  await prisma.lead.deleteMany();
  await prisma.liaPlacement.deleteMany();
  await prisma.milestoneProgress.deleteMany();
  await prisma.progression.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.company.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();
  await prisma.milestone.deleteMany();
  await prisma.phaseSchedule.deleteMany();
  await prisma.careerGroup.deleteMany();
  await prisma.education.deleteMany();

  // Skapa utbildningar
  const fullstackEducation = await prisma.education.upsert({
    where: { id: "edu-fullstack" },
    update: {},
    create: {
      id: "edu-fullstack",
      name: "Fullstack Developer",
      description: "2-årig YH-utbildning inom fullstack-utveckling",
    },
  });

  const uxEducation = await prisma.education.upsert({
    where: { id: "edu-ux" },
    update: {},
    create: {
      id: "edu-ux",
      name: "UX Designer",
      description: "2-årig YH-utbildning inom UX-design",
    },
  });

  // Skapa Career Groups
  const stockholmGroup = await prisma.careerGroup.upsert({
    where: { id: "cg-sthlm-fs25" },
    update: {},
    create: {
      id: "cg-sthlm-fs25",
      name: "Stockholm FAS25",
      region: "Stockholm",
      educationId: fullstackEducation.id,
    },
  });

  const malmoGroup = await prisma.careerGroup.upsert({
    where: { id: "cg-malmo-fs25" },
    update: {},
    create: {
      id: "cg-malmo-fs25",
      name: "Malmö FAS25",
      region: "Malmö",
      educationId: fullstackEducation.id,
    },
  });

  // Skapa fas-scheman för varje utbildningsgrupp
  console.log("📅 Creating phase schedules...");
  const phaseSchedules = [
    // Stockholm FAS25
    { careerGroupId: stockholmGroup.id, phase: "PHASE_1" as const, startDate: new Date("2025-01-13"), endDate: new Date("2025-02-28"), deadline: new Date("2025-02-28") },
    { careerGroupId: stockholmGroup.id, phase: "PHASE_2" as const, startDate: new Date("2025-03-01"), endDate: new Date("2025-05-31"), deadline: new Date("2025-05-31") },
    { careerGroupId: stockholmGroup.id, phase: "PHASE_3" as const, startDate: new Date("2025-06-01"), endDate: new Date("2025-09-30"), deadline: new Date("2025-09-30") },
    { careerGroupId: stockholmGroup.id, phase: "PHASE_4" as const, startDate: new Date("2025-11-10"), endDate: new Date("2026-09-30"), deadline: new Date("2026-06-30") },
    // Malmö FAS25
    { careerGroupId: malmoGroup.id, phase: "PHASE_1" as const, startDate: new Date("2025-01-13"), endDate: new Date("2025-02-28"), deadline: new Date("2025-02-28") },
    { careerGroupId: malmoGroup.id, phase: "PHASE_2" as const, startDate: new Date("2025-03-01"), endDate: new Date("2025-05-31"), deadline: new Date("2025-05-31") },
    { careerGroupId: malmoGroup.id, phase: "PHASE_3" as const, startDate: new Date("2025-06-01"), endDate: new Date("2025-09-30"), deadline: new Date("2025-09-30") },
    { careerGroupId: malmoGroup.id, phase: "PHASE_4" as const, startDate: new Date("2025-11-10"), endDate: new Date("2026-09-30"), deadline: new Date("2026-06-30") },
  ];

  for (const schedule of phaseSchedules) {
    await prisma.phaseSchedule.create({ data: schedule });
  }

  // Skapa milestones för varje fas
  const milestones = [
    // FAS 1
    { id: "ms-cw1", name: "Career Workshop 1: CV & LinkedIn", phase: PhaseNumber.PHASE_1 },
    { id: "ms-cw2", name: "Career Workshop 2: Research", phase: PhaseNumber.PHASE_1 },
    { id: "ms-bbd", name: "Big Bang Day", phase: PhaseNumber.PHASE_1 },
    { id: "ms-30leads", name: "30 Leads i CRM", phase: PhaseNumber.PHASE_1 },
    // FAS 2
    { id: "ms-cw3", name: "Career Workshop 3: Pitch & Mingle", phase: PhaseNumber.PHASE_2 },
    { id: "ms-60leads", name: "60 Leads i CRM", phase: PhaseNumber.PHASE_2 },
    { id: "ms-10contacts", name: "10 Kontakter", phase: PhaseNumber.PHASE_2 },
    { id: "ms-studyvisit", name: "3 Studiebesök", phase: PhaseNumber.PHASE_2 },
    // FAS 3
    { id: "ms-cw4", name: "Career Workshop 4: Intervju", phase: PhaseNumber.PHASE_3 },
    { id: "ms-90leads", name: "90 Leads i CRM", phase: PhaseNumber.PHASE_3 },
    { id: "ms-15contacts", name: "15 Kontakter", phase: PhaseNumber.PHASE_3 },
    { id: "ms-lia-check1", name: "LIA Check-in 1", phase: PhaseNumber.PHASE_3 },
    { id: "ms-lia-check2", name: "LIA Check-in 2", phase: PhaseNumber.PHASE_3 },
    { id: "ms-lia-secured", name: "LIA Säkrad", phase: PhaseNumber.PHASE_3 },
    // FAS 4
    { id: "ms-job-checkin", name: "Jobb Check-in", phase: PhaseNumber.PHASE_4 },
    { id: "ms-alumni", name: "Alumni Reunion", phase: PhaseNumber.PHASE_4 },
  ];

  for (const ms of milestones) {
    await prisma.milestone.upsert({
      where: { id: ms.id },
      update: {},
      create: ms,
    });
  }

  // Skapa användare
  const users = [
    // Admin
    { id: "user-admin", email: "admin@chasacademy.se", name: "Anna Admin", role: Role.ADMIN },
    // Utbildare
    { id: "user-teacher", email: "teacher@chasacademy.se", name: "Tommy Teacher", role: Role.TEACHER },
    // Studerande
    { id: "user-student", email: "student@chasacademy.se", name: "Sara Student", role: Role.STUDENT, careerGroupId: stockholmGroup.id },
    { id: "user-erik", email: "erik@student.se", name: "Erik Eriksson", role: Role.STUDENT, careerGroupId: stockholmGroup.id },
    { id: "user-lisa", email: "lisa@student.se", name: "Lisa Lindgren", role: Role.STUDENT, careerGroupId: stockholmGroup.id },
    { id: "user-johan", email: "johan@student.se", name: "Johan Johansson", role: Role.STUDENT, careerGroupId: malmoGroup.id },
    { id: "user-maria", email: "maria@student.se", name: "Maria Månsson", role: Role.STUDENT, careerGroupId: malmoGroup.id },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { id: user.id },
      update: {},
      create: user,
    });
  }

  // Skapa progression för studerande
  const studentProgressions = [
    { id: "prog-student", userId: "user-student", currentPhase: PhaseNumber.PHASE_2 },
    { id: "prog-erik", userId: "user-erik", currentPhase: PhaseNumber.PHASE_2 },
    { id: "prog-lisa", userId: "user-lisa", currentPhase: PhaseNumber.PHASE_3 },
    { id: "prog-johan", userId: "user-johan", currentPhase: PhaseNumber.PHASE_1 },
    { id: "prog-maria", userId: "user-maria", currentPhase: PhaseNumber.PHASE_3 },
  ];

  for (const prog of studentProgressions) {
    await prisma.progression.upsert({
      where: { userId: prog.userId },
      update: { currentPhase: prog.currentPhase },
      create: prog,
    });
  }

  // Skapa MilestoneProgress för varje student
  console.log("📊 Creating milestone progress...");
  const allMilestones = await prisma.milestone.findMany();
  const allProgressions = await prisma.progression.findMany();

  for (const progression of allProgressions) {
    for (const milestone of allMilestones) {
      // Markera som completed baserat på fas
      const phaseOrder = { PHASE_1: 1, PHASE_2: 2, PHASE_3: 3, PHASE_4: 4 };
      const currentPhaseNum = phaseOrder[progression.currentPhase];
      const milestonePhaseNum = phaseOrder[milestone.phase];
      
      // Completed om milestone-fasen är lägre än nuvarande fas
      const completed = milestonePhaseNum < currentPhaseNum;

      await prisma.milestoneProgress.upsert({
        where: {
          progressionId_milestoneId: {
            progressionId: progression.id,
            milestoneId: milestone.id,
          },
        },
        update: { completed },
        create: {
          progressionId: progression.id,
          milestoneId: milestone.id,
          completed,
          completedAt: completed ? new Date() : null,
        },
      });
    }
  }

  // Skapa företag
  const companies = [
    { id: "comp-spotify", name: "Spotify", industry: "Tech/Streaming", city: "Stockholm", size: "200+", website: "https://spotify.com" },
    { id: "comp-klarna", name: "Klarna", industry: "Fintech", city: "Stockholm", size: "200+", website: "https://klarna.com" },
    { id: "comp-king", name: "King", industry: "Gaming", city: "Stockholm", size: "200+", website: "https://king.com" },
    { id: "comp-acme", name: "ACME Consulting", industry: "Konsult", city: "Malmö", size: "51-200" },
    { id: "comp-startup", name: "TechStartup AB", industry: "SaaS", city: "Stockholm", size: "11-50" },
    { id: "comp-agency", name: "Digital Agency", industry: "Digital byrå", city: "Göteborg", size: "11-50" },
  ];

  for (const comp of companies) {
    await prisma.company.upsert({
      where: { id: comp.id },
      update: {},
      create: comp,
    });
  }

  // Skapa kontakter
  const contacts = [
    { id: "con-1", name: "Emma Tech", title: "Talent Acquisition", email: "emma@spotify.com", companyId: "comp-spotify" },
    { id: "con-2", name: "Oscar Developer", title: "Engineering Manager", email: "oscar@klarna.com", companyId: "comp-klarna" },
    { id: "con-3", name: "Maja HR", title: "HR Manager", email: "maja@king.com", companyId: "comp-king" },
  ];

  for (const con of contacts) {
    await prisma.contact.upsert({
      where: { id: con.id },
      update: {},
      create: con,
    });
  }

  // Skapa leads för Sara Student
  const leads = [
    { userId: "user-student", companyId: "comp-spotify", contactId: "con-1", status: LeadStatus.IN_DIALOG, contactAttempts: 3 },
    { userId: "user-student", companyId: "comp-klarna", contactId: "con-2", status: LeadStatus.CONTACTED, contactAttempts: 1 },
    { userId: "user-student", companyId: "comp-startup", status: LeadStatus.NEW, contactAttempts: 0 },
    { userId: "user-lisa", companyId: "comp-king", contactId: "con-3", status: LeadStatus.LIA_OFFERED, contactAttempts: 4 },
  ];

  for (const lead of leads) {
    await prisma.lead.create({
      data: lead,
    });
  }

  // Skapa LIA-plats för Lisa
  await prisma.liaPlacement.upsert({
    where: { userId: "user-lisa" },
    update: {},
    create: {
      userId: "user-lisa",
      companyId: "comp-king",
      supervisor: "Maja HR",
      supervisorEmail: "maja@king.com",
      status: LiaStatus.APPROVED,
      startDate: new Date("2025-11-10"),
      endDate: new Date("2026-04-26"),
    },
  });

  console.log("✅ Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
