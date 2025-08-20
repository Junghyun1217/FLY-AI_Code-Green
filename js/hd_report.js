// 페이지 로딩이 완료되면 즉시 실행
document.addEventListener('DOMContentLoaded', () => {

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

    // --- 1. 필요한 HTML 요소들을 ID로 정확하게 찾습니다. ---
    const previewContainer = document.querySelector('.preview-container');
    const viewPdfBtn = document.getElementById('view-pdf-btn');
    const downloadBtn = document.getElementById('download-pdf-btn');
    const errorMessageDiv = document.getElementById('error-message');

    // --- 에러 메시지를 화면에 표시하는 함수 ---
    function showError(message) {
        console.error(message); // 개발자 콘솔에도 에러 출력
        if (errorMessageDiv) {
            errorMessageDiv.textContent = message; // 화면에도 에러 메시지 표시
        }
        // 에러 발생 시 버튼들을 숨김
        if (viewPdfBtn) viewPdfBtn.style.display = 'none';
        if (downloadBtn) downloadBtn.style.display = 'none';
    }

    // --- 2. URL에서 job_id를 가져옵니다. ---
    const urlParams = new URLSearchParams(window.location.search);
    const jobId = urlParams.get('job_id');

    // job_id가 없으면 즉시 에러 처리
    if (!jobId) {
        showError('오류: URL에서 작업 ID(job_id)를 찾을 수 없습니다.');
        return; // 코드 실행 중단
    }

    console.log(`Job ID: ${jobId} 로 PDF 정보 요청을 시작합니다.`);

    // --- 3. 백엔드 API를 호출하여 PDF 정보를 가져옵니다. (async/await 사용) ---
    const fetchPdfInfo = async () => {
        try {
            const response = await fetch(`/api/status/${jobId}`);
            console.log('백엔드 응답 수신:', response);

            if (!response.ok) {
                throw new Error(`서버 응답 오류: ${response.status}`);
            }

            const data = await response.json();
            console.log('응답 데이터 (JSON):', data);

            // PDF URL이 정상적으로 왔는지 확인
            if (data.status === 'completed' && data.result && data.result.download_url) {
                const downloadUrl = data.result.download_url;
                const filename = data.result.report_filename || 'report.pdf';
                const viewUrl = downloadUrl.replace('?download=1', '');

                console.log('다운로드 URL:', downloadUrl);
                console.log('미리보기 URL:', viewUrl);

                // --- 4. 버튼에 기능과 링크를 연결합니다. ---
                if (downloadBtn) {
                    downloadBtn.href = downloadUrl;
                    downloadBtn.textContent = `PDF 다운로드 (${filename})`;
                    console.log('다운로드 버튼 설정 완료.');
                }

                if (viewPdfBtn) {
                    viewPdfBtn.addEventListener('click', (e) => {
                        e.preventDefault(); // 기본 링크 이동 방지
                        console.log('PDF 보기 버튼 클릭됨.');
                        
                        previewContainer.innerHTML = `<iframe src="${viewUrl}"></iframe>`;
                        previewContainer.classList.add('pdf-mode');
                        
                        console.log('미리보기 영역을 PDF 뷰어로 교체 완료.');
                    });
                    console.log('미리보기 버튼 설정 완료.');
                }

            } else {
                throw new Error('보고서가 아직 준비되지 않았거나, PDF URL 정보가 없습니다.');
            }

        } catch (error) {
            showError(`PDF 정보를 가져오는 중 문제가 발생했습니다: ${error.message}`);
        }
    };

    fetchPdfInfo(); // PDF 정보 가져오는 함수 실행

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