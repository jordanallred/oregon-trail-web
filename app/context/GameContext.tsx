// File: app/context/GameContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import INTERACTIVE_EVENTS from '../data/interactiveEvents';

// Game constants
const GAME_CONSTANTS = {
    TOTAL_DISTANCE: 2000, // miles from Independence, MO to Oregon
    FOOD_PER_PERSON_PER_DAY: 2, // pounds
    MILES_PER_DAY_HEALTHY: 20,
    STARTING_MONEY: 900, // dollars
    STARTING_FOOD: 200, // pounds
    STARTING_OXEN: 2, // pairs
    STARTING_CLOTHING: 2, // sets per person
    STARTING_AMMO: 20, // bullets
    STARTING_SPARE_PARTS: 0,
    PACE_OPTIONS: ['steady', 'strenuous', 'grueling'],
    RATION_OPTIONS: ['filling', 'meager', 'bare bones'],
    FORT_LOCATIONS: [300, 600, 900, 1200, 1500, 1800], // miles
    RIVER_LOCATIONS: [250, 550, 850, 1150, 1450, 1750], // miles
};

// Price list for store items
const STORE_PRICES = {
    food: 0.2, // per pound
    clothing: 10, // per set
    bullets: 2, // per box of 20
    oxen: 40, // per pair
    wagon_wheel: 10, // each
    wagon_axle: 10, // each
    wagon_tongue: 10, // each
};

// Possible random events
const RANDOM_EVENTS = [
    { type: 'illness', description: 'Someone in your party has fallen ill', severity: 'medium' },
    { type: 'broken_wheel', description: 'A wagon wheel has broken', severity: 'medium' },
    { type: 'broken_axle', description: 'A wagon axle has broken', severity: 'high' },
    { type: 'broken_tongue', description: 'A wagon tongue has broken', severity: 'medium' },
    { type: 'bad_water', description: 'You drank bad water', severity: 'low' },
    { type: 'lost_trail', description: "You've lost the trail", severity: 'medium' },
    { type: 'heavy_fog', description: 'Heavy fog has slowed your travel', severity: 'low' },
    { type: 'snake_bite', description: 'Someone has been bitten by a snake', severity: 'high' },
    { type: 'theft', description: 'Thieves have stolen some of your supplies', severity: 'medium' },
    { type: 'beneficial', description: 'Found wild berries', effect: 'food', amount: 10 },
    { type: 'beneficial', description: 'Found an abandoned wagon', effect: 'parts', amount: 1 },
];

// Define the game state type
type PartyMember = {
    name: string;
    health: 'good' | 'fair' | 'poor' | 'dead';
    diseases: string[];
};

type GameState = {
    date: Date;
    miles: number;
    money: number;
    food: number;
    oxen: number;
    clothing: number;
    ammunition: number;
    spareWheels: number;
    spareAxles: number;
    spareTongues: number;
    weather: 'good' | 'fair' | 'poor' | 'very poor';
    pace: 'steady' | 'strenuous' | 'grueling';
    rations: 'filling' | 'meager' | 'bare bones';
    party: PartyMember[];
    messages: string[];
    recentEvents: any[];
    partyLeader: string;
    inEvent: boolean;
    currentEvent: any | null;
    isPaused: boolean;
};

// Initial game state
const initialGameState: GameState = {
    date: new Date(1848, 3, 1), // April 1, 1848
    miles: 0,
    money: GAME_CONSTANTS.STARTING_MONEY,
    food: GAME_CONSTANTS.STARTING_FOOD,
    oxen: GAME_CONSTANTS.STARTING_OXEN,
    clothing: GAME_CONSTANTS.STARTING_CLOTHING * 5, // 5 party members
    ammunition: GAME_CONSTANTS.STARTING_AMMO,
    spareWheels: GAME_CONSTANTS.STARTING_SPARE_PARTS,
    spareAxles: GAME_CONSTANTS.STARTING_SPARE_PARTS,
    spareTongues: GAME_CONSTANTS.STARTING_SPARE_PARTS,
    weather: 'good',
    pace: 'steady',
    rations: 'filling',
    party: [],
    messages: ['Welcome to the Oregon Trail!'],
    recentEvents: [],
    partyLeader: '',
    inEvent: false,
    currentEvent: null,
    isPaused: false,
};

// Create context
type GameContextType = {
    gameState: GameState;
    setPartyMembers: (leader: string, members: string[]) => void;
    updateGameState: (updates: Partial<GameState>) => void;
    advanceDay: () => void;
    handleStore: (purchases: {
        food?: number;
        clothing?: number;
        ammunition?: number;
        oxen?: number;
        spareWheels?: number;
        spareAxles?: number;
        spareTongues?: number;
    }) => void;
    huntingMinigame: () => {food: number; bullets: number};
    checkGameOver: () => {isOver: boolean; reason: string};
    resetGame: () => void;
    forceEvent: (eventType: string) => void;
    triggerInteractiveEvent: (eventId?: string) => void;
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: React.ReactNode }) {
    const [gameState, setGameState] = useState<GameState>(initialGameState);

    // Initialize the party with the names provided
    const setPartyMembers = (leader: string, members: string[]) => {
        const party = [leader, ...members].map(name => ({
            name,
            health: 'good' as const,
            diseases: [],
        }));

        setGameState(prev => ({
            ...prev,
            party,
            partyLeader: leader,
            messages: [...prev.messages, 'Your journey begins!'],
        }));
    };

    // General function to update game state
    const updateGameState = (updates: Partial<GameState>) => {
        setGameState(prev => ({ ...prev, ...updates }));
    };

    // Handle in-game store purchases
    const handleStore = (purchases: {
        food?: number;
        clothing?: number;
        ammunition?: number;
        oxen?: number;
        spareWheels?: number;
        spareAxles?: number;
        spareTongues?: number;
    }) => {
        let totalCost = 0;

        if (purchases.food) totalCost += purchases.food * STORE_PRICES.food;
        if (purchases.clothing) totalCost += purchases.clothing * STORE_PRICES.clothing;
        if (purchases.ammunition) totalCost += purchases.ammunition * STORE_PRICES.bullets;
        if (purchases.oxen) totalCost += purchases.oxen * STORE_PRICES.oxen;
        if (purchases.spareWheels) totalCost += purchases.spareWheels * STORE_PRICES.wagon_wheel;
        if (purchases.spareAxles) totalCost += purchases.spareAxles * STORE_PRICES.wagon_axle;
        if (purchases.spareTongues) totalCost += purchases.spareTongues * STORE_PRICES.wagon_tongue;

        if (totalCost > gameState.money) {
            updateGameState({
                messages: [...gameState.messages, "You don't have enough money for those purchases."]
            });
            return;
        }

        updateGameState({
            money: gameState.money - totalCost,
            food: gameState.food + (purchases.food || 0),
            clothing: gameState.clothing + (purchases.clothing || 0),
            ammunition: gameState.ammunition + (purchases.ammunition || 0),
            oxen: gameState.oxen + (purchases.oxen || 0),
            spareWheels: gameState.spareWheels + (purchases.spareWheels || 0),
            spareAxles: gameState.spareAxles + (purchases.spareAxles || 0),
            spareTongues: gameState.spareTongues + (purchases.spareTongues || 0),
            messages: [...gameState.messages, "Purchases complete."]
        });
    };

    // Handle hunting minigame
    const huntingMinigame = () => {
        if (gameState.ammunition < 10) {
            updateGameState({
                messages: [...gameState.messages, "Not enough ammunition to hunt."]
            });
            return { food: 0, bullets: 0 };
        }

        // Simplified hunting results
        const success = Math.random() > 0.3;
        const bulletsUsed = Math.floor(Math.random() * 5) + 5; // 5-10 bullets
        const foodGained = success ? Math.floor(Math.random() * 50) + 30 : 0; // 30-80 food if successful

        updateGameState({
            ammunition: gameState.ammunition - bulletsUsed,
            food: gameState.food + foodGained,
            messages: [...gameState.messages,
                success
                    ? `Hunting successful! Gained ${foodGained} pounds of food.`
                    : "Hunting unsuccessful."]
        });

        return { food: foodGained, bullets: bulletsUsed };
    };

    // Check if the game is over and why
    const checkGameOver = () => {
        if (gameState.party.every(member => member.health === 'dead')) {
            return { isOver: true, reason: 'All party members have died.' };
        }

        if (gameState.party.find(member => member.name === gameState.partyLeader)?.health === 'dead') {
            return { isOver: true, reason: 'The wagon leader has died.' };
        }

        if (gameState.miles >= GAME_CONSTANTS.TOTAL_DISTANCE) {
            return { isOver: true, reason: 'victory' };
        }

        const currentDate = new Date(gameState.date);
        if (currentDate.getMonth() > 10) { // December
            return { isOver: true, reason: 'Winter has arrived before reaching Oregon.' };
        }

        if (gameState.oxen < 1) {
            return { isOver: true, reason: 'You have no oxen left to pull your wagon.' };
        }

        return { isOver: false, reason: '' };
    };

    // Reset the game to initial state
    const resetGame = () => {
        setGameState(initialGameState);
    };

    // Force a specific event to occur
    const forceEvent = (eventType: string) => {
        const event = RANDOM_EVENTS.find(e => e.type === eventType) || RANDOM_EVENTS[0];

        updateGameState({
            inEvent: true,
            currentEvent: event,
            messages: [...gameState.messages, event.description]
        });
    };

    // Advance one day in the game
    const advanceDay = () => {
        // Check if game is paused or in event
        if (gameState.isPaused || gameState.inEvent) {
            return;
        }

        // Get current values for calculation
        const newDate = new Date(gameState.date);
        newDate.setDate(newDate.getDate() + 1);

        // Calculate food consumption
        const foodConsumed = calculateFoodConsumption();
        const newFood = Math.max(0, gameState.food - foodConsumed);

        // Calculate distance traveled
        const milesGained = calculateMilesTraveled();
        const newMiles = gameState.miles + milesGained;

        // Determine weather changes
        const newWeather = updateWeather();

        // Check for random events
        const randomEvent = checkForRandomEvent();

        // Update party health
        const newParty = updatePartyHealth(newFood === 0, newWeather);

        // Compose new game state
        const updatedState: Partial<GameState> = {
            date: newDate,
            miles: newMiles,
            food: newFood,
            weather: newWeather,
            party: newParty,
            messages: [
                ...gameState.messages,
                `Day ${getDayCount()}: Traveled ${milesGained} miles. ${newMiles} miles total.`
            ]
        };

        // If there's a random event, update state accordingly
        if (randomEvent) {
            updatedState.inEvent = true;
            updatedState.currentEvent = randomEvent;
            updatedState.messages = [
                ...updatedState.messages,
                randomEvent.description
            ];
        }

        // Check if reached a landmark
        const landmark = checkLandmark(newMiles);
        if (landmark) {
            updatedState.messages = [
                ...updatedState.messages,
                `You've reached ${landmark}.`
            ];
        }

        // Update the game state
        updateGameState(updatedState);
    };

    // Helper function to calculate food consumption based on party size and ration setting
    const calculateFoodConsumption = () => {
        const livingMembers = gameState.party.filter(member => member.health !== 'dead').length;
        let rationMultiplier = 1;

        switch(gameState.rations) {
            case 'filling':
                rationMultiplier = 1;
                break;
            case 'meager':
                rationMultiplier = 0.75;
                break;
            case 'bare bones':
                rationMultiplier = 0.5;
                break;
        }

        return Math.floor(livingMembers * GAME_CONSTANTS.FOOD_PER_PERSON_PER_DAY * rationMultiplier);
    };

    // Helper function to calculate miles traveled based on pace, weather, health
    const calculateMilesTraveled = () => {
        let paceMultiplier = 1;

        switch(gameState.pace) {
            case 'steady':
                paceMultiplier = 1;
                break;
            case 'strenuous':
                paceMultiplier = 1.5;
                break;
            case 'grueling':
                paceMultiplier = 2;
                break;
        }

        let weatherMultiplier = 1;

        switch(gameState.weather) {
            case 'good':
                weatherMultiplier = 1;
                break;
            case 'fair':
                weatherMultiplier = 0.9;
                break;
            case 'poor':
                weatherMultiplier = 0.75;
                break;
            case 'very poor':
                weatherMultiplier = 0.5;
                break;
        }

        // Check party health - if anyone is sick, travel is slower
        const healthyMembers = gameState.party.filter(member => member.health === 'good').length;
        const healthMultiplier = healthyMembers / gameState.party.length;

        // Check oxen count - fewer oxen means slower travel
        const oxenMultiplier = Math.min(1, gameState.oxen / 3);

        // Calculate final miles traveled
        return Math.floor(
            GAME_CONSTANTS.MILES_PER_DAY_HEALTHY *
            paceMultiplier *
            weatherMultiplier *
            healthMultiplier *
            oxenMultiplier
        );
    };

    // Helper function to update weather based on current month and random chance
    const updateWeather = () => {
        const month = gameState.date.getMonth();
        const weatherOptions = {
            // Different weather probabilities based on month
            // Spring (March-May): Generally good weather
            2: { good: 0.7, fair: 0.2, poor: 0.1, 'very poor': 0 },
            3: { good: 0.7, fair: 0.2, poor: 0.1, 'very poor': 0 },
            4: { good: 0.8, fair: 0.15, poor: 0.05, 'very poor': 0 },

            // Summer (June-August): Mostly good but can be very hot
            5: { good: 0.9, fair: 0.1, poor: 0, 'very poor': 0 },
            6: { good: 0.7, fair: 0.2, poor: 0.1, 'very poor': 0 },
            7: { good: 0.8, fair: 0.15, poor: 0.05, 'very poor': 0 },

            // Fall (September-November): Increasingly challenging
            8: { good: 0.6, fair: 0.3, poor: 0.1, 'very poor': 0 },
            9: { good: 0.4, fair: 0.3, poor: 0.2, 'very poor': 0.1 },
            10: { good: 0.2, fair: 0.3, poor: 0.3, 'very poor': 0.2 },

            // Winter (December-February): Very difficult
            11: { good: 0.1, fair: 0.2, poor: 0.4, 'very poor': 0.3 },
            0: { good: 0.1, fair: 0.1, poor: 0.3, 'very poor': 0.5 },
            1: { good: 0.2, fair: 0.2, poor: 0.3, 'very poor': 0.3 },
        } as Record<number, Record<string, number>>;

        // If the month is not in our weather table, use default good weather
        if (!weatherOptions[month]) {
            return 'good' as const;
        }

        // Weather tends to be persistent, so 50% chance to just keep current weather
        if (Math.random() < 0.5) {
            return gameState.weather;
        }

        // Otherwise, randomly select new weather based on month's probabilities
        const rand = Math.random();
        let cumulativeProbability = 0;

        for (const [weather, probability] of Object.entries(weatherOptions[month])) {
            cumulativeProbability += probability;
            if (rand <= cumulativeProbability) {
                return weather as 'good' | 'fair' | 'poor' | 'very poor';
            }
        }

        return 'good' as const; // Default fallback
    };

    // Helper function to check for random events
    const checkForRandomEvent = () => {
        // Base chance for an event (20% each day)
        if (Math.random() > 0.2) {
            return null;
        }

        // 40% chance for an interactive event vs 60% chance for a regular event
        if (Math.random() < 0.4) {
            // Return null here, but trigger an interactive event
            setTimeout(() => triggerInteractiveEvent(), 500);
            return null;
        }

        // Select a random regular event
        const eventIndex = Math.floor(Math.random() * RANDOM_EVENTS.length);
        return RANDOM_EVENTS[eventIndex];
    };

    // Helper function to update party health based on food, weather, and pace
    const updatePartyHealth = (noFood: boolean, weather: string) => {
        return gameState.party.map(member => {
            // Skip updating health for dead members
            if (member.health === 'dead') {
                return member;
            }

            // Calculate health risks based on various factors
            const foodRisk = noFood ? 0.3 : 0;

            let weatherRisk = 0;
            if (weather === 'poor') weatherRisk = 0.05;
            if (weather === 'very poor') weatherRisk = 0.15;

            let paceRisk = 0;
            if (gameState.pace === 'strenuous') paceRisk = 0.05;
            if (gameState.pace === 'grueling') paceRisk = 0.15;

            let rationRisk = 0;
            if (gameState.rations === 'meager') rationRisk = 0.05;
            if (gameState.rations === 'bare bones') rationRisk = 0.15;

            let clothingRisk = 0;
            if (gameState.clothing < gameState.party.length) {
                clothingRisk = 0.1;
            }

            // Current health risk
            let healthRisk = 0;
            if (member.health === 'fair') healthRisk = 0.1;
            if (member.health === 'poor') healthRisk = 0.2;

            // Calculate total risk of health deterioration
            const totalRisk = foodRisk + weatherRisk + paceRisk + rationRisk + clothingRisk + healthRisk;

            // Determine health change
            if (Math.random() < totalRisk) {
                // Health deteriorates
                if (member.health === 'good') {
                    return { ...member, health: 'fair' as const };
                }
                else if (member.health === 'fair') {
                    return { ...member, health: 'poor' as const };
                }
                else if (member.health === 'poor') {
                    return { ...member, health: 'dead' as const };
                }
            }

            // Chance of recovery if conditions are good
            const recoveryChance =
                !noFood &&
                weather === 'good' &&
                gameState.rations === 'filling' &&
                gameState.pace === 'steady' ? 0.2 : 0.05;

            if (Math.random() < recoveryChance) {
                // Health improves
                if (member.health === 'fair') {
                    return { ...member, health: 'good' as const };
                }
                else if (member.health === 'poor') {
                    return { ...member, health: 'fair' as const };
                }
            }

            // No change
            return member;
        });
    };

    // Helper function to check if reached landmark
    const checkLandmark = (miles: number) => {
        // Check for forts
        for (const fortMile of GAME_CONSTANTS.FORT_LOCATIONS) {
            if (gameState.miles < fortMile && miles >= fortMile) {
                return `Fort at mile ${fortMile}`;
            }
        }

        // Check for rivers
        for (const riverMile of GAME_CONSTANTS.RIVER_LOCATIONS) {
            if (gameState.miles < riverMile && miles >= riverMile) {
                return `River crossing at mile ${riverMile}`;
            }
        }

        return null;
    };

    // Helper function to get total days passed
    const getDayCount = () => {
        const startDate = new Date(1848, 3, 1); // April 1, 1848
        const currentDate = new Date(gameState.date);
        const diffTime = currentDate.getTime() - startDate.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to count the first day
    };

    const triggerInteractiveEvent = (eventId?: string) => {
        // If paused or already in an event, don't trigger a new one
        if (gameState.isPaused || gameState.inEvent) {
            return;
        }

        let event;
        if (eventId) {
            // Find specific event by ID
            event = INTERACTIVE_EVENTS.find(e => e.id === eventId);
        } else {
            // Pick a random event
            const eventIndex = Math.floor(Math.random() * INTERACTIVE_EVENTS.length);
            event = INTERACTIVE_EVENTS[eventIndex];
        }

        if (!event) {
            console.error('Event not found');
            return;
        }

        // Add event choices to the event for interactive handling
        const currentEvent = {
            ...event,
            type: 'interactive'
        };

        // Update game state
        updateGameState({
            inEvent: true,
            currentEvent,
            isPaused: true,
            messages: [...gameState.messages, event.description]
        });
    };

// Then add the new function to the context value:
    return (
        <GameContext.Provider
            value={{
                gameState,
                setPartyMembers,
                updateGameState,
                advanceDay,
                handleStore,
                huntingMinigame,
                checkGameOver,
                resetGame,
                forceEvent,
                triggerInteractiveEvent, // Add this line
            }}
        >
            {children}
        </GameContext.Provider>
    );
}

// Custom hook to use the game context
export function useGameContext() {
    const context = useContext(GameContext);
    if (context === undefined) {
        throw new Error('useGameContext must be used within a GameProvider');
    }
    return context;
}