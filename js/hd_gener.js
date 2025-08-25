document.addEventListener('DOMContentLoaded', () => {
    // ================================================================
    // 1. 6초 후 강제 페이지 이동 기능
    // ================================================================
    const generatingContainer = document.querySelector('.generating-container');

    if (generatingContainer) {
        const urlParams = new URLSearchParams(window.location.search);
        const jobId = urlParams.get('job_id');

        if (jobId) {
            // jobId가 있으면, 6초(6000ms) 후에 결과 페이지로 이동시킵니다.
            setTimeout(() => {
                window.location.href = `hd_report_result.html?job_id=${jobId}`;
            }, 1800000);
        } else {
            // jobId가 없으면 오류 메시지를 표시합니다.
            generatingContainer.innerHTML = `
                <h1>오류가 발생했습니다.</h1>
                <p>작업 ID를 찾을 수 없습니다. 다시 시도해주세요.</p>
            `;
        }
    }

    // ================================================================
    // 2. 헤더 및 드롭다운 메뉴 기능 (기존 코드와 동일하게 유지)
    // ================================================================
    const dropdownBtn = document.querySelector('.dropdown-btn');
    const dropdownContent = document.querySelector('.dropdown-content');
    const header = document.querySelector('.landing-page-header');
    
    // ... (이하 헤더 관련 코드는 기존과 동일) ...
    let lastScrollTop = 0;
    let scrollTimeout;
    window.addEventListener('scroll', function() {
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            if (dropdownContent && dropdownContent.classList.contains('show')) {
                dropdownContent.classList.remove('show');
                dropdownBtn.classList.remove('active');
            }
        }, 40);
        if (scrollTop > lastScrollTop && scrollTop > 50) {
            header.classList.add('header-hidden');
        } else {
            header.classList.remove('header-hidden');
        }
        if (scrollTop > 50) {
            header.classList.add('header-solid-bg');
        } else {
            header.classList.remove('header-solid-bg');
        }
        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
    }, false);
    if (dropdownBtn) {
        dropdownBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            const isShown = dropdownContent.classList.toggle('show');
            dropdownBtn.classList.toggle('active', isShown);
        });
    }
    window.addEventListener('click', (event) => {
        if (dropdownContent && dropdownContent.classList.contains('show')) {
            dropdownContent.classList.remove('show');
            dropdownBtn.classList.remove('active');
        }
    });
});