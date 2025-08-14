document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('.landing-page-header');
    let lastScrollY = 0; // 이전 스크롤 위치를 저장
    const scrollThreshold = 50; // 헤더 배경색이 변하기 시작할 스크롤 임계값 (px)
    const hideThreshold = 100; // 헤더가 숨겨지기 시작할 스크롤 임계값 (px)

    function onScroll() {
        const currentScrollY = window.scrollY; // 현재 스크롤 위치

        // 1. 헤더 배경색 및 그림자 변경 로직 (스크롤이 일정 이상 내려갔을 때)
        if (currentScrollY > scrollThreshold) {
            header.classList.add('header-solid-bg');
        } else {
            header.classList.remove('header-solid-bg');
        }

        // 2. 헤더 숨김/표시 로직 (스크롤 방향에 따라)
        if (currentScrollY > lastScrollY && currentScrollY > hideThreshold) {
            // 아래로 스크롤 중이고, 충분히 스크롤했을 때 헤더 숨김
            header.classList.add('header-hidden');
        } else if (currentScrollY < lastScrollY) {
            // 위로 스크롤 중일 때 헤더 표시
            header.classList.remove('header-hidden');
        }

        lastScrollY = currentScrollY; // 현재 스크롤 위치를 다음 비교를 위해 저장
    }

    // 스크롤 이벤트 리스너 등록
    window.addEventListener('scroll', onScroll);

    // 페이지 로드 시 초기 상태 설정 (페이지가 이미 스크롤되어 있을 경우)
    onScroll();
});