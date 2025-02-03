import { prisma } from "@/lib/prisma";

export async function logActivity(
  actorId: string,
  actorType: string,
  action: string,
  description: string
) {
  try {
    await prisma.activityLog.create({
      data: {
        actorId,
        actorType,
        action,
        description,
      },
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
}
