// File: app/utils/gameUtils.ts

// Sound effect functions
export const playSound = (soundType: 'click' | 'success' | 'error' | 'event' | 'river' | 'hunt') => {
    // In a real implementation, we would play actual sounds
    // This is a placeholder for the sound functionality
    console.log(`Playing sound: ${soundType}`);

    // Here we would use the Web Audio API or HTML5 audio elements
    // Example:
    // const audio = new Audio(`/sounds/${soundType}.mp3`);
    // audio.play();
};

// Game event probability calculator
export const calculateEventProbability = (
    baseChance: number,
    pace: 'steady' | 'strenuous' | 'grueling',
    weather: 'good' | 'fair' | 'poor' | 'very poor'
): number => {
    let modifier = 0;

    // Pace affects event chance
    if (pace === 'strenuous') modifier += 0.05;
    if (pace === 'grueling') modifier += 0.1;

    // Weather affects event chance
    if (weather === 'fair') modifier += 0.02;
    if (weather === 'poor') modifier += 0.05;
    if (weather === 'very poor') modifier += 0.1;

    return Math.min(baseChance + modifier, 0.95); // Cap at 95% chance
};

// Helper to format money values
export const formatMoney = (amount: number): string => {
    return `$${amount.toFixed(2)}`;
};

// Helper to format date
export const formatDate = (date: Date): string => {
    const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };
    return date.toLocaleDateString('en-US', options);
};

// Calculate travel time between two distances
export const calculateTravelTime = (
    startMiles: number,
    endMiles: number,
    pace: 'steady' | 'strenuous' | 'grueling',
    oxenCount: number
): number => {
    const distance = endMiles - startMiles;

    // Base miles per day
    let milesPerDay = 20;

    // Adjust for pace
    if (pace === 'steady') milesPerDay *= 1;
    if (pace === 'strenuous') milesPerDay *= 1.5;
    if (pace === 'grueling') milesPerDay *= 2;

    // Adjust for oxen count (more oxen = slightly faster travel)
    milesPerDay *= (1 + Math.min(oxenCount - 2, 4) * 0.05);

    // Calculate days
    return Math.ceil(distance / milesPerDay);
};

// Random name generator for NPCs at forts, etc.
export const generateRandomName = (): string => {
    const firstNames = [
        'John', 'Mary', 'William', 'Sarah', 'James', 'Elizabeth', 'George', 'Martha',
        'Thomas', 'Catherine', 'Joseph', 'Margaret', 'Charles', 'Anna', 'Henry', 'Jane'
    ];

    const lastNames = [
        'Smith', 'Jones', 'Williams', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore',
        'Taylor', 'Anderson', 'Thomas', 'Jackson', 'White', 'Harris', 'Clark', 'Lewis'
    ];

    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];

    return `${firstName} ${lastName}`;
};

// Calculate score for hunting mini-game
export const calculateHuntingScore = (
    clickSpeed: number,
    accuracy: number
): number => {
    // Higher clickSpeed and accuracy = better score
    return Math.floor((clickSpeed * 0.4 + accuracy * 0.6) * 100);
};

// Helper to save/load game state (could be expanded to use localStorage)
export const saveGameState = (gameState: any): void => {
    // In a real implementation, we would save to localStorage or a backend
    const serialized = JSON.stringify(gameState);
    localStorage.setItem('oregonTrailSave', serialized);
    console.log('Game saved!');
};

export const loadGameState = (): any | null => {
    // In a real implementation, we would load from localStorage or a backend
    const saved = localStorage.getItem('oregonTrailSave');
    if (!saved) return null;

    try {
        return JSON.parse(saved);
    } catch (e) {
        console.error('Failed to load saved game', e);
        return null;
    }
};

// Helper to determine a good riverCrossing method based on conditions
export const suggestRiverCrossingMethod = (
    riverDepth: number,
    money: number,
    ferryPrice: number
): 'ford' | 'ferry' | 'wait' => {
    // If river is shallow, fording is safe
    if (riverDepth <= 3) return 'ford';

    // If we have money and the river is deep, ferry is best
    if (money >= ferryPrice && riverDepth > 3) return 'ferry';

    // If the river is dangerous and we can't afford ferry, waiting is safest
    if (riverDepth > 6) return 'wait';

    // Otherwise, take a chance with fording
    return 'ford';
};