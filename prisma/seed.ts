import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  // Create roles
  const roles = ["admin", "teacher", "student"];

  for (const roleName of roles) {
    await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName },
    });
  }

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: "admin@zanecoder.com" },
    update: {},
    create: {
      email: "admin@zanecoder.com",
      fullName: "System Admin",
      password: await bcrypt.hash("admin123", 10),
      isActive: true,
      role: {
        connect: {
          name: "admin",
        },
      },
    },
  });

  // Create teacher user
  const teacher = await prisma.user.upsert({
    where: { email: "teacher@zanecoder.com" },
    update: {},
    create: {
      email: "teacher@zanecoder.com",
      fullName: "John Teacher",
      password: await bcrypt.hash("teacher123", 10),
      isActive: true,
      role: {
        connect: {
          name: "teacher",
        },
      },
    },
  });

  // Create sample students
  const students = [
    {
      email: "celso@zanecoder.com",
      fullName: "Celso Puerto",
      password: await bcrypt.hash("123123", 10),
      dateOfBirth: new Date("1995-01-01"),
      gender: "Male",
    },
    {
      email: "sonrhey@zanecoder.com",
      fullName: "Son Rhey",
      password: await bcrypt.hash("123123", 10),
      dateOfBirth: new Date("1996-01-01"),
      gender: "Male",
    },
    {
      email: "student@zanecoder.com",
      fullName: "Sample Student",
      password: await bcrypt.hash("123123", 10),
      dateOfBirth: new Date("1997-01-01"),
      gender: "Unspecified",
    },
  ];

  for (const studentData of students) {
    const { email, fullName, password, dateOfBirth, gender } = studentData;

    await prisma.$transaction(async (tx) => {
      // Create user first
      const user = await tx.user.upsert({
        where: { email },
        update: {},
        create: {
          email,
          fullName,
          password,
          isActive: true,
          role: {
            connect: {
              name: "student",
            },
          },
        },
      });

      // Create student record
      await tx.student.create({
        data: {
          fullName,
          dateOfBirth,
          gender,
        },
      });
    });
  }

  // Create sample courses
  const courses = [
    {
      title: "Introduction to Web Development",
      description: "Learn the basics of HTML, CSS, and JavaScript",
      teacherId: teacher.id,
    },
    {
      title: "Advanced JavaScript Programming",
      description: "Master modern JavaScript concepts and frameworks",
      teacherId: teacher.id,
    },
    {
      title: "Full Stack Development",
      description: "Build complete web applications from front to back",
      teacherId: teacher.id,
    },
  ];

  for (const courseData of courses) {
    await prisma.course.create({
      data: courseData,
    });
  }

  console.log("Seed data created successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
