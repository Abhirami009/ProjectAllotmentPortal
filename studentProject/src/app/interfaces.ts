export interface user {
	user_id : number,
	password : string
}


export interface course {
	course_id  : number,
	course_name : string,
	credits : number,
	course_code : string
}

export interface Student {
    name: string;
    rollNumber: number;
	phone_no : number;
	email : string;
    branch: string;
    year: number;
    cgpa: number;
    completedCourses?: course[];
	applied? : projApplication[];
}

export enum Status {
    PENDING = "Pending",
    REJECTED = "Rejected",
    APPROVED = "Approved"
}

export interface Pdf {
    name: string;
    url: string;
}

export interface projApplication {
    project_id : number;
	title : string;
	bio : string;
    status: Status;
    docs: Pdf[];
    timestamp: Date;
	preference: number;
	facultypreference: number;
}

export interface department{
	dept_id : number,
	dept_name : string
}

export interface project{
	project_id : number,
	title : string,
	faculty_name : string,
	min_cgpa : number,
	description : string,
	available_slots : number,
	students_per_team : number,
	prerequisites? : course[],
	documents? : Pdf[],
	min_year : number,
	department? : department[]

}

export interface preference{
	student_id : number,
	project_id : number,
	rank : number
}

export interface facultypreference{
	faculty_id : number,
	student_id : number,
	project_id : number,
	rank : number
}