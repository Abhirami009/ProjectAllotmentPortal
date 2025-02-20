export enum Role {
    STUDENT = "student",
    FACULTY = "faculty"
}

export interface User {
    userId: number;
    name: string;
    password : string;
}

// Enum for Departments
export enum Dept {
    CS = "Computer Science",
    DS = "Data Science",
    EE = "Electrical Engineering",
    ME = "Mechanical Engineering",
    CE = "Civil Engineering",
}

// Course Interface
export interface Course {
    courseId: number;
    courseName: string;
    courseCode: string;
    offeredBy: Dept;
    credits: number;
}

// Student Interface
export interface Student {
    studentId: string;
    name: string;
    rollNumber: string;
    branch: Dept;
    semester: number;
    cgpa: number;
    completedCourses: Course[];
}

// Faculty Interface
export interface Faculty {
    facultyId: number;
    name: string;
	password : string;
    email: string;
    department: Dept;
}

// Project Eligibility Criteria
export interface EligibilityCriteria {
    requiredCourses: Course[];
    minCgpa: number;
    departments: Dept[];
    minSemester: number;
}

// Project Interface
export interface Project {
    projectId: number;
    facultyId: number;
    title: string;
    description: string;
    eligibilityCriteria: EligibilityCriteria;
    slotsAvailable: number;
    studentsPerTeam: number;
}

// Application Status Enum
export enum Status {
    PENDING = "Pending",
    REJECTED = "Rejected",
    APPROVED = "Approved"
}

// PDF Interface
export interface Pdf {
    name: string;
    url: string;
}

// Application Interface
export interface projApplication {
    applicationId: number;
    students: Student[];
    projectId: number;
    status: Status;
    docs: Pdf[];
    timestamp: Date;
    facultyComments: string | undefined;
}
