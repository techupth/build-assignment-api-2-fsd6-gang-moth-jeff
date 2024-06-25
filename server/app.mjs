import express from "express";
import connectionPool from "./utils/db.mjs";

const app = express();
const port = 4001;

app.use(express.json());

app.post("/assignments", async (req, res) => {
  const newAssignment = {
    ...req.body,
    created_at: new Date(),
    updated_at: new Date(),
    published_at: new Date(),
  };


  try {
    await connectionPool.query(
      `insert into assignments (title,content,category) 
    values ($1,$2,$3)`,
      [newAssignment.title, newAssignment.content, newAssignment.category]
    );
  } catch {
    return res.status(500).json({
      message: "Server could not create assignment because database connection",
    });
  }

  if (!newAssignment.title) {
    return res.status(400).json({
      message:
        "Server could not create assignment because there are missing data from client",
    });
  }

  return res.status(201).json({
    message: "Created assignment successfully.",
  });
});


app.get("/assignments", async (req, res) => {
  let result;

  try {
    result = await connectionPool.query(`select * from assignments`);
  } catch {
    return res.status(500).json({
      message: "Server could not read assignment because database connection",
    });
  }
  return res.status(200).json({
    data: result.rows,
  });
});

app.get("/assignments/:assignmentId", async (req, res) => {
  let assignmentIdFromClient = req.params.assignmentId;
  let result;

  try {
    result = await connectionPool.query(
      `select * from assignments where assignment_id = $1`,
      [assignmentIdFromClient]
    );
  } catch {
    return res.status(500).json({
      message: "server could not read assignment because database connection",
    });
  }

  if (result.rows.length === 0) {
    return res.status(404).json({
      message: "Server could not find a requested assignment",
    });
  } else {
    return res.status(200).json({
      data: result.rows[0],
    });
  }
});

app.put("/assignments/:assignmentId",async (req, res) => {
  const putIdFromClient = req.params.assignmentId;
  let updatedAssignment = { ...req.body };

  if (
    !updatedAssignment.title ||
    !updatedAssignment.content ||
    !updatedAssignment.category
  ) {
    return res.status(404).json({
      message: "Server could not find a requested assignment to update",
    });
  }

  try {
    await connectionPool.query(
      `update assignments 
        set title=$2, 
            content = $3, 
            category = $4 
        where assignment_id = $1`,
      [
        putIdFromClient,
        updatedAssignment.title,
        updatedAssignment.content,
        updatedAssignment.category,
      ]
    );
  } catch {
    return res.status(500).json({
      message: "Server could not update assignment because database connection",
    });
  }

  return res.status(200).json({
    message: "Updated assignment sucessfully",
  });
});

app.delete("/assignments/:assignmentId",async (req,res)=>{
  const assignmentIdFromClient = req.params.assignmentId;
  let result;
  try {
    await connectionPool.query(
      `delete from assignments where assignment_id = $1`,
      [assignmentIdFromClient]
    );

    result = await connectionPool.query(`select * from assignments where assignment_id = $1`,
      [assignmentIdFromClient]
    )

    if(result.rows.length === 0){
      return res.status(400).json({
        message: "Server could not find a requested assignment to delete"
      })
    }

  } catch {
    return res.status(500).json({
      message: "Server could not delete assignment because database connection",
    })
  }
  
  return res.status(200).json({
    message: "Deleted assignment sucessfully"
  })
})

app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});
