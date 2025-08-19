function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

document.addEventListener('DOMContentLoaded', async () => {
    // ▼▼▼▼▼ 1. PDF 미리보기 기능에 필요한 요소들을 먼저 찾아둡니다. ▼▼▼▼▼
    const previewContainer = document.getElementById('preview-container');
    const downloadBtn = document.getElementById('download-pdf-btn'); // ID로 변경
    const viewPdfBtn = document.getElementById('view-pdf-btn');       // ID로 변경
    // ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲

    // 2. URL에서 job_id를 가져와서 다운로드 링크를 설정하는 로직 (기존 코드 개선)
    const jobId = getQueryParam('job_id');

    if (!jobId) {
        console.error('Error: Job ID not found in URL.');
        if(downloadBtn) downloadBtn.style.display = 'none';
        if(viewPdfBtn) viewPdfBtn.style.display = 'none';
    } else {
        try {
            const response = await fetch(`/api/status/${jobId}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();

            if (data.status === 'completed' && data.result && data.result.download_url) {
                const downloadUrl = data.result.download_url;
                const filename = data.result.report_filename;

                if (downloadBtn) {
                    downloadBtn.href = downloadUrl;
                    downloadBtn.textContent = `PDF 다운로드 (${filename})`;
                }

                // ▼▼▼▼▼ 3. 'PDF 보기' 버튼에 클릭 이벤트 리스너를 추가합니다. ▼▼▼▼▼
                if (viewPdfBtn && previewContainer) {
                    // 보기용 URL에서 '?download=1' 파라미터를 제거합니다.
                    const viewUrl = downloadUrl.replace('?download=1', '');

                    viewPdfBtn.addEventListener('click', (event) => {
                        event.preventDefault(); // 기본 링크 이동 동작을 막습니다.

                        // 컨테이너의 내용을 iframe(PDF 뷰어)으로 교체합니다.
                        previewContainer.innerHTML = `<iframe src="${viewUrl}" frameborder="0"></iframe>`;

                        // PDF 뷰어에 최적화된 스타일 클래스를 추가합니다.
                        previewContainer.classList.add('pdf-mode');
                    });
                }
                // ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲

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

    // 4. 헤더 스크롤 효과 및 드랍다운 메뉴 기능 (기존 코드 유지)
    // ... (이하 기존 코드는 변경 없이 그대로 유지됩니다) ...
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