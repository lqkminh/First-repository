import { PrismaClient, BillingInterval, CalendarCode } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const roman1962 = await prisma.liturgicalCalendar.upsert({
    where: { code: CalendarCode.ROMAN_1962 },
    update: {},
    create: {
      code: CalendarCode.ROMAN_1962,
      nameVi: "Lịch Rôma 1962",
      nameLa: "Calendarium Romanum 1962",
      description: "Missale Romanum 1962; nội dung chỉ công bố sau khi được đối chiếu."
    }
  });

  const pre55 = await prisma.liturgicalCalendar.upsert({
    where: { code: CalendarCode.PRE_1955 },
    update: {},
    create: {
      code: CalendarCode.PRE_1955,
      nameVi: "Lịch Rôma trước 1955",
      nameLa: "Calendarium Romanum ante 1955",
      description: "Niên lịch trước các cải tổ năm 1955; kho dữ liệu riêng."
    }
  });

  const plan1962 = await prisma.plan.upsert({
    where: { code: "ORDO_1962" },
    update: { calendarId: roman1962.id },
    create: {
      code: "ORDO_1962",
      nameVi: "Hội viên ORDO 1962",
      calendarId: roman1962.id,
      description: "Truy cập thư viện phụng vụ Rôma 1962."
    }
  });

  const planPre55 = await prisma.plan.upsert({
    where: { code: "ORDO_PRE55" },
    update: { calendarId: pre55.id },
    create: {
      code: "ORDO_PRE55",
      nameVi: "Hội viên ORDO tiền 1955",
      calendarId: pre55.id,
      description: "Truy cập thư viện phụng vụ trước năm 1955."
    }
  });

  for (const [planId, month, year] of [
    [plan1962.id, 39000, 390000],
    [planPre55.id, 69000, 690000]
  ] as const) {
    await prisma.planPrice.upsert({
      where: { planId_interval: { planId, interval: BillingInterval.MONTH } },
      update: { amountVnd: month, currency: "VND", isActive: true },
      create: { planId, interval: BillingInterval.MONTH, amountVnd: month }
    });
    await prisma.planPrice.upsert({
      where: { planId_interval: { planId, interval: BillingInterval.YEAR } },
      update: { amountVnd: year, currency: "VND", isActive: true },
      create: { planId, interval: BillingInterval.YEAR, amountVnd: year }
    });
  }

  console.log("Seed completed: calendars, plans, and monthly/yearly prices.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
