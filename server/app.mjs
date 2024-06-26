import express from "express";
import connectionPool from "./utils/db.mjs";

const app = express();
const port = 4001;

app.use(express.json());

app.get("/test", (req, res) => {
  return res.json("Server API is working 🚀");
});

app.get("/assignments", async (req, res) => {
  let result;

  try {
    result = await connectionPool.query(`SELECT * FROM assignments`);

    if (!result.rows[0]) {
      return res.status(404).json({
        message: `Server could not find a requested assignment because it may not yet have data in the assignment table.`,
      });
    }
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
  const assignmentIdFromClient = req.params.assignmentId;
  let result;

  try {
    result = await connectionPool.query(
      `SELECT * FROM assignments WHERE assignment_id = $1`,
      [assignmentIdFromClient]
    );

    if (!result.rows[0]) {
      return res.status(404).json({
        message: `Server could not find a requested assignment (assignment_id: ${assignmentIdFromClient})`,
      });
    }
  } catch {
    return res.status(500).json({
      message: "Server could not read assignment because database connection",
    });
  }

  return res.status(200).json({
    data: result.rows[0],
  });
});

app.put("/assignments/:assignmentId", async (req, res) => {
  const assignmentIdFromClient = req.params.assignmentId;
  const updateAssignment = { ...req.body, updated_at: new Date() };

  try {
    const updateResult = await connectionPool.query(
      ` UPDATE assignments
        SET title = $1,
            content = $2,
            category = $3,
            updated_at = $4
        WHERE assignment_id = $5
        RETURNING *`,
      [
        updateAssignment.title,
        updateAssignment.content,
        updateAssignment.category,
        updateAssignment.updated_at,
        assignmentIdFromClient,
      ]
    );

    if (!updateResult.rows[0]) {
      return res.status(404).json({
        message: `Server could not find a requested assignment to update (assignment_id: ${assignmentIdFromClient})`,
      });
    }
  } catch {
    return res.status(500).json({
      message: "Server could not update assignment because database connection",
    });
  }

  return res.status(200).json({ message: "Updated assignment sucessfully" });
});

app.delete("/assignments/:assignmentId", async (req, res) => {
  const assignmentIdFromClient = req.params.assignmentId;

  try {
    const result = await connectionPool.query(
      `DELETE FROM assignments WHERE assignment_id = $1`,
      [assignmentIdFromClient]
    );

    if (!result.rows[0]) {
      return res.status(404).json({
        message: `Server could not find a requested assignment to delete (assignment_id: ${assignmentIdFromClient}`,
      });
    }
  } catch {
    return res.status(500).json({
      message: "Server could not delete assignment because database connection",
    });
  }
});

app.listen(port, () => {
  console.log(`Server is running on localhost:${port}`);
});
