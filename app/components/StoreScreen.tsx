// File: app/components/StoreScreen.tsx
'use client';

import { useState } from 'react';
import { useGameContext } from '../context/GameContext';

export default function StoreScreen({ onScreenChange }: { onScreenChange: (screen: string) => void }) {
    const { gameState, handleStore, updateGameState } = useGameContext();
    const [purchases, setPurchases] = useState({
        food: 0,
        clothing: 0,
        ammunition: 0,
        oxen: 0,
        spareWheels: 0,
        spareAxles: 0,
        spareTongues: 0
    });

    // Store prices
    const prices = {
        food: 0.2, // per pound
        clothing: 10, // per set
        ammunition: 2, // per box of 20 bullets
        oxen: 40, // per pair
        spareWheels: 10, // each
        spareAxles: 10, // each
        spareTongues: 10, // each
    };

    // Calculate total cost
    const totalCost =
        purchases.food * prices.food +
        purchases.clothing * prices.clothing +
        purchases.ammunition * prices.ammunition +
        purchases.oxen * prices.oxen +
        purchases.spareWheels * prices.spareWheels +
        purchases.spareAxles * prices.spareAxles +
        purchases.spareTongues * prices.spareTongues;

    const handlePurchase = () => {
        // Convert ammunition to bullets (20 per box)
        const bullets = purchases.ammunition * 20;

        handleStore({
            food: purchases.food,
            clothing: purchases.clothing,
            ammunition: bullets,
            oxen: purchases.oxen,
            spareWheels: purchases.spareWheels,
            spareAxles: purchases.spareAxles,
            spareTongues: purchases.spareTongues
        });

        // Reset purchases
        setPurchases({
            food: 0,
            clothing: 0,
            ammunition: 0,
            oxen: 0,
            spareWheels: 0,
            spareAxles: 0,
            spareTongues: 0
        });
    };

    const handleLeaveStore = () => {
        updateGameState({ isPaused: false });
        onScreenChange('travel');
    };

    // Helper to update purchase quantities
    const updatePurchase = (item: keyof typeof purchases, amount: number) => {
        setPurchases(prev => {
            const newValue = Math.max(0, prev[item] + amount);
            return { ...prev, [item]: newValue };
        });
    };

    return (
        <div className="space-y-6">
            <div className="bg-brown-900 border border-yellow-800 p-4">
                <h2 className="text-2xl text-yellow-300 mb-4">General Store</h2>
                <p className="mb-6">You have ${gameState.money} to spend. Select the items you wish to purchase.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="space-y-4">
                        <div>
                            <h3 className="font-bold text-yellow-200">Food - ${prices.food.toFixed(2)} per pound</h3>
                            <div className="flex items-center space-x-2">
                                <button
                                    className="px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded"
                                    onClick={() => updatePurchase('food', -10)}
                                >
                                    -10
                                </button>
                                <button
                                    className="px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded"
                                    onClick={() => updatePurchase('food', -1)}
                                >
                                    -
                                </button>
                                <span className="w-16 text-center">{purchases.food} lbs</span>
                                <button
                                    className="px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded"
                                    onClick={() => updatePurchase('food', 1)}
                                >
                                    +
                                </button>
                                <button
                                    className="px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded"
                                    onClick={() => updatePurchase('food', 10)}
                                >
                                    +10
                                </button>
                            </div>
                            <div className="text-sm">Cost: ${(purchases.food * prices.food).toFixed(2)}</div>
                        </div>

                        <div>
                            <h3 className="font-bold text-yellow-200">Clothing - ${prices.clothing} per set</h3>
                            <div className="flex items-center space-x-2">
                                <button
                                    className="px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded"
                                    onClick={() => updatePurchase('clothing', -1)}
                                >
                                    -
                                </button>
                                <span className="w-16 text-center">{purchases.clothing} sets</span>
                                <button
                                    className="px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded"
                                    onClick={() => updatePurchase('clothing', 1)}
                                >
                                    +
                                </button>
                            </div>
                            <div className="text-sm">Cost: ${purchases.clothing * prices.clothing}</div>
                        </div>

                        <div>
                            <h3 className="font-bold text-yellow-200">Ammunition - ${prices.ammunition} per box (20 bullets)</h3>
                            <div className="flex items-center space-x-2">
                                <button
                                    className="px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded"
                                    onClick={() => updatePurchase('ammunition', -1)}
                                >
                                    -
                                </button>
                                <span className="w-16 text-center">{purchases.ammunition} boxes</span>
                                <button
                                    className="px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded"
                                    onClick={() => updatePurchase('ammunition', 1)}
                                >
                                    +
                                </button>
                            </div>
                            <div className="text-sm">Cost: ${purchases.ammunition * prices.ammunition}</div>
                        </div>

                        <div>
                            <h3 className="font-bold text-yellow-200">Oxen - ${prices.oxen} per pair</h3>
                            <div className="flex items-center space-x-2">
                                <button
                                    className="px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded"
                                    onClick={() => updatePurchase('oxen', -1)}
                                >
                                    -
                                </button>
                                <span className="w-16 text-center">{purchases.oxen} pairs</span>
                                <button
                                    className="px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded"
                                    onClick={() => updatePurchase('oxen', 1)}
                                >
                                    +
                                </button>
                            </div>
                            <div className="text-sm">Cost: ${purchases.oxen * prices.oxen}</div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <h3 className="font-bold text-yellow-200">Spare Wheels - ${prices.spareWheels} each</h3>
                            <div className="flex items-center space-x-2">
                                <button
                                    className="px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded"
                                    onClick={() => updatePurchase('spareWheels', -1)}
                                >
                                    -
                                </button>
                                <span className="w-16 text-center">{purchases.spareWheels}</span>
                                <button
                                    className="px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded"
                                    onClick={() => updatePurchase('spareWheels', 1)}
                                >
                                    +
                                </button>
                            </div>
                            <div className="text-sm">Cost: ${purchases.spareWheels * prices.spareWheels}</div>
                        </div>

                        <div>
                            <h3 className="font-bold text-yellow-200">Spare Axles - ${prices.spareAxles} each</h3>
                            <div className="flex items-center space-x-2">
                                <button
                                    className="px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded"
                                    onClick={() => updatePurchase('spareAxles', -1)}
                                >
                                    -
                                </button>
                                <span className="w-16 text-center">{purchases.spareAxles}</span>
                                <button
                                    className="px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded"
                                    onClick={() => updatePurchase('spareAxles', 1)}
                                >
                                    +
                                </button>
                            </div>
                            <div className="text-sm">Cost: ${purchases.spareAxles * prices.spareAxles}</div>
                        </div>

                        <div>
                            <h3 className="font-bold text-yellow-200">Spare Tongues - ${prices.spareTongues} each</h3>
                            <div className="flex items-center space-x-2">
                                <button
                                    className="px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded"
                                    onClick={() => updatePurchase('spareTongues', -1)}
                                >
                                    -
                                </button>
                                <span className="w-16 text-center">{purchases.spareTongues}</span>
                                <button
                                    className="px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded"
                                    onClick={() => updatePurchase('spareTongues', 1)}
                                >
                                    +
                                </button>
                            </div>
                            <div className="text-sm">Cost: ${purchases.spareTongues * prices.spareTongues}</div>
                        </div>

                        <div className="bg-gray-800 p-3 rounded mt-6">
                            <h3 className="font-bold text-yellow-200">Current Inventory:</h3>
                            <div className="text-sm">Food: {gameState.food} pounds</div>
                            <div className="text-sm">Clothing: {gameState.clothing} sets</div>
                            <div className="text-sm">Ammunition: {gameState.ammunition} bullets</div>
                            <div className="text-sm">Oxen: {gameState.oxen} pairs</div>
                            <div className="text-sm">Spare Parts: {gameState.spareWheels} wheels, {gameState.spareAxles} axles, {gameState.spareTongues} tongues</div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-between items-center">
                    <div>
                        <div className="text-lg">Total Cost: ${totalCost.toFixed(2)}</div>
                        <div className="text-sm">Remaining Money: ${(gameState.money - totalCost).toFixed(2)}</div>
                    </div>

                    <div className="flex space-x-3">
                        <button
                            className={`px-4 py-2 rounded ${totalCost > 0 && totalCost <= gameState.money ? 'bg-green-700 hover:bg-green-600' : 'bg-gray-700 cursor-not-allowed'}`}
                            onClick={handlePurchase}
                            disabled={totalCost <= 0 || totalCost > gameState.money}
                        >
                            Purchase
                        </button>

                        <button
                            className="bg-red-700 hover:bg-red-600 px-4 py-2 rounded"
                            onClick={handleLeaveStore}
                        >
                            Leave Store
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
