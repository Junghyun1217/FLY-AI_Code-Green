// gener.js 파일의 전체 내용

document.addEventListener('DOMContentLoaded', () => {

    // --- 1. 현재 주소창에서 job_id를 가져오는 코드 ---
    const urlParams = new URLSearchParams(window.location.search);
    const jobId = urlParams.get('job_id');

    // --- 2. 6초 후 결과 페이지로 이동시키는 코드 ---
    setTimeout(() => {
        // job_id가 정상적으로 존재할 경우에만 결과 페이지로 이동
        if (jobId) {
            window.location.href = `report_result.html?job_id=${jobId}`;
        } else {
            // 혹시라도 job_id 없이 이 페이지에 들어왔을 경우에 대한 예외 처리
            alert("유효한 작업 ID가 없어 메인 페이지로 이동합니다.");
            window.location.href = 'landing.html'; // 메인 페이지로 이동
        }
    }, 6000); // 6000ms = 6초


    // ================================================================
    // 아래의 헤더/드롭다운 관련 코드는 기존과 동일하게 유지합니다.
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