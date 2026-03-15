import { describe, it, expect } from 'vitest';
import { getDistanceFromLatLonInMeters } from '../geo';

describe('geo utils', () => {
  describe('getDistanceFromLatLonInMeters', () => {
    it('같은 위치의 거리는 0이다', () => {
      const distance = getDistanceFromLatLonInMeters(37.5, 127.0, 37.5, 127.0);
      expect(distance).toBe(0);
    });

    it('서울 시청과 강남역 사이의 거리를 계산한다', () => {
      // 서울 시청: 37.5663, 126.9779
      // 강남역: 37.4979, 127.0276
      const distance = getDistanceFromLatLonInMeters(37.5663, 126.9779, 37.4979, 127.0276);
      
      // 실제 거리는 약 8.5km
      expect(distance).toBeGreaterThan(8000);
      expect(distance).toBeLessThan(9000);
    });

    it('위도 차이만 있을 때 거리를 계산한다', () => {
      const distance = getDistanceFromLatLonInMeters(37.0, 127.0, 38.0, 127.0);
      
      // 위도 1도 차이는 약 111km
      expect(distance).toBeGreaterThan(110000);
      expect(distance).toBeLessThan(112000);
    });

    it('경도 차이만 있을 때 거리를 계산한다', () => {
      const distance = getDistanceFromLatLonInMeters(37.0, 127.0, 37.0, 128.0);
      
      // 경도 1도 차이는 위도에 따라 다르지만 약 88km (37도 위도 기준)
      expect(distance).toBeGreaterThan(85000);
      expect(distance).toBeLessThan(92000);
    });

    it('음수 좌표도 처리한다', () => {
      const distance = getDistanceFromLatLonInMeters(-33.8688, 151.2093, -37.8136, 144.9631);
      
      // 시드니와 멜버른 사이 거리는 약 714km
      expect(distance).toBeGreaterThan(700000);
      expect(distance).toBeLessThan(730000);
    });

    it('작은 거리도 정확하게 계산한다', () => {
      // 100m 정도 차이
      const distance = getDistanceFromLatLonInMeters(37.5663, 126.9779, 37.5673, 126.9779);
      
      expect(distance).toBeGreaterThan(100);
      expect(distance).toBeLessThan(120);
    });

    it('반환값은 미터 단위이다', () => {
      const distance = getDistanceFromLatLonInMeters(37.5, 127.0, 37.6, 127.1);
      
      // 결과는 숫자이고 양수여야 함
      expect(typeof distance).toBe('number');
      expect(distance).toBeGreaterThan(0);
    });
  });
});
