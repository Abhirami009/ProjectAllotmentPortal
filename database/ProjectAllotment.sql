CREATE ROLE projectallotmentportal with login;

create table Department(
dept_id integer PRIMARY KEY,
dept_name text UNIQUE NOT NULL
);


create table students
( 
Roll_no integer PRIMARY KEY,
FirstName varchar(50) NOT NULL,
LastName varchar(50) NOT NULL,
email text NOT NULL,
Phone_no VARCHAR(10) NOT NULL UNIQUE,
Department_id INTEGER,
year integer NOT NULL,
Cgpa decimal(2,2) NOT NULL,
CONSTRAINT check_cgpa CHECK(cgpa >= 0 and cgpa <= 10),
CONSTRAINT check_year CHECK(year >= 1 and year <= 8),
CONSTRAINT fk_dept FOREIGN KEY (Department_id) REFERENCES Department(dept_id)
);

create table faculty(
faculty_id integer PRIMARY KEY,
firstName varchar(50) NOT NULL,
lastName varchar(50) NOT NULL,
email text NOT NULL UNIQUE,
Phone_no VARCHAR(10) NOT NULL UNIQUE,
Department_id INTEGER,
CONSTRAINT fk_dept FOREIGN KEY (Department_id) REFERENCES Department(dept_id)
);

CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    password TEXT NOT NULL,
    user_type VARCHAR(10) NOT NULL CHECK (user_type IN ('student', 'faculty')),  -- To distinguish between students and faculty
    student_id INTEGER,
    faculty_id INTEGER,
    CONSTRAINT fk_student FOREIGN KEY (student_id) REFERENCES students(Roll_no),
    CONSTRAINT fk_faculty FOREIGN KEY (faculty_id) REFERENCES faculty(faculty_id),
    CONSTRAINT check_user_type CHECK (
        (user_type = 'student' AND student_id IS NOT NULL AND faculty_id IS NULL) OR 
        (user_type = 'faculty' AND faculty_id IS NOT NULL AND student_id IS NULL)
    )
);


create table courses (
course_id integer PRIMARY KEY,
course_name varchar(50) NOT NULL,
Course_code varchar(5) NOT NULL,
Credits integer NOT NULL,
CONSTRAINT check_credits CHECK(Credits > 0)
);

CREATE TABLE STUDENT_COURSES (
    Student_id INTEGER,
    Course_id INTEGER,
    Grade CHAR(1) NOT NULL,
    CONSTRAINT pk_student_course PRIMARY KEY (Student_id, Course_id, Grade),  -- Composite primary key
    CONSTRAINT fk_student FOREIGN KEY (Student_id) REFERENCES students(Roll_no),
    CONSTRAINT fk_course FOREIGN KEY (Course_id) REFERENCES courses(course_id),
    CONSTRAINT check_grade CHECK (Grade IN ('S', 'A', 'B', 'C', 'D', 'E', 'F', 'I'))  -- Ensure the grade is valid
);

create table projects(
	project_id SERIAL integer PRIMARY KEY,
    faculty_id integer, 
	Title text NOT NULL UNIQUE,
	Description text NOT NULL,
	Min_cgpa decimal(2,2) NOT NULL  CHECK (Min_cgpa >= 0 AND Min_cgpa <= 10),
    CONSTRAINT fk_faculty FOREIGN KEY (faculty_id) REFERENCES faculty(faculty_id)
	
);

ALTER TABLE projects 
ADD COLUMN Available_slots INTEGER NOT NULL CHECK (Available_slots >= 0),  -- Total available slots for students
ADD COLUMN Students_per_team INTEGER NOT NULL CHECK (Students_per_team >= 1); -- Minimum 1 student per team
ALTER TABLE projects
ADD COLUMN min_year INTEGER CHECK(min_year >= 1 and min_year <= 20);

ALTER TABLE projects 
ADD COLUMN faculty_id INTEGER,
ADD CONSTRAINT fk_faculty FOREIGN KEY (faculty_id) REFERENCES faculty(faculty_id) ON DELETE CASCADE;




create table prereq(
   project_id integer,
   course_id integer,
   PRIMARY KEY (Project_id, Course_id),
   CONSTRAINT fk_project FOREIGN KEY (Project_id) REFERENCES projects(Project_id) ON DELETE CASCADE,
   CONSTRAINT fk_course FOREIGN KEY (Course_id) REFERENCES courses(Course_id) ON DELETE CASCADE
);

create table project_dept (
Project_id INTEGER,
dept_id INTEGER,
PRIMARY KEY(project_id, dept_id)
CONSTRAINT fk_dept FOREIGN KEY (Department_id) REFERENCES Department(dept_id)
CONSTRAINT fk_project_dept FOREIGN KEY (Project_id) REFERENCES projects(Project_id) ON DELETE CASCADE
)

CREATE TABLE project_documents (
    Document_id SERIAL PRIMARY KEY,
    Project_id INTEGER,
    Document_name VARCHAR(255) NOT NULL,
    Document_path TEXT NOT NULL,
    Uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_project_docs FOREIGN KEY (Project_id) REFERENCES projects(Project_id) ON DELETE CASCADE
);


CREATE or replace VIEW project_details AS
SELECT 
    p.project_id,
    p.title,
    p.description,
    p.min_cgpa,
    p.available_slots,
    p.students_per_team,    
    p.faculty_id,
	p.min_year,
    ARRAY_AGG(DISTINCT pr.course_id) AS prerequisite_courses,
    ARRAY_AGG(DISTINCT pd.document_name) AS document_names,
    ARRAY_AGG(DISTINCT pd.document_path) AS document_paths
FROM projects p
LEFT JOIN faculty f ON p.faculty_id = f.faculty_id
LEFT JOIN prereq pr ON p.project_id = pr.project_id
LEFT JOIN project_documents pd ON p.project_id = pd.project_id
GROUP BY p.project_id, f.firstname;

-- SELECT * FROM project_details;


CREATE or replace FUNCTION get_project_details(proj_id INTEGER)
RETURNS TABLE (
    project_id INTEGER,
    title TEXT,
    description TEXT,
    min_cgpa decimal(2,2),
    available_slots INTEGER,
    students_per_team INTEGER,
    faculty_id INTEGER,
    prerequisite_courses integer[],
    document_names varchar[],
    document_paths text[]
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.project_id,
        p.title,
        p.description,
        p.min_cgpa,
        p.available_slots,
        p.students_per_team,
        p.faculty_id,
        ARRAY_AGG(DISTINCT pr.course_id) AS prerequisite_courses,
        ARRAY_AGG(DISTINCT pd.document_name) AS document_names,
        ARRAY_AGG(DISTINCT pd.document_path) AS document_paths
    FROM projects p
    LEFT JOIN faculty f ON p.faculty_id = f.faculty_id
    LEFT JOIN prereq pr ON p.project_id = pr.project_id
    LEFT JOIN project_documents pd ON p.project_id = pd.project_id
    WHERE p.project_id = proj_id
    GROUP BY p.project_id;
END; 
$$ LANGUAGE plpgsql;

-- drop function get_project_details;
-- SELECT * FROM get_project_details(2);

create or replace function getcourse(course_id integer)
returns var



CREATE TABLE teams (
    Team_id SERIAL PRIMARY KEY,
    Team_name VARCHAR(100) NOT NULL UNIQUE 
);

CREATE TABLE team_members (
    Team_id INTEGER,
    Student_id INTEGER,
    PRIMARY KEY (Team_id, Student_id),
    CONSTRAINT fk_team FOREIGN KEY (Team_id) REFERENCES teams(Team_id) ON DELETE CASCADE,
    CONSTRAINT fk_student FOREIGN KEY (Student_id) REFERENCES students(Roll_no) ON DELETE CASCADE
);


CREATE TABLE project_applications (
    Application_id SERIAL PRIMARY KEY,
    Student_id INTEGER,
    Project_id INTEGER,
    Application_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    bio text;
    Status VARCHAR(20) DEFAULT 'Pending' CHECK (Status IN ('Pending', 'Accepted', 'Rejected')),
    CONSTRAINT fk_student FOREIGN KEY (Student_id) REFERENCES students(Roll_no) ON DELETE CASCADE,
    CONSTRAINT fk_project FOREIGN KEY (Project_id) REFERENCES projects(Project_id) ON DELETE CASCADE,
    UNIQUE (Student_id, Project_id)
);

CREATE TABLE team_project_applications (
    Application_id SERIAL PRIMARY KEY,
    Team_id INTEGER,
    Project_id INTEGER,
    bio text,
    Application_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Status VARCHAR(20) DEFAULT 'Pending' CHECK (Status IN ('Pending', 'Accepted', 'Rejected')),
    CONSTRAINT fk_team FOREIGN KEY (Team_id) REFERENCES teams(Team_id) ON DELETE CASCADE,
    CONSTRAINT fk_project FOREIGN KEY (Project_id) REFERENCES projects(Project_id) ON DELETE CASCADE,
    UNIQUE (Team_id, Project_id)
);


/* this is to prevent the student from applying to a project both as team and individually to the same project*/
CREATE OR REPLACE FUNCTION prevent_duplicate_application()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM team_project_applications tpa
        JOIN team_members tm ON tpa.Team_id = tm.Team_id
        WHERE tm.Student_id = NEW.Student_id AND tpa.Project_id = NEW.Project_id
    ) THEN
        RAISE EXCEPTION 'Student has already applied for this project as part of a team';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_individual_application
BEFORE INSERT ON project_applications
FOR EACH ROW EXECUTE FUNCTION prevent_duplicate_application();

CREATE TABLE documents_applications (
    Document_id SERIAL PRIMARY KEY,
    Individual_Application_id INTEGER,
    Team_Application_id INTEGER,
    Document_name VARCHAR(255) NOT NULL,
    Document_url TEXT,
    Upload_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_individual_application FOREIGN KEY (Individual_Application_id)
        REFERENCES project_applications(Application_id) ON DELETE CASCADE,
    CONSTRAINT fk_team_application FOREIGN KEY (Team_Application_id) 
        REFERENCES team_project_applications(Application_id) ON DELETE CASCADE,
    CHECK (
        (Individual_Application_id IS NOT NULL AND Team_Application_id IS NULL) OR
        (Individual_Application_id IS NULL AND Team_Application_id IS NOT NULL)
    )
);

GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO projectallotmentportal;

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO projectallotmentportal;

DO $$ 
DECLARE 
    view_rec RECORD;
BEGIN
    FOR view_rec IN 
        SELECT table_name 
        FROM information_schema.views 
        WHERE table_schema = 'public'
    LOOP
        EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON %I TO projectallotmentportal;', view_rec.table_name);
    END LOOP;
END $$;

ALTER DEFAULT PRIVILEGES IN SCHEMA public 
GRANT ALL PRIVILEGES ON TABLES TO projectallotmentportal;

ALTER DEFAULT PRIVILEGES IN SCHEMA public 
GRANT ALL PRIVILEGES ON sequences TO projectallotmentportal;


CREATE TABLE student_preferences ( -- to store the prefernces of the students, lower rank higher preference
    student_id INTEGER,
    project_id INTEGER,
    rank INTEGER NOT NULL,
    PRIMARY KEY (student_id, project_id),
    CONSTRAINT fk_student FOREIGN KEY (student_id) REFERENCES students(Roll_no) ON DELETE CASCADE,
    CONSTRAINT fk_project FOREIGN KEY (project_id) REFERENCES projects(Project_id) ON DELETE CASCADE,
    CONSTRAINT check_rank CHECK (rank > 0)
);

CREATE TABLE faculty_preferences (
    faculty_id INTEGER,
    student_id INTEGER,
    project_id INTEGER,
    rank INTEGER NOT NULL,
    PRIMARY KEY (faculty_id, student_id, project_id),
    CONSTRAINT fk_faculty FOREIGN KEY (faculty_id) REFERENCES faculty(faculty_id) ON DELETE CASCADE,
    CONSTRAINT fk_student FOREIGN KEY (student_id) REFERENCES students(Roll_no) ON DELETE CASCADE,
    CONSTRAINT fk_project FOREIGN KEY (project_id) REFERENCES projects(Project_id) ON DELETE CASCADE,
    CONSTRAINT check_rank CHECK (rank > 0)
);

insert into faculty_preferences values 
(1, 101, 2, 1),
(1, 102, 2, 2),
(1, 103, 2, 3),
(1, 103, 4, 1),
(1, 103, 6, 1);


insert into student_preferences values 
(101,2,1),
(101,4,2),
(101,1,3),
(102,2,1),
(102,11,2),
(102,13,3),
(103,2,1),
(103,3,2),
(103,6,3);

select * from project_allocations;
delete from project_allocations ;
-- select available_slots from projects where project_id = 2;

 update projects set available_slots = 2 where project_id = 2;

CREATE TABLE project_allocations ( -- to store the allocations of the project
    student_id INTEGER,
    project_id INTEGER,
    faculty_id INTEGER,
    allocation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (student_id, project_id),
    CONSTRAINT fk_student FOREIGN KEY (student_id) REFERENCES students(Roll_no) ON DELETE CASCADE,
    CONSTRAINT fk_project FOREIGN KEY (project_id) REFERENCES projects(Project_id) ON DELETE CASCADE,
    CONSTRAINT fk_faculty FOREIGN KEY (faculty_id) REFERENCES faculty(faculty_id) ON DELETE CASCADE
);

-- update project_applications set status = 'Pending';
select * from project_applications;

select * from faculty_preferences;
select * from student_preferences;

CREATE OR REPLACE FUNCTION trigger_gale_shapley()
    RETURNS TRIGGER AS $$
    BEGIN
      PERFORM pg_notify('run_gale_shapley', 'run');
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    DROP TRIGGER IF EXISTS trigger_student_preferences ON student_preferences;
    CREATE TRIGGER trigger_student_preferences
    AFTER INSERT OR UPDATE OR DELETE ON student_preferences
    FOR EACH STATEMENT EXECUTE FUNCTION trigger_gale_shapley();

    DROP TRIGGER IF EXISTS trigger_faculty_preferences ON faculty_preferences;
    CREATE TRIGGER trigger_faculty_preferences
    AFTER INSERT OR UPDATE OR DELETE ON faculty_preferences
    FOR EACH STATEMENT EXECUTE FUNCTION trigger_gale_shapley();


CREATE TABLE boston_allocations(
    student_id INTEGER,
    project_id INTEGER,
    faculty_id INTEGER,
    allocation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (student_id, project_id),
    CONSTRAINT fk_student FOREIGN KEY (student_id) REFERENCES students(Roll_no) ON DELETE CASCADE,
    CONSTRAINT fk_project FOREIGN KEY (project_id) REFERENCES projects(Project_id) ON DELETE CASCADE,
    CONSTRAINT fk_faculty FOREIGN KEY (faculty_id) REFERENCES faculty(faculty_id) ON DELETE CASCADE
);
ALTER TABLE boston_allocations
ADD COLUMN score NUMERIC;

CREATE TABLE boston_ranks (
    student_id INTEGER,
    project_id INTEGER,
    rank INTEGER NOT NULL,
    PRIMARY KEY (student_id, project_id),
    CONSTRAINT fk_student FOREIGN KEY (student_id) REFERENCES students(Roll_no) ON DELETE CASCADE,
    CONSTRAINT fk_project FOREIGN KEY (project_id) REFERENCES projects(Project_id) ON DELETE CASCADE,
    CONSTRAINT check_rank CHECK (rank > 0)
);


CREATE OR REPLACE VIEW student_project_preferences AS
SELECT 
    s.firstName || s.lastName AS student_name,
    p.Title AS project_name,
    sp.rank AS preference_rank
FROM 
    student_preferences sp
JOIN 
    students s ON sp.student_id = s.Roll_no
JOIN 
    projects p ON sp.project_id = p.Project_id;

CREATE OR REPLACE VIEW project_student_preferences AS
SELECT 
    s.firstName || s.lastName AS student_name,
    p.Title AS project_name,
    pp.rank AS preference_rank
FROM 
    faculty_preferences pp
JOIN 
    students s ON pp.student_id = s.Roll_no
JOIN 
    projects p ON pp.project_id = p.Project_id;

create or replace function get_available_slots(pproject text)
returns int as $$ 
declare 
capacity int;
begin 
select available_slots into capacity
from projects where Title = pproject;
return capacity;
end;
$$ LANGUAGE plpgsql;