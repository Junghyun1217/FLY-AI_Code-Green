document.addEventListener('DOMContentLoaded', () => {
    
    // ================================================================
    // 1. 분석 상태 확인 (폴링) 기능
    // ================================================================
    const generatingContainer = document.querySelector('.generating-container');
    if (generatingContainer) {
        // URL 주소에서 'job_id' 값을 가져옵니다.
        const urlParams = new URLSearchParams(window.location.search);
        const jobId = urlParams.get('job_id');

        if (!jobId) {
            // job_id가 없으면 에러 처리
            generatingContainer.innerHTML = `
                <h1>오류가 발생했습니다.</h1>
                <p>작업 ID를 찾을 수 없습니다. 다시 시도해주세요.</p>
            `;
        } else {
            // 3초마다 상태를 체크하는 '폴링(Polling)'을 시작합니다.
            const pollingInterval = setInterval(async () => {
                try {
                    // 백엔드 서버의 '/api' 경로로 상태 확인 요청을 보냅니다.
                    const response = await fetch(`/api/status/${jobId}`); // ◀️ 여기를 수정했습니다.
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    const data = await response.json();
                
                    // 서버가 "complete" 응답을 보내면,
                    if (data.status === 'complete') {
                        clearInterval(pollingInterval); // 확인 작업을 멈추고
                        // 최종 결과 페이지로 이동합니다.
                        window.location.href = `hd_report_result.html?job_id=${jobId}`;
                    }
                    // "processing" 등 다른 응답이면, 아무것도 하지 않고 3초 뒤에 다시 물어봅니다.

                } catch (error) {
                    console.error("상태 확인 중 에러:", error);
                    clearInterval(pollingInterval); // 에러 발생 시 확인 작업을 멈추고
                    // 사용자에게 에러 메시지를 보여줍니다.
                    generatingContainer.innerHTML = `
                        <h1>리포트 생성에 실패했습니다.</h1>
                        <p>오류가 발생했습니다. 잠시 후 다시 시도해주세요.</p>
                    `;
                }
            }, 3000); // 3초 간격
        }
    }

    // ================================================================
    // 2. 헤더 및 드롭다운 메뉴 기능 (기존 코드 유지)
    // ================================================================
    const dropdownBtn = document.querySelector('.dropdown-btn');
    const dropdownContent = document.querySelector('.dropdown-content');
    const header = document.querySelector('.landing-page-header');
    
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