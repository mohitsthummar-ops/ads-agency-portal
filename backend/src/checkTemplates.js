const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Template = require('./models/Template');

dotenv.config();

const check = async () => {
    await mongoose.connect(process.env.MONGO_URI);
    const templates = await Template.find().limit(5);
    console.log('Sample Templates:', JSON.stringify(templates, null, 2));
    process.exit();
};

check();
