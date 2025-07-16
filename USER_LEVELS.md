# User Level System

The Disney Countdown application now includes a comprehensive user level system with three tiers: **Anonymous**, **Standard**, and **Premium**.

## User Levels

### Anonymous (Default)
- **Access**: Basic features only
- **Features**: Countdown timer, Packing checklist
- **Limitations**: 
  - Can only create 1 item per feature
  - Data is not persisted between sessions
  - No data export capabilities

### Standard (Free Account)
- **Access**: Basic + Standard features
- **Features**: All Anonymous features + Save/Load data, Multiple items, Export data
- **Limitations**:
  - Up to 10 items per feature
  - 10MB storage limit
  - No premium planning tools

### Premium
- **Access**: All features
- **Features**: All Standard features + Trip Planner, Budget Tracker, Advanced Analytics, Priority Support, Unlimited Storage
- **Benefits**:
  - Unlimited items and storage
  - Advanced planning tools
  - Priority customer support
  - Advanced analytics and insights

## Implementation

### Core Components

1. **UserManager** (`src/lib/userManagement.ts`)
   - Singleton class managing user state
   - Handles user creation, upgrades, and feature access
   - Provides data limits based on user level

2. **useUser Hook** (`src/hooks/useUser.ts`)
   - React hook for accessing user state
   - Provides user actions and computed values
   - Handles state updates and persistence

3. **UserProfile Component** (`src/components/UserProfile.tsx`)
   - Displays current user information
   - Provides upgrade flows for Standard and Premium
   - Shows user level and available features

4. **FeatureGuard Component** (`src/components/FeatureGuard.tsx`)
   - Wraps premium features with access control
   - Shows upgrade prompts for locked features
   - Provides seamless upgrade experience

### Feature Access Control

Features are defined in `src/lib/userManagement.ts` with their required access levels:

```typescript
export const FEATURES: Record<string, FeatureAccess> = {
  countdown: {
    feature: 'countdown',
    level: UserLevel.ANON,
    description: 'Basic countdown timer',
    isEnabled: true
  },
  tripPlanner: {
    feature: 'tripPlanner',
    level: UserLevel.PREMIUM,
    description: 'Advanced trip planning',
    isEnabled: true
  },
  // ... more features
}
```

### Plugin Integration

Plugins now include a `requiredLevel` field:

```typescript
config: PluginConfig = {
  id: 'planner',
  name: 'Trip Planner',
  description: 'Plan your daily Disney itinerary',
  icon: 'Calendar',
  color: 'from-park-magic to-park-epcot',
  route: '/planner',
  widgetType: 'planner',
  requiredLevel: 'premium', // New field
  isPremium: true // Legacy support
}
```

## Usage Examples

### Checking Feature Access

```typescript
import { useUser } from '@/hooks/useUser'

function MyComponent() {
  const { hasFeatureAccess } = useUser()
  
  if (hasFeatureAccess('tripPlanner')) {
    return <TripPlanner />
  } else {
    return <UpgradePrompt />
  }
}
```

### Using FeatureGuard

```typescript
import { FeatureGuard } from '@/components/ui'

function MyPage() {
  return (
    <div>
      <h1>My Dashboard</h1>
      
      <FeatureGuard feature="tripPlanner" requiredLevel="premium">
        <TripPlanner />
      </FeatureGuard>
      
      <FeatureGuard feature="saveData" requiredLevel="standard">
        <DataManager />
      </FeatureGuard>
    </div>
  )
}
```

### User Management

```typescript
import { useUser } from '@/hooks/useUser'

function UserActions() {
  const { 
    user, 
    userLevel, 
    upgradeToStandard, 
    upgradeToPremium, 
    logout 
  } = useUser()
  
  const handleUpgrade = async (email: string) => {
    try {
      upgradeToStandard(email)
      // Show success message
    } catch (error) {
      // Handle error
    }
  }
  
  return (
    <div>
      <p>Current Level: {userLevel}</p>
      <button onClick={() => handleUpgrade('user@example.com')}>
        Upgrade to Standard
      </button>
      <button onClick={upgradeToPremium}>
        Upgrade to Premium
      </button>
    </div>
  )
}
```

## Testing

Visit `/test-user-levels` to see a comprehensive test page that demonstrates:

- Current user level and information
- Feature access grid showing what's available/locked
- FeatureGuard component demos
- Available and upgradeable features
- Interactive upgrade flows

## Data Persistence

User data is stored in localStorage with the following keys:
- `disney-user`: Current user information
- `disney-user-preferences`: User preferences
- `disney-feature-access`: Feature access state

## Migration Notes

- Existing users will be automatically assigned Anonymous level
- All existing data remains accessible
- Premium features are gracefully degraded for non-premium users
- Plugin system maintains backward compatibility with `isPremium` field

## Future Enhancements

- Server-side user management
- Payment integration for premium upgrades
- Cloud synchronization
- Team/family accounts
- Advanced analytics dashboard 