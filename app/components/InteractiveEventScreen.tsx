// File: app/components/InteractiveEventScreen.tsx
'use client';

import { useState } from 'react';
import { useGameContext } from '../context/GameContext';
import { playSound } from '../utils/gameUtils';

// Event choice type definition
interface EventChoice {
    text: string;
    outcome: string;
    effect: (gameState: any) => Partial<any>;
}

// Interactive event type definition
interface InteractiveEvent {
    id: string;
    title: string;
    description: string;
    image?: string;
    choices: EventChoice[];
}

export default function InteractiveEventScreen({
                                                   onScreenChange
                                               }: {
    onScreenChange: (screen: string) => void
}) {
    const { gameState, updateGameState } = useGameContext();
    const [showOutcome, setShowOutcome] = useState(false);
    const [selectedChoice, setSelectedChoice] = useState<EventChoice | null>(null);

    // Get the current event from the game state
    const currentEvent = gameState.currentEvent;

    // Handle player choice
    const handleChoice = (choice: EventChoice) => {
        // Play sound effect
        playSound('click');

        // Store the selected choice
        setSelectedChoice(choice);

        // Apply the effects of the choice to the game state
        const stateUpdates = choice.effect(gameState);

        // Add outcome message to the game logs
        const messages = [...gameState.messages, choice.outcome];

        // Update game state with the effects and message
        updateGameState({
            ...stateUpdates,
            messages
        });

        // Show the outcome
        setShowOutcome(true);
    };

    // Continue journey after viewing outcome
    const handleContinue = () => {
        // Play sound effect
        playSound('click');

        // Clear the event and resume travel
        updateGameState({
            inEvent: false,
            currentEvent: null,
            isPaused: false
        });

        // Return to travel screen
        onScreenChange('travel');
    };

    // If event doesn't have interactive choices, treat as regular event
    if (!currentEvent?.choices) {
        return (
            <div className="bg-black border border-green-500 p-4">
                <h2 className="text-2xl text-red-500 mb-4">Event: {currentEvent?.description}</h2>

                <button
                    className="bg-green-700 hover:bg-green-600 px-4 py-2 rounded"
                    onClick={handleContinue}
                >
                    Continue
                </button>
            </div>
        );
    }

    return (
        <div className="bg-black border border-green-500 p-4">
            {!showOutcome ? (
                <>
                    <h2 className="text-2xl text-yellow-400 mb-4">{currentEvent.title}</h2>
                    <p className="mb-6">{currentEvent.description}</p>

                    <div className="space-y-3 mb-6">
                        {currentEvent.choices.map((choice, index) => (
                            <button
                                key={index}
                                className="bg-blue-700 hover:bg-blue-600 px-4 py-2 rounded w-full text-left"
                                onClick={() => handleChoice(choice)}
                            >
                                {choice.text}
                            </button>
                        ))}
                    </div>
                </>
            ) : (
                <>
                    <h2 className="text-2xl text-yellow-400 mb-4">Outcome</h2>
                    <p className="mb-6">{selectedChoice?.outcome}</p>

                    <button
                        className="bg-green-700 hover:bg-green-600 px-4 py-2 rounded"
                        onClick={handleContinue}
                    >
                        Continue Journey
                    </button>
                </>
            )}
        </div>
    );
}