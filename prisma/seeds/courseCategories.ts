import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  try {
    // First, check if categories already exist
    const existingCategories = await prisma.courseCategory.findMany();

    if (existingCategories.length > 0) {
      console.log("Categories already seeded. Skipping...");
      return;
    }

    const categories = [
      {
        name: "Programming",
        description: "Learn coding and software development",
      },
      {
        name: "Design",
        description: "Graphic design and UI/UX courses",
      },
      {
        name: "Business",
        description: "Business and entrepreneurship courses",
      },
      {
        name: "Mathematics",
        description: "Mathematics and statistics courses",
      },
      {
        name: "Science",
        description: "Science and research courses",
      },
      {
        name: "Language",
        description: "Language learning courses",
      },
      {
        name: "Arts",
        description: "Art and creative courses",
      },
      {
        name: "Music",
        description: "Music and audio courses",
      },
      {
        name: "Health",
        description: "Health and wellness courses",
      },
      {
        name: "Technology",
        description: "Technology and IT courses",
      },
    ];

    console.log("Starting to seed course categories...");

    for (const category of categories) {
      const createdCategory = await prisma.courseCategory.create({
        data: category,
      });
      console.log(`Created category: ${createdCategory.name}`);
    }

    console.log("Course categories seeding completed!");
  } catch (error) {
    console.error("Error seeding course categories:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
