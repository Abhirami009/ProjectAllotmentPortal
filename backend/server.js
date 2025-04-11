const express = require("express");
const cors = require("cors"); // Import CORS
const {pool} = require("./db");
const http = require('http');


const multer = require("multer");
const path = require("path");
 const { saveAllocations, saveAllocations_facpropose , bostonMechanism, saveAllocations_boston, saveAllocations_SPAlecture, saveAllocations_SPAstudent} = require("./db"); 



const app = express();
app.use(express.json());
app.use(cors({ origin: "*" })); // Allow all origins for development
 // Enable CORS for all requests

// Get all students

app.use(express.static("uploads")); // Serve static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));



// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Upload endpoint
app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  // Create file URL
  const fileUrl = `http://localhost:5001/${req.file.filename}`; // Change port if needed

  res.json({ name: req.file.originalname, url: fileUrl });
});

app.get("/students", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT s.Roll_no AS studentId, 
                   CONCAT(s.FirstName, ' ', s.LastName) AS name,
                   s.Roll_no AS rollNumber,
                   d.dept_name AS branch,
                   s.year AS year,
                   s.Cgpa AS cgpa
            FROM students s
            JOIN Department d ON s.Department_id = d.dept_id
        `);

        res.json(result.rows);
    } catch (err) {
        console.error("Error fetching students:", err.message);
        res.status(500).send("Server Error");
    }
});

// Get completed courses for a student
app.get("/students/:id/courses", async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(`
            SELECT c.course_id AS "courseId",
                   c.course_name AS "courseName",
                   c.Course_code AS "courseCode",
                   d.dept_name AS "offeredBy",
                   c.Credits AS "credits"
            FROM courses c
            JOIN Department d ON c.department_id = d.dept_id
            JOIN student_courses sc ON sc.course_id = c.course_id
            WHERE sc.student_id = $1
        `, [id]);

        res.json(result.rows);
    } catch (err) {
        console.error(`Error fetching courses for student ${id}:`, err.message);
        res.status(500).send("Server Error");
    }
});

// Get faculty users
app.get("/users_faculty", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT user_id, password FROM users WHERE user_type = 'faculty'
        `);

        res.json(result.rows);
    } catch (err) {
        console.error("Error fetching faculty users:", err.message);
        res.status(500).send("Server Error");
    }
});


app.get("/users_students", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT user_id, password FROM users WHERE user_type = 'student'
        `);

        res.json(result.rows);
    } catch (err) {
        console.error("Error fetching Student users:", err.message);
        res.status(500).send("Server Error");
    }
});

// create table students
// ( 
// Roll_no integer PRIMARY KEY,
// FirstName varchar(50) NOT NULL,
// LastName varchar(50) NOT NULL,
// email text NOT NULL,
// Phone_no VARCHAR(10) NOT NULL UNIQUE,
// Department_id INTEGER,
// Semester integer NOT NULL,
// Cgpa integer NOT NULL,
// CONSTRAINT check_cgpa CHECK(cgpa >= 0 and cgpa <= 10),
// CONSTRAINT check_semester CHECK(Semester >= 1 and Semester <= 8),
// CONSTRAINT fk_dept FOREIGN KEY (Department_id) REFERENCES Department(dept_id)
// );
app.get("/student/:id", async (req, res) => {
    try {
        const { id } = req.params;
        console.log(id);

        // Fetch student details
        const studentQuery = `
            SELECT s.Roll_no, s.FirstName, s.LastName, s.email, s.Phone_no, d.dept_name AS branch, s.year, s.Cgpa
            FROM users u
            JOIN students s ON s.Roll_no = u.student_id
            JOIN Department d ON s.department_id = d.dept_id
            WHERE u.user_id = $1
        `;
        const studentResult = await pool.query(studentQuery, [id]);

        if (studentResult.rows.length === 0) {
            return res.status(404).json({ error: "Student not found" });
        }

        const student = studentResult.rows[0]; // Extract single student object

        // Fetch completed courses
        const courseQuery = `
            SELECT c.course_id, c.course_name, sc.Grade
            FROM STUDENT_COURSES sc 
            JOIN courses c ON sc.Course_id = c.course_id
            WHERE sc.Student_id = $1
            AND sc.Grade IN ('S', 'A', 'B', 'C', 'D', 'E')  -- Exclude 'F' and 'I'
        `;
        const courseResult = await pool.query(courseQuery, [student.roll_no]);
        student.completedCourses = courseResult.rows; // Assign completed courses

        // Fetch project applications
        const applicationQuery = `
            SELECT pa.project_id, pa.application_id, pa.application_date, pa.status, pa.bio, p.title
            FROM project_applications pa
            JOIN projects p ON pa.project_id = p.project_id
            WHERE pa.student_id = $1
        `;
        const applicationResult = await pool.query(applicationQuery, [student.roll_no]);

        // Fetch documents for each application
        for (let app of applicationResult.rows) {
            const docQuery = `
                SELECT Document_name AS name, Document_url AS url 
                FROM documents_applications 
                WHERE Individual_Application_id = $1
            `;
            const docResult = await pool.query(docQuery, [app.application_id]);
            app.docs = docResult.rows; // Assign documents to application
        }

        student.applications = applicationResult.rows; // Assign applications to student

        // Send final JSON response
        res.json(student);
    } catch (error) {
        console.error("Error fetching student:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});



// Get faculty details by ID
app.get("/faculty/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(`
            SELECT f.faculty_id, f.firstName, f.lastName, f.email, f.Phone_no, 
                   d.dept_name 
            FROM users u
            JOIN faculty f ON f.faculty_id = u.faculty_id
            JOIN Department d ON f.department_id = d.dept_id
            WHERE u.user_id = $1
        `, [id]);

        res.json(result.rows);
    } catch (err) {
        console.error(`Error fetching faculty ${id}:`, err.message);
        res.status(500).send("Server Error");
    }
});


app.get("/faculty_project/:id", async (req, res) => {
    try {
        const id = req.params.id; // Ensure `id` is correctly assigned
        
        // Fetch project details
        const projectResult = await pool.query(
            `SELECT * FROM project_details WHERE faculty_id = $1`, 
            [id]
        );
        
        const projects = projectResult.rows;

        // Fetch prerequisites and documents for each project
        for (let project of projects) {
            // 🔹 Fetch prerequisites (courses)
            const prereqResult = await pool.query(
                `SELECT c.course_id, c.course_name, c.credits 
                 FROM prereq pp 
                 JOIN courses c ON pp.course_id = c.course_id
                 WHERE pp.project_id = $1`, 
                [project.project_id]
            );
            project.prerequisites = prereqResult.rows; // Attach prerequisites

            // 🔹 Fetch documents (Fixed: Now inside the loop)
            const docResult = await pool.query(
                `SELECT document_name as doc_name, document_path as doc_url
                 FROM project_documents 
                 WHERE project_id = $1`, 
                [project.project_id]
            );
            project.documents = docResult.rows; // Attach documents


            const deptResult = await pool.query(
                `SELECT pd.dept_id, d.dept_name  -- ✅ Use "pd.dept_id" to avoid ambiguity
                    FROM project_dept pd
                    JOIN Department d ON pd.dept_id = d.dept_id
                    WHERE pd.project_id = $1
                `, 
                [project.project_id]
            );
            // console.log()
            project.department = deptResult.rows || []; // Attach documents
        }

        res.json(projects);
    } catch (err) {
        console.error(`Error fetching projects for faculty ${req.params.id}:`, err.message);
        res.status(500).send("Server Error");
    }
});


app.put("/update_project", async (req, res) => {
    try {
        
        const { project_id, title, min_cgpa, description, available_slots, students_per_team, prerequisites, documents, min_year, department } = req.body;
        console.log("-------",req.body);
        // Update project details
        const updateQuery = `
            UPDATE projects
            SET title = $1, min_cgpa = $2, description = $3, available_slots = $4, students_per_team = $5, min_year = $6
            WHERE project_id = $7
            RETURNING *;
        `;

        const result = await pool.query(updateQuery, [title, min_cgpa, description, available_slots, students_per_team, min_year, project_id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Project not found" });
        }

        // Update prerequisites
        await pool.query(`DELETE FROM prereq WHERE project_id = $1`, [project_id]);
        if (prerequisites && prerequisites.length > 0) {
            const prereqInsertQuery = `INSERT INTO prereq (project_id, course_id) VALUES ${prerequisites.map((_, i) => `($1, $${i + 2})`).join(", ")}`;
            await pool.query(prereqInsertQuery, [project_id, ...prerequisites.map(p => p.course_id)]);
        }

        // Update documents
        await pool.query(`DELETE FROM project_documents WHERE project_id = $1`, [project_id]);
        if (documents && documents.length > 0) {
            const docInsertQuery = `INSERT INTO project_documents (project_id, doc_name, doc_url) VALUES ${documents.map((_, i) => `($1, $${i * 2 + 2}, $${i * 2 + 3})`).join(", ")}`;
            const docValues = documents.flatMap(doc => [doc.doc_name, doc.doc_url]);
            await pool.query(docInsertQuery, [project_id, ...docValues]);
        }

        // Update department
        await pool.query(`DELETE FROM project_dept WHERE project_id = $1`, [project_id]);
        if (department && department.length > 0) {
            const values = department.map((_, i) => `($1, $${i + 2})`).join(", ");
            const params = [project_id, ...department.map(d => d.dept_id)];

            const insertQuery = `INSERT INTO project_dept (project_id, dept_id) VALUES ${values}`;
            await pool.query(insertQuery, params);
        }

        res.json({ message: "Project updated successfully", project: result.rows[0] });
    } catch (err) {
        console.error(`Error updating project :`, err.message);
        res.status(500).send("Server Error");
    }
});


app.post("/add_project", async (req, res) => {
    try {
        const { title, min_cgpa, description, available_slots, students_per_team, prerequisites, documents, min_year, faculty_id, department } = req.body;
        console.log("-----", req.body);

        // Insert project details and get the new project ID
        const projectInsertQuery = `
            INSERT INTO projects (title, min_cgpa, description, available_slots, students_per_team, faculty_id, min_year)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING project_id;
        `;

        console.log("query", projectInsertQuery);
        const projectResult = await pool.query(projectInsertQuery, [
            title, min_cgpa, description, available_slots, students_per_team, faculty_id, min_year
        ]);
        const project_id = projectResult.rows[0].project_id;

        // Insert prerequisites if available
        if (prerequisites && prerequisites.length > 0) {
            const prereqInsertQueries = prerequisites.map(prereq =>
                pool.query(`INSERT INTO prereq (project_id, course_id) VALUES ($1, $2)`, [project_id, prereq.course_id])
            );
            await Promise.all(prereqInsertQueries);
        }

        // Insert departments if available (Fixed issue here)
        if (department && department.length > 0) {
            const deptInsertQueries = department.map(dept =>
                pool.query(`INSERT INTO project_dept (project_id, dept_id) VALUES ($1, $2)`, [project_id, dept.dept_id])
            );
            await Promise.all(deptInsertQueries); 
        }

        // Insert documents if available
        if (documents && documents.length > 0) {
            const docInsertQueries = documents.map(doc =>
                pool.query(`INSERT INTO project_documents (project_id, Document_name, Document_path) VALUES ($1, $2, $3)`, [project_id, doc.doc_name, doc.doc_url])
            );
            await Promise.all(docInsertQueries);
        }

        res.status(201).json({ message: "Project added successfully", project_id });

    } catch (err) {
        console.error("Error adding project:", err.message);
        res.status(500).send("Server Error");
    }
});

app.get("/projects", async (req, res) => {
    try {
        
        // Fetch project details
        const projectResult = await pool.query(
            `SELECT * FROM project_details`, 
        );
        
        const projects = projectResult.rows;


        // Fetch prerequisites and documents for each project
        for (let project of projects) {
            // 🔹 Fetch prerequisites (courses)
            const faculty = await pool.query(`select f.firstName || ' ' || f.lastName  as faculty_name from faculty f where f.faculty_id = $1`, [project.faculty_id]);
            project.faculty = faculty.rows[0].faculty_name;
            const prereqResult = await pool.query(
                `SELECT c.course_id, c.course_name, c.credits 
                 FROM prereq pp 
                 JOIN courses c ON pp.course_id = c.course_id
                 WHERE pp.project_id = $1`, 
                [project.project_id]
            );
            project.prerequisites = prereqResult.rows; // Attach prerequisites

            // 🔹 Fetch documents (Fixed: Now inside the loop)
            const docResult = await pool.query(
                `SELECT document_name as doc_name, document_path as doc_url
                 FROM project_documents 
                 WHERE project_id = $1`, 
                [project.project_id]
            );
            project.documents = docResult.rows; // Attach documents


            const deptResult = await pool.query(
                `SELECT pd.dept_id, d.dept_name  -- ✅ Use "pd.dept_id" to avoid ambiguity
                    FROM project_dept pd
                    JOIN Department d ON pd.dept_id = d.dept_id
                    WHERE pd.project_id = $1
                `, 
                [project.project_id]
            );
            // console.log()
            project.department = deptResult.rows || []; // Attach documents
        }

        res.json(projects);
    } catch (err) {
        console.error(`Error fetching projects for faculty ${req.params.id}:`, err.message);
        res.status(500).send("Server Error");
    }
});


// Get all courses
app.get("/courses", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT c.course_id ,
                   c.course_name ,
                   c.Course_code,
                   c.Credits AS "credits"
            FROM courses c
        `);

        res.json(result.rows);
    } catch (err) {
        console.error("Error fetching courses:", err.message);
        res.status(500).send("Server Error");
    }
});


app.get("/department", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT d.dept_id ,
                   d.dept_name 
            FROM Department d
        `);

        res.json(result.rows);
    } catch (err) {
        console.error("Error fetching courses:", err.message);
        res.status(500).send("Server Error");
    }
});







app.post("/add_application", async (req, res) => {
    try {
        const { student_id, project_id, bio, docs } = req.body;
        
        console.log("Received application data:", req.body);
        // console.log("Received application data: --- project",projapp);

        // Insert application and get the new application ID
        const appInsertQuery = `
            INSERT INTO project_applications (Student_id, Project_id, bio)
            VALUES ($1, $2, $3)
            RETURNING Application_id;
        `;

        const appResult = await pool.query(appInsertQuery, [student_id, project_id, bio]);
        const application_id = appResult.rows[0].application_id;

        // Insert documents if available
        if (docs && docs.length > 0) {
            const docInsertQueries = docs.map(doc =>
                pool.query(
                    `INSERT INTO documents_applications (Individual_Application_id, Document_name, Document_url) 
                     VALUES ($1, $2, $3)`, 
                    [application_id, doc.name, doc.url]
                )
            );
            await Promise.all(docInsertQueries); 
        }

        res.status(201).json({ message: "Application added successfully", application_id });

    } catch (err) {
        console.error("Error adding application:", err.message);
        res.status(500).send("Server Error");
    }
});


app.delete("/delete_application", async (req, res) => {
    try {
        const { student_id, project_id } = req.body;

        // First, delete related documents if any
        // await pool.query("DELETE FROM documents_applications WHERE Individual_Application_id = $1", [id]);

        // Then delete the application
        const result = await pool.query("DELETE FROM project_applications WHERE student_id = $1 and project_id = $2 RETURNING *", [student_id, project_id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Application not found" });
        }

        res.json({ message: "Application deleted successfully" });
    } catch (err) {
        console.error("Error deleting application:", err.message);
        res.status(500).send("Server Error");
    }
});

app.get('/get_applications/:projectId', async (req, res) => {
    try {
        const projectId = req.params.projectId;

        // Fetch applications
        const result = await pool.query(
            `SELECT a.Application_id, s.firstName || ' ' || s.lastName AS name, s.cgpa, s.Roll_no, 
                    s.year, a.Status, a.bio, d.dept_name, a.Application_date
             FROM project_applications a
             JOIN students s ON a.student_id = s.Roll_no
             JOIN Department d ON s.Department_id = d.dept_id
             WHERE a.Project_id = $1
             ORDER BY a.Application_date DESC;`,
            [projectId]
        );

        let applications = result.rows;
        console.log("Applications for project", projectId, applications);

        // Fetch all document data in parallel
        const docPromises = applications.map(async (app) => {
            const docResult = await pool.query(
                `SELECT document_name AS doc_name, document_url AS doc_url 
                 FROM documents_applications 
                 WHERE individual_application_id = $1`,
                [app.application_id]
            );
            app.documents = docResult.rows; // Attach documents to each application
        });

        await Promise.all(docPromises); // Wait for all document queries to finish

        console.log('Database Response:', applications);
        res.json(applications); // Send final response
    } catch (err) {
        console.error('Error fetching applications:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


app.patch('/applications/:id', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    console.log("Updating status:", status, "for application:", id);
    
    try {
        // Fetch project_id for the given application_id
        const projQuery = await pool.query('SELECT project_id FROM project_applications WHERE application_id = $1', [id]);

        if (projQuery.rows.length === 0) {
            return res.status(404).json({ error: 'Application not found' });
        }

        const proj_id = projQuery.rows[0].project_id;

        // Update application status
        await pool.query('UPDATE project_applications SET status = $1 WHERE application_id = $2', [status, id]);

        // Decrement available slots in the associated project (only if status update is successful)
        await pool.query('UPDATE projects SET available_slots = available_slots - 1 WHERE project_id = $1', [proj_id]);

        res.json({ success: true, message: 'Application status updated successfully' });
    } catch (error) {
        console.error('Error updating application status:', error);
        res.status(500).json({ error: 'Failed to update application status' });
    }
});



app.post('/savepref', async (req, res) => {
    const { preferences } = req.body;

    if (!preferences || !Array.isArray(preferences)) {
        return res.status(400).json({ error: "Invalid data format" });
    }

    try {
        const values = preferences.map(pref => `(${pref.faculty_id}, ${pref.student_id}, ${pref.project_id}, ${pref.preference_rank})`).join(',');

        const query = `
            INSERT INTO faculty_preferences (faculty_id, student_id, project_id, rank) 
            VALUES ${values} 
            ON CONFLICT (faculty_id, student_id, project_id) 
            DO UPDATE SET rank = EXCLUDED.rank;
        `;

        await pool.query(query);
        res.status(200).json({ message: "Preferences saved successfully!" });
    } catch (error) {
        console.error("Error saving preferences:", error);
        res.status(500).json({ error: "Failed to save preferences" });
    }
});

app.post('/savestudentpref', async (req, res) => {
    const { user_id, preferences } = req.body;
    console.log(req.body);
    // if (!user_id || !Array.isArray(preferences)) {
    //     return res.status(400).json({ error: "Invalid data format" });
    // }
console.log("Received request to save preferences:", req.body);
console.log("User ID:", user_id);
        console.log("Preferences:", preferences);
    try {
        

        const values = preferences.map(pref => `( ${pref.student_id}, ${pref.project_id}, ${pref.preference_rank})`).join(',');

        const query = `
            INSERT INTO student_preferences (student_id, project_id, rank) 
            VALUES ${values} 
            ON CONFLICT (student_id, project_id) 
            DO UPDATE SET rank = EXCLUDED.rank;
        `;

        await pool.query(query);
        res.status(200).json({ message: "Student Preferences saved successfully!" });
    } catch (error) {
        console.error("Error saving Student preferences:", error);
        res.status(500).json({ error: "Failed to save Student preferences" });
    }
});

app.get('/Allocations/:id', async (req,res) => {
    try {
        await saveAllocations();
        const id = req.params.id;
            const studResult = await pool.query(
                `SELECT a.Application_id, s.firstName || ' ' || s.lastName as name , s.cgpa, s.Roll_no, s.year, a.Status, 
                a.bio, d.dept_name, a.Application_date
                 FROM project_applications a
                 JOIN project_allocations p ON p.student_id = a.student_id and p.project_id = a.Project_id
                 JOIN students s ON a.student_id = s.Roll_no
                 JOIN Department d ON s.Department_id = d.dept_id
                 WHERE a.Project_id = $1
                 ORDER BY a.Application_date DESC; `,[id]
            );
            applications = studResult.rows;
            res.json(applications);
            
        }
       
        
     catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }


});

app.get('/Allocations_facpropose/:id', async (req,res) => {
    try {
        await saveAllocations_facpropose();
        const id = req.params.id;
            const studResult = await pool.query(
                `SELECT a.Application_id, s.firstName || ' ' || s.lastName as name , s.cgpa, s.Roll_no, s.year, a.Status, 
                a.bio, d.dept_name, a.Application_date
                 FROM project_applications a
                 JOIN project_allocations p ON p.student_id = a.student_id and p.project_id = a.Project_id
                 JOIN students s ON a.student_id = s.Roll_no
                 JOIN Department d ON s.Department_id = d.dept_id
                 WHERE a.Project_id = $1
                 ORDER BY a.Application_date DESC; `,[id]
            );
            applications = studResult.rows;
            res.json(applications);
            
        }
       
        
     catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }


});

app.get('/Allocations_SPAlecturer/:id', async (req,res) => {
    try {
        await saveAllocations_SPAlecture();
        const id = req.params.id;
            const studResult = await pool.query(
                `SELECT a.Application_id, s.firstName || ' ' || s.lastName as name , s.cgpa, s.Roll_no, s.year, a.Status, 
                a.bio, d.dept_name, a.Application_date
                 FROM project_applications a
                 JOIN project_allocations p ON p.student_id = a.student_id and p.project_id = a.Project_id
                 JOIN students s ON a.student_id = s.Roll_no
                 JOIN Department d ON s.Department_id = d.dept_id
                 WHERE a.Project_id = $1
                 ORDER BY a.Application_date DESC; `,[id]
            );
            applications = studResult.rows;
            res.json(applications);
            
        }
       
        
     catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }


});

app.get('/Allocations_SPAstudent/:id', async (req,res) => {
    try {
        await saveAllocations_SPAstudent();
        const id = req.params.id;
            const studResult = await pool.query(
                `SELECT a.Application_id, s.firstName || ' ' || s.lastName as name , s.cgpa, s.Roll_no, s.year, a.Status, 
                a.bio, d.dept_name, a.Application_date
                 FROM project_applications a
                 JOIN project_allocations p ON p.student_id = a.student_id and p.project_id = a.Project_id
                 JOIN students s ON a.student_id = s.Roll_no
                 JOIN Department d ON s.Department_id = d.dept_id
                 WHERE a.Project_id = $1
                 ORDER BY a.Application_date DESC; `,[id]
            );
            applications = studResult.rows;
            res.json(applications);
            
        }
       
        
     catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }


});

app.get('/Allocations_boston', async (req, res) => {
    try {
      const allocations = await saveAllocations_boston();
      await saveAllocations(allocations);
      res.status(200).json({ message: 'Boston mechanism allocations saved.', allocations });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  app.get('/Allocations_boston/:id', async (req,res) => {
    try {
        await saveAllocations_boston();
        console.log("boston req",req.params)
        const id = req.params.id;
            const studResult = await pool.query(
                `SELECT a.Application_id, s.firstName || ' ' || s.lastName as name , s.cgpa, s.Roll_no, s.year, a.Status, 
                a.bio, d.dept_name, a.Application_date, ba.score AS match_score, br.rank AS rank
                 FROM project_applications a
                 JOIN students s ON a.student_id = s.Roll_no
                 JOIN Department d ON s.Department_id = d.dept_id
                 LEFT JOIN boston_allocations ba ON a.student_id = ba.student_id AND a.project_id = ba.Project_id
                 LEFT JOIN boston_ranks br ON a.student_id = br.student_id AND a.project_id = br.project_id

                 WHERE a.Project_id = $1
                 ORDER BY br.rank ASC NULLS LAST, a.Application_date DESC;`,[id]
            );
            applications = studResult.rows;
            res.json(applications);
            console.log(applications)
        }
       
        
     catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }


});

// Route to trigger and return Boston mechanism allocations
// app.get('/Allocations_boston', async (req, res) => {
//     try {
//       await saveAllocations_boston(); // Triggers Boston mechanism and stores results
//       res.status(200).json({ message: 'Boston mechanism allocations saved.' });
//     } catch (err) {
//       console.error(err);
//       res.status(500).json({ error: 'Internal Server Error' });
//     }
//   });
  
//   // Route to fetch allocations for a specific project
//   app.get('/Allocations_boston/:id', async (req, res) => {
//     try {
//       const id = req.params.id;
  
//       const studResult = await pool.query(
//         `SELECT 
//             a.Application_id, 
//             s.firstName || ' ' || s.lastName AS name,
//             s.cgpa, 
//             s.Roll_no, 
//             s.year, 
//             a.Status, 
//             a.bio, 
//             d.dept_name, 
//             a.Application_date,
//             b.score
//           FROM project_applications a
//           JOIN boston_allocations b ON b.student_id = a.student_id AND b.project_id = a.Project_id
//           JOIN students s ON a.student_id = s.Roll_no
//           JOIN Department d ON s.Department_id = d.dept_id
//           WHERE a.Project_id = $1
//           ORDER BY b.score DESC;`, // sort by score if needed
//         [id]
//       );
  
//       res.json(studResult.rows);
//     } catch (err) {
//       console.error(err);
//       res.status(500).json({ error: 'Internal Server Error' });
//     }
//   });
  
  


app.get('/preferences/:id', async(req,res) => {
    try{
        const id = req.params.id;
            const studResult = await pool.query(
                `SELECT CONCAT(s.FirstName, ' ', s.LastName) AS name, f.rank from faculty_preferences f, students s 
                where f.project_id = $1 and s.Roll_no = f.student_id`,[id]
            );
            pref = studResult.rows;
            console.log(pref);
            res.json(pref);
    }
    catch(err){
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/getstudentranks/:studentId/:projectId', async (req, res) => {
    const {studentId, projectId} = req.params;
    console.log("request params are",req.params)
    try {
        const query = `
            SELECT rank 
            FROM faculty_preferences 
            WHERE student_id = $1 AND project_id = $2;
        `;
        const result = await pool.query(query, [studentId, projectId]);

        // if (result.rows.length > 0) {
        //     res.status(200).json({ rank: result.rows[0].rank });
        // } else {
        //     res.status(200).json({ rank: "Not Ranked" });
        // }
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "No rank found for this project" });
        }

        res.json(result.rows[0]); // Send the rank as response
    } catch (error) {
        console.error("Error fetching student rank:", error);
        res.status(500).json({ error: "Failed to fetch rank" });
    }
});


app.get('/getstudentpref/:id', async (req, res) => {
    try {
        console.log(req.params.id);
        const studentId = req.params.id;
        const result = await pool.query(
            `SELECT project_id, rank FROM student_preferences WHERE student_id = $1 ORDER BY rank asc`,
            [studentId]
        );

        res.json(result.rows);
    } catch (err) {
        console.error("Error fetching student preferences:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.get('/getStudentpreferences_Visualiser', async (req, res) => {
    try {
        // console.log(req.params.id);
        // const studentId = req.params.id;
        const result = await pool.query(
            `select * from student_project_preferences`
        );  
        res.json(result.rows);
    } catch (err){
        console.error("Error fetching student preferences:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
} );

app.get('/getProjectpreferences_Visualiser', async (req, res) => {
    try {
        // console.log(req.params.id);
        // const studentId = req.params.id;
        const result = await pool.query(
            `select * from project_student_preferences`
        );  
        res.json(result.rows);
    } catch (err){
        console.error("Error fetching project preferences:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
} );

app.get('/getAvailableSlots/:title', async (req, res) => {
    try {
      const title = req.params.title; // ✅ Use params since it's in the URL path
  
      const result = await pool.query(
        `SELECT get_available_slots($1) as available_slots`, // ✅ function should accept title
        [title] // ✅ pass parameter correctly
      );
  
      const availableSlots = result.rows[0]?.available_slots;
  
      if (availableSlots === null) {
        return res.status(404).json({ error: 'Project not found' });
      }
  
      res.json(availableSlots );
  
    } catch (err) {
      console.error("Error fetching available slots:", err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
  


const server = http.createServer(app);

// Start server
// app.listen(5001, () => console.log("Server running on port 5001"));
server.listen(5001, () => {
    console.log(`Server running on port 5001`);
});


