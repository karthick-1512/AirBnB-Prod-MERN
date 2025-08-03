const express = require('express');
const cors = require('cors');
const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User.js');
const Place = require('./models/Place.js');
const Booking = require('./models/Booking.js');
const cookieParser = require('cookie-parser');
const imageDownloader = require('image-downloader');
const multer = require('multer');
const fs = require('fs');
const mime = require('mime-types');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();

const bcryptSalt = bcrypt.genSaltSync(10);
const jwtSecret = 'fasefraw4r5r3wq45wdfgw34twdfg';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const bucket = process.env.SUPABASE_BUCKET;
const supabase = createClient(supabaseUrl, supabaseKey);

app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(__dirname + '/uploads'));
app.use(cors({
  credentials: true,
  origin: 'http://127.0.0.1:5173',
}));

function asyncHandler(fn) {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

async function uploadToSupabase(path, originalFilename, mimetype) {
  const parts = originalFilename.split('.');
  const ext = parts[parts.length - 1];
  const newFilename = `${Date.now()}.${ext}`;
  const fileBuffer = fs.readFileSync(path);

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(newFilename, fileBuffer, {
      contentType: mimetype,
      upsert: true,
    });

  if (error) {
    console.log(`Upload failed: ${error.message}`);
    return "";
  }

  const publicURL = `https://elkfwxkqexeoubswbfns.supabase.co/storage/v1/object/public/airbnb-images//${newFilename}`;
  return publicURL;
}

function getUserDataFromReq(req) {
  return new Promise((resolve, reject) => {
    jwt.verify(req.cookies.token, jwtSecret, {}, async (err, userData) => {
      if (err) throw err;
      resolve(userData);
    });
  });
}

app.get('/api/test', (req, res) => {
  mongoose.connect(process.env.MONGO_URL);
  res.json('test ok');
});

app.post('/api/register', asyncHandler(async (req, res) => {
  mongoose.connect(process.env.MONGO_URL);
  const { name, email, password } = req.body;
  const userDoc = await User.create({
    name,
    email,
    password: bcrypt.hashSync(password, bcryptSalt),
  });
  res.json(userDoc);
}));

app.post('/api/login', asyncHandler(async (req, res) => {
  mongoose.connect(process.env.MONGO_URL);
  const { email, password } = req.body;
  const userDoc = await User.findOne({ email });
  if (userDoc) {
    const passOk = bcrypt.compareSync(password, userDoc.password);
    if (passOk) {
      jwt.sign({
        email: userDoc.email,
        id: userDoc._id
      }, jwtSecret, {}, (err, token) => {
        if (err) throw err;
        res.cookie('token', token).json(userDoc);
      });
    } else {
      res.status(422).json('pass not ok');
    }
  } else {
    res.json('not found');
  }
}));

app.get('/api/profile', asyncHandler(async (req, res) => {
  mongoose.connect(process.env.MONGO_URL);
  const { token } = req.cookies;
  if (token) {
    jwt.verify(token, jwtSecret, {}, async (err, userData) => {
      if (err) throw err;
      const { name, email, _id } = await User.findById(userData.id);
      res.json({ name, email, _id });
    });
  } else {
    res.json(null);
  }
}));

app.post('/api/logout', (req, res) => {
  res.cookie('token', '').json(true);
});

app.post('/api/upload-by-link', asyncHandler(async (req, res) => {
  mongoose.connect(process.env.MONGO_URL);
  const { link } = req.body;

  try {
    new URL(link);
  } catch (err) {
    return res.status(400).json({ error: "Invalid URL format" });
  }

  const newName = 'photo' + Date.now() + '.jpg';

  await imageDownloader.image({
    url: link,
    dest: '/tmp/' + newName,
  });

  const mimeType = mime.lookup('/tmp/' + newName);
  const url = await uploadToSupabase('/tmp/' + newName, newName, mimeType);

  if (!url) {
    return res.status(500).json({ error: 'Upload failed' });
  }

  res.json(url);
}));

app.delete('/api/places/:id', asyncHandler(async (req, res) => {
  mongoose.connect(process.env.MONGO_URL);
  const { id } = req.params;
  await Place.findByIdAndDelete(id);
  res.json({ success: true });
}));

app.post('/api/delete-photo', asyncHandler(async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: 'No URL provided' });
  }
  const parts = url.split('/');
  const filename = parts[parts.length - 1];
  const { error } = await supabase.storage.from(bucket).remove([filename]);

  if (error) {
    return res.status(500).json({ error: 'Failed to delete file' });
  }
  res.json({ success: true });
}));

const photosMiddleware = multer({ dest: '/tmp' });
app.post('/api/upload', photosMiddleware.array('photos', 100), asyncHandler(async (req, res) => {
  const uploadedFiles = [];
  for (let i = 0; i < req.files.length; i++) {
    const { path, originalname, mimetype } = req.files[i];
    const url = await uploadToSupabase(path, originalname, mimetype);
    uploadedFiles.push(url);
  }
  res.json(uploadedFiles);
}));

app.get('/api/search', asyncHandler(async (req, res) => {
  mongoose.connect(process.env.MONGO_URL);
  const { query } = req.query;

  if (!query || query.trim() === "") {
    return res.json([]);
  }

  const regex = new RegExp(query, 'i');
  const results = await Place.find({
    $or: [
      { title: { $regex: regex } },
      { address: { $regex: regex } }
    ]
  }).limit(5);

  res.json(results);
}));

app.post('/api/places', asyncHandler(async (req, res) => {
  mongoose.connect(process.env.MONGO_URL);
  const { token } = req.cookies;
  const {
    title, address, addedPhotos, description, price,
    perks, extraInfo, checkIn, checkOut, maxGuests,
  } = req.body;

  jwt.verify(token, jwtSecret, {}, async (err, userData) => {
    if (err) throw err;
    const placeDoc = await Place.create({
      owner: userData.id,
      title, address, photos: addedPhotos, description, price,
      perks, extraInfo, checkIn, checkOut, maxGuests,
    });
    res.json(placeDoc);
  });
}));

app.get('/api/user-places', asyncHandler(async (req, res) => {
  mongoose.connect(process.env.MONGO_URL);
  const { token } = req.cookies;
  jwt.verify(token, jwtSecret, {}, async (err, userData) => {
    const { id } = userData;
    res.json(await Place.find({ owner: id }));
  });
}));

app.get('/api/places/:id', asyncHandler(async (req, res) => {
  mongoose.connect(process.env.MONGO_URL);
  const { id } = req.params;
  res.json(await Place.findById(id));
}));

app.put('/api/places', asyncHandler(async (req, res) => {
  mongoose.connect(process.env.MONGO_URL);
  const { token } = req.cookies;
  const {
    id, title, address, addedPhotos, description,
    perks, extraInfo, checkIn, checkOut, maxGuests, price,
  } = req.body;

  jwt.verify(token, jwtSecret, {}, async (err, userData) => {
    if (err) throw err;
    const placeDoc = await Place.findById(id);
    if (userData.id === placeDoc.owner.toString()) {
      placeDoc.set({
        title, address, photos: addedPhotos, description,
        perks, extraInfo, checkIn, checkOut, maxGuests, price,
      });
      await placeDoc.save();
      res.json('ok');
    }
  });
}));

app.get('/api/places', asyncHandler(async (req, res) => {
  mongoose.connect(process.env.MONGO_URL);
  res.json(await Place.find());
}));

app.post('/api/bookings', asyncHandler(async (req, res) => {
  mongoose.connect(process.env.MONGO_URL);
  const userData = await getUserDataFromReq(req);
  const {
    place, checkIn, checkOut, numberOfGuests, name, phone, price,
  } = req.body;

  const booking = await Booking.create({
    place, checkIn, checkOut, numberOfGuests, name, phone, price,
    user: userData.id,
  });

  res.json(booking);
}));

app.get('/api/bookings', asyncHandler(async (req, res) => {
  mongoose.connect(process.env.MONGO_URL);
  const { placeId } = req.query;

  if (placeId) {
    const bookings = await Booking.find({ place: placeId });
    return res.json(bookings);
  }

  const userData = await getUserDataFromReq(req);
  const bookings = await Booking.find({ user: userData.id }).populate('place');
  res.json(bookings);
}));

app.delete('/api/bookings/:id', asyncHandler(async (req, res) => {
  mongoose.connect(process.env.MONGO_URL);
  const { id } = req.params;
  await Booking.findByIdAndDelete(id);
  res.json({ success: true });
}));

app.listen(4000);

app.use((err, req, res, next) => {
  console.error("❌ Internal Server Error:", err.stack || err);
  res.status(500).json({ error: 'Internal Server Error' });
});
