// File: app/components/HuntingMinigame.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useGameContext } from '../context/GameContext';

// Define the Animal type
interface Animal {
    id: number;
    type: 'deer' | 'bison' | 'rabbit' | 'squirrel';
    x: number;
    y: number;
    direction: 'left' | 'right';
    hit: boolean;
}

export default function HuntingMinigame({
                                            onComplete
                                        }: {
    onComplete: (result: { food: number; bullets: number }) => void
}) {
    const { gameState } = useGameContext();
    const [animals, setAnimals] = useState<Animal[]>([]);
    const [bulletsUsed, setBulletsUsed] = useState(0);
    const [timeLeft, setTimeLeft] = useState(40);
    const [foodGained, setFoodGained] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const [showInstructions, setShowInstructions] = useState(true);
    const [hunterPosition, setHunterPosition] = useState(200);

    const gameAreaRef = useRef<HTMLDivElement>(null);

    // Hard-coded animals that are guaranteed to appear
    const staticAnimals: Animal[] = [
        { id: 1, type: 'deer', x: 150, y: 80, direction: 'right', hit: false },
        { id: 2, type: 'bison', x: 400, y: 50, direction: 'left', hit: false },
        { id: 3, type: 'rabbit', x: 280, y: 120, direction: 'right', hit: false }
    ];

    // Start the game
    const startGame = () => {
        setShowInstructions(false);
        setIsActive(true);
        setHunterPosition(200);
        // Use the static animals instead of generating random ones
        setAnimals(staticAnimals);
    };

    // Handle mouse movement
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!gameAreaRef.current || !isActive) return;

        const rect = gameAreaRef.current.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;

        // Move hunter based on mouse position
        setHunterPosition(Math.min(Math.max(50, mouseX), rect.width - 50));
    };

    // Handle shooting
    const handleShoot = () => {
        if (!isActive || bulletsUsed >= 20) return;

        // Increase bullets used
        setBulletsUsed(prev => prev + 1);

        // Check if any animal was hit
        setAnimals(prevAnimals => {
            let foodAdded = 0;

            const updatedAnimals = prevAnimals.map(animal => {
                if (animal.hit) return animal;

                // Check if hunter's position aligns with animal
                const isHit = Math.abs(hunterPosition - animal.x) < 25;

                if (isHit) {
                    // Calculate food based on animal type
                    if (animal.type === 'deer') foodAdded = 60;
                    else if (animal.type === 'bison') foodAdded = 100;
                    else if (animal.type === 'rabbit') foodAdded = 10;
                    else foodAdded = 2;
                }

                return {
                    ...animal,
                    hit: animal.hit || isHit
                };
            });

            if (foodAdded > 0) {
                setFoodGained(prev => prev + foodAdded);
            }

            return updatedAnimals;
        });
    };

    // Handle key presses
    useEffect(() => {
        if (!isActive) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (!gameAreaRef.current) return;

            const { width } = gameAreaRef.current.getBoundingClientRect();

            // Move left
            if (e.key === 'ArrowLeft' || e.key === 'a') {
                setHunterPosition(prev => Math.max(50, prev - 10));
            }
            // Move right
            else if (e.key === 'ArrowRight' || e.key === 'd') {
                setHunterPosition(prev => Math.min(width - 50, prev + 10));
            }
            // Shoot
            else if (e.key === ' ' || e.key === 'Enter') {
                handleShoot();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isActive]);

    // Timer countdown
    useEffect(() => {
        if (!isActive) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    setIsActive(false);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isActive]);

    // Move animals
    useEffect(() => {
        if (!isActive || !gameAreaRef.current) return;

        const { width } = gameAreaRef.current.getBoundingClientRect();

        const interval = setInterval(() => {
            setAnimals(prevAnimals => {
                return prevAnimals.map(animal => {
                    if (animal.hit) return animal;

                    let newX = animal.x;
                    if (animal.direction === 'right') {
                        newX += 2;
                    } else {
                        newX -= 2;
                    }

                    // Check if out of bounds and reverse direction
                    if (newX > width - 20) {
                        return { ...animal, x: width - 20, direction: 'left' };
                    } else if (newX < 20) {
                        return { ...animal, x: 20, direction: 'right' };
                    }

                    return { ...animal, x: newX };
                });
            });
        }, 100);

        return () => clearInterval(interval);
    }, [isActive]);

    return (
        <div className="bg-black border border-green-500 p-4 w-full text-green-400 font-mono">
            {showInstructions ? (
                <div className="text-center space-y-4">
                    <h2 className="text-2xl text-green-400 mb-4">HUNTING</h2>
                    <div className="bg-black p-4 border border-green-500 mx-auto max-w-md">
                        <p className="mb-4">You're going hunting for food.</p>
                        <p className="mb-4">Use your mouse or arrow keys to move and click or press SPACE to shoot.</p>
                        <p className="mb-4">You have 40 seconds and 20 bullets.</p>
                        <div className="my-6 text-left">
                            <div className="grid grid-cols-2 gap-4">
                                <div>Squirrel - 2 lbs</div>
                                <div>Rabbit - 10 lbs</div>
                                <div>Deer - 60 lbs</div>
                                <div>Bison - 100 lbs</div>
                            </div>
                        </div>
                    </div>
                    <button
                        className="bg-green-700 hover:bg-green-600 p-2 rounded mt-4 w-40 mx-auto block"
                        onClick={startGame}
                    >
                        START HUNTING
                    </button>
                </div>
            ) : (
                <>
                    <div className="flex justify-between mb-2 border-b border-green-500 pb-2">
                        <div>Time: {timeLeft}s</div>
                        <div>Bullets: {20 - bulletsUsed}</div>
                        <div>Food: {foodGained} lbs</div>
                    </div>

                    <div
                        ref={gameAreaRef}
                        className="bg-black w-full h-64 relative overflow-hidden cursor-crosshair border border-green-500"
                        onMouseMove={handleMouseMove}
                        onClick={handleShoot}
                    >
                        {/* Trees (static) */}
                        <div className="absolute" style={{ left: '80px', top: '150px' }}>
                            <div className="w-16 h-20 relative">
                                <div className="absolute w-10 h-2 bg-green-500" style={{left: '3px', top: '0px'}}></div>
                                <div className="absolute w-12 h-2 bg-green-500" style={{left: '2px', top: '2px'}}></div>
                                <div className="absolute w-14 h-2 bg-green-500" style={{left: '1px', top: '4px'}}></div>
                                <div className="absolute w-16 h-2 bg-green-500" style={{left: '0px', top: '6px'}}></div>
                                <div className="absolute w-14 h-2 bg-green-500" style={{left: '1px', top: '8px'}}></div>
                                <div className="absolute w-12 h-2 bg-green-500" style={{left: '2px', top: '10px'}}></div>
                                <div className="absolute w-2 h-6 bg-orange-600" style={{left: '7px', top: '12px'}}></div>
                            </div>
                        </div>

                        <div className="absolute" style={{ left: '160px', top: '150px' }}>
                            <div className="w-16 h-20 relative">
                                <div className="absolute w-10 h-2 bg-green-500" style={{left: '3px', top: '0px'}}></div>
                                <div className="absolute w-12 h-2 bg-green-500" style={{left: '2px', top: '2px'}}></div>
                                <div className="absolute w-14 h-2 bg-green-500" style={{left: '1px', top: '4px'}}></div>
                                <div className="absolute w-16 h-2 bg-green-500" style={{left: '0px', top: '6px'}}></div>
                                <div className="absolute w-14 h-2 bg-green-500" style={{left: '1px', top: '8px'}}></div>
                                <div className="absolute w-12 h-2 bg-green-500" style={{left: '2px', top: '10px'}}></div>
                                <div className="absolute w-2 h-6 bg-orange-600" style={{left: '7px', top: '12px'}}></div>
                            </div>
                        </div>

                        <div className="absolute" style={{ left: '300px', top: '170px' }}>
                            <div className="w-16 h-20 relative">
                                <div className="absolute w-10 h-2 bg-green-500" style={{left: '3px', top: '0px'}}></div>
                                <div className="absolute w-12 h-2 bg-green-500" style={{left: '2px', top: '2px'}}></div>
                                <div className="absolute w-14 h-2 bg-green-500" style={{left: '1px', top: '4px'}}></div>
                                <div className="absolute w-16 h-2 bg-green-500" style={{left: '0px', top: '6px'}}></div>
                                <div className="absolute w-14 h-2 bg-green-500" style={{left: '1px', top: '8px'}}></div>
                                <div className="absolute w-12 h-2 bg-green-500" style={{left: '2px', top: '10px'}}></div>
                                <div className="absolute w-2 h-6 bg-orange-600" style={{left: '7px', top: '12px'}}></div>
                            </div>
                        </div>

                        {/* Render animals */}
                        {animals.map(animal => (
                            <div
                                key={animal.id}
                                className={`absolute ${animal.hit ? 'opacity-50' : ''}`}
                                style={{
                                    left: `${animal.x}px`,
                                    top: `${animal.y}px`,
                                    transform: animal.direction === 'left' ? 'scaleX(-1)' : ''
                                }}
                            >
                                {animal.type === 'deer' && (
                                    <div className="w-8 h-6 relative">
                                        <div className="absolute w-3 h-3 bg-white" style={{left: '15px', top: '0px'}}></div>
                                        <div className="absolute w-2 h-4 bg-white" style={{left: '10px', top: '2px'}}></div>
                                        <div className="absolute w-7 h-2 bg-white" style={{left: '0px', top: '4px'}}></div>
                                    </div>
                                )}

                                {animal.type === 'bison' && (
                                    <div className="w-10 h-8 relative">
                                        <div className="absolute w-8 h-3 bg-orange-700" style={{left: '0px', top: '0px'}}></div>
                                        <div className="absolute w-10 h-2 bg-orange-700" style={{left: '0px', top: '3px'}}></div>
                                        <div className="absolute w-6 h-3 bg-orange-700" style={{left: '2px', top: '5px'}}></div>
                                    </div>
                                )}

                                {animal.type === 'rabbit' && (
                                    <div className="w-4 h-4 relative">
                                        <div className="absolute w-3 h-2 bg-white" style={{left: '0px', top: '0px'}}></div>
                                        <div className="absolute w-2 h-2 bg-white" style={{left: '1px', top: '2px'}}></div>
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* Hunter */}
                        <div className="absolute" style={{ left: `${hunterPosition - 10}px`, bottom: '40px' }}>
                            <div className="w-20 h-20 relative">
                                <div className="absolute w-4 h-3 bg-white" style={{left: '8px', top: '0px'}}></div>
                                <div className="absolute w-4 h-5 bg-white" style={{left: '8px', top: '3px'}}></div>
                                <div className="absolute w-10 h-2 bg-white" style={{left: '10px', top: '5px'}}></div>
                            </div>
                        </div>

                        {/* Ground */}
                        <div className="absolute bottom-0 left-0 right-0 h-10 bg-green-950"></div>
                    </div>

                    {!isActive && timeLeft === 0 && (
                        <div className="text-center mt-4 p-4 border border-green-500">
                            <h3 className="text-xl text-green-400">HUNTING RESULTS</h3>
                            <p>You shot {bulletsUsed} bullets</p>
                            <p>You got {foodGained} pounds of food</p>
                            <button
                                className="bg-green-700 hover:bg-green-600 p-2 rounded mt-4"
                                onClick={() => onComplete({ food: foodGained, bullets: bulletsUsed })}
                            >
                                CONTINUE ON TRAIL
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
