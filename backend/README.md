# MealSync Backend

This is the backend service for the MealSync meal planning application. It provides APIs for meal planning, user management, and nutritional data.

## Features

- Meal database with nutritional information
- Intelligent meal planning algorithm using linear programming
- User preference and dietary restriction handling
- Progress tracking for weight management

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)

### Installation

1. Install dependencies:

```bash
npm install
```

Import the sample meal data into MongoDB:

```bash

    node importMeals.cjs
```

Start the server with:

```bash
node server.cjs
```

## API Endpoints
### Meals
- GET /api/meals - Get all meals
- POST /api/meals/:id/favorite - Toggle favorite status for a meal
### Meal Planning
- POST /api/generate-meal-plan - Generate a personalized meal plan based on user preferences
### User Data
- POST /api/check-in - Record user weight check-in data

## Architecture
The backend uses:

- Express.js for the API server
- MongoDB for data storage
- javascript-lp-solver for meal plan optimization
## Meal Planning Algorithm
The meal planning algorithm uses linear programming to optimize meal selection based on:

- Caloric requirements (based on weight management goals)
- Macronutrient distribution (protein, carbs, fat)
- Dietary preferences (vegan, vegetarian, etc.)
- Diet types (keto, low-carb, low-fat)
The solver maximizes calories within constraints to provide satisfying meals while meeting nutritional goals.


## Data Model
### Meals
Each meal contains:

- Name
- Cuisine type
- Nutritional information (calories, protein, carbs, fat)
- Diet type (keto, low-carb, low-fat)
- Dietary flags (isVegan, isVegetarian)
### Users
User data includes:

- Authentication information
- Diet preferences
- Weight management goals
- Personal details for calorie calculations