const express = require("express");
const router = express.Router();
const Note = require("../models/Note");
const fetchuser = require("../middleware/fetchuser");
const { body, validationResult } = require("express-validator");
const { findByIdAndUpdate } = require("../models/Note");

// ROUTE 1: Get all notes of a user using GET /api/notes/fetchallnotes. Login required

router.get("/fetchallnotes", fetchuser, async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user.id });
    res.json(notes);
  } catch (error) {
    res.status(500).send("Oops! Something went wrong");
  }
});

// ROUTE 2: Add a new note using POST /api/notes/addnote. Login required

router.post(
  "/addnote",
  fetchuser,
  [
    body("title", "Title should be atleast 2 characters").isLength({ min: 2 }),
    body("description", "Description should be atleast 5 characters").isLength({
      min: 5,
    }),
  ],
  async (req, res) => {
    try {
      const { title, description, tag } = req.body;
      // If there are errors, return bad request and show the errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      // Creating a new note
      const note = new Note({
        title,
        description,
        tag,
        user: req.user.id,
      });
      const savedNote = await note.save();
      res.json(savedNote);
    } catch (error) {
      res.status(500).send("Oops! Something went wrong");
    }
  }
);

// ROUTE 3: Update a note using PUT /api/notes/updatenote/:id. Login required

router.put("/updatenote/:id", fetchuser, async (req, res) => {
  const { title, description, tag } = req.body;
  try {
    // Create a newNote object
    const newNote = {};
    if (title) {
      newNote.title = title;
    }
    if (description) {
      newNote.description = description;
    }
    if (tag) {
      newNote.tag = tag;
    }

    // Find the note to be updated and update it
    let note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).send("Not found");
    }
    // Allow updation only if the user owns this
    if (req.user.id !== note.user.toString()) {
      return res.status(401).send("Not authorised");
    }

    note = await Note.findByIdAndUpdate(
      req.params.id,
      { $set: newNote },
      { new: true }
    );
    res.send(note);
  } catch (error) {
    res.status(500).send("Internal server error");
  }
});

// ROUTE 4: Delete a new note using DELETE /api/notes/deletenote/:id. Login required

router.delete("/deletenote/:id", fetchuser, async (req, res) => {
  try {
    // Find the note to be deleted and delete it
    let note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).send("Not found");
    }

    // Allow deletion only if user owns this note
    if (req.user.id !== note.user.toString()) {
      return res.status(401).send("Not authorised");
    }

    note = await Note.findByIdAndDelete(req.params.id);
    res.send("Note deleted");
  } catch (error) {
    res.status(500).send("Internal Server error");
  }
});

module.exports = router;
