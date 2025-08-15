// URL에서 쿼리 파라미터를 가져오는 함수
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}
document.addEventListener('DOMContentLoaded', async () => {
    // 1. URL에서 job_id를 가져와서 다운로드 링크를 설정하는 로직
    const jobId = getQueryParam('job_id');
    const downloadBtn = document.querySelector('.download-pdf');
    const viewPdfBtn = document.querySelector('.view-pdf');
    if (!jobId) {
        console.error('Error: Job ID not found in URL.');
        if (downloadBtn) downloadBtn.style.display = 'none';
        if (viewPdfBtn) viewPdfBtn.style.display = 'none';
    } else {
        try {
            // 백엔드 API를 호출하여 최종 결과 데이터를 가져옵니다.
            const response = await fetch(`/api/status/${jobId}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            if (data.status === 'completed' && data.result && data.result.download_url) {
                // 작업이 완료되면 다운로드 버튼의 href를 업데이트합니다.
                const downloadUrl = data.result.download_url;
                const filename = data.result.report_filename;
                if (downloadBtn) {
                    downloadBtn.href = downloadUrl;
                    downloadBtn.textContent = `PDF 다운로드 (${filename})`;
                }
                if (viewPdfBtn) {
                    // PDF 보기 버튼에는 '?download=1'을 제거한 URL을 할당합니다.
                    viewPdfBtn.href = downloadUrl.replace('?download=1', '');
                }
            } else {
                console.warn('Report not completed or download URL not available.');
                if (downloadBtn) downloadBtn.style.display = 'none';
                if (viewPdfBtn) viewPdfBtn.style.display = 'none';
            }
        } catch (error) {
            console.error("결과 확인 중 에러:", error);
            if (downloadBtn) downloadBtn.style.display = 'none';
            if (viewPdfBtn) viewPdfBtn.style.display = 'none';
        }
    }
    // 2. 헤더 스크롤 효과 및 드랍다운 메뉴 기능 (기존 코드)
    let lastScrollTop = 0;
    const header = document.querySelector('.landing-page-header');
    let scrollTimeout;
    window.addEventListener('scroll', function() {
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            const dropdownContent = document.querySelector('.dropdown-content');
            const dropdownBtn = document.querySelector('.dropdown-btn');
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
    // 3. 스크롤 애니메이션, 팝업, TOP 버튼 등 기타 기능 (기존 코드)
    const introObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            } else {
                if (entry.boundingClientRect.top > 0) {
                    entry.target.classList.remove('is-visible');
                }
            }
        });
    }, {
        threshold: 0.1
    });
    const introSection = document.querySelector('.intro-section');
    if (introSection) {
        introObserver.observe(introSection);
    }
    const dropdownBtn = document.querySelector('.dropdown-btn');
    const dropdownContent = document.querySelector('.dropdown-content');
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
    const scrollTopBtn = document.getElementById('scrollTopBtn');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            scrollTopBtn.classList.add('show');
        } else {
            scrollTopBtn.classList.remove('show');
        }
    });
    scrollTopBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    const expertConsultBtn = document.getElementById('expert-consult-btn');
    const reportModal = document.getElementById('report-modal');
    const modalCancelBtn = document.getElementById('modal-cancel-btn');
    if (expertConsultBtn && reportModal) {
        expertConsultBtn.addEventListener('click', (e) => {
            e.preventDefault();
            reportModal.classList.add('show');
        });
        modalCancelBtn.addEventListener('click', () => {
            reportModal.classList.remove('show');
        });
        reportModal.addEventListener('click', (e) => {
            if (e.target === reportModal) {
                reportModal.classList.remove('show');
            }
        });
    }
});