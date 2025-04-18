// File: app/components/TravelScreen.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useGameContext } from '../context/GameContext';
import { playSound } from '../utils/gameUtils';
import HuntingMinigame from './HuntingMinigame';

export default function TravelScreen({ onScreenChange }: { onScreenChange: (screen: string) => void }) {
    const { gameState, updateGameState, advanceDay, checkGameOver, triggerInteractiveEvent } = useGameContext();
    const [travelMode, setTravelMode] = useState<'auto' | 'manual'>('manual');
    const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
    const [showSupplies, setShowSupplies] = useState(false);
    const [showParty, setShowParty] = useState(false);
    const [showMap, setShowMap] = useState(false);
    const [showHunting, setShowHunting] = useState(false);
    const prevMilesRef = useRef<number>();

    // Check for game over condition
    useEffect(() => {
        const gameOverCheck = checkGameOver();
        if (gameOverCheck.isOver) {
            // Stop auto-travel if it's running
            if (intervalId) {
                clearInterval(intervalId);
                setIntervalId(null);
            }

            // Show appropriate end screen
            if (gameOverCheck.reason === 'victory') {
                onScreenChange('victory');
            } else {
                updateGameState({ messages: [...gameState.messages, gameOverCheck.reason] });
                onScreenChange('gameover');
            }
        }
    }, [gameState, checkGameOver, onScreenChange, updateGameState, intervalId]);

    // Check for fort or river crossings
    useEffect(() => {
        // Constants from our game context
        const FORT_LOCATIONS = [300, 600, 900, 1200, 1500, 1800];
        const RIVER_LOCATIONS = [250, 550, 850, 1150, 1450, 1750];

        // Check if we're at a fort
        const atFort = FORT_LOCATIONS.includes(gameState.miles);

        // Check if we're at a river
        const atRiver = RIVER_LOCATIONS.includes(gameState.miles);

        if (atFort) {
            // Stop auto-travel
            if (intervalId) {
                clearInterval(intervalId);
                setIntervalId(null);
            }

            updateGameState({
                messages: [...gameState.messages, "You've reached a fort. You can rest and buy supplies here."],
                isPaused: true
            });

            onScreenChange('store');
        }

        if (atRiver) {
            // Stop auto-travel
            if (intervalId) {
                clearInterval(intervalId);
                setIntervalId(null);
            }

            updateGameState({
                messages: [...gameState.messages, "You've reached a river crossing."],
                isPaused: true
            });

            onScreenChange('river');
        }
    }, [gameState.miles, gameState.messages, intervalId, onScreenChange, updateGameState]);

    // Clean up interval on unmount
    useEffect(() => {
        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [intervalId]);

    // Check for milestone-based events
    useEffect(() => {
        // Don't trigger milestone events if already in an event or paused
        if (gameState.inEvent || gameState.isPaused) return;

        // Different events based on distance milestones
        const previousMiles = prevMilesRef.current;
        const currentMiles = gameState.miles;

        // Update the ref
        prevMilesRef.current = currentMiles;

        // Skip if this is the initial load
        if (previousMiles === undefined) return;

        // Mountain shortcuts opportunity (around 1000 miles)
        if (previousMiles < 1000 && currentMiles >= 1000) {
            setTimeout(() => triggerInteractiveEvent('mountain_shortcut'), 500);
        }

        // Lost child event (before halfway)
        if (previousMiles < 800 && currentMiles >= 800) {
            setTimeout(() => triggerInteractiveEvent('lost_child'), 500);
        }

        // Native encounter closer to the end
        if (previousMiles < 1600 && currentMiles >= 1600) {
            setTimeout(() => triggerInteractiveEvent('native_encounter'), 500);
        }

        // Weather-based events
        if (gameState.weather === 'very poor') {
            // Chance of frostbitten traveler during very poor weather
            if (Math.random() < 0.2) {
                setTimeout(() => triggerInteractiveEvent('frostbitten_traveler'), 500);
            }
        }

        // Food-based events
        if (gameState.food < 50 && previousMiles !== currentMiles) {
            // Chance of wild fruit or hunting party when food is low
            if (Math.random() < 0.3) {
                setTimeout(() =>
                        triggerInteractiveEvent(Math.random() < 0.5 ? 'wild_fruit' : 'hunting_party'),
                    500
                );
            }
        }

        // Health-based events
        const poorHealthCount = gameState.party.filter(member => member.health === 'poor').length;
        if (poorHealthCount > 1 && previousMiles !== currentMiles) {
            // Chance of disease outbreak when multiple people are in poor health
            if (Math.random() < 0.4) {
                setTimeout(() => triggerInteractiveEvent('disease_outbreak'), 500);
            }
        }
    }, [gameState.miles, gameState.weather, gameState.food, gameState.party, gameState.inEvent, gameState.isPaused, triggerInteractiveEvent]);

    // Handle auto travel
    const startAutoTravel = () => {
        // Clear any existing interval
        if (intervalId) {
            clearInterval(intervalId);
        }

        // Start new auto-travel interval
        const id = setInterval(() => {
            advanceDay();
        }, 1000); // Advance one day every second

        setIntervalId(id);
        setTravelMode('auto');
    };

    // Stop auto travel
    const stopAutoTravel = () => {
        if (intervalId) {
            clearInterval(intervalId);
            setIntervalId(null);
        }

        setTravelMode('manual');
    };

    // Handle events if we're in one
    useEffect(() => {
        if (gameState.inEvent) {
            // Stop auto-travel
            if (intervalId) {
                clearInterval(intervalId);
                setIntervalId(null);
            }

            // Check if it's an interactive event
            if (gameState.currentEvent?.type === 'interactive') {
                onScreenChange('interactive-event');
            } else {
                onScreenChange('event');
            }
        }
    }, [gameState.inEvent, gameState.currentEvent, intervalId, onScreenChange]);

    // Handle pace change
    const changePace = (pace: 'steady' | 'strenuous' | 'grueling') => {
        playSound('click');
        updateGameState({
            pace,
            messages: [...gameState.messages, `Changed pace to ${pace}.`]
        });
    };

    // Handle rations change
    const changeRations = (rations: 'filling' | 'meager' | 'bare bones') => {
        playSound('click');
        updateGameState({
            rations,
            messages: [...gameState.messages, `Changed food rations to ${rations}.`]
        });
    };

    // Handle hunting completion
    const handleHuntingComplete = (result: { food: number; bullets: number }) => {
        setShowHunting(false);

        updateGameState({
            food: gameState.food + result.food,
            ammunition: gameState.ammunition - result.bullets,
            messages: [
                ...gameState.messages,
                `Hunting complete. Used ${result.bullets} bullets and gained ${result.food} pounds of food.`
            ]
        });
    };

    // Convert miles to map position (percentage)
    const getMilePercentage = () => {
        return (gameState.miles / 2000) * 100;
    };

    // Render wagon position on map
    const getWagonPosition = () => {
        const percentage = getMilePercentage();

        // These are rough map calculations to match our SVG map
        if (percentage < 10) {
            return { left: `${8 + (percentage * 3)}%`, top: '66%' };
        } else if (percentage < 25) {
            return { left: `${20 + (percentage - 10) * 2.5}%`, top: `${66 - (percentage - 10) * 0.8}%` };
        } else if (percentage < 50) {
            return { left: `${40 + (percentage - 25) * 1.6}%`, top: `${54 - (percentage - 25) * 0.48}%` };
        } else if (percentage < 75) {
            return { left: `${64 + (percentage - 50) * 1.2}%`, top: `${42 - (percentage - 50) * 0.36}%` };
        } else {
            return { left: `${85 + (percentage - 75) * 0.6}%`, top: `${33 - (percentage - 75) * 0.24}%` };
        }
    };

    return (
        <div className="space-y-6">
            {showHunting ? (
                <HuntingMinigame onComplete={handleHuntingComplete} />
            ) : showMap ? (
                <div className="bg-blue-900 border border-blue-600 p-4 relative">
                    <h2 className="text-2xl text-blue-300 mb-4">Oregon Trail Map</h2>
                    <div className="relative">
                        <svg
                            viewBox="0 0 600 300"
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-full h-auto"
                        >
                            {/* Background terrain */}
                            <rect x="0" y="0" width="600" height="300" fill="#e9d8a6"/>

                            {/* Trail path */}
                            <path d="M 50,200 C 100,190 150,220 200,180 C 250,150 300,170 350,130 C 400,100 450,120 500,90 C 550,70 580,50 590,30"
                                  stroke="#8b5a2b" strokeWidth="8" fill="none" strokeDasharray="2"/>

                            {/* Mountains */}
                            <polygon points="400,80 420,40 440,80" fill="#6c757d"/>
                            <polygon points="430,90 450,30 470,90" fill="#6c757d"/>
                            <polygon points="460,100 480,50 500,100" fill="#6c757d"/>
                            <polygon points="490,75 510,25 530,75" fill="#6c757d"/>
                            <polygon points="520,85 540,35 560,85" fill="#6c757d"/>

                            {/* Rivers */}
                            <path d="M 250,20 C 260,60 240,100 250,140 C 260,180 240,220 250,260 C 260,280 240,290 250,300"
                                  stroke="#4895ef" strokeWidth="10" fill="none"/>
                            <path d="M 350,20 C 360,40 340,60 350,80 C 360,100 340,120 350,140 C 360,160 340,180 350,200 C 360,220 340,240 350,260 C 360,280 340,290 350,300"
                                  stroke="#4895ef" strokeWidth="8" fill="none"/>
                            <path d="M 450,20 C 460,40 440,60 450,80 C 460,100 440,120 450,140 C 460,160 440,180 450,200 C 460,220 440,240 450,260 C 460,280 440,290 450,300"
                                  stroke="#4895ef" strokeWidth="6" fill="none"/>

                            {/* Landmarks/Forts */}
                            <circle cx="50" cy="200" r="8" fill="#e63946"/>
                            <text x="40" y="220" fontFamily="monospace" fontSize="12" fill="#000">Independence</text>

                            <rect x="195" y="175" width="10" height="10" fill="#e63946"/>
                            <text x="185" y="195" fontFamily="monospace" fontSize="10" fill="#000">Fort Kearney</text>

                            <rect x="295" y="125" width="10" height="10" fill="#e63946"/>
                            <text x="285" y="145" fontFamily="monospace" fontSize="10" fill="#000">Fort Laramie</text>

                            <rect x="395" y="85" width="10" height="10" fill="#e63946"/>
                            <text x="385" y="105" fontFamily="monospace" fontSize="10" fill="#000">Fort Hall</text>

                            <rect x="495" y="45" width="10" height="10" fill="#e63946"/>
                            <text x="485" y="65" fontFamily="monospace" fontSize="10" fill="#000">Fort Walla Walla</text>

                            <circle cx="590" cy="30" r="8" fill="#2a9d8f"/>
                            <text x="565" y="20" fontFamily="monospace" fontSize="12" fill="#000">Oregon!</text>

                            {/* Legend */}
                            <rect x="20" y="20" width="120" height="80" fill="rgba(255,255,255,0.7)" rx="5"/>
                            <text x="30" y="40" fontFamily="monospace" fontSize="12" fontWeight="bold" fill="#000">LEGEND</text>
                            <circle cx="35" cy="55" r="5" fill="#e63946"/>
                            <text x="45" y="60" fontFamily="monospace" fontSize="10" fill="#000">Fort/Settlement</text>
                            <line x1="30" y1="75" x2="50" y2="75" stroke="#8b5a2b" strokeWidth="4" strokeDasharray="1"/>
                            <text x="55" y="80" fontFamily="monospace" fontSize="10" fill="#000">Oregon Trail</text>
                            <line x1="30" y1="95" x2="50" y2="95" stroke="#4895ef" strokeWidth="4"/>
                            <text x="55" y="100" fontFamily="monospace" fontSize="10" fill="#000">River</text>
                        </svg>

                        {/* Wagon position marker */}
                        <div
                            className="absolute w-8 h-8"
                            style={{
                                ...getWagonPosition(),
                                transform: 'translate(-50%, -50%)'
                            }}
                        >
                            <svg
                                viewBox="0 0 100 50"
                                xmlns="http://www.w3.org/2000/svg"
                                className="w-full h-full"
                            >
                                <rect x="20" y="20" width="60" height="20" fill="#B8860B"/>
                                <path d="M 20,20 Q 50,5 80,20" fill="none" stroke="#EEEEDD" strokeWidth="3"/>
                                <circle cx="25" cy="40" r="5" fill="#8B4513"/>
                                <circle cx="75" cy="40" r="5" fill="#8B4513"/>
                            </svg>
                        </div>
                    </div>
                    <div className="text-center mt-4">
                        <button
                            className="bg-blue-700 hover:bg-blue-600 px-4 py-2 rounded"
                            onClick={() => setShowMap(false)}
                        >
                            Return to Travel
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    <div className="h-48 bg-green-900 border border-green-500 p-4 overflow-y-auto message-log">
                        {gameState.messages.slice(-10).map((message, index) => (
                            <div key={index} className="mb-2">
                                &gt; {message}
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <div className="flex space-x-2">
                                <button
                                    className={`px-3 py-1 rounded ${travelMode === 'manual' ? 'bg-green-700' : 'bg-gray-700'}`}
                                    onClick={() => {
                                        playSound('click');
                                        advanceDay();
                                        stopAutoTravel();
                                    }}
                                >
                                    Travel 1 Day
                                </button>

                                {travelMode === 'auto' ? (
                                    <button
                                        className="bg-red-700 hover:bg-red-600 px-3 py-1 rounded"
                                        onClick={() => {
                                            playSound('click');
                                            stopAutoTravel();
                                        }}
                                    >
                                        Stop Travel
                                    </button>
                                ) : (
                                    <button
                                        className="bg-blue-700 hover:bg-blue-600 px-3 py-1 rounded"
                                        onClick={() => {
                                            playSound('click');
                                            startAutoTravel();
                                        }}
                                    >
                                        Auto Travel
                                    </button>
                                )}
                            </div>

                            <div className="space-y-1">
                                <div className="text-green-400">Travel Pace:</div>
                                <div className="flex space-x-2">
                                    <button
                                        className={`px-2 py-1 rounded text-sm ${gameState.pace === 'steady' ? 'bg-green-700' : 'bg-gray-700'}`}
                                        onClick={() => changePace('steady')}
                                    >
                                        Steady
                                    </button>
                                    <button
                                        className={`px-2 py-1 rounded text-sm ${gameState.pace === 'strenuous' ? 'bg-green-700' : 'bg-gray-700'}`}
                                        onClick={() => changePace('strenuous')}
                                    >
                                        Strenuous
                                    </button>
                                    <button
                                        className={`px-2 py-1 rounded text-sm ${gameState.pace === 'grueling' ? 'bg-green-700' : 'bg-gray-700'}`}
                                        onClick={() => changePace('grueling')}
                                    >
                                        Grueling
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <div className="text-green-400">Food Rations:</div>
                                <div className="flex space-x-2">
                                    <button
                                        className={`px-2 py-1 rounded text-sm ${gameState.rations === 'filling' ? 'bg-green-700' : 'bg-gray-700'}`}
                                        onClick={() => changeRations('filling')}
                                    >
                                        Filling
                                    </button>
                                    <button
                                        className={`px-2 py-1 rounded text-sm ${gameState.rations === 'meager' ? 'bg-green-700' : 'bg-gray-700'}`}
                                        onClick={() => changeRations('meager')}
                                    >
                                        Meager
                                    </button>
                                    <button
                                        className={`px-2 py-1 rounded text-sm ${gameState.rations === 'bare bones' ? 'bg-green-700' : 'bg-gray-700'}`}
                                        onClick={() => changeRations('bare bones')}
                                    >
                                        Bare Bones
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <button
                                className="bg-yellow-700 hover:bg-yellow-600 px-3 py-1 rounded w-full"
                                onClick={() => setShowSupplies(!showSupplies)}
                            >
                                {showSupplies ? 'Hide Supplies' : 'Show Supplies'}
                            </button>

                            {showSupplies && (
                                <div className="bg-black border border-green-500 p-3 space-y-1">
                                    <div>Food: {gameState.food} pounds</div>
                                    <div>Ammunition: {gameState.ammunition} bullets</div>
                                    <div>Spare Parts:
                                        {gameState.spareWheels} wheels,
                                        {gameState.spareAxles} axles,
                                        {gameState.spareTongues} tongues
                                    </div>
                                </div>
                            )}

                            <button
                                className="bg-purple-700 hover:bg-purple-600 px-3 py-1 rounded w-full"
                                onClick={() => setShowParty(!showParty)}
                            >
                                {showParty ? 'Hide Party' : 'Show Party'}
                            </button>

                            {showParty && (
                                <div className="bg-black border border-green-500 p-3 space-y-1">
                                    {gameState.party.map((member, index) => (
                                        <div key={index} className="flex justify-between">
                                            <div>{member.name}</div>
                                            <div className={
                                                member.health === 'good' ? 'text-green-400' :
                                                    member.health === 'fair' ? 'text-yellow-400' :
                                                        member.health === 'poor' ? 'text-red-400' :
                                                            'text-gray-400'
                                            }>
                                                {member.health}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="flex space-x-2">
                                <button
                                    className="bg-blue-700 hover:bg-blue-600 px-3 py-1 rounded flex-1"
                                    onClick={() => setShowMap(true)}
                                >
                                    View Map
                                </button>

                                <button
                                    className="bg-yellow-700 hover:bg-yellow-600 px-3 py-1 rounded flex-1"
                                    onClick={() => {
                                        playSound('click');
                                        updateGameState({ isPaused: true });
                                        onScreenChange('camping');
                                    }}
                                >
                                    Make Camp
                                </button>
                            </div>

                            <button
                                className="bg-red-700 hover:bg-red-600 px-3 py-1 rounded w-full mt-2"
                                onClick={() => setShowHunting(true)}
                                disabled={gameState.ammunition < 10}
                            >
                                Go Hunting
                            </button>
                        </div>
                    </div>

                    <div className="h-6 w-full bg-gray-800 border border-gray-500 rounded">
                        <div
                            className="h-full bg-green-600 rounded"
                            style={{ width: `${(gameState.miles / 2000) * 100}%` }}
                        ></div>
                    </div>
                    <div className="text-center text-sm">Progress to Oregon: {Math.floor((gameState.miles / 2000) * 100)}%</div>
                </>
            )}
        </div>
    );
}