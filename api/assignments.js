const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const Assignment = require('../models/Assignment');
const Teacher = require('../models/Teacher');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'teacher-dashboard-secret-key';

// Middleware to verify JWT token
const verifyToken = async (req, res, next) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const teacher = await Teacher.findById(decoded.teacherId).select('-password');
    
    if (!teacher) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.teacher = teacher;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadsDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /pdf|jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only PDF and image files are allowed'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: fileFilter
});

// Get all assignments for the authenticated teacher
router.get('/', verifyToken, async (req, res) => {
  try {
    const { search, startDate, endDate } = req.query;
    let query = { createdBy: req.teacher._id };

    // Apply filters
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    if (startDate || endDate) {
      query.deadline = {};
      if (startDate) query.deadline.$gte = new Date(startDate);
      if (endDate) query.deadline.$lte = new Date(endDate);
    }

    const assignments = await Assignment.find(query)
      .sort({ createdAt: -1 })
      .populate('createdBy', 'firstName lastName email');

    res.json(assignments);
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching assignments' });
  }
});

// Get single assignment
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const assignment = await Assignment.findOne({
      _id: req.params.id,
      createdBy: req.teacher._id
    }).populate('createdBy', 'firstName lastName email');

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    res.json(assignment);
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching assignment' });
  }
});

// Create new assignment
router.post('/', verifyToken, upload.single('file'), async (req, res) => {
  try {
    const { title, description, deadline } = req.body;

    const assignmentData = {
      title,
      description,
      deadline: new Date(deadline),
      createdBy: req.teacher._id
    };

    if (req.file) {
      assignmentData.fileName = req.file.originalname;
      assignmentData.filePath = req.file.filename;
    }

    const assignment = new Assignment(assignmentData);
    await assignment.save();

    const populatedAssignment = await Assignment.findById(assignment._id)
      .populate('createdBy', 'firstName lastName email');

    res.status(201).json(populatedAssignment);
  } catch (error) {
    res.status(500).json({ error: 'Server error creating assignment' });
  }
});

// Update assignment
router.put('/:id', verifyToken, upload.single('file'), async (req, res) => {
  try {
    const { title, description, deadline } = req.body;
    
    const assignment = await Assignment.findOne({
      _id: req.params.id,
      createdBy: req.teacher._id
    });

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    // Update fields
    assignment.title = title;
    assignment.description = description;
    assignment.deadline = new Date(deadline);
    assignment.updatedAt = new Date();

    // Handle file upload
    if (req.file) {
      // Delete old file if exists
      if (assignment.filePath) {
        const oldFilePath = path.join(__dirname, '../uploads', assignment.filePath);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }
      
      assignment.fileName = req.file.originalname;
      assignment.filePath = req.file.filename;
    }

    await assignment.save();

    const populatedAssignment = await Assignment.findById(assignment._id)
      .populate('createdBy', 'firstName lastName email');

    res.json(populatedAssignment);
  } catch (error) {
    res.status(500).json({ error: 'Server error updating assignment' });
  }
});

// Delete assignment
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const assignment = await Assignment.findOne({
      _id: req.params.id,
      createdBy: req.teacher._id
    });

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    // Delete file if exists
    if (assignment.filePath) {
      const filePath = path.join(__dirname, '../uploads', assignment.filePath);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await Assignment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Assignment deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error deleting assignment' });
  }
});

// Download file
router.get('/download/:filename', verifyToken, async (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '../uploads', filename);

    // Verify the file belongs to an assignment created by this teacher
    const assignment = await Assignment.findOne({
      filePath: filename,
      createdBy: req.teacher._id
    });

    if (!assignment) {
      return res.status(404).json({ error: 'File not found' });
    }

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found on server' });
    }

    res.download(filePath, assignment.fileName);
  } catch (error) {
    res.status(500).json({ error: 'Server error downloading file' });
  }
});

module.exports = router;