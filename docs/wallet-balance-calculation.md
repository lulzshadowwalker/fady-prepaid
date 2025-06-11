# Wallet Balance Calculation

This document explains how wallet balances are calculated in the prepaid system, specifically for the cashout request feature.

## Overview

Each driver has a wallet with three types of balances:

1. **Total Balance** (`totalBalance`): The complete amount available in the driver's wallet
2. **Actual Balance** (`actualBalance`): Money that the driver has actually paid for (e.g., purchased prepaid cards)
3. **Added Balance** (`addedBalance`): Money added by the platform (e.g., welcome bonuses, discounted topups, promotional credits)

The relationship is: `totalBalance = actualBalance + addedBalance`

## Data Sources

The calculation uses three main data sources from Firestore:

### 1. Driver Document (`drivers_data` collection)
- Field: `driver_wallet_value` - stores the current total balance
- This is the authoritative source for the total balance

### 2. Wallet Topups (`drivers_data/{driverId}/wallet_topups` subcollection)
- Records when drivers add money by redeeming prepaid cards
- Key fields:
  - `cardValue`: Amount added to wallet
  - `isDiscounted`: Boolean indicating if this was a promotional/discounted topup
  - `createdAt`: Timestamp of the topup

### 3. Transfers (`driver_wallet_money_move` collection)
- Records peer-to-peer transfers between drivers
- Key fields:
  - `sender_uid`: Driver who sent money
  - `receiver_uid`: Driver who received money
  - `wallet_value`: Amount transferred
  - `is_discounted`: Boolean indicating if this was promotional money

## Calculation Logic

### Step 1: Get Total Balance
Retrieve `driver_wallet_value` from the driver's document in Firestore.

### Step 2: Calculate from Topups
For each wallet topup:
- If `isDiscounted = true`: Add `cardValue` to **added balance**
- If `isDiscounted = false`: Add `cardValue` to **actual balance**

### Step 3: Calculate from Transfers
For each transfer where the driver is involved:

**If driver received money** (`receiverUid` matches driver):
- If `is_discounted = true`: Add `wallet_value` to **added balance**
- If `is_discounted = false`: Add `wallet_value` to **actual balance**

**If driver sent money** (`senderUid` matches driver):
- If `is_discounted = true`: Subtract `wallet_value` from **added balance**
- If `is_discounted = false`: Subtract `wallet_value` from **actual balance**

### Step 4: Safety Measures
1. **Prevent negative balances**: Both `actualBalance` and `addedBalance` are clamped to minimum 0
2. **Reconciliation check**: If calculated total doesn't match stored total:
   - Prioritize the actual balance calculation
   - Adjust added balance to make the total match: `addedBalance = max(0, totalBalance - actualBalance)`
3. **Precision handling**: Round to 2 decimal places to avoid floating-point errors

## Implementation

The calculation is implemented in:
- `FirebaseWalletRepository.ts`: Main implementation for production
- `InMemoryWalletRepository.ts`: Mock implementation for development
- `FirebaseCashoutRequestRepository.ts`: Uses wallet repository to populate driver wallet summaries

## Usage in Cashout Requests

When displaying cashout requests, each request includes the driver's complete wallet summary. This allows admins to:
- See how much money the driver actually paid for vs. received as bonuses
- Make informed decisions about cashout approvals
- Ensure only "actual" money is eligible for cashout (business rule)

## Example Calculation

```typescript
// Driver has:
// - Total balance: $100 (from driver_wallet_value)
// - Topup 1: $50 (not discounted) -> +$50 actual
// - Topup 2: $20 (discounted) -> +$20 added  
// - Transfer received: $30 (not discounted) -> +$30 actual
// - Transfer sent: $10 (not discounted) -> -$10 actual

// Final calculation:
// actualBalance = 50 + 30 - 10 = $70
// addedBalance = 20 = $20
// totalBalance = 70 + 20 = $90

// Note: If this doesn't match stored total ($100), 
// addedBalance would be adjusted to $30 to maintain consistency
```

## Error Handling

- Returns `undefined` if driver not found
- Handles missing subcollections gracefully (returns empty arrays)
- Logs errors but doesn't throw exceptions
- Falls back to zero values for missing or invalid data

## Security Considerations

- All money calculations are performed server-side
- Floating-point precision is handled with proper rounding
- Negative balances are prevented
- Discrepancies between calculated and stored totals are logged and reconciled