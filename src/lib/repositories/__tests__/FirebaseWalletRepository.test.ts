// import { FirebaseWalletRepository } from '../FirebaseWalletRepository';
// import { WalletSummary } from '../../types';
//
// // Mock Firestore
// jest.mock('@/lib/firebase', () => ({
//   firestore: {}
// }));
//
// // Mock Firestore functions
// jest.mock('firebase/firestore', () => ({
//   collection: jest.fn(),
//   doc: jest.fn(),
//   getDocs: jest.fn(),
//   query: jest.fn(),
//   where: jest.fn(),
//   or: jest.fn(),
// }));
//
// describe('FirebaseWalletRepository', () => {
//   let repository: FirebaseWalletRepository;
//
//   beforeEach(() => {
//     repository = new FirebaseWalletRepository();
//     jest.clearAllMocks();
//   });
//
//   describe('calculateBalances', () => {
//     // Access private method for testing
//     const calculateBalances = (
//       topUps: any[],
//       transfers: any[],
//       totalBalance: number,
//       driverUid: string
//     ) => {
//       // @ts-expect-error - accessing private method for testing
//       return repository.calculateBalances(topUps, transfers, totalBalance, driverUid);
//     };
//
//     test('should handle normal case where calculated matches stored total', () => {
//       const topUps = [
//         { cardValue: 50, isDiscounted: false }, // +50 actual
//         { cardValue: 20, isDiscounted: true },  // +20 added
//       ];
//       const transfers = [
//         { 
//           receiverUid: 'driver123',
//           senderUid: 'other',
//           walletValue: 10,
//           isDiscounted: false 
//         }, // +10 actual
//       ];
//
//       const result = calculateBalances(topUps, transfers, 80, 'driver123');
//
//       expect(result).toEqual({
//         actualBalance: 60,  // 50 + 10
//         addedBalance: 20,   // 20
//       });
//     });
//
//     test('should handle bug case where calculated exceeds stored total (scale down)', () => {
//       const topUps = [
//         { cardValue: 20, isDiscounted: false }, // +20 actual
//         { cardValue: 5, isDiscounted: true },   // +5 added
//       ];
//       const transfers = [];
//
//       // Calculated: 25, but stored total is only 9
//       const result = calculateBalances(topUps, transfers, 9, 'driver123');
//
//       expect(result.actualBalance).toBeCloseTo(7.2, 1);  // 20 * (9/25) = 7.2
//       expect(result.addedBalance).toBeCloseTo(1.8, 1);   // 5 * (9/25) = 1.8
//       expect(result.actualBalance + result.addedBalance).toBeCloseTo(9, 1);
//     });
//
//     test('should handle case where calculated is less than stored total', () => {
//       const topUps = [
//         { cardValue: 30, isDiscounted: false }, // +30 actual
//       ];
//       const transfers = [];
//
//       // Calculated: 30, but stored total is 50
//       const result = calculateBalances(topUps, transfers, 50, 'driver123');
//
//       expect(result).toEqual({
//         actualBalance: 50,  // 30 + (50-30) = 50
//         addedBalance: 0,    // 0
//       });
//     });
//
//     test('should never exceed total balance', () => {
//       const topUps = [
//         { cardValue: 100, isDiscounted: false },
//         { cardValue: 50, isDiscounted: true },
//       ];
//       const transfers = [];
//
//       const result = calculateBalances(topUps, transfers, 30, 'driver123');
//
//       expect(result.actualBalance).toBeLessThanOrEqual(30);
//       expect(result.addedBalance).toBeLessThanOrEqual(30);
//       expect(result.actualBalance + result.addedBalance).toBeLessThanOrEqual(30);
//     });
//
//     test('should handle outgoing transfers correctly', () => {
//       const topUps = [
//         { cardValue: 100, isDiscounted: false }, // +100 actual
//       ];
//       const transfers = [
//         {
//           senderUid: 'driver123',
//           receiverUid: 'other',
//           walletValue: 30,
//           isDiscounted: false
//         }, // -30 actual
//       ];
//
//       const result = calculateBalances(topUps, transfers, 70, 'driver123');
//
//       expect(result).toEqual({
//         actualBalance: 70,  // 100 - 30
//         addedBalance: 0,
//       });
//     });
//
//     test('should handle mixed topups and transfers', () => {
//       const topUps = [
//         { cardValue: 50, isDiscounted: false }, // +50 actual
//         { cardValue: 10, isDiscounted: true },  // +10 added
//       ];
//       const transfers = [
//         {
//           receiverUid: 'driver123',
//           senderUid: 'other',
//           walletValue: 20,
//           isDiscounted: false
//         }, // +20 actual
//         {
//           senderUid: 'driver123',
//           receiverUid: 'other',
//           walletValue: 15,
//           isDiscounted: true
//         }, // -15 added
//       ];
//
//       const result = calculateBalances(topUps, transfers, 65, 'driver123');
//
//       expect(result).toEqual({
//         actualBalance: 70,  // 50 + 20 = 70, but capped to 65
//         addedBalance: 0,    // 10 - 15 = -5, but capped to 0, then adjusted
//       });
//     });
//
//     test('should prevent negative balances', () => {
//       const topUps = [];
//       const transfers = [
//         {
//           senderUid: 'driver123',
//           receiverUid: 'other',
//           walletValue: 50,
//           isDiscounted: false
//         }, // -50 actual
//       ];
//
//       const result = calculateBalances(topUps, transfers, 0, 'driver123');
//
//       expect(result.actualBalance).toBeGreaterThanOrEqual(0);
//       expect(result.addedBalance).toBeGreaterThanOrEqual(0);
//     });
//
//     test('should handle precision correctly', () => {
//       const topUps = [
//         { cardValue: 33.33, isDiscounted: false },
//         { cardValue: 66.67, isDiscounted: true },
//       ];
//       const transfers = [];
//
//       const result = calculateBalances(topUps, transfers, 100, 'driver123');
//
//       expect(result.actualBalance).toEqual(33.33);
//       expect(result.addedBalance).toEqual(66.67);
//     });
//
//     test('should handle zero total balance', () => {
//       const topUps = [
//         { cardValue: 50, isDiscounted: false },
//       ];
//       const transfers = [];
//
//       const result = calculateBalances(topUps, transfers, 0, 'driver123');
//
//       expect(result).toEqual({
//         actualBalance: 0,
//         addedBalance: 0,
//       });
//     });
//
//     test('should handle empty topups and transfers', () => {
//       const result = calculateBalances([], [], 25, 'driver123');
//
//       expect(result).toEqual({
//         actualBalance: 25, // Difference added to actual balance
//         addedBalance: 0,
//       });
//     });
//
//     test('should log warnings for discrepancies', () => {
//       const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
//
//       const topUps = [
//         { cardValue: 100, isDiscounted: false },
//       ];
//
//       calculateBalances(topUps, [], 50, 'driver123');
//
//       expect(consoleSpy).toHaveBeenCalledWith(
//         expect.stringContaining('Wallet balance discrepancy'),
//         expect.objectContaining({
//           calculated: 100,
//           stored: 50,
//         })
//       );
//
//       consoleSpy.mockRestore();
//     });
//   });
//
//   describe('edge cases', () => {
//     test('should maintain mathematical relationship: total = actual + added', () => {
//       const testCases = [
//         { calculated: 100, stored: 50 },
//         { calculated: 25, stored: 80 },
//         { calculated: 0, stored: 30 },
//         { calculated: 50, stored: 50 },
//       ];
//
//       testCases.forEach(({ calculated, stored }) => {
//         const topUps = [
//           { cardValue: calculated, isDiscounted: false }
//         ];
//
//         // @ts-ignore
//         const result = repository.calculateBalances(topUps, [], stored, 'test');
//
//         const total = result.actualBalance + result.addedBalance;
//         expect(total).toBeCloseTo(Math.min(calculated, stored), 2);
//         expect(result.actualBalance).toBeLessThanOrEqual(stored);
//         expect(result.addedBalance).toBeLessThanOrEqual(stored);
//       });
//     });
//   });
// });
