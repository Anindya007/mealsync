const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
// Import and use the solver
const solver = require('./solver.cjs');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mealplanner', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.log('MongoDB connection error:', err));

// Define Schemas
const userSchema = new mongoose.Schema({
    email: { type: String, required: false },
    password: { type: String, required: false },
    dietPreferences: String,
    dietType: String,
    goals: {
        weightManagement: String,
        speed: String
    },
    mealsPerDay: [String],
    mealPreferences: [String],
    personalDetails: {
        age: Number,
        gender: String,
        weight: Number,
        height: Number,
        heightFeet:Number,
        heightInches:Number,
    },
    mealChoice: String,
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Routes
app.post('/api/register', async (req, res) => {
    try {
        let { email, password } = req.body;
        if (!email) email = 'dummy@example.com';
        if (!password) password = 'dummypassword123';

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            // Compare passwords and start sign in flow
            if (existingUser.password === password) {
                // Update existing user record with any new data from request
                const updatedUser = await User.findByIdAndUpdate(
                    existingUser._id,
                    { ...req.body, email, password }, // Preserve email and password
                    { new: true }
                );

                return res.status(200).json({
                    message: 'Sign in successful',
                    userId: updatedUser._id
                });
            } else {
                return res.status(401).json({ message: 'Invalid password' });
            }
        }

        // Create new user
        const user = new User({
            ...req.body,
            email: email,
            password: password
        });

        await user.save();
        res.status(201).json({ message: 'User registered successfully', userId: user._id });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});


app.get('/api/users/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Route to generate meal plan using solver.cjs
app.post('/api/generate-meal-plan', async (req, res) => {
    try {

        // Prepare input for solver
        const userInput = {
            weightLossPerWeekKg: req.goals?.weightManagement ? parseFloat(req.goals.weightManagement) || 0.5 : 0.5,
            dietType: req.dietType || 'low-carb',
            restrictions: Array.isArray(req.mealPreferences) ? req.mealPreferences : [],
            mealsPerDay: req.mealsPerDay && Array.isArray(req.mealsPerDay) ? req.mealsPerDay.length : 3
        };



        // Generate meal plan
        const mealPlan = await solver.generateMealPlan(userInput);

        res.json({ mealPlan });
    } catch (error) {
        console.error('Error generating meal plan:', error);
        res.status(500).json({ message: 'Failed to generate meal plan' });
    }
});

// Route to generate meal plan using solver.cjs
app.post('/api/check-in', async (req, res) => {
    try {
        const { userId, goalWeight, currentWeight } = req.body;

        // Find and update the user
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                $set: {
                    'personalDetails.weight': currentWeight,
                    'goals.weightManagement': goalWeight
                }
            },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            message: 'Check-in successful',
            user: updatedUser
        });
    } catch (error) {
        console.error('Error during check-in:', error);
        res.status(500).json({ message: 'Failed to update user data' });
    }
})

app.get('/api/meals', async (req, res) => {
    try {
        const meals = await solver.getMealsFromDB();
        res.json({ meals });
    }
    catch (error) {
        console.error('Error fetching meals:', error);
        res.status(500).json({ message: 'Failed to fetch meals from database' });
    }

});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, "localhost" , () => {
    console.log(`Server is running on port ${PORT}`);
});