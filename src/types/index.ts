export interface Role {
  id: string;
  name: string;
}

export interface Student {
  id: string;
  fullName: string;
}

export interface Instructor {
  id: string;
  fullName: string;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  studentId?: string;
  instructorId?: string;
  isActive: boolean;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  instructor: {
    fullName: string;
  };
  lessons: {
    id: string;
    title: string;
    sequenceOrder: number;
  }[];
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  content: string;
  sequenceOrder: number;
}

export interface Submission {
  id: string;
  fileUrl: string | null;
  status: string;
  createdAt: string;
  student: {
    fullName: string;
  };
}

export interface CourseEnrollment {
  id: string;
  status: string;
  progress: number;
  lastAccessedAt: Date;
  enrollmentDate: Date;
  completedAt: Date | null;
  course: Course;
  student: Student;
}
