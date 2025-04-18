// File: app/components/StartScreen.tsx
'use client';

import { useState } from 'react';
import { useGameContext } from '../context/GameContext';

export default function StartScreen({ onStart }: { onStart: () => void }) {
    const { setPartyMembers } = useGameContext();
    const [leader, setLeader] = useState('');
    const [members, setMembers] = useState(['', '', '', '']);
    const [stage, setStage] = useState(1);
    const [showInstructions, setShowInstructions] = useState(false);

    const handleStart = () => {
        if (leader.trim() === '') {
            alert('Please enter a name for your party leader');
            return;
        }

        // Filter out empty member names
        const validMembers = members.filter(member => member.trim() !== '');

        // Set party members and start the game
        setPartyMembers(leader, validMembers);
        onStart();
    };

    const handleMemberChange = (index: number, value: string) => {
        const newMembers = [...members];
        newMembers[index] = value;
        setMembers(newMembers);
    };

    if (showInstructions) {
        return (
            <div className="space-y-4">
                <h2 className="text-2xl text-green-400">Game Instructions</h2>
                <p>Try to get to Oregon by traveling the Oregon Trail!</p>
                <ul className="list-disc pl-5 space-y-2">
                    <li>You start in Independence, Missouri in April 1848.</li>
                    <li>Your goal is to reach Oregon before winter.</li>
                    <li>Balance your supplies, health, and pace carefully.</li>
                    <li>Watch out for rivers, illness, and other dangers.</li>
                    <li>Visit forts to buy supplies along the way.</li>
                    <li>Hunt when you run low on food, but be careful with ammunition.</li>
                </ul>
                <button
                    className="bg-green-700 hover:bg-green-600 px-4 py-2 rounded mt-4"
                    onClick={() => setShowInstructions(false)}
                >
                    Return to Menu
                </button>
            </div>
        );
    }

    if (stage === 1) {
        return (
            <div className="space-y-6 text-center">
                <h2 className="text-4xl text-green-400 mb-6">THE OREGON TRAIL</h2>
                <div className="text-xl space-y-4">
                    <p>Travel the trail to Oregon!</p>
                    <p>2000 miles of adventure and danger await!</p>
                </div>
                <div className="space-y-4 mt-8">
                    <button
                        className="bg-green-700 hover:bg-green-600 px-6 py-3 rounded text-xl w-full"
                        onClick={() => setStage(2)}
                    >
                        Start New Game
                    </button>
                    <button
                        className="bg-blue-700 hover:bg-blue-600 px-6 py-3 rounded text-xl w-full"
                        onClick={() => setShowInstructions(true)}
                    >
                        See Instructions
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl text-green-400">Who will be making this journey?</h2>

            <div className="space-y-4">
                <div>
                    <label className="block mb-1">Wagon Leader:</label>
                    <input
                        type="text"
                        value={leader}
                        onChange={(e) => setLeader(e.target.value)}
                        className="w-full px-3 py-2 bg-black border border-green-500 text-white"
                        placeholder="Enter name"
                    />
                </div>

                <div className="space-y-2">
                    <p>Other Party Members:</p>
                    {members.map((member, index) => (
                        <input
                            key={index}
                            type="text"
                            value={member}
                            onChange={(e) => handleMemberChange(index, e.target.value)}
                            className="w-full px-3 py-2 bg-black border border-green-500 text-white mb-2"
                            placeholder={`Party member ${index + 1}`}
                        />
                    ))}
                </div>
            </div>

            <div className="flex justify-between mt-6">
                <button
                    className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded"
                    onClick={() => setStage(1)}
                >
                    Back
                </button>
                <button
                    className="bg-green-700 hover:bg-green-600 px-4 py-2 rounded"
                    onClick={handleStart}
                >
                    Begin Journey
                </button>
            </div>
        </div>
    );
}