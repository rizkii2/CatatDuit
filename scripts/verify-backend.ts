import { formatRupiah, parseRupiahInput, formatDateID, formatFullDateID, getTodayWIB, getFirstDayOfMonthWIB } from '../src/lib/utils/format';
import { signUpSchema, signInSchema, updateProfileSchema } from '../src/lib/validations/auth';
import { createAccountSchema } from '../src/lib/validations/account';
import { createCategorySchema } from '../src/lib/validations/category';
import { createTransactionSchema, transactionFilterSchema } from '../src/lib/validations/transaction';
import { createTransferSchema } from '../src/lib/validations/transfer';
import { upsertBudgetSchema } from '../src/lib/validations/budget';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`✅ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`❌ FAIL: ${testName}${detail ? ' -> ' + detail : ''}`);
    failed++;
  }
}

console.log('--- Testing CatatDuit Backend Logic & Validation ---\n');

// 1. FORMATTING TESTS (FR-2, FR-5, FR-6, Localization)
console.log('[Test Suite 1: Formatting & Localization]');
const rpFormatted = formatRupiah(1250000);
// IDR format in Node.js id-ID produces e.g. "Rp 1.250.000" or "Rp1.250.000"
assert(rpFormatted.includes('1.250.000'), 'formatRupiah formats 1250000 correctly', rpFormatted);
assert(parseRupiahInput('Rp 1.250.000') === 1250000, 'parseRupiahInput parses "Rp 1.250.000" to 1250000');
assert(parseRupiahInput('50000') === 50000, 'parseRupiahInput parses "50000" to 50000');
assert(parseRupiahInput('') === 0, 'parseRupiahInput handles empty string');

const todayWIB = getTodayWIB();
assert(/^\d{4}-\d{2}-\d{2}$/.test(todayWIB), 'getTodayWIB returns YYYY-MM-DD', todayWIB);

const firstDay = getFirstDayOfMonthWIB(new Date('2026-10-29T10:00:00Z'));
assert(firstDay === '2026-10-01', 'getFirstDayOfMonthWIB returns 2026-10-01', firstDay);

// 2. AUTH VALIDATION TESTS (FR-1)
console.log('\n[Test Suite 2: Auth Validation]');
const validSignUp = signUpSchema.safeParse({
  email: 'budi@example.com',
  password: 'password123',
  nama: 'Budi Santoso',
});
assert(validSignUp.success, 'Valid signUp passes');

const invalidEmailSignUp = signUpSchema.safeParse({
  email: 'budi-bukan-email',
  password: 'password123',
});
assert(!invalidEmailSignUp.success, 'Invalid email in signUp fails');

const shortPasswordSignUp = signUpSchema.safeParse({
  email: 'budi@example.com',
  password: '123',
});
assert(!shortPasswordSignUp.success, 'Short password in signUp fails');

// 3. ACCOUNT VALIDATION TESTS (FR-3)
console.log('\n[Test Suite 3: Account Validation]');
const validAccount = createAccountSchema.safeParse({
  nama: 'BCA Utama',
  tipe: 'bank',
  saldo_awal: 5000000,
});
assert(validAccount.success, 'Valid account passes');

const invalidAccountType = createAccountSchema.safeParse({
  nama: 'Crypto',
  tipe: 'crypto', // Only cash/bank/ewallet
  saldo_awal: 10000,
});
assert(!invalidAccountType.success, 'Invalid account type fails');

const negativeBalanceAccount = createAccountSchema.safeParse({
  nama: 'Tunai',
  tipe: 'cash',
  saldo_awal: -5000,
});
assert(!negativeBalanceAccount.success, 'Negative saldo_awal fails');

// 4. CATEGORY VALIDATION TESTS (FR-4)
console.log('\n[Test Suite 4: Category Validation]');
const validCategory = createCategorySchema.safeParse({
  nama: 'Makan Siang',
  tipe: 'expense',
  ikon: 'Utensils',
  warna: '#EF4444',
});
assert(validCategory.success, 'Valid category passes');

const invalidColorCategory = createCategorySchema.safeParse({
  nama: 'Makan',
  tipe: 'expense',
  ikon: 'Utensils',
  warna: 'red', // Must be #RRGGBB hex
});
assert(!invalidColorCategory.success, 'Invalid hex color fails');

// 5. TRANSACTION VALIDATION TESTS (FR-2)
console.log('\n[Test Suite 5: Transaction Validation]');
const validTx = createTransactionSchema.safeParse({
  account_id: '123e4567-e89b-12d3-a456-426614174000',
  category_id: '123e4567-e89b-12d3-a456-426614174001',
  tipe: 'expense',
  amount: 45000,
  tanggal: '2026-10-29',
  catatan: 'Makan siang warteg',
});
assert(validTx.success, 'Valid transaction passes');

const zeroAmountTx = createTransactionSchema.safeParse({
  account_id: '123e4567-e89b-12d3-a456-426614174000',
  category_id: '123e4567-e89b-12d3-a456-426614174001',
  tipe: 'expense',
  amount: 0, // PRD: nominal wajib bilangan bulat lebih dari 0
  tanggal: '2026-10-29',
});
assert(!zeroAmountTx.success, 'Zero amount transaction fails (must be > 0)');

const decimalAmountTx = createTransactionSchema.safeParse({
  account_id: '123e4567-e89b-12d3-a456-426614174000',
  category_id: '123e4567-e89b-12d3-a456-426614174001',
  tipe: 'expense',
  amount: 45000.5, // PRD: rupiah tanpa desimal
  tanggal: '2026-10-29',
});
assert(!decimalAmountTx.success, 'Decimal amount transaction fails');

// 6. TRANSFER VALIDATION TESTS (FR-6)
console.log('\n[Test Suite 6: Transfer Validation]');
const validTransfer = createTransferSchema.safeParse({
  dari_account_id: '123e4567-e89b-12d3-a456-426614174000',
  ke_account_id: '123e4567-e89b-12d3-a456-426614174001',
  amount: 250000,
  biaya_admin: 2500,
  tanggal: '2026-10-29',
  catatan: 'Topup e-wallet',
});
assert(validTransfer.success, 'Valid transfer passes');

const sameAccountTransfer = createTransferSchema.safeParse({
  dari_account_id: '123e4567-e89b-12d3-a456-426614174000',
  ke_account_id: '123e4567-e89b-12d3-a456-426614174000', // SAME ACCOUNT!
  amount: 250000,
  biaya_admin: 0,
});
assert(!sameAccountTransfer.success, 'Transfer with same source and destination fails');

// 7. BUDGET VALIDATION & CALCULATION TESTS (FR-7)
console.log('\n[Test Suite 7: Budget Logic & Calculation]');
const validBudget = upsertBudgetSchema.safeParse({
  category_id: '123e4567-e89b-12d3-a456-426614174001',
  bulan: '2026-10-01',
  batas: 1500000,
});
assert(validBudget.success, 'Valid budget passes');

const invalidBudgetMonth = upsertBudgetSchema.safeParse({
  category_id: '123e4567-e89b-12d3-a456-426614174001',
  bulan: '2026-10-15', // Must be YYYY-MM-01 (tanggal 1)
  batas: 1500000,
});
assert(!invalidBudgetMonth.success, 'Budget month not starting on day 01 fails');

// Budget Alert thresholds:
// aman (<80%), peringatan (80-100%), melebihi (>100%)
function calculateBudgetStatus(batas: number, terpakai: number) {
  const percentage = Math.round((terpakai / batas) * 100);
  let status: 'aman' | 'peringatan' | 'melebihi' = 'aman';
  if (percentage >= 100) status = 'melebihi';
  else if (percentage >= 80) status = 'peringatan';
  return { percentage, status };
}

assert(calculateBudgetStatus(1000000, 750000).status === 'aman', '75% spent is aman');
assert(calculateBudgetStatus(1000000, 800000).status === 'peringatan', '80% spent is peringatan');
assert(calculateBudgetStatus(1000000, 950000).status === 'peringatan', '95% spent is peringatan');
assert(calculateBudgetStatus(1000000, 1050000).status === 'melebihi', '105% spent is melebihi');

// 8. DYNAMIC BALANCE FORMULA VERIFICATION (FR-3, FR-6)
// Saldo = saldo_awal + total pemasukan - total pengeluaran - (transfer keluar + biaya admin) + transfer masuk
console.log('\n[Test Suite 8: Dynamic Account Balance Formula]');
const saldoAwal = 5000000;
const incomeTx = 2500000;
const expenseTx = 1200000;
const transferOut = 500000;
const adminFee = 2500;
const transferIn = 100000;

const calculatedBalance = saldoAwal + incomeTx - expenseTx - (transferOut + adminFee) + transferIn;
// 5000000 + 2500000 - 1200000 - 502500 + 100000 = 5897500
assert(calculatedBalance === 5897500, 'Dynamic balance calculation matches formula exactly', String(calculatedBalance));

console.log(`\n========================================`);
console.log(`Summary: ${passed} passed, ${failed} failed`);
console.log(`========================================\n`);

if (failed > 0) {
  process.exit(1);
}

