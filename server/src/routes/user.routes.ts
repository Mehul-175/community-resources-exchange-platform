import express from 'express'
import { getMyProfile, getUserById, deleteProfile, updateProfile } from '../controllers/user.controllers';

const router = express.Router();

router.get("/me", getMyProfile);
router.get("/:id", getUserById);
router.patch("/me", updateProfile);
router.delete("/me", deleteProfile);

export default router;