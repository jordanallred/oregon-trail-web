// File: app/components/CampingScreen.tsx
'use client';

import { useState } from 'react';
import { useGameContext } from '../context/GameContext';
import { playSound } from '../utils/gameUtils';

export default function CampingScreen({ onScreenChange }: { onScreenChange: (screen: string) => void }) {
    const { gameState, updateGameState, triggerInteractiveEvent } = useGameContext();
    const [showActivities, setShowActivities] = useState(false);
    const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
    const [activityResult, setActivityResult] = useState<string | null>(null);

    // Activities and their effects
    const campingActivities = [
        {
            id: 'rest',
            name: 'Rest and Recover',
            description: 'Focus on resting to improve health and morale.',
            action: () => {
                // Chance for everyone to improve health slightly
                const updatedParty = gameState.party.map(member => {
                    if (member.health === 'fair' && Math.random() < 0.4) {
                        return { ...member, health: 'good' as const };
                    } else if (member.health === 'poor' && Math.random() < 0.3) {
                        return { ...member, health: 'fair' as const };
                    }
                    return member;
                });

                // Update game state
                updateGameState({
                    party: updatedParty,
                });

                // Set result message
                setActivityResult('Your party rests well for the night. Some members appear to be in better health by morning.');
            }
        },
        {
            id: 'hunt',
            name: 'Night Hunting',
            description: 'Hunt by moonlight to gather more food.',
            action: () => {
                // Check if have ammunition
                if (gameState.ammunition < 5) {
                    setActivityResult('You don\'t have enough ammunition to go hunting.');
                    return;
                }

                // Calculate success
                const huntSuccess = Math.random();
                let foodGained = 0;
                let bulletsUsed = Math.floor(Math.random() * 3) + 3; // 3-5 bullets

                if (huntSuccess < 0.3) {
                    // Poor hunt
                    foodGained = Math.floor(Math.random() * 5) + 5; // 5-10 food
                    setActivityResult(`Night hunting was difficult. You only got ${foodGained} pounds of food and used ${bulletsUsed} bullets.`);
                } else if (huntSuccess < 0.7) {
                    // Average hunt
                    foodGained = Math.floor(Math.random() * 10) + 15; // 15-25 food
                    setActivityResult(`The night hunt was fairly successful. You got ${foodGained} pounds of food and used ${bulletsUsed} bullets.`);
                } else {
                    // Great hunt
                    foodGained = Math.floor(Math.random() * 15) + 25; // 25-40 food
                    setActivityResult(`The night hunt was excellent! You got ${foodGained} pounds of food and used ${bulletsUsed} bullets.`);
                }

                // Update game state
                updateGameState({
                    food: gameState.food + foodGained,
                    ammunition: gameState.ammunition - bulletsUsed,
                    messages: [...gameState.messages, `Night hunting yielded ${foodGained} pounds of food.`]
                });

                // Small chance for a thief encounter if successful hunt
                if (huntSuccess >= 0.7 && Math.random() < 0.3) {
                    // Queue the thief event for when they return to camp
                    setTimeout(() => {
                        triggerInteractiveEvent('thief_in_camp');
                    }, 3000);
                }
            }
        },
        {
            id: 'repair',
            name: 'Repair Equipment',
            description: 'Spend time fixing your wagon and equipment.',
            action: () => {
                // Check if any repairs are needed (just in case)
                let repairMade = false;
                let repairMessage = '';

                // Check if we can make a wagon part with existing materials
                if (Math.random() < 0.3 && gameState.spareTongues < 2) {
                    updateGameState({
                        spareTongues: gameState.spareTongues + 1,
                    });
                    repairMade = true;
                    repairMessage = 'You crafted a spare wagon tongue from nearby materials.';
                } else if (Math.random() < 0.2 && gameState.spareWheels < 2) {
                    updateGameState({
                        spareWheels: gameState.spareWheels + 1,
                    });
                    repairMade = true;
                    repairMessage = 'You repaired a damaged wheel, adding it to your spare parts.';
                }

                if (!repairMade) {
                    repairMessage = 'You spend time maintaining your equipment. Everything seems to be in good condition now.';
                }

                setActivityResult(repairMessage);
                updateGameState({
                    messages: [...gameState.messages, repairMessage]
                });
            }
        },
        {
            id: 'socialize',
            name: 'Socialize with Other Travelers',
            description: 'Meet other people on the trail to share information.',
            action: () => {
                // Random chance to gain valuable information or trigger events
                const socialOutcome = Math.random();

                if (socialOutcome < 0.3) {
                    // Learn about weather
                    const weatherForecast = "You hear from other travelers that the weather ahead should be favorable for the next few days.";
                    setActivityResult(weatherForecast);
                    updateGameState({
                        messages: [...gameState.messages, weatherForecast]
                    });
                } else if (socialOutcome < 0.6) {
                    // Learn about trail conditions
                    const trailInfo = "Other travelers mention that there's a difficult river crossing about 100 miles ahead. They suggest preparing for it.";
                    setActivityResult(trailInfo);
                    updateGameState({
                        messages: [...gameState.messages, trailInfo]
                    });
                } else if (socialOutcome < 0.9) {
                    // Learn about nearby resources
                    const resourceInfo = "You learn about a good hunting spot just a few miles ahead. Game should be plentiful there.";
                    setActivityResult(resourceInfo);
                    updateGameState({
                        messages: [...gameState.messages, resourceInfo]
                    });
                } else {
                    // Meet someone interesting
                    setActivityResult("You meet an interesting traveler with stories to share around the campfire. The morale in your camp improves.");

                    // Queue an interactive event for morning
                    setTimeout(() => {
                        const randomEvent = Math.random();
                        if (randomEvent < 0.33) {
                            triggerInteractiveEvent('hunting_party');
                        } else if (randomEvent < 0.66) {
                            triggerInteractiveEvent('abandoned_wagon');
                        } else {
                            triggerInteractiveEvent('native_encounter');
                        }
                    }, 3000);
                }
            }
        }
    ];

    // Handle selecting an activity
    const handleActivitySelect = (activity: any) => {
        playSound('click');
        setSelectedActivity(activity.id);
        activity.action();
    };

    // Handle continuing journey
    const handleContinue = () => {
        playSound('click');

        // Create a new date for the next day
        const newDate = new Date(gameState.date);
        newDate.setDate(newDate.getDate() + 1);

        // Calculate food consumption for camping
        const livingMembers = gameState.party.filter(member => member.health !== 'dead').length;
        const foodConsumed = livingMembers * 2; // 2 pounds per person per night

        // Update game state
        updateGameState({
            date: newDate,
            food: Math.max(0, gameState.food - foodConsumed),
            isPaused: false,
            messages: [...gameState.messages, `Morning has come. You consumed ${foodConsumed} pounds of food overnight.`]
        });

        // Return to travel screen
        onScreenChange('travel');
    };

    // Check for night event
    const checkForNightEvent = () => {
        // 20% chance of night event
        if (Math.random() < 0.2) {
            // Possible night events
            const nightEvents = ['thief_in_camp', 'snake_pit'];
            const randomEventIndex = Math.floor(Math.random() * nightEvents.length);

            triggerInteractiveEvent(nightEvents[randomEventIndex]);
        }
    };

    return (
        <div className="bg-gray-900 border border-yellow-700 p-4">
            <h2 className="text-2xl text-yellow-400 mb-4">Camp for the Night</h2>

            {!showActivities ? (
                <>
                    <p className="mb-6">You've decided to make camp for the night. Before resting, would you like to do anything?</p>

                    <div className="flex space-x-4">
                        <button
                            className="bg-blue-700 hover:bg-blue-600 px-4 py-2 rounded"
                            onClick={() => {
                                playSound('click');
                                setShowActivities(true);
                            }}
                        >
                            Choose Activities
                        </button>

                        <button
                            className="bg-green-700 hover:bg-green-600 px-4 py-2 rounded"
                            onClick={() => {
                                playSound('click');
                                checkForNightEvent();
                                handleContinue();
                            }}
                        >
                            Just Rest
                        </button>
                    </div>
                </>
            ) : activityResult ? (
                <>
                    <div className="bg-gray-800 p-4 border border-yellow-600 mb-6">
                        <h3 className="text-yellow-300 mb-2">Activity Result</h3>
                        <p>{activityResult}</p>
                    </div>

                    <button
                        className="bg-green-700 hover:bg-green-600 px-4 py-2 rounded"
                        onClick={handleContinue}
                    >
                        Rest for the Night
                    </button>
                </>
            ) : (
                <>
                    <p className="mb-4">What would you like to do at camp tonight?</p>

                    <div className="space-y-3 mb-6">
                        {campingActivities.map((activity) => (
                            <div
                                key={activity.id}
                                className={`p-3 border rounded cursor-pointer ${
                                    selectedActivity === activity.id
                                        ? 'border-yellow-500 bg-yellow-900'
                                        : 'border-gray-700 hover:border-gray-500'
                                }`}
                                onClick={() => handleActivitySelect(activity)}
                            >
                                <h3 className="font-bold">{activity.name}</h3>
                                <p className="text-sm">{activity.description}</p>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}