// 카카오 맵 API 동적 로드
export const loadKakaoMapScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // 이미 로드되었는지 확인
    if ((window as any).kakao && (window as any).kakao.maps) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    const apiKey = import.meta.env.VITE_KAKAO_MAP_KEY;

    if (!apiKey) {
      reject(new Error('카카오 맵 API 키가 설정되지 않았습니다.'));
      return;
    }

    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&libraries=services&autoload=false`;
    script.async = true;

    script.onload = () => {
      // 카카오 맵 API 로드 완료 후 초기화
      (window as any).kakao.maps.load(() => {
        resolve();
      });
    };

    script.onerror = () => {
      reject(new Error('카카오 맵 API 로드에 실패했습니다.'));
    };

    document.head.appendChild(script);
  });
};