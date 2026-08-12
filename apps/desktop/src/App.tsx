import React, { useState, useEffect } from 'react';
import { useSettingsStore } from './stores/settingsStore';
import { OnboardingModal } from './components/onboarding/OnboardingModal';
import { Header } from './components/header/Header';
import { DubbingDashboard } from './components/main/DubbingDashboard';
import { SettingsModal } from './components/settings/SettingsModal';

export function App() {
  const { settings } = useSettingsStore();

  const [isOnboardingOpen, setIsOnboardingOpen] = useState(!settings.hasCompletedOnboarding);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    if (settings.hasCompletedOnboarding) {
      import('./utils/updater').then(({ checkForUpdates }) => {
        checkForUpdates(true);
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col antialiased select-none">
      <Header
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      <main className="flex-1 overflow-y-auto p-4 md:p-6 flex items-center justify-center">
        <DubbingDashboard onOpenSettings={() => setIsSettingsOpen(true)} />
      </main>

      <OnboardingModal
        isOpen={isOnboardingOpen}
        onComplete={() => setIsOnboardingOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}

export default App;
