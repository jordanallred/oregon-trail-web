// File: app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import {GameProvider, useGameContext} from './context/GameContext';
import StartScreen from './components/StartScreen';
import TravelScreen from './components/TravelScreen';
import EventScreen from './components/EventScreen';
import StoreScreen from './components/StoreScreen';
import RiverScreen from './components/RiverScreen';
import StatusBar from './components/StatusBar';
import GameOverScreen from './components/GameOverScreen';
import VictoryScreen from './components/VictoryScreen';
import InteractiveEventScreen from './components/InteractiveEventScreen';
import CampingScreen from "@/app/components/CampingScreen";

export default function Home() {
  const [gameStarted, setGameStarted] = useState(false);

  return (
      <main className="flex min-h-screen flex-col items-center justify-between p-4 bg-green-800 text-white font-mono">
        <GameProvider>
          <div className="w-full max-w-4xl bg-black border-4 border-gray-300 p-6 rounded shadow-lg">
            <h1 className="text-4xl font-bold text-center mb-6 text-green-400">Oregon Trail</h1>

            {!gameStarted ? (
                <StartScreen onStart={() => setGameStarted(true)} />
            ) : (
                <GameContent />
            )}
          </div>
        </GameProvider>
      </main>
  );
}

function GameContent() {
    const [currentScreen, setCurrentScreen] = useState('travel');
    const { gameState } = useGameContext();

    // Check if the current event is an interactive event
    useEffect(() => {
        if (gameState.inEvent && gameState.currentEvent?.type === 'interactive') {
            setCurrentScreen('interactive-event');
        }
    }, [gameState.inEvent, gameState.currentEvent]);

    return (
        <div className="game-content">
            <StatusBar />

            {currentScreen === 'travel' && <TravelScreen onScreenChange={setCurrentScreen} />}
            {currentScreen === 'event' && <EventScreen onScreenChange={setCurrentScreen} />}
            {currentScreen === 'interactive-event' && <InteractiveEventScreen onScreenChange={setCurrentScreen} />}
            {currentScreen === 'store' && <StoreScreen onScreenChange={setCurrentScreen} />}
            {currentScreen === 'river' && <RiverScreen onScreenChange={setCurrentScreen} />}
            {currentScreen === 'camping' && <CampingScreen onScreenChange={setCurrentScreen} />}
            {currentScreen === 'gameover' && <GameOverScreen />}
            {currentScreen === 'victory' && <VictoryScreen />}
        </div>
    );
}