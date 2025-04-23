const { MongoClient } = require('mongodb');
const solver = require('javascript-lp-solver');

const MONGO_URI = 'mongodb://localhost:27017';
const DB_NAME = 'mealplanner';
const COLLECTION_NAME = 'meals';



const client = new MongoClient(MONGO_URI);


async function getMealsFromDB() {
    await client.connect();
    return await client.db(DB_NAME).collection(COLLECTION_NAME).find({}).toArray();
}

async function generateMealPlan(userInput) {
    const client = new MongoClient(MONGO_URI);
    try {
        await client.connect();
        const meals = await getMealsFromDB(client);

        // Estimate daily calorie deficit (7700 kcal = 1 kg fat)
        const dailyDeficit = (userInput.weightLossPerWeekKg * 7700) / 7;
        // Assume 2200 kcal is maintenance
        const dailyTargetCalories = 2200 - dailyDeficit;

        // Filter meals by user preference
        const filteredMeals = meals.filter(meal => {
            if (userInput.dietType && meal.type !== userInput.dietType) return false;
            if (userInput.restrictions.includes('vegetarian') && !meal.isVegetarian) return false;
            if (userInput.restrictions.includes('vegan') && !meal.isVegan) return false;
            return true;
        });

        // Build LP model
        const model = {
            optimize: 'calories',
            opType: 'max',
            constraints: {
                calories: { max: dailyTargetCalories },
                fat: { max: userInput.dietType === 'low-fat' ? 50 : 200 },
                carbs: { max: userInput.dietType === 'low-carb' ? 100 : 500 },
                protein: { min: 60 }
            },
            variables: {},
            ints: {}
        };

        filteredMeals.forEach((meal, idx) => {
            const varName = `meal${idx}`;
            model.variables[varName] = {
                calories: meal.calories,
                protein: meal.protein,
                carbs: meal.carbs,
                fat: meal.fat
            };
            model.ints[varName] = 1;
        });

        const results = solver.Solve(model);

        // Extract chosen meals
        const chosenMeals = [];
        for (const key in results) {
            if (key.startsWith('meal') && results[key] > 0) {
                const index = parseInt(key.replace('meal', ''));
                chosenMeals.push(filteredMeals[index]);
            }
        }

        // Return the meal plan
        return {
            meals: chosenMeals,
            totalCalories: results.result,
            targetCalories: dailyTargetCalories,
            weightLossPerWeek: userInput.weightLossPerWeekKg
        };

    } catch (error) {
        console.error('Error in generateMealPlan:', error);
        throw error;
    } finally {
        await client.close();
    }
}

module.exports = {
    generateMealPlan,
    getMealsFromDB
};