// File: app/components/GameOverScreen.tsx
'use client';

import { useGameContext } from '../context/GameContext';

export default function GameOverScreen() {
    const { gameState, resetGame } = useGameContext();

    // Find out what happened
    const getGameOverReason = () => {
        // Check if leader died
        if (gameState.party.find(member => member.name === gameState.partyLeader)?.health === 'dead') {
            return `${gameState.partyLeader} has died. Without a leader, your journey cannot continue.`;
        }

        // Check if all members died
        if (gameState.party.every(member => member.health === 'dead')) {
            return "All members of your party have perished.";
        }

        // Check if out of oxen
        if (gameState.oxen < 1) {
            return "Without oxen to pull your wagon, you cannot continue.";
        }

        // Check if winter arrived
        const currentDate = new Date(gameState.date);
        if (currentDate.getMonth() > 10) { // December
            return "Winter has set in, making further travel impossible. You've failed to reach Oregon in time.";
        }

        return "Your journey has ended.";
    };

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

    // Handle play again button
    const handlePlayAgain = () => {
        // Reset game state
        resetGame();

        // Refresh the page to restart the game completely
        window.location.href = '/';
    };

    return (
        <div className="space-y-6 flex flex-col items-center">
            <h2 className="text-4xl text-red-500 mb-6">GAME OVER</h2>

            <p className="text-xl mb-6">{getGameOverReason()}</p>

            <div className="bg-black border border-gray-700 p-4 mx-auto text-left max-w-md w-full">
                <h3 className="text-xl text-yellow-400 mb-4">Journey Statistics</h3>

                <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-x-4">
                        <div>Days on trail:</div>
                        <div>{daysOnTrail()}</div>
                    </div>

                    <div className="grid grid-cols-2 gap-x-4">
                        <div>Miles traveled:</div>
                        <div>{gameState.miles} miles</div>
                    </div>

                    <div className="grid grid-cols-2 gap-x-4">
                        <div>Survivors:</div>
                        <div>{survivorCount()} / {gameState.party.length}</div>
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