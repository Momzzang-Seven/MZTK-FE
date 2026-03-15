import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { VerifyStatusOverlay } from '../VerifyStatusOverlay';

vi.mock('@constant/location', () => ({
  VERIFY_TEXT: {
    DISTANCE_PREFIX: '현재 거리: ',
    DISTANCE_UNIT: 'm',
    WARNING_OUT_OF_RANGE: '범위를 벗어났습니다',
  },
}));

describe('VerifyStatusOverlay', () => {
  const mockGymLocation = { lat: 37.5, lng: 127.0 };

  it('거리 정보가 표시된다', () => {
    render(
      <VerifyStatusOverlay
        gymLocation={mockGymLocation}
        distance={50}
        isNear={true}
      />
    );
    
    expect(screen.getByText(/현재 거리: 50m/)).toBeInTheDocument();
  });

  it('isNear=false일 때 경고 메시지가 표시된다', () => {
    render(
      <VerifyStatusOverlay
        gymLocation={mockGymLocation}
        distance={150}
        isNear={false}
      />
    );
    
    expect(screen.getByText('범위를 벗어났습니다')).toBeInTheDocument();
  });

  it('isNear=true일 때 경고 메시지가 숨겨진다', () => {
    render(
      <VerifyStatusOverlay
        gymLocation={mockGymLocation}
        distance={50}
        isNear={true}
      />
    );
    
    expect(screen.queryByText('범위를 벗어났습니다')).not.toBeInTheDocument();
  });

  it('gymLocation이 null일 때 아무것도 렌더링하지 않는다', () => {
    const { container } = render(
      <VerifyStatusOverlay
        gymLocation={null}
        distance={50}
        isNear={true}
      />
    );
    
    expect(container.firstChild).toBeNull();
  });

  it('distance가 null일 때 아무것도 렌더링하지 않는다', () => {
    const { container } = render(
      <VerifyStatusOverlay
        gymLocation={mockGymLocation}
        distance={null}
        isNear={false}
      />
    );
    
    expect(container.firstChild).toBeNull();
  });

  it('overlay 스타일이 적용된다', () => {
    const { container } = render(
      <VerifyStatusOverlay
        gymLocation={mockGymLocation}
        distance={50}
        isNear={true}
      />
    );
    
    const overlay = container.querySelector('.absolute.top-28');
    expect(overlay).toBeInTheDocument();
  });
});
