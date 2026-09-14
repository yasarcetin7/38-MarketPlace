import {
  Currency,
  formatPrice,
  isCurrency,
  priceStringToCents,
} from '@/types/currency';

// test('isCurrency should validate the currency string', () => {
//   expect(isCurrency('euro')).toBe(false);
//   expect(isCurrency('EUR')).toBe(true);
//   expect(isCurrency('TRY')).toBe(true);
//   expect(isCurrency('GBP')).toBe(true);
// });

describe('isCurrency', () => {
  it('returns true if the correct input is provided', () => {
    expect(isCurrency('EUR')).toBe(true);
    expect(isCurrency('TRY')).toBe(true);
    expect(isCurrency('GBP')).toBe(true);
  });

  it('returns false if the input currency string is misspeld', () => {
    expect(isCurrency('tr')).toBe(false);
    expect(isCurrency('€')).toBe(false);
    expect(isCurrency('euro')).toBe(false);
  });

  it('returns false if the input currency is not supported', () => {
    expect(isCurrency('USD')).toBe(false);
    expect(isCurrency('SEK')).toBe(false);
    expect(isCurrency('NOK')).toBe(false);
  });
});

describe('formatPrice', () => {
  it('should format the price according to the given currency', () => {
    expect(formatPrice(214, Currency.EUR)).toMatch('€2.14');
    expect(formatPrice(100, Currency.EUR)).toMatch('€1.00');
    expect(formatPrice(100, Currency.GBP)).toMatch('£1.00');
    // "TRY 1.00"   ← actually TRY + NBSP + 1.00 so we need to allow any whitespace in the toMatch().
    expect(formatPrice(100, Currency.TRY)).toMatch(/TRY\s1\.00/)
  });
});

describe('priceStringToCents', () => {
  it('should convert price to cents', () => {
    expect(priceStringToCents('20.00')).toEqual(2000);
  });
});