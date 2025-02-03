import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  // Clear existing data in correct order (respect foreign key constraints)
  await prisma.courseEnrollment.deleteMany({});
  await prisma.quizAttempt.deleteMany({});
  await prisma.quiz.deleteMany({});
  await prisma.submission.deleteMany({});
  await prisma.assignment.deleteMany({});
  await prisma.discussionReply.deleteMany({});
  await prisma.discussion.deleteMany({});
  await prisma.lesson.deleteMany({});
  await prisma.course.deleteMany({});
  await prisma.systemSettings.deleteMany({});
  await prisma.systemLog.deleteMany({});
  await prisma.admin.deleteMany({});
  await prisma.teacher.deleteMany({});
  await prisma.student.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.courseCategory.deleteMany({});
  await prisma.role.deleteMany({});

  console.log("Cleaned up existing data");

  // Create roles first
  const adminRole = await prisma.role.create({
    data: { name: "admin" },
  });
  const teacherRole = await prisma.role.create({
    data: { name: "teacher" },
  });
  const studentRole = await prisma.role.create({
    data: { name: "student" },
  });

  // Create course categories
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
  ];

  const createdCategories = await Promise.all(
    categories.map((category) =>
      prisma.courseCategory.create({
        data: category,
      })
    )
  );

  console.log("Created course categories");

  // Create admin user
  const adminUser = await prisma.user.create({
    data: {
      email: "admin@zanecoder.com",
      fullName: "System Admin",
      password: await bcrypt.hash("admin123", 10),
      roleId: adminRole.id,
      adminDetails: {
        create: {
          fullName: "System Admin",
          systemSettings: {
            create: [
              {
                key: "defaultSettings",
                value: "{}",
              },
            ],
          },
        },
      },
    },
    include: {
      adminDetails: true,
    },
  });
  console.log("Created admin user");

  // Create teacher user
  const teacherUser = await prisma.user.create({
    data: {
      email: "teacher@zanecoder.com",
      fullName: "John Teacher",
      password: await bcrypt.hash("teacher123", 10),
      roleId: teacherRole.id,
      teacherDetails: {
        create: {
          fullName: "John Teacher",
          specialization: "Web Development",
          bio: "Experienced web developer and educator",
          gender: "Male",
        },
      },
    },
    include: {
      teacherDetails: true,
    },
  });
  console.log("Created teacher user");

  // Create students
  const studentData = [
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

  const createdStudents = await Promise.all(
    studentData.map((data) =>
      prisma.user.create({
        data: {
          email: data.email,
          fullName: data.fullName,
          password: data.password,
          roleId: studentRole.id,
          studentDetails: {
            create: {
              fullName: data.fullName,
              dateOfBirth: data.dateOfBirth,
              gender: data.gender,
            },
          },
        },
        include: {
          studentDetails: true,
        },
      })
    )
  );
  console.log("Created student users");

  // Create courses with categories
  const courses = [
    {
      title: "Introduction to Web Development",
      description: "Learn the basics of HTML, CSS, and JavaScript",
      categoryId: createdCategories[0].id, // Programming category
      status: "active",
      lessons: [
        {
          title: "HTML Basics",
          description: "Introduction to HTML",
          content: "Learn about HTML tags and structure",
          materialUrl: "https://example.com/html-basics",
          sequenceOrder: 1,
        },
        {
          title: "CSS Fundamentals",
          description: "Learn CSS basics",
          content: "Understanding CSS selectors and properties",
          materialUrl: "https://example.com/css-basics",
          sequenceOrder: 2,
        },
      ],
    },
    {
      title: "Advanced JavaScript Programming",
      description: "Master modern JavaScript concepts and frameworks",
      categoryId: createdCategories[0].id, // Programming category
      status: "draft",
      lessons: [
        {
          title: "ES6 Features",
          description: "Modern JavaScript features",
          content: "Learn about arrow functions, destructuring, and more",
          materialUrl: "https://example.com/es6-features",
          sequenceOrder: 1,
        },
      ],
    },
    {
      title: "UI/UX Design Fundamentals",
      description: "Learn the basics of user interface and experience design",
      categoryId: createdCategories[1].id, // Design category
      status: "active",
      lessons: [
        {
          title: "Design Principles",
          description: "Basic principles of design",
          content: "Learn about color theory, typography, and layout",
          materialUrl: "https://example.com/design-principles",
          sequenceOrder: 1,
        },
      ],
    },
  ];

  // Create courses with lessons
  for (const courseData of courses) {
    const course = await prisma.course.create({
      data: {
        title: courseData.title,
        description: courseData.description,
        teacherId: teacherUser.teacherDetails!.id,
        categoryId: courseData.categoryId,
        status: courseData.status,
        lessons: {
          create: courseData.lessons,
        },
      },
      include: {
        lessons: true,
      },
    });
    console.log(`Created course: ${course.title} (${course.status})`);

    // Create assignments, quizzes, and discussions for each lesson
    for (const lesson of course.lessons) {
      await prisma.assignment.create({
        data: {
          title: `Assignment for ${lesson.title}`,
          description: `Practice what you learned in ${lesson.title}`,
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          maxScore: 100,
          lessonId: lesson.id,
        },
      });

      const quiz = await prisma.quiz.create({
        data: {
          title: `Quiz for ${lesson.title}`,
          description: `Test your knowledge of ${lesson.title}`,
          timeLimit: 30,
          maxScore: 100,
          lessonId: lesson.id,
        },
      });

      const discussion = await prisma.discussion.create({
        data: {
          title: `Discussion: ${lesson.title}`,
          content: `Let's discuss what we learned in ${lesson.title}`,
          authorId: teacherUser.id,
          lessonId: lesson.id,
        },
      });

      await prisma.discussionReply.create({
        data: {
          content: "Great lesson! I learned a lot.",
          authorId: createdStudents[0].id,
          discussionId: discussion.id,
        },
      });
    }

    // Enroll first two students in the course
    for (const student of createdStudents.slice(0, 2)) {
      await prisma.courseEnrollment.create({
        data: {
          studentId: student.studentDetails!.id,
          courseId: course.id,
          status: "ACTIVE",
          enrollmentDate: new Date(),
        },
      });
    }
    console.log(`Enrolled students in course: ${course.title}`);
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
