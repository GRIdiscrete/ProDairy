# Driver Forms Offline Mode - Quick Visual Guide

## Status Indicators

### Online Mode
```
┌─────────────────────────────────────────────┐
│  🟢 Online  [Load Data] [Check Network]    │
│             [Sync Pending (0)] [+ Create]   │
└─────────────────────────────────────────────┘
```

### Offline Mode with Cached Data
```
┌─────────────────────────────────────────────────────────────────────────┐
│  🟠 Offline  📦 Cached: 25 drivers, 15 materials, 10 suppliers         │
│              [Load Data (disabled)] [Check Network]                     │
│              [Sync Pending (0) (disabled)] [+ Create]                   │
└─────────────────────────────────────────────────────────────────────────┘
```

### Offline Mode with Pending Forms
```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  🟠 Offline  📦 Cached: 25 drivers, 15 materials, 10 suppliers                 │
│              ⏳ 3 pending forms to sync                                         │
│              [Load Data (disabled)] [Check Network]                             │
│              [Sync Pending (3) (disabled)] [+ Create]                           │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## Form Status Badges

```
┌──────────────────────────────────────────────┐
│  ✅ Delivered      (Green badge)             │
│  ❌ Rejected       (Red badge)               │
│  ⏺️  Pending        (Yellow badge)            │
│  📴 Pending Sync   (Orange badge - offline)  │
└──────────────────────────────────────────────┘
```

## Form Drawer - Online vs Offline

### Online Mode
```
┌─────────────────────────────────────────┐
│  Create Driver Form                     │
│  🟢 Online  [Refresh Data]              │
│                                         │
│  Driver *           [Select driver ▾]  │
│  Start Date *       [Pick date]        │
│  End Date *         [Pick date]        │
│  Tanker *           [Select tanker ▾]  │
│                                         │
│  ✅ All dropdowns populated with live data
└─────────────────────────────────────────┘
```

### Offline Mode
```
┌─────────────────────────────────────────────────────────┐
│  Create Driver Form                                     │
│  🟠 Offline  [Refresh Data]                             │
│  📦 Using cached data (25 drivers, 15 materials, 10     │
│     suppliers)                                          │
│                                                         │
│  Driver *           [Select driver ▾]                  │
│  Start Date *       [Pick date]                        │
│  End Date *         [Pick date]                        │
│  Tanker *           [Select tanker ▾] (empty - online) │
│                                                         │
│  ✅ Dropdowns populated with cached data                │
│  ⚠️  Tanker dropdown empty (not cached)                 │
└─────────────────────────────────────────────────────────┘
```

## User Workflow Examples

### Scenario 1: Create Form While Online
```
1. User opens page → 🟢 Online
2. Click [+ Create Form]
3. Form drawer opens with live data
4. Fill form, click [Create Form]
5. ✅ "Driver form created successfully"
6. Form appears in list with ✅ Delivered / ⏺️ Pending badge
```

### Scenario 2: Prepare for Offline Work
```
1. User is 🟢 Online
2. Click [Load Data] button
3. Wait for: "All data loaded and stored offline successfully!"
4. ✅ Data now cached in browser
5. User can now work offline
```

### Scenario 3: Create Form While Offline
```
1. Network disconnects → 🟠 Offline
2. Page shows: 📦 Cached: X drivers, Y materials, Z suppliers
3. Click [+ Create Form]
4. Form drawer shows: 🟠 Offline with cached data count
5. Fill form using cached dropdowns
6. Click [Create Form]
7. 💾 "Driver form saved offline. It will be synced when..."
8. Form appears with 📴 Pending Sync badge
9. Counter updates: ⏳ 1 pending form to sync
10. [Sync Pending (1)] button shows count
```

### Scenario 4: Sync Pending Forms
```
1. Network reconnects → 🟢 Online
2. Page shows: ⏳ 3 pending forms to sync
3. Click [Sync Pending (3)] button
4. Processing...
5. ✅ "Successfully synced 3 form(s)"
6. Forms lose 📴 Pending Sync badge
7. Counter resets: [Sync Pending (0)]
8. Forms now have ✅ or ⏺️ badge
```

### Scenario 5: Manual Network Check
```
1. User unsure of connection status
2. Click [Check Network] button
3a. If online: ✅ "Network connection is active"
3b. If offline: ❌ "No network connection detected"
4. Badge updates to reflect true status
```

### Scenario 6: Work Offline, Refresh Page
```
1. User is 🟠 Offline
2. Creates 2 forms offline
3. Counter shows: ⏳ 2 pending forms to sync
4. User refreshes page (F5)
5. Page reloads → 🟠 Offline
6. Still shows: ⏳ 2 pending forms to sync
7. ✅ Data persisted in localStorage
8. Forms still show 📴 Pending Sync badge
```

## Button States

### Online Mode Buttons
```
[Load Data]          ✅ Enabled - loads fresh data
[Check Network]      ✅ Enabled - verifies connection  
[Sync Pending (X)]   ✅ Enabled if X > 0
[+ Create Form]      ✅ Enabled - uses live data
[Refresh Data]       ✅ Enabled - fetches from API
```

### Offline Mode Buttons
```
[Load Data]          ❌ Disabled - needs network
[Check Network]      ✅ Enabled - verifies connection
[Sync Pending (X)]   ❌ Disabled - needs network
[+ Create Form]      ✅ Enabled - uses cached data
[Refresh Data]       ✅ Enabled - reloads from localStorage
```

## Toast Notifications

```
Online Actions:
✅ "All data loaded and stored offline successfully!"
✅ "Driver form created successfully"
✅ "Successfully synced 3 form(s)"
✅ "Network connection is active"

Offline Actions:
💾 "Driver form saved offline. It will be synced when you're back online."
❌ "No network connection detected"
❌ "You must be online to sync pending forms"
❌ "You need to be online to load data"

Mixed Results:
⚠️ "Synced 2 form(s), 1 failed"
ℹ️ "No pending forms to sync"
```

## Debugging Checklist

### If offline data not loading:
```
☑️ Check browser console for errors
☑️ Open DevTools > Application > Local Storage
☑️ Verify offline_* keys exist
☑️ Run test-offline-data.js in console
☑️ Click [Load Data] while online first
☑️ Click [Refresh Data] to manually reload
☑️ Check network badge matches actual connectivity
```

### If forms not syncing:
```
☑️ Verify actually online (green badge)
☑️ Click [Check Network] to confirm
☑️ Check console for sync errors
☑️ Verify pending count > 0
☑️ Check localStorage for pending forms
☑️ Try [Refresh Data] then sync again
```

### If badge shows wrong status:
```
☑️ Click [Check Network] button
☑️ Wait 30 seconds for auto-check
☑️ Toggle airplane mode off/on
☑️ Check browser console for network logs
☑️ Verify /api/health-check is accessible
```

## Data Flow Diagram

```
User Action → Network Check → Data Source Selection → Display
     │              │                    │                │
     │              ├─ Online ──────> API/Supabase       │
     │              │                    │                │
     │              └─ Offline ─────> localStorage ──────┘
     │
     └─ Submit Form ─┬─ Online ──> POST to API ──> Success
                     │
                     └─ Offline ─> Save to localStorage
                                   └─> Pending badge
                                   └─> Counter++
                                   └─> Wait for sync
```

## Color Coding

- 🟢 **Green**: Online, connected, success, delivered
- 🟠 **Orange**: Offline, pending sync, warning
- 🔴 **Red**: Error, rejected, failed
- 🟡 **Yellow**: Pending action/status
- ⚫ **Gray**: Disabled, neutral

## Key Performance Indicators

```
Network Check Interval:  30 seconds (automatic)
Health Check Timeout:    5 seconds
Data Refresh:            On-demand (manual button)
Auto-Sync:               Disabled (manual only)
Cache Expiry:            None (persists until cleared)
Sync Strategy:           One-by-one (sequential)
```
