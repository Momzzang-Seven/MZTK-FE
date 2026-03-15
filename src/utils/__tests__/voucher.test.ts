import { describe, it, expect, vi } from 'vitest';
import { voucherCodeToBytes32, parseAmount } from '../voucher';

// ethers 모듈 모킹
vi.mock('ethers', () => ({
  toUtf8Bytes: (str: string) => {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(str);
    // 32바이트로 제한
    return bytes.length > 32 ? bytes.slice(0, 32) : bytes;
  },
  hexlify: (arr: Uint8Array) => '0x' + Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join(''),
  ethers: {
    parseUnits: (value: string, decimals: number) => {
      // 소수점 처리를 위한 간단한 구현
      const parts = value.split('.');
      const integerPart = BigInt(parts[0] || '0');
      const decimalPart = parts[1] || '';
      const paddedDecimal = decimalPart.padEnd(decimals, '0').slice(0, decimals);
      return integerPart * BigInt(10) ** BigInt(decimals) + BigInt(paddedDecimal || '0');
    },
  },
}));

describe('voucher utils', () => {
  describe('voucherCodeToBytes32', () => {
    it('바우처 코드를 bytes32로 변환한다', () => {
      const result = voucherCodeToBytes32('TEST');
      
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result.startsWith('0x')).toBe(true);
    });

    it('32바이트 길이의 hex 문자열을 반환한다', () => {
      const result = voucherCodeToBytes32('VOUCHER123');
      
      // 0x + 64 hex characters (32 bytes)
      expect(result.length).toBe(66);
    });

    it('빈 문자열도 처리한다', () => {
      const result = voucherCodeToBytes32('');
      
      expect(result).toBeDefined();
      expect(result.startsWith('0x')).toBe(true);
    });

    it('같은 코드는 같은 결과를 반환한다', () => {
      const code = 'TESTCODE';
      const result1 = voucherCodeToBytes32(code);
      const result2 = voucherCodeToBytes32(code);
      
      expect(result1).toBe(result2);
    });
  });

  describe('parseAmount', () => {
    it('금액을 wei 단위로 변환한다 (기본 18 decimals)', () => {
      const result = parseAmount('1');
      
      expect(result).toBe(BigInt('1000000000000000000'));
    });

    it('소수점 금액을 처리한다', () => {
      const result = parseAmount('1.5');
      
      expect(result).toBe(BigInt('1500000000000000000'));
    });

    it('커스텀 decimals를 지원한다', () => {
      const result = parseAmount('100', 6);
      
      expect(result).toBe(BigInt('100000000'));
    });

    it('0을 처리한다', () => {
      const result = parseAmount('0');
      
      expect(result).toBe(BigInt('0'));
    });

    it('큰 숫자를 처리한다', () => {
      const result = parseAmount('1000000');
      
      expect(result).toBe(BigInt('1000000000000000000000000'));
    });

    it('소수점 자리수가 decimals보다 작을 때 처리한다', () => {
      const result = parseAmount('1.5', 6);
      
      expect(result).toBe(BigInt('1500000'));
    });
  });
});

