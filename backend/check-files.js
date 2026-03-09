require('dotenv').config();
const mongoose = require('mongoose');
const Assignment = require('./models/Assignment');
const Student = require('./models/Student');

mongoose.connect(process.env.MONGODB_URI).then(() => {
  Assignment.find({submittedFile: {$exists: true, $ne: null}})
    .populate('allocatedTo')
    .then(a => {
      console.log('Assignments with files:');
      a.forEach(x => {
        console.log('---');
        console.log('Title:', x.title);
        console.log('File:', x.submittedFile);
        console.log('Status:', x.status);
        console.log('Frontend URL:', `/uploads/${x.submittedFile}`);
      });
      process.exit(0);
    });
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
