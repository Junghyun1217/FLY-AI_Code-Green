document.addEventListener('DOMContentLoaded', () => {
    // ================================================================
    // 1. 분석 상태 확인 (폴링) 기능
    // ================================================================
    const generatingContainer = document.querySelector('.generating-container');

    if (generatingContainer) {
        const urlParams = new URLSearchParams(window.location.search);
        const jobId = urlParams.get('job_id');

        if (!jobId) {
            generatingContainer.innerHTML = `
                <h1>오류가 발생했습니다.</h1>
                <p>작업 ID를 찾을 수 없습니다. 다시 시도해주세요.</p>
            `;
            return; // 🚨 개선점 1: jobId가 없으면 여기서 함수를 완전히 종료시켜 아래 코드가 실행되지 않도록 합니다.
        }

        // 함수를 한번은 즉시 실행하고, 그 뒤부터 3초 간격으로 폴링을 시작합니다.
        // 이렇게 하면 페이지 로드 후 3초를 기다릴 필요 없이 바로 상태 확인을 시작할 수 있습니다.
        checkStatus(); 
        const pollingInterval = setInterval(checkStatus, 3000);

        async function checkStatus() {
            try {
                // 🚨 개선점 2: fetch 요청에 타임아웃(timeout)을 추가하여 네트워크 문제가 있을 때 무한정 기다리는 것을 방지합니다.
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 5000); // 5초 응답 없으면 요청 취소

                const response = await fetch(`/api/status/${jobId}`, {
                    signal: controller.signal
                });
                clearTimeout(timeoutId); // 응답이 오면 타임아웃 해제

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();

                // 🚨 개선점 3: data.status 값이 없는 예외적인 경우를 처리합니다.
                if (!data || !data.status) {
                    console.warn("서버로부터 유효하지 않은 응답을 받았습니다:", data);
                    return; // 상태 값이 없으면 폴링을 계속합니다.
                }

                if (data.status === 'completed') {
                    clearInterval(pollingInterval);
                    // 페이지 이동 전 약간의 딜레이를 주어 전환이 자연스럽게 보이도록 할 수 있습니다. (선택 사항)
                    setTimeout(() => {
                       window.location.href = `hd_report_result.html?job_id=${jobId}`;
                    }, 500);
                } else if (data.status === 'failed') {
                    clearInterval(pollingInterval);
                    generatingContainer.innerHTML = `
                        <h1>리포트 생성에 실패했습니다.</h1>
                        <p>오류: ${data.error || '알 수 없는 오류가 발생했습니다.'}</p>
                    `;
                }
                // 'in_progress' 상태일 경우, 함수가 조용히 종료되고 다음 setInterval 호출을 기다립니다.

            } catch (error) {
                console.error("상태 확인 중 에러:", error);
                clearInterval(pollingInterval);
                generatingContainer.innerHTML = `
                    <h1>연결에 실패했습니다.</h1>
                    <p>서버와 통신하는 중 문제가 발생했습니다. 네트워크 연결을 확인하고 다시 시도해주세요.</p>
                `;
            }
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