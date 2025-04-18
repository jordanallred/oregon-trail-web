// File: app/components/EventScreen.tsx
'use client';

import { useGameContext } from '../context/GameContext';

export default function EventScreen({ onScreenChange }: { onScreenChange: (screen: string) => void }) {
    const { gameState, updateGameState } = useGameContext();

    const handleEventResponse = () => {
        // Handle the event based on its type
        if (!gameState.currentEvent) {
            onScreenChange('travel');
            return;
        }

        const eventType = gameState.currentEvent.type;
        let messages = [...gameState.messages];

        switch(eventType) {
            case 'illness':
                // Random party member gets sick
                if (gameState.party.some(member => member.health !== 'dead')) {
                    const livingMembers = gameState.party.filter(member => member.health !== 'dead');
                    const randomIndex = Math.floor(Math.random() * livingMembers.length);
                    const sickMember = livingMembers[randomIndex];

                    // Update party member health
                    const updatedParty = gameState.party.map(member => {
                        if (member.name === sickMember.name) {
                            const newHealth = member.health === 'good' ? 'fair' : 'poor';
                            messages.push(`${member.name} is sick and their health has worsened to ${newHealth}.`);
                            return { ...member, health: newHealth as 'fair' | 'poor' };
                        }
                        return member;
                    });

                    updateGameState({ party: updatedParty, messages });
                }
                break;

            case 'broken_wheel':
                if (gameState.spareWheels > 0) {
                    updateGameState({
                        spareWheels: gameState.spareWheels - 1,
                        messages: [...messages, 'Used a spare wheel to fix the wagon.']
                    });
                } else {
                    // Slow down travel until fixed
                    updateGameState({
                        messages: [...messages, 'No spare wheel available. Travel will be slower until you obtain one.']
                    });
                }
                break;

            case 'broken_axle':
                if (gameState.spareAxles > 0) {
                    updateGameState({
                        spareAxles: gameState.spareAxles - 1,
                        messages: [...messages, 'Used a spare axle to fix the wagon.']
                    });
                } else {
                    // Major issue - delay travel significantly
                    updateGameState({
                        messages: [...messages, 'No spare axle available. Travel will be much slower until you obtain one.']
                    });
                }
                break;

            case 'broken_tongue':
                if (gameState.spareTongues > 0) {
                    updateGameState({
                        spareTongues: gameState.spareTongues - 1,
                        messages: [...messages, 'Used a spare wagon tongue to fix the wagon.']
                    });
                } else {
                    // Delay travel
                    updateGameState({
                        messages: [...messages, 'No spare wagon tongue available. Travel will be slower until you obtain one.']
                    });
                }
                break;

            case 'bad_water':
                // Random chance of someone getting sick
                if (Math.random() > 0.5 && gameState.party.some(member => member.health === 'good')) {
                    const healthyMembers = gameState.party.filter(member => member.health === 'good');
                    const randomIndex = Math.floor(Math.random() * healthyMembers.length);
                    const sickMember = healthyMembers[randomIndex];

                    // Update party member health
                    const updatedParty = gameState.party.map(member => {
                        if (member.name === sickMember.name) {
                            messages.push(`${member.name} got sick from the bad water.`);
                            return { ...member, health: 'fair' as const };
                        }
                        return member;
                    });

                    updateGameState({ party: updatedParty, messages });
                } else {
                    updateGameState({
                        messages: [...messages, 'Fortunately, no one got sick from the bad water.']
                    });
                }
                break;

            case 'lost_trail':
                // Lose some time/miles
                updateGameState({
                    miles: Math.max(0, gameState.miles - Math.floor(Math.random() * 10) - 5),
                    messages: [...messages, 'You lost some time finding the trail again.']
                });
                break;

            case 'heavy_fog':
                // Just a message, as the slowdown is already calculated in the travel function
                updateGameState({
                    messages: [...messages, 'The heavy fog has cleared.']
                });
                break;

            case 'snake_bite':
                // Someone gets very sick
                if (gameState.party.some(member => member.health !== 'dead')) {
                    const livingMembers = gameState.party.filter(member => member.health !== 'dead');
                    const randomIndex = Math.floor(Math.random() * livingMembers.length);
                    const sickMember = livingMembers[randomIndex];

                    // Update party member health - snake bite is serious
                    const updatedParty = gameState.party.map(member => {
                        if (member.name === sickMember.name) {
                            // 50% chance of getting poor health regardless of current health
                            const newHealth = Math.random() > 0.5 || member.health === 'poor' ? 'poor' : 'fair';
                            messages.push(`${member.name} was bitten by a snake and their health is now ${newHealth}.`);
                            return { ...member, health: newHealth as 'fair' | 'poor' };
                        }
                        return member;
                    });

                    updateGameState({ party: updatedParty, messages });
                }
                break;

            case 'theft':
                // Lose some supplies
                const stolenFood = Math.floor(Math.random() * 20) + 5;
                const stolenBullets = Math.floor(Math.random() * 10) + 5;

                updateGameState({
                    food: Math.max(0, gameState.food - stolenFood),
                    ammunition: Math.max(0, gameState.ammunition - stolenBullets),
                    messages: [...messages, `Thieves stole ${stolenFood} pounds of food and ${stolenBullets} bullets.`]
                });
                break;

            case 'beneficial':
                if (gameState.currentEvent.effect === 'food') {
                    updateGameState({
                        food: gameState.food + gameState.currentEvent.amount,
                        messages: [...messages, `Found ${gameState.currentEvent.amount} pounds of food!`]
                    });
                } else if (gameState.currentEvent.effect === 'parts') {
                    // Random part
                    const partType = Math.floor(Math.random() * 3);
                    if (partType === 0) {
                        updateGameState({
                            spareWheels: gameState.spareWheels + 1,
                            messages: [...messages, 'Found a spare wagon wheel!']
                        });
                    } else if (partType === 1) {
                        updateGameState({
                            spareAxles: gameState.spareAxles + 1,
                            messages: [...messages, 'Found a spare wagon axle!']
                        });
                    } else {
                        updateGameState({
                            spareTongues: gameState.spareTongues + 1,
                            messages: [...messages, 'Found a spare wagon tongue!']
                        });
                    }
                }
                break;

            default:
                // Unknown event, just continue
                updateGameState({
                    messages: [...messages, 'You dealt with the situation and continued on.']
                });
        }

        // Clear the event and resume travel
        updateGameState({
            inEvent: false,
            currentEvent: null,
            isPaused: false
        });

        onScreenChange('travel');
    };

    return (
        <div className="space-y-6">
            <div className="bg-black border border-green-500 p-4">
                <h2 className="text-2xl text-red-500 mb-4">Event: {gameState.currentEvent?.description}</h2>

                <button
                    className="bg-green-700 hover:bg-green-600 px-4 py-2 rounded"
                    onClick={handleEventResponse}
                >
                    Continue
                </button>
            </div>
        </div>
    );
}