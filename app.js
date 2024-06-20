const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const userRoutes = require('./routes/users');
const discussionRoutes = require('./routes/discussions');

const app = express();

try{mongoose.connect('mongodb://localhost:27017/discussion-app', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
//   useCreateIndex: true
});}catch(e){
    console.log({e})
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/uploads', express.static('uploads'));

app.use('/users', userRoutes);
app.use('/discussions', discussionRoutes);


// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
