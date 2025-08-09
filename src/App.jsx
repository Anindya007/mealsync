import { useState, useEffect } from 'react';
import MealplanLogo from './assets/mealplanlogo.svg'
import dashboard_food from './assets/dashboard_food.png'

// Main App Component
export default function MealPlannerApp() {
    const [step, setStep] = useState(1);
    const [userId, setUserId] = useState(null);  // Add this line
    const [formData, setFormData] = useState({
        dietPreferences: '', // Step 1: Diet type selection
        dietType: '',
        goals: {
            weightManagement: '',
            speed: ''
        },
        isLoggedIn: false,
        mealsPerDay: [], // Step 5: Meals per day
        mealPreferences: [],// Step 6: Allergies (this can stay as array since multiple selections are needed)
        personalDetails: {
            age: null,
            gender: '',
            weight: null,
            height: null
        },
        mealChoice: '',
    });

    // Total number of steps in the form process
    const totalSteps = 16;

    // Handle single selection button clicks (radio button behavior)
    const handleSingleSelect = (field, value) => {
        setFormData(prevData => ({
            ...prevData,
            [field]: value
        }));

        console.log(formData);
        // Auto-advance to next step if not the last step
        if (step < totalSteps) {
            setTimeout(() => setStep(step + 1), 300); // Small delay for visual feedback
        }
    };



    // Handle array selections (for allergies - last step)
    const handleMultiSelect = (field, value) => {
        setFormData(prevData => {
            const currentArray = prevData[field];
            if (currentArray.includes(value)) {
                return {
                    ...prevData,
                    [field]: currentArray.filter(item => item !== value)
                };
            } else {
                return {
                    ...prevData,
                    [field]: [...currentArray, value]
                };
            }
        });

        console.log(formData);
    };

    useEffect(() => {
        let timer;
        if (step === 10) {
            timer = setTimeout(() => setStep(step + 1), 5000);
        }
        return () => clearTimeout(timer);
    }, [step]);

    // Handle changes for personal details and goalform
    const handleChange = (fieldName, field, value) => {
        // If only two parameters are provided, assume the first is the field and the second is the value
        if (value === undefined) {
            value = field;
            field = fieldName;
            fieldName = 'goals'; // Default to 'goals' for GoalForm
        }

        setFormData(prevData => {
            // If fieldName is 'personalDetails', update the nested object
            if (fieldName === 'personalDetails') {
                return {
                    ...prevData,
                    personalDetails: {
                        ...prevData.personalDetails,
                        [field]: value
                    }
                };
            }
            // For goals, update the nested object
            else if (fieldName === 'goals') {
                return {
                    ...prevData,
                    goals: {
                        ...prevData.goals,
                        [field]: value
                    }
                };
            }
            // For other fields, update directly
            else {
                return {
                    ...prevData,
                    [fieldName]: value
                };
            }
        });

        console.log(formData);
    };

    // Handle continue to the next step
    const handleContinue = (nextStep) => {
        if (nextStep <= totalSteps) {
            setStep(nextStep);
        }
    };





    // Handle sign up
    const handleSignUp = async () => {
        try {
            // First, update the formData to mark the user as logged in
            setFormData(prev => ({
                ...prev,
                isLoggedIn: true
            }));

            // Then, send the data to the backend
            const response = await fetch('http://localhost:5000/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Failed to save user data');
            }
            
            const data = await response.json();
            
            setUserId(data.userId);  // Add this line
            console.log('User data saved successfully:', data);

            // Move to the next step
            setStep(step + 1);
        } catch (error) {
            console.error('Error saving user data:', error);
            alert('Failed to save data. Please try again.');
        }
    };



    // Render the current form step
    const renderStep = () => {
        switch (step) {
            case 1:
                return (<WeightManagementInfoForm
                    value={formData.weightManagement}
                    onSelect={(value) => handleSingleSelect('goal', value)}
                />);
            case 2:
                return <DietaryPreferencesForm
                    value={formData.dietPreferences}
                    onSelect={(value) => handleSingleSelect('dietPreferences', value)}
                />;
            case 3:
                return <MealPreferencesForm
                    selected={formData.mealPreferences}
                    onToggle={(value) => handleMultiSelect('mealPreferences', value)}
                    handleContinue={() => handleContinue(4)}
                />;
            case 4:
                return <PersonalDetailsForm
                    formData={formData.personalDetails}
                    handleChange={(field, value) => handleChange('personalDetails', field, value)}
                    handleContinue={() => handleContinue(5)}
                />;
            case 5:
                return <DietTypeForm
                    value={formData.dietPreferences}
                    onSelect={(value) => handleSingleSelect('dietType', value)}
                />;
            case 6:
                return <GoalForm
                    formData={formData.goals}
                    handleChange={(field, value) => handleChange('goals', field, value)}
                    handleContinue={() => handleContinue(7)}
                />;
            case 7:
                return <AuthenticationForm
                    onSelect={(value) => handleSignUp()}
                />;
            case 8:
                return <MealsPerDayForm
                    selected={formData.mealsPerDay}
                    onToggle={(value) => handleMultiSelect('mealsPerDay', value)}
                    handleContinue={() => handleContinue(9)}
                />;
            case 9:
                return <MealChoiceForm
                    value={formData.mealChoice}
                    onSelect={(value) => handleSingleSelect('mealChoice', value)}
                />;
            case 10:
                return <AnalysisPage
                />;
            case 11:
                return <DashboardPage
                    setStep={setStep}
                />;
            case 12:
                return <ShoppingListPage setStep={setStep}
                />;

            case 13:
                return <RecipeDatabase setStep={setStep} formData={formData} userId={userId}
                />;
            case 14:
                return <ProgressTrackerComponent setStep={setStep} userId={userId}
                />;
            case 15:
                    return <Calendar setStep={setStep} formData={formData}/>;    
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl">
                <div className="p-8">
                    {step >= 1 && step <= totalSteps && renderStep()}
                </div>
            </div>
        </div>
    );
}



// Step 1: Personal Information Form
function WeightManagementInfoForm({ value, onSelect }) {
    const options = [
        { id: 'lose_weight', label: 'Lose weight' },
        { id: 'gain_muscle', label: 'Gain muscle' },
        { id: 'gain_weight', label: 'Gain weight' },
        { id: 'maintain_weight', label: 'Maintain weight' }
    ];

    return (
        <main className="flex min-h-screen flex-col items-center bg-[#51bf8a] px-4 py-12">
            <div className="w-full max-w-md">
                <div className="mx-auto mb-12 w-64 rounded-lg bg-white p-4">
                    <img src={MealplanLogo} alt="MealSync Logo" width={200} height={60} className="mx-auto" />
                </div>

                <h1 className="mb-16 text-center text-4xl font-bold text-white">What&apos;s your goal?</h1>

                <div className="flex flex-col gap-6">
                    {options.map((option) => (
                        <button
                            key={option.id}
                            className={`w-full rounded-sm bg-[#423636] py-6 text-2xl font-medium text-white ${option.id === value ? 'bg-blue-500' : ''}`}
                            onClick={() => onSelect(option.id)}
                        >{option.label}</button>
                    ))}

                </div>
            </div>
        </main>
    );
}

// Step 2: Dietary Preferences Form
function DietaryPreferencesForm({ value, onSelect }) {
    const options = [
        { id: 'vegetarian', label: 'Vegetarian' },
        { id: 'vegan', label: 'Vegan' },
        { id: 'pescatarian', label: 'Pescatarian' },
        { id: 'pesco-pollo', label: 'Pesco-pollo' },
        { id: 'omnivore', label: 'Omnivore' },

    ];

    return (
        <main className="flex min-h-screen flex-col items-center bg-[#51bf8a] px-4 py-12">
            <div className="w-full max-w-md">
                <div className="mx-auto mb-12 w-64 rounded-lg bg-white p-4">
                    <img src={MealplanLogo} alt="MealSync Logo" width={200} height={60} className="mx-auto" />
                </div>

                <h1 className="mb-16 text-center text-4xl font-bold text-white">What's your lifestyle? </h1>

                <div className="flex flex-col gap-6">
                    {options.map((option) => (
                        <button
                            key={option.id}
                            className={`w-full rounded-sm bg-[#423636] py-6 text-2xl font-medium text-white ${option.id === value ? 'bg-blue-500' : ''}`}
                            onClick={() => onSelect(option.id)}
                        >{option.label}</button>
                    ))}

                </div>
            </div>
        </main>
    );
}

// Step 3: Meal Preferences Form
function MealPreferencesForm({ selected, onToggle, handleContinue }) {

    const options = [
        { id: 'breakfast', label: 'Breakfast' },
        { id: 'lunch', label: 'Lunch' },
        { id: 'dinner', label: 'Dinner' }

    ];


    return (
        <main className="flex min-h-screen flex-col items-center bg-[#51bf8a] px-4 py-12">
            <div className="w-full max-w-md">
                <div className="mx-auto mb-12 w-64 rounded-lg bg-white p-4">
                    <img src={MealplanLogo} alt="MealSync Logo" width={200} height={60} className="mx-auto" />
                </div>

                <h1 className="mb-16 text-center text-4xl font-bold text-white">Which meal type do you want to plan?</h1>
                <h1 className="mb-16 text-center text-4xl font-bold text-white">Select all that apply?</h1>

                <div className="flex flex-col gap-6">
                    {options.map((option) => (
                        <button
                            key={option.id}
                            className={`w-full rounded-sm bg-[#423636] py-6 text-2xl font-medium text-white ${selected.includes(option.id) ? 'bg-blue-500' : ''}`}
                            onClick={(e) => onToggle(option.id)}
                        >{option.label}</button>
                    ))}
                    <button
                        className={`w-full rounded-sm bg-[#423636] py-6 text-2xl font-medium text-white`}
                        onClick={handleContinue}
                    >Continue</button>
                </div>
            </div>
        </main>
    );
}

// Reusable CustomPopover Component
function CustomPopover({ isOpen, onClose, options, options2, onSelect, showSuffix = false, suffix = '', width = "w-1/4", top = "" }) {
    if (!isOpen) return null;

    return (
        <div className={`absolute ${width} ${top} bg-[#51bf8a] rounded-lg shadow-lg max-h-[300px] flex`}>
            <ul className="py-2 flex-1 overflow-y-auto border-r border-white/20">
                {options.map((option) => (
                    <li
                        key={option}
                        onClick={() => {
                            onSelect("heightFeet",option);
                            onClose();
                        }}
                        className="text-white text-center py-3 text-xl cursor-pointer hover:bg-[#3da572] transition-colors"
                    >
                        {option}{showSuffix ? suffix : ''}
                    </li>
                ))}
            </ul>
            {options2 && (
                <ul className="py-2 flex-1 overflow-y-auto">
                    {options2.map((option) => (
                        <li
                            key={option}
                            onClick={() => {
                                onSelect("heightInches",option);
                                onClose();
                            }}
                            className="text-white text-center py-3 text-xl cursor-pointer hover:bg-[#3da572] transition-colors"
                        >
                            {option + '"'}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}


// Step 4: Personal Details Form
function PersonalDetailsForm({ formData, handleChange, handleContinue }) {
    const [showAgePopover, setShowAgePopover] = useState(false);
    const [showGenderPopover, setShowGenderPopover] = useState(false);
    const [showWeightPopover, setShowWeightPopover] = useState(false);
    const [showHeightPopover, setShowHeightPopover] = useState(false);

    const ageOptions = Array.from({ length: 82 }, (_, i) => i + 19); // Ages 19 to 100
    const genderOptions = ['Male', 'Female'];
    const weightOptions = Array.from({ length: 120 }, (_, i) => i + 130); // Weights 30 to 230 kg
    const feetOptions = Array.from({ length: 5 }, (_, i) => i + 4); // Heights from 4 to 8 feet
    const inchesOptions = Array.from({ length: 12 }, (_, i) => i); // 0 to 11 inches

    

    const closeAllPopovers = () => {
        setShowAgePopover(false);
        setShowGenderPopover(false);
        setShowWeightPopover(false);
        setShowHeightPopover(false);
    };

    return (
        <main className="flex min-h-screen flex-col items-center bg-[#51bf8a] px-4 py-12">
            <div className="w-full max-w-md">
                <div className="mx-auto mb-12 w-64 rounded-lg bg-white p-4">
                    <img src={MealplanLogo} alt="MealSync Logo" width={200} height={60} className="mx-auto" />
                </div>
                <h1 className="mb-16 text-center text-4xl font-bold text-white">Tell us more about yourself </h1>
                <div className="flex flex-col gap-6">
                    <button
                        onClick={() => { closeAllPopovers(); setShowAgePopover(!showAgePopover) }}
                        className="w-full rounded-sm bg-[#423636] py-6 text-2xl font-medium text-white"
                    >
                        Age
                    </button>
                    <CustomPopover
                        isOpen={showAgePopover}
                        onClose={() => setShowAgePopover(false)}
                        options={ageOptions}
                        onSelect={(value) => handleChange('age', value)}
                        showSuffix={true}
                        suffix=" years"
                    />

                    <button
                        onClick={() => { closeAllPopovers(); setShowGenderPopover(!showGenderPopover) }}
                        className="w-full rounded-sm bg-[#423636] py-6 text-2xl font-medium text-white"
                    >
                        Gender
                    </button>
                    <CustomPopover
                        isOpen={showGenderPopover}
                        onClose={() => setShowGenderPopover(false)}
                        options={genderOptions}
                        onSelect={(value) => handleChange('gender', value)}
                    />

                    <button
                        onClick={() => { closeAllPopovers(); setShowWeightPopover(!showWeightPopover) }}
                        className="w-full rounded-sm bg-[#423636] py-6 text-2xl font-medium text-white"
                    >
                        Weight
                    </button>
                    <CustomPopover
                        isOpen={showWeightPopover}
                        onClose={() => setShowWeightPopover(false)}
                        options={weightOptions}
                        onSelect={(value) => handleChange('weight', value)}
                        showSuffix={true}
                        suffix=" lbs"
                    />

                    <button
                        onClick={() => { closeAllPopovers(); setShowHeightPopover(!showHeightPopover) }}
                        className="w-full rounded-sm bg-[#423636] py-6 text-2xl font-medium text-white"
                    >
                        Height
                    </button>
                    <div className="flex gap-2">
                        <CustomPopover
                            isOpen={showHeightPopover}
                            onClose={() => setShowHeightPopover(false)}
                            options={feetOptions}
                            options2={inchesOptions}
                            onSelect={(option,value) => handleChange(option, value)}
                            showSuffix={true}
                            suffix=" ft"
                            width="w-1/2"
                            top="mt-[-17rem]"
                        />
                    </div>

                    <button
                        onClick={handleContinue}
                        className="w-full rounded-sm bg-[#423636] py-6 text-2xl font-medium text-white"
                    >
                        Continue
                    </button>
                </div>
            </div>
        </main>
    );
}

// Results View after submission
function DietTypeForm({ value, onSelect }) {
    const options = [
        { id: 'high_protein', label: 'High Protein' },
        { id: 'low_fat', label: 'Low fat' },
        { id: 'keto', label: 'Keto' },
        { id: 'low_carb', label: 'Low Carb' },
        { id: 'recommend', label: 'Recommend ' },

    ];

    return (
        <main className="flex min-h-screen flex-col items-center bg-[#51bf8a] px-4 py-12">
            <div className="w-full max-w-md">
                <div className="mx-auto mb-12 w-64 rounded-lg bg-white p-4">
                    <img src={MealplanLogo} alt="MealSync Logo" width={200} height={60} className="mx-auto" />
                </div>

                <h1 className="mb-16 text-center text-4xl font-bold text-white">Which type of diet do you want?</h1>

                <div className="flex flex-col gap-6">
                    {options.map((option) => (
                        <button
                            key={option.id}
                            className={`w-full rounded-sm bg-[#423636] py-6 text-2xl font-medium text-white ${option.id === value ? 'bg-blue-500' : ''}`}
                            onClick={() => onSelect(option.id)}
                        >{option.label}</button>
                    ))}

                </div>
            </div>
        </main>
    );
}

// Step 4: Personal Details Form
function GoalForm({ formData, handleChange, handleContinue }) {
    const [showGoalWeightPopover, setShowGoalWeightPopover] = useState(false);
    const [showSpeedPopover, setShowSpeedPopover] = useState(false);

    const goalWeightOptions = Array.from({ length: 100 }, (_, i) => i + 30);
    const speedOptions = ['Fast', 'Slow', 'Recommend'];

    const closeAllPopovers = () => {
        setShowSpeedPopover(false);
        setShowGoalWeightPopover(false);
    };

    return (
        <main className="flex min-h-screen flex-col items-center bg-[#51bf8a] px-4 py-12">
            <div className="w-full max-w-md">
                <div className="mx-auto mb-12 w-64 rounded-lg bg-white p-4">
                    <img src={MealplanLogo} alt="MealSync Logo" width={200} height={60} className="mx-auto" />
                </div>
                <h1 className="mb-16 text-center text-4xl font-bold text-white">Customize your goal </h1>
                <div className="flex flex-col gap-6">
                    <button
                        onClick={() => { closeAllPopovers(); setShowGoalWeightPopover(!showGoalWeightPopover) }}
                        className="w-full rounded-sm bg-[#423636] py-6 text-2xl font-medium text-white"
                    >
                        Goal weight
                    </button>
                    <CustomPopover
                        isOpen={showGoalWeightPopover}
                        onClose={() => setShowGoalWeightPopover(false)}
                        options={goalWeightOptions}
                        onSelect={(value) => handleChange('weightManagement', value)}
                        showSuffix={true}
                        suffix=" kg"
                    />

                    <button
                        onClick={() => { closeAllPopovers(); setShowSpeedPopover(!showSpeedPopover) }}
                        className="w-full rounded-sm bg-[#423636] py-6 text-2xl font-medium text-white"
                    >
                        Speed
                    </button>
                    <CustomPopover
                        isOpen={showSpeedPopover}
                        onClose={() => setShowSpeedPopover(false)}
                        options={speedOptions}
                        onSelect={(value) => handleChange('speed', value)}
                    />

                    <button
                        onClick={handleContinue}
                        className="w-full rounded-sm bg-[#423636] py-6 text-2xl font-medium text-white"
                    >
                        Continue
                    </button>
                </div>
            </div>
        </main>
    );
}


function AuthenticationForm({ onSelect }) {
    const [showGoogleAuthPopover, setShowGoogleAuthPopover] = useState(false);

    const closeAllPopovers = () => {
        setShowGoogleAuthPopover(false);
    };

    const handleGoogleSignUp = () => {
        // Create Google Sign In button
        google.accounts.id.initialize({
            client_id: 'YOUR_CLIENT_ID', // This can be any string for mock purposes
            callback: handleGoogleCallback
        });

        google.accounts.id.prompt((notification) => {
            if (notification.isNotDisplayed()) {
                console.log('Google Sign-In not displayed');
            }
        });
    };

    const handleGoogleCallback = (response) => {
        // Mock successful Google sign-in
        console.log('Mock Google Sign-In successful');
        // Call the parent component's onSelect to proceed
        onSelect();
    };

    return (
        <main className="flex min-h-screen flex-col items-center bg-[#51bf8a] px-4 py-12">
            <div className="w-full max-w-md">
                <div className="mx-auto mb-12 w-64 rounded-lg bg-white p-4">
                    <img src={MealplanLogo} alt="MealSync Logo" width={200} height={60} className="mx-auto" />
                </div>

                <div className="flex flex-col gap-6 mt-[12.5rem]">
                    <button
                        key={"isLoggedIn"}
                        className="w-full rounded-sm bg-[#423636] py-6 text-2xl font-medium text-white"
                        onClick={() => onSelect()}
                    >
                        Sign Up
                    </button>

                    <button
                        onClick={handleGoogleSignUp}
                        className="w-full rounded-sm bg-[#423636] py-6 text-2xl font-medium text-white flex items-center justify-center gap-2"
                    >
                        
                        Sign Up with Google
                    </button>
                    {showGoogleAuthPopover && (
                        <div className="absolute bg-white border rounded-md shadow-lg p-4">
                            <p className="text-center mb-4">
                                Google Authentication will be implemented here
                            </p>
                            <button
                                onClick={() => { closeAllPopovers(); }}
                                className="w-full rounded-sm bg-blue-500 py-2 text-white"
                            >
                                Close
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}

function MealsPerDayForm({ selected, onToggle, handleContinue }) {

    const options = [
        { id: 'breakfast', label: 'Breakfast' },
        { id: 'lunch', label: 'Lunch' },
        { id: 'dinner', label: 'Dinner' }

    ];


    return (
        <main className="flex min-h-screen flex-col items-center bg-[#51bf8a] px-4 py-12">
            <div className="w-full max-w-md">
                <div className="mx-auto mb-12 w-64 rounded-lg bg-white p-4">
                    <img src={MealplanLogo} alt="MealSync Logo" width={200} height={60} className="mx-auto" />
                </div>

                <h1 className="mb-16 text-center text-4xl font-bold text-white">How many meals per day?</h1>


                <div className="flex flex-col gap-6">
                    {options.map((option) => (
                        <button
                            key={option.id}
                            className={`w-full rounded-sm bg-[#423636] py-6 text-2xl font-medium text-white ${selected.includes(option.id) ? 'bg-blue-500' : ''}`}
                            onClick={(e) => onToggle(option.id)}
                        >{option.label}</button>
                    ))}
                    <button
                        className={`w-full rounded-sm bg-[#423636] py-6 text-2xl font-medium text-white`}
                        onClick={handleContinue}
                    >Continue</button>
                </div>
            </div>
        </main>
    );
}

function MealChoiceForm({ value, onSelect }) {
    const options = [
        { id: 'want_to_choose', label: 'I want to choose my meals' },
        { id: 'app_choose', label: 'Let app choose for me   ' },
    ];

    return (
        <main className="flex min-h-screen flex-col items-center bg-[#51bf8a] px-4 py-12">
            <div className="w-full max-w-md">
                <div className="mx-auto mb-12 w-64 rounded-lg bg-white p-4">
                    <img src={MealplanLogo} alt="MealSync Logo" width={200} height={60} className="mx-auto" />
                </div>

                <h1 className="mb-16 text-center text-4xl font-bold text-white">How do you want to plan your meals?</h1>

                <div className="flex flex-col gap-6">
                    {options.map((option) => (
                        <button
                            key={option.id}
                            className={`w-full rounded-sm bg-[#423636] py-6 text-2xl font-medium text-white ${option.id === value ? 'bg-blue-500' : ''}`}
                            onClick={() => onSelect(option.id)}
                        >{option.label}</button>
                    ))}

                </div>
            </div>
        </main>
    );
}

function AnalysisPage() {
    const texts = [
        { label: 'Analysing Preferences' },
        { label: 'Assessing calories' },
        { label: 'Creating meals' },
    ];

    return (
        <main className="flex min-h-screen flex-col items-center bg-[#51bf8a] px-4 py-12">
            <div className="w-full max-w-md">
                <div className="mx-auto mb-12 w-64 bg-white p-4">
                    <img src={MealplanLogo} alt="MealSync Logo" width={200} height={60} className="mx-auto" />
                </div>


                <div className="flex flex-col gap-6">

                    {texts.map((text) => (
                        <p className='p-3 text-white text-2xl'
                        ><svg width="36" height="33" viewBox="0 0 36 33" fill="none" className="inline" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="18.2759" cy="5.17928" r="5" fill="black" />
                                <circle cx="30.3423" cy="17.5662" r="5" fill="black" />
                                <circle cx="5.53271" cy="17.5662" r="5" fill="black" />
                                <circle cx="18.2759" cy="27.5662" r="5" fill="black" />
                            </svg>
                            &nbsp;&nbsp;&nbsp;&nbsp;
                            {text.label}</p>
                    ))}

                </div>
            </div>
        </main>
    );
}

function DashboardPage({ setStep }) {

    return (
        <main className="flex min-h-screen flex-col items-center bg-[#51bf8a] py-12">




            <div className="flex flex-col gap-6">
                <div className="flex justify-center items-center">
                    <ul className="flex w-full  overflow-hidden">
                        {[
                            { day: 'S', date: '23' },
                            { day: 'M', date: '24' },
                            { day: 'T', date: '25' },
                            { day: 'W', date: '26' },
                            { day: 'T', date: '27' },
                            { day: 'F', date: '28' },
                            { day: 'S', date: '1' }
                        ].map((item, index) => (
                            <li
                                key={index}
                                className="flex-1 text-white text-center py-2"
                            >
                                <div className="text-sm sm:text-base font-medium">{item.day}</div>
                                <div className="text-lg sm:text-xl font-bold">{item.date}</div>
                            </li>
                        ))}
                    </ul>
                </div>
                <img src={dashboard_food} alt="dashboard_food" width={600} height={600} className="mx-auto" />

                <Footer setStep={setStep} />
            </div>

        </main>
    );
}

function ShoppingListPage({ setStep }) {

    const [formData, setFormData] = useState({
        item: '',
        quantity: '',
        unit: '',
    });



    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Form submitted:', formData);
        // You can add logic here to handle the form submission
    };

    const handleCancel = () => {
        setFormData({
            item: '',
            quantity: '',
            unit: '',
        });
        // Additional cancel logic can be added here
    };


    return (
        <main className="flex min-h-screen flex-col items-center bg-[#51bf8a] py-12">

            <div className="flex w-full flex-col gap-6">
                <h1 className="mb-16 text-center text-4xl font-bold text-white">Shopping List</h1>
                <div className="w-full max-w-sm mx-auto">
                    <form
                        onSubmit={handleSubmit}
                        className="bg-[#3c2f2f] rounded-lg p-6 shadow-lg flex flex-col"
                    >
                        <div className="mb-6">
                            <label className="text-white text-lg">Item</label>
                            <input
                                type="text"
                                name="item"
                                value={formData.item}
                                onChange={handleChange}
                                className="w-full bg-transparent border-b border-white text-white pb-1 focus:outline-none"
                            />
                        </div>

                        <div className="flex mb-10">
                            <div className="w-1/2 mr-4">
                                <label className="text-white text-lg">Quantity</label>
                                <input
                                    type="text"
                                    name="quantity"
                                    value={formData.quantity}
                                    onChange={handleChange}
                                    className="w-full bg-transparent border-b border-white text-white pb-1 focus:outline-none"
                                />
                            </div>

                            <div className="w-1/2">
                                <label className="text-white text-lg">Unit</label>
                                <input
                                    type="text"
                                    name="unit"
                                    value={formData.unit}
                                    onChange={handleChange}
                                    className="w-full bg-transparent border-b border-white text-white pb-1 focus:outline-none"
                                />
                            </div>
                        </div>

                        <div className="flex justify-between mt-auto">
                            <button
                                type="submit"
                                className="bg-[#e2e8ea] text-black px-6 py-2 font-medium"
                            >
                                Add
                            </button>

                            <button
                                type="button"
                                onClick={handleCancel}
                                className="bg-[#e2e8ea] text-black px-4 py-2 font-medium"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>

                <Footer setStep={setStep} customClass="mt-[28rem]" />
            </div>


        </main>
    );
}

// Move the meals fetching logic to a custom hook for reuse
function useMeals() {
    const [meals, setMeals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMeals = async () => {
            try {
                setLoading(true);
                const response = await fetch('http://localhost:5000/api/meals');

                if (!response.ok) {
                    throw new Error('Failed to fetch meals');
                }

                const data = await response.json();
                setMeals(data.meals || []);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching meals:', err);
                setError(err.message);
                setLoading(false);
            }
        };

        fetchMeals();
    }, []);

    const toggleFavorite = async (mealId) => {
        try {
            const updatedMeals = meals.map(meal => {
                if (meal._id === mealId) {
                    return { ...meal, isFavorite: !meal.isFavorite };
                }
                return meal;
            });
            setMeals(updatedMeals);

            // Update on the server
            /*  const response = await fetch(`http://localhost:5000/api/meals/${mealId}/favorite`, {
                 method: 'POST',
                 headers: {
                     'Content-Type': 'application/json',
                 },
                 body: JSON.stringify({ isFavorite: updatedMeals.find(m => m.id === mealId).isFavorite }),
             });
 
             if (!response.ok) {
                 throw new Error('Failed to update favorite status');
             } */
        } catch (err) {
            console.error('Error updating favorite status:', err);
            // Revert the change if the server update fails
            setMeals(meals);
        }
    };

    return { meals, loading, error, toggleFavorite };
}

function RecipeDatabase({ setStep, formData }) {
    const [activeTab, setActiveTab] = useState('database');
    const [searchQuery, setSearchQuery] = useState('');
    const { meals, loading, error, toggleFavorite } = useMeals();
    const [mealPlan, setMealPlan] = useState([]);
    const [filteredMeals, setFilteredMeals] = useState([]);
    const [loadingMealPlan, setLoadingMealPlan] = useState(true);

    // Update filteredMeals when meals data changes
    useEffect(() => {
        setFilteredMeals(meals);
    }, [meals]);

    useEffect(() => {
        const fetchMealPlan = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/generate-meal-plan', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch meal plan');
                }
                const data = await response.json();
                setMealPlan(data.mealPlan.meals || []);
            } catch (err) {
                console.error('Error fetching meal plan:', err);
            } finally {
                setLoadingMealPlan(false);
            }
        };

        fetchMealPlan();
    }, []);

    const MealCard = ({ meal }) => (
        <div className="bg-white rounded-lg p-4 shadow relative">
            <button
                onClick={() => toggleFavorite(meal._id)}
                className="absolute top-2 right-2 text-2xl text-yellow-500 hover:text-yellow-600"
            >
                {meal.isFavorite ? '★' : '☆'}
            </button>
            <h3 className="text-lg font-semibold">{meal.name}</h3>
            <div className="text-sm text-gray-600">
                <p>Calories: {meal.calories}</p>
                <p>Protein: {meal.protein}g</p>
                <p>Carbs: {meal.carbs}g</p>
                <p>Fat: {meal.fat}g</p>
            </div>
        </div>
    );

    const DatabaseContent = () => (
        <div className="w-full px-4">
            {loading ? (
                <div className="text-center text-white">Loading meals...</div>
            ) : error ? (
                <div className="text-center text-red-500">Error: {error}</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredMeals.map((meal, index) => (
                        <MealCard key={index} meal={meal} />
                    ))}
                </div>
            )}
        </div>
    );

    const FavouritesContent = () => (
        <div className="w-full px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMeals
                    .filter(meal => meal.isFavorite)
                    .map((meal, index) => (
                        <MealCard key={index} meal={meal} />
                    ))}
            </div>
        </div>
    );

    const MyRecipesContent = () => (
        <div className="w-full px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mealPlan.map((meal, index) => (
                    <MealCard key={index} meal={meal} />
                ))}
            </div>
        </div>
    );

    return (
        <main className="flex min-h-screen flex-col items-center bg-[#51bf8a] py-12">
            <div className="pt-12 pb-4">
                <div className="flex space-x-4 text-white text-lg">
                    <div
                        className={`pb-2 border-b-2 cursor-pointer ${activeTab === 'database' ? 'border-white' : 'border-transparent'
                            }`}
                        onClick={() => setActiveTab('database')}
                    >
                        Database
                    </div>
                    <div
                        className={`pb-2 border-b-2 cursor-pointer ${activeTab === 'favourites' ? 'border-white' : 'border-transparent'
                            }`}
                        onClick={() => setActiveTab('favourites')}
                    >
                        Favourites
                    </div>
                    <div
                        className={`pb-2 border-b-2 cursor-pointer ${activeTab === 'myrecipes' ? 'border-white' : 'border-transparent'
                            }`}
                        onClick={() => setActiveTab('myrecipes')}
                    >
                        My recipes
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-full p-3 mb-4 w-full max-w-md">
                <input
                    type="text"
                    placeholder="Search foods"
                    className="bg-white w-full text-center text-gray-800 placeholder-gray-800 outline-none"
                    value={searchQuery}
                    onChange={(e) => {
                        setSearchQuery(e.target.value);
                        // Filter meals based on search query
                        const filtered = meals.filter(meal =>
                            meal.name.toLowerCase().includes(e.target.value.toLowerCase())
                        );
                        // Update the filtered meals list
                        setFilteredMeals(filtered);
                    }}
                />
            </div>

            {/* Content area */}
            <div className="flex-grow w-full max-w-6xl">
                {activeTab === 'database' && <DatabaseContent />}
                {activeTab === 'favourites' && <FavouritesContent />}
                {activeTab === 'myrecipes' && <MyRecipesContent />}
            </div>

            <Footer setStep={setStep} customClass='w-full' />
        </main>
    );
}

function ProgressTrackerComponent({ setStep,userId }) {

    const [currentWeight, setCurrentWeight] = useState('');
    const [goalWeight, setGoalWeight] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleCheckIn = async () => {
        // Don't proceed if weights aren't entered
        if (!currentWeight || !goalWeight) {
            alert('Please enter both current weight and goal weight');
            return;
        }

        setIsLoading(true);

        try {
            // API call to save the weight data
            const response = await fetch('http://localhost:5000/api/check-in', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    currentWeight: parseFloat(currentWeight),
                    goalWeight: parseFloat(goalWeight),
                    userId: userId,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to save data');
            }

            // Handle successful check-in
            alert('Check-in successful!');
            setStep(11);

        } catch (error) {
            console.error('Error saving weight data:', error);
            alert('Failed to save data. Please try again.');
            setStep(11);
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="flex flex-col h-screen bg-emerald-400 p-4">
            {/* Header */}
            <div className="text-center text-white text-2xl font-semibold mt-6 mb-8">
                Progress
            </div>

            {/* Goal selector */}
            <div className="bg-white rounded-full p-3 mb-12 flex justify-between items-center">
                <div className="text-gray-800 text-lg ml-4">Goal</div>
                <div className="text-gray-800 text-xl mr-4">&gt;</div>
            </div>

            {/* Weight comparison section */}
            <div className="flex justify-between mb-16">
                {/* Current weight */}
                <div className="flex flex-col items-center">
                    <div className="text-white mb-2">
                        Current<br />weight
                    </div>
                    <input type="text"
                        value={currentWeight}
                        onChange={(e) => setCurrentWeight(Number(e.target.value))} className=' w-20 h-20' />
                </div>

                {/* Goal weight */}
                <div className="flex flex-col items-center">
                    <div className="text-white mb-2">Goal</div>
                    <input type="text"
                        value={goalWeight}
                        onChange={(e) => setGoalWeight(Number(e.target.value))} className=' w-20 h-20' />
                </div>
            </div>

            {/* Spacer */}
            <div className="flex-grow"></div>

            {/* Check in button */}
            <div className="flex justify-center mb-12">
                <button className="bg-gray-800 text-white py-3 px-16 text-lg" onClick={handleCheckIn}>
                    Check in
                </button>
            </div>
            <Footer setStep={setStep} customClass="mt-[19rem]"/>
        </div>

    )
}

function Calendar({setStep,formData}) {
    const days = [
      {
        name: new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }),
        meals: formData.mealsPerDay
      },
      {
        name: new Date(Date.now() + 86400000).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }),
        meals: formData.mealsPerDay
      },
      {
        name: new Date(Date.now() + 172800000).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }),
        meals: formData.mealsPerDay
      }
    ];
  
    return (
      <div className="flex flex-col h-screen bg-emerald-400 p-4">
        {days.map((day, index) => (
          <div key={index} className="mb-6">
            <h2 className="text-white text-2xl font-bold mb-3">{day.name}</h2>
            <div className="space-y-3">
              {day.meals.map((meal, mealIndex) => (
                <button
                  key={mealIndex}
                  className="bg-[#3c2f2f] text-white text-lg w-full py-3 px-4 rounded-full"
                >
                  {meal}
                </button>
              ))}
            </div>
          </div>
        ))}
        <Footer setStep={setStep} customClass='mt-[7rem]'/>
      </div>
    );
  }

function Footer({ setStep, customClass = '' }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const { meals, loading, error } = useMeals();


    const openModal = () => setIsOpen(true);
    const closeModal = () => setIsOpen(false);

    return (<div className={`flex justify-center items-center ${customClass}`}>
        <ul className="flex w-full bg-[#E3ECEC] overflow-hidden">
            <li
                className="flex-1 text-white text-center py-2 cursor-pointer hover:bg-gray-700 transition-colors"
                onClick={() => setStep(11)}
            >
                <svg width="50" height="51" viewBox="0 0 50 51" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="50" height="50" transform="translate(0 0.868225)" fill="#E3ECEC" />
                    <path d="M7.08691 19.4954L24.4766 4.96429L38.2931 19.4954V43.7935H29.2409V23.0687H16.1391V43.7935H7.08691V19.4954Z" stroke="black" />
                </svg>
            </li>
            <li className="flex-1 text-white text-center py-2 hover:bg-gray-700 transition-colors" ><svg width="50" height="51" viewBox="0 0 50 51" fill="none" xmlns="http://www.w3.org/2000/svg"
            onClick={() => setStep(15)}>
                <rect width="50" height="50" transform="translate(0 0.36969)" fill="#E3ECEC" />
                <path d="M31.9082 5.95514H18.3299V18.8187H9.27783V31.9205H18.3299V44.7842H31.9082V31.9205H40.7223V18.8187H31.9082V5.95514Z" stroke="black" />
            </svg>
            </li>
            <li className="flex-1 text-white text-center py-2 hover:bg-gray-700 transition-colors" onClick={() => setStep(12)}><svg width="50" height="51" viewBox="0 0 50 51" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="50" height="50" transform="translate(0 0.0455322)" fill="#E3ECEC" />
                <path d="M9.72559 5.57092H14.0137V13.6703H34.9766V31.5389C34.9766 34.3004 32.7381 36.5389 29.9766 36.5389H15.2047" stroke="black" />
                <path d="M15.2046 36.7771V36.7771C13.7576 36.7771 12.5845 35.604 12.5845 34.157V15.8142H10.6787V5.80914M34.5002 33.9186V39.1619C34.5002 41.9233 32.2616 44.1619 29.5002 44.1619H12.5845" stroke="black" />
                <ellipse cx="29.0496" cy="46.9846" rx="2.85864" ry="2.82275" fill="black" />
                <ellipse cx="17.3772" cy="46.9846" rx="2.85864" ry="2.82275" fill="black" />
            </svg>
            </li>
            <li className="flex-1 text-white text-center py-2 hover:bg-gray-700 transition-colors" onClick={openModal}><svg width="50" height="51" viewBox="0 0 50 51" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="50" height="50" transform="translate(0 0.378906)" fill="#E3ECEC" />
                <path d="M28.3184 14.5992C28.3184 21.2127 22.7475 26.6055 15.8357 26.6055C8.92393 26.6055 3.35303 21.2127 3.35303 14.5992C3.35303 7.98571 8.92393 2.59283 15.8357 2.59283C22.7475 2.59283 28.3184 7.98571 28.3184 14.5992Z" fill="#E3ECEC" stroke="black" />
                <line x1="23.2226" y1="25.0317" x2="44.4238" y2="47.0066" stroke="black" />
            </svg>
            </li>
            <li className="flex-1 text-white text-center py-2 hover:bg-gray-700 transition-colors" onClick={() => setStep(13)}><svg width="50" height="51" viewBox="0 0 50 51" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clip-path="url(#clip0_40_2)">
                    <rect width="50" height="50" transform="translate(0 0.809143)" fill="#E3ECEC" />
                    <path d="M5.41371 10.7027H22.9608M5.41371 21.343H22.9608M5.41371 31.9833H22.9608M0 0.809143V43.9302H29.8677V0.809143H0Z" stroke="black" />
                </g>
                <defs>
                    <clipPath id="clip0_40_2">
                        <rect width="50" height="50" fill="white" transform="translate(0 0.809143)" />
                    </clipPath>
                </defs>
            </svg>
            </li>
            <li className="flex-1 text-white text-center py-2 hover:bg-gray-700 transition-colors" onClick={() => setStep(14)}><svg width="50" height="51" viewBox="0 0 50 51" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="50" height="50" transform="translate(0 0.809143)" fill="#E3ECEC" />
                <path d="M7.41162 5.14349V46.593H42.4295M11.4615 14.4339L22.8958 28.0121V19.1982L33.3773 36.3497" stroke="black" />
                <path d="M34.9677 40.9014C35.4995 41.0503 36.0514 40.7399 36.2003 40.2081L38.6267 31.5413C38.7756 31.0095 38.4652 30.4577 37.9334 30.3088C37.4015 30.1599 36.8497 30.4703 36.7008 31.0021L34.5439 38.7059L26.8402 36.5491C26.3083 36.4002 25.7565 36.7106 25.6076 37.2424C25.4587 37.7743 25.7691 38.3261 26.301 38.475L34.9677 40.9014ZM32.2217 36.6174L34.3657 40.4288L36.1089 39.4482L33.9648 35.6368L32.2217 36.6174Z" fill="black" />
            </svg>
            </li>

            {/* Modal Overlay */}
            {isOpen && (
                <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center" onClick={closeModal}>
                    {/* Modal Content */}
                    <div
                        className="sm:max-w-md w-full mx-4"
                        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
                    >
                        {/* Green Content Box */}
                        <div className="bg-emerald-500 rounded-lg p-6 flex flex-col items-center w-full h-[400px] relative">
                            {/* Close Button */}
                            <button
                                onClick={closeModal}
                                className="absolute right-4 top-4 rounded-sm opacity-70 text-white hover:opacity-100"
                            >
                                ✕
                            </button>

                            <h2 className="text-white text-2xl font-semibold mb-4">Search recipe</h2>

                            {/* Search Input */}
                            <div className="w-full mb-4">
                                <input
                                    type="text"
                                    placeholder="Search for recipes..."
                                    className="w-full px-4 py-2 rounded-md"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            {/* Meals List */}
                            <div className="w-full overflow-y-auto flex-grow">
                                {loading ? (
                                    <p className="text-white text-center">Loading meals...</p>
                                ) : error ? (
                                    <p className="text-white text-center">Error: {error}</p>
                                ) : meals.length === 0 ? (
                                    <p className="text-white text-center">No meals found</p>
                                ) : (
                                    <ul className="space-y-2">
                                        {meals
                                            .filter(meal =>
                                                meal.name &&
                                                meal.name.toLowerCase().includes(searchQuery.toLowerCase())
                                            )
                                            .map((meal, index) => (
                                                <li
                                                    key={index}
                                                    className="bg-white p-3 rounded-md cursor-pointer hover:bg-gray-100"
                                                >
                                                    <div className="font-medium">{meal.name}</div>
                                                    <div className="text-sm text-gray-600">
                                                        {meal.calories} calories | {meal.protein}g protein | {meal.carbs}g carbs | {meal.fat}g fat
                                                    </div>
                                                </li>
                                            ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </ul>
    </div>)
}
