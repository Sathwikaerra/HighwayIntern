import express from "express";
import {
  signup,
  verifySignup,
  login,
  verifyLogin,
  addNote,
  getNotes,
  deleteNote
} from "../controllers/authController.js";
import {authenticate} from  "../middleware/Authenticate.js"

const router = express.Router();

router.post("/signup", signup);
router.post("/verify-signup", verifySignup);
router.post("/login", login);
router.post("/verify-login", verifyLogin); 



router.post("/add-note", addNote);
router.delete("/delete-note/:userId/:noteId", deleteNote);


router.get("/getnotes", authenticate, getNotes);
router.post("/add", authenticate, addNote);
router.delete("/delete/:id", authenticate, deleteNote);


export default router;
