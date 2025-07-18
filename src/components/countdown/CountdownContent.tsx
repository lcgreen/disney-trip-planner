import { AttractionsSection, TipsSection } from '@/components/countdown'
import { ParkSelection, DateSelection, CountdownDisplay } from '@/components/countdown'

interface CountdownContentProps {
  countdownData: any
  onParkSelect: (park: any) => void
  onDateChange: (date: string) => void
  onStartCountdown: () => void
}

const CountdownContent = ({
  countdownData,
  onParkSelect,
  onDateChange,
  onStartCountdown
}: CountdownContentProps) => {
  return (
    <>
      <div className="space-y-8">
        <ParkSelection
          disneyParks={countdownData.disneyParks}
          selectedPark={countdownData.selectedPark}
          onParkSelect={onParkSelect}
          settings={countdownData.settings}
        />

        <DateSelection
          targetDate={countdownData.targetDate}
          onDateChange={onDateChange}
          onStartCountdown={onStartCountdown}
        />

        {countdownData.targetDate && (
          <CountdownDisplay
            targetDate={countdownData.targetDate}
            selectedPark={countdownData.selectedPark}
            countdown={countdownData.countdown}
            milliseconds={countdownData.milliseconds}
            isActive={countdownData.isActive}
            settings={countdownData.settings}
            customTheme={countdownData.customTheme}
          />
        )}
      </div>

      {countdownData.targetDate && (
        <div className="space-y-8 mt-8">
          {countdownData.settings.showAttractions && (
            <AttractionsSection selectedPark={countdownData.selectedPark} />
          )}

          {countdownData.settings.showTips && (
            <TipsSection />
          )}
        </div>
      )}
    </>
  )
}

export default CountdownContent