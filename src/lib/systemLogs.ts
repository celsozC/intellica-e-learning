import { prisma } from "@/lib/prisma";

export async function createSystemLog(
  userId: string,
  action: string,
  details: string
) {
  try {
    return await prisma.systemLog.create({
      data: {
        userId,
        action,
        details,
        timestamp: new Date(),
      },
    });
  } catch (error) {
    console.error("Error creating system log:", error);
    throw error;
  }
}
