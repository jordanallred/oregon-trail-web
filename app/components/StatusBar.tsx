// File: app/components/StatusBar.tsx
'use client';

import { useGameContext } from '../context/GameContext';

export default function StatusBar() {
    const { gameState } = useGameContext();

    // Format date to display
    const formatDate = (date: Date) => {
        const month = date.toLocaleString('default', { month: 'long' });
        const day = date.getDate();
        const year = date.getFullYear();
        return `${month} ${day}, ${year}`;
    };

    return (
        <div className="bg-black border border-green-500 p-3 mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
                <div className="text-green-400 font-bold">Date</div>
                <div>{formatDate(gameState.date)}</div>
            </div>

            <div>
                <div className="text-green-400 font-bold">Weather</div>
                <div className="capitalize">{gameState.weather}</div>
            </div>

            <div>
                <div className="text-green-400 font-bold">Health</div>
                <div className="capitalize">
                    {gameState.party.filter(m => m.health !== 'dead').length === 0
                        ? 'None Alive'
                        : gameState.party.every(m => m.health === 'good' || m.health === 'dead')
                            ? 'Good'
                            : gameState.party.some(m => m.health === 'poor')
                                ? 'Poor'
                                : 'Fair'}
                </div>
            </div>

            <div>
                <div className="text-green-400 font-bold">Miles Traveled</div>
                <div>{gameState.miles} / 2000</div>
            </div>

            <div>
                <div className="text-green-400 font-bold">Food</div>
                <div>{gameState.food} pounds</div>
            </div>

            <div>
                <div className="text-green-400 font-bold">Oxen</div>
                <div>{gameState.oxen} {gameState.oxen === 1 ? 'pair' : 'pairs'}</div>
            </div>

            <div>
                <div className="text-green-400 font-bold">Clothing</div>
                <div>{gameState.clothing} sets</div>
            </div>

            <div>
                <div className="text-green-400 font-bold">Money</div>
                <div>${gameState.money}</div>
            </div>
        </div>
    );
}
