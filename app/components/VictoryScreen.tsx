// File: app/components/VictoryScreen.tsx
'use client';

import { useGameContext } from '../context/GameContext';
import { useRouter } from 'next/navigation';

export default function VictoryScreen() {
    const { gameState, resetGame } = useGameContext();
    const router = useRouter();

    // Calculate stats
    const daysOnTrail = () => {
        const startDate = new Date(1848, 3, 1); // April 1, 1848
        const endDate = new Date(gameState.date);
        const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const survivorCount = () => {
        return gameState.party.filter(member => member.health !== 'dead').length;
    };

    // Calculate score
    const calculateScore = () => {
        let score = 0;

        // Points for survivors
        score += survivorCount() * 500;

        // Points for leftover supplies
        score += gameState.food;
        score += gameState.ammunition * 2;
        score += gameState.clothing * 15;
        score += gameState.money * 5;
        score += (gameState.spareWheels + gameState.spareAxles + gameState.spareTongues) * 25;

        // Points for reaching Oregon before winter
        const month = gameState.date.getMonth();
        if (month < 9) {
            // Before October is excellent
            score += 1000;
        } else if (month < 10) {
            // October is good
            score += 500;
        } else {
            // November is cutting it close
            score += 250;
        }

        return score;
    };

    // Handle play again button
    const handlePlayAgain = () => {
        // Reset game state
        resetGame();

        // Refresh the page to restart the game completely
        // This ensures all components are reset properly
        window.location.href = '/';
    };

    return (
        <div className="space-y-6 flex flex-col items-center">
            <h2 className="text-4xl text-green-500 mb-6">CONGRATULATIONS!</h2>

            <p className="text-xl mb-6">You have successfully reached Oregon!</p>

            <div className="bg-black border border-green-700 p-4 mx-auto text-left max-w-md w-full">
                <h3 className="text-xl text-green-400 mb-4">Journey Statistics</h3>

                <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-x-4">
                        <div>Days on trail:</div>
                        <div>{daysOnTrail()}</div>
                    </div>

                    <div className="grid grid-cols-2 gap-x-4">
                        <div>Arrival date:</div>
                        <div>{gameState.date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                    </div>

                    <div className="grid grid-cols-2 gap-x-4">
                        <div>Survivors:</div>
                        <div>{survivorCount()} / {gameState.party.length}</div>
                    </div>

                    <div className="grid grid-cols-2 gap-x-4">
                        <div>Remaining money:</div>
                        <div>${gameState.money}</div>
                    </div>

                    <div className="grid grid-cols-2 gap-x-4">
                        <div>Remaining food:</div>
                        <div>{gameState.food} pounds</div>
                    </div>

                    <div className="grid grid-cols-2 gap-x-4 font-bold mt-4">
                        <div>Final Score:</div>
                        <div>{calculateScore()}</div>
                    </div>
                </div>
            </div>

            <button
                className="bg-green-700 hover:bg-green-600 p-3 rounded text-xl mt-6"
                onClick={handlePlayAgain}
            >
                Play Again
            </button>
        </div>
    );
}