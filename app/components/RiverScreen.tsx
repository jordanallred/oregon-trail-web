// File: app/components/RiverScreen.tsx
'use client';

import { useState } from 'react';
import { useGameContext } from '../context/GameContext';

export default function RiverScreen({ onScreenChange }: { onScreenChange: (screen: string) => void }) {
    const { gameState, updateGameState } = useGameContext();
    const [choice, setChoice] = useState<'ford' | 'ferry' | 'wait' | null>(null);
    const [showInfo, setShowInfo] = useState(true);

    // Generate river information
    const riverDepth = Math.floor(Math.random() * 10) + 1; // 1-10 feet
    const riverWidth = Math.floor(Math.random() * 100) + 50; // 50-150 feet

    const ferryPrice = Math.floor(Math.random() * 20) + 5; // $5-$25

    const handleCrossing = () => {
        if (!choice) return;

        let messages = [...gameState.messages];
        let additionalUpdates: Partial<typeof gameState> = {};

        switch(choice) {
            case 'ford':
                // Attempt to ford the river - dangerous if deep
                if (riverDepth > 3) {
                    // Danger increases with depth
                    const dangerFactor = (riverDepth - 3) / 7; // 0-1 scale

                    if (Math.random() < dangerFactor) {
                        // Disaster - lose supplies or people
                        const disasterType = Math.random();

                        if (disasterType < 0.3) {
                            // Lose food
                            const foodLost = Math.floor(gameState.food * 0.3);
                            messages.push(`Disaster! Your wagon tipped while crossing. You lost ${foodLost} pounds of food.`);
                            additionalUpdates.food = Math.max(0, gameState.food - foodLost);
                        }
                        else if (disasterType < 0.6) {
                            // Lose supplies
                            messages.push("Disaster! Your wagon tipped while crossing. You lost some supplies.");
                            additionalUpdates.ammunition = Math.max(0, gameState.ammunition - Math.floor(gameState.ammunition * 0.3));
                            additionalUpdates.clothing = Math.max(0, gameState.clothing - Math.floor(gameState.clothing * 0.3));
                        }
                        else {
                            // Someone might drown - very dangerous
                            if (gameState.party.some(member => member.health !== 'dead')) {
                                const livingMembers = gameState.party.filter(member => member.health !== 'dead');
                                const randomIndex = Math.floor(Math.random() * livingMembers.length);
                                const unluckyMember = livingMembers[randomIndex];

                                if (Math.random() < 0.5) {
                                    // They survive but get sick
                                    const updatedParty = gameState.party.map(member => {
                                        if (member.name === unluckyMember.name) {
                                            messages.push(`${member.name} nearly drowned crossing the river and is now in poor health.`);
                                            return { ...member, health: 'poor' as const };
                                        }
                                        return member;
                                    });

                                    additionalUpdates.party = updatedParty;
                                } else {
                                    // They drown
                                    const updatedParty = gameState.party.map(member => {
                                        if (member.name === unluckyMember.name) {
                                            messages.push(`${member.name} drowned while crossing the river.`);
                                            return { ...member, health: 'dead' as const };
                                        }
                                        return member;
                                    });

                                    additionalUpdates.party = updatedParty;
                                }
                            }
                        }
                    } else {
                        // Success but challenging
                        messages.push("You successfully forded the river, though it was difficult.");
                    }
                } else {
                    // Easy crossing
                    messages.push("You safely forded the river. The crossing was easy.");
                }
                break;

            case 'ferry':
                // Pay for ferry - safe but costs money
                if (gameState.money >= ferryPrice) {
                    messages.push(`You paid $${ferryPrice} to safely cross on the ferry.`);
                    additionalUpdates.money = gameState.money - ferryPrice;
                } else {
                    messages.push("You don't have enough money for the ferry. You'll need to choose another option.");
                    setChoice(null);
                    return;
                }
                break;

            case 'wait':
                // Wait for conditions to improve
                const daysWaited = Math.floor(Math.random() * 3) + 1;
                const newDate = new Date(gameState.date);
                newDate.setDate(newDate.getDate() + daysWaited);

                // Consume food while waiting
                const livingMembers = gameState.party.filter(member => member.health !== 'dead').length;
                const foodConsumed = livingMembers * daysWaited * 2; // 2 pounds per person per day

                messages.push(`You waited ${daysWaited} days for better conditions.`);
                additionalUpdates.date = newDate;
                additionalUpdates.food = Math.max(0, gameState.food - foodConsumed);

                // River is now easier to cross
                messages.push("The river seems a bit calmer now. You decide to ford it.");
                // 80% chance of success after waiting
                if (Math.random() > 0.2) {
                    messages.push("You crossed the river safely.");
                } else {
                    const foodLost = Math.floor(gameState.food * 0.15);
                    messages.push(`There were still some challenges crossing. You lost ${foodLost} pounds of food.`);
                    additionalUpdates.food = Math.max(0, gameState.food - foodLost);
                }
                break;
        }

        // Resume travel
        updateGameState({
            ...additionalUpdates,
            messages,
            isPaused: false
        });

        onScreenChange('travel');
    };

    return (
        <div className="space-y-6">
            {showInfo && (
                <div className="bg-blue-900 border border-blue-500 p-4 mb-4">
                    <h2 className="text-2xl text-blue-300 mb-2">River Crossing</h2>
                    <p className="mb-2">You've reached a river {riverWidth} feet wide and {riverDepth} feet deep.</p>
                    <p className="mb-4">You need to decide how to cross.</p>
                    <button
                        className="bg-blue-700 hover:bg-blue-600 px-3 py-1 rounded"
                        onClick={() => setShowInfo(false)}
                    >
                        Continue
                    </button>
                </div>
            )}

            {!showInfo && (
                <div className="bg-black border border-green-500 p-4">
                    <h2 className="text-2xl text-blue-400 mb-4">How will you cross the river?</h2>

                    <div className="space-y-4">
                        <div
                            className={`p-3 border rounded cursor-pointer ${choice === 'ford' ? 'border-green-500 bg-green-900' : 'border-gray-700'}`}
                            onClick={() => setChoice('ford')}
                        >
                            <h3 className="font-bold">Attempt to ford the river</h3>
                            <p className="text-sm">Cross the river with your wagon. {riverDepth > 3 ? 'Warning: The river is deep and may be dangerous.' : 'The river seems shallow enough to cross safely.'}</p>
                        </div>

                        <div
                            className={`p-3 border rounded cursor-pointer ${choice === 'ferry' ? 'border-green-500 bg-green-900' : 'border-gray-700'}`}
                            onClick={() => setChoice('ferry')}
                        >
                            <h3 className="font-bold">Take the ferry (${ ferryPrice })</h3>
                            <p className="text-sm">Pay for a safe crossing. You have ${gameState.money} remaining.</p>
                        </div>

                        <div
                            className={`p-3 border rounded cursor-pointer ${choice === 'wait' ? 'border-green-500 bg-green-900' : 'border-gray-700'}`}
                            onClick={() => setChoice('wait')}
                        >
                            <h3 className="font-bold">Wait for conditions to improve</h3>
                            <p className="text-sm">Rest a few days and hope for better conditions. This will consume food.</p>
                        </div>

                        <div className="mt-6">
                            <button
                                className={`px-4 py-2 rounded ${choice ? 'bg-green-700 hover:bg-green-600' : 'bg-gray-700 cursor-not-allowed'}`}
                                onClick={handleCrossing}
                                disabled={!choice}
                            >
                                Proceed
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}