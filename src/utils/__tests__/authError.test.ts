import { describe, expect, it } from 'vitest';
import { isSanctionedAccountError } from '../authError';

const axiosError = (status: number, data: unknown) => ({
  isAxiosError: true,
  response: { status, data },
});

describe('isSanctionedAccountError', () => {
  it('제재 계정 에러 코드를 감지한다', () => {
    expect(
      isSanctionedAccountError(
        axiosError(403, { code: 'ACCOUNT_BLOCKED', message: 'blocked' })
      )
    ).toBe(true);
  });

  it('auth 로그인 흐름의 bare 403을 제재 계정으로 처리한다', () => {
    expect(
      isSanctionedAccountError(axiosError(403, { code: 'AUTH_005' }), {
        allowBareForbidden: true,
      })
    ).toBe(true);
  });

  it('일반 권한 부족 403은 제재 계정으로 처리하지 않는다', () => {
    expect(
      isSanctionedAccountError(axiosError(403, { code: 'POST_002' }), {
        allowBareForbidden: true,
      })
    ).toBe(false);
  });

  it('제재 키워드가 포함된 메시지를 감지한다', () => {
    expect(
      isSanctionedAccountError(
        axiosError(403, { message: 'Account blocked by administrator' })
      )
    ).toBe(true);
  });
});
