import { describe, it, expect } from 'vitest';
import { getChartData, getChartOptions } from '../chartConfig';

describe('chartConfig utils', () => {
  describe('getChartData', () => {
    it('차트 데이터를 반환한다', () => {
      const data = getChartData();
      
      expect(data).toBeDefined();
      expect(data).toHaveProperty('labels');
      expect(data).toHaveProperty('datasets');
    });

    it('5개의 라벨을 가진다', () => {
      const data = getChartData();
      
      expect(data.labels).toHaveLength(5);
      expect(data.labels).toContain('부적절한 내용');
      expect(data.labels).toContain('스팸');
      expect(data.labels).toContain('규정 위반');
      expect(data.labels).toContain('괴롭힘');
      expect(data.labels).toContain('기타');
    });

    it('데이터셋을 가진다', () => {
      const data = getChartData();
      
      expect(data.datasets).toHaveLength(1);
      expect(data.datasets[0]).toHaveProperty('data');
      expect(data.datasets[0]).toHaveProperty('backgroundColor');
    });

    it('데이터 값이 올바르다', () => {
      const data = getChartData();
      
      expect(data.datasets[0].data).toEqual([30, 25, 20, 15, 10]);
    });

    it('배경색이 정의되어 있다', () => {
      const data = getChartData();
      
      expect(data.datasets[0].backgroundColor).toHaveLength(5);
      expect(data.datasets[0].backgroundColor[0]).toBe('#FF6384');
    });

    it('hoverOffset과 borderWidth가 설정되어 있다', () => {
      const data = getChartData();
      
      expect(data.datasets[0].hoverOffset).toBe(4);
      expect(data.datasets[0].borderWidth).toBe(0);
    });
  });

  describe('getChartOptions', () => {
    it('차트 옵션을 반환한다', () => {
      const options = getChartOptions();
      
      expect(options).toBeDefined();
      expect(options).toHaveProperty('responsive');
      expect(options).toHaveProperty('maintainAspectRatio');
      expect(options).toHaveProperty('plugins');
    });

    it('responsive 설정이 true이다', () => {
      const options = getChartOptions();
      
      expect(options.responsive).toBe(true);
    });

    it('maintainAspectRatio 설정이 false이다', () => {
      const options = getChartOptions();
      
      expect(options.maintainAspectRatio).toBe(false);
    });

    it('datalabels 플러그인 설정이 있다', () => {
      const options = getChartOptions();
      
      expect(options.plugins.datalabels).toBeDefined();
      expect(options.plugins.datalabels.color).toBe('#fff');
      expect(options.plugins.datalabels.font.weight).toBe('bold');
      expect(options.plugins.datalabels.font.size).toBe(18);
    });

    it('datalabels formatter가 퍼센트를 추가한다', () => {
      const options = getChartOptions();
      
      const formatted = options.plugins.datalabels.formatter(30);
      expect(formatted).toBe('30%');
    });

    it('legend 플러그인 설정이 있다', () => {
      const options = getChartOptions();
      
      expect(options.plugins.legend).toBeDefined();
      expect(options.plugins.legend.position).toBe('right');
      expect(options.plugins.legend.labels.boxWidth).toBe(20);
      expect(options.plugins.legend.labels.padding).toBe(15);
    });

    it('tooltip 콜백이 정의되어 있다', () => {
      const options = getChartOptions();
      
      expect(options.plugins.tooltip.callbacks.label).toBeDefined();
      expect(typeof options.plugins.tooltip.callbacks.label).toBe('function');
    });

    it('tooltip label 콜백이 올바른 형식을 반환한다', () => {
      const options = getChartOptions();
      
      const mockContext: any = {
        label: '부적절한 내용',
        parsed: 30,
      };
      
      const result = options.plugins.tooltip.callbacks.label(mockContext);
      expect(result).toBe('부적절한 내용: 30%');
    });
  });
});
