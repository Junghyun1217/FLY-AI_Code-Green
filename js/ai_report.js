// 페이지의 모든 HTML 요소가 로드된 후 스크립트를 실행합니다.
document.addEventListener('DOMContentLoaded', () => {

    // ================================================================
    // 기능 1: AI 리포트 PDF 정보 로딩 및 버튼 기능 활성화
    // ================================================================

    // --- 필요한 HTML 요소들을 가져옵니다. ---
    const previewContainer = document.querySelector('.report-preview-container');
    const viewPdfBtn = document.querySelector('.view-pdf');
    const downloadBtn = document.querySelector('.download-pdf');
    // 전문가 검토 폼 섹션은 기본적으로 숨겨둘 수 있으므로, 필요 시 ID를 부여하거나 이대로 사용합니다.
    const expertReviewSection = document.querySelector('.expert-review-section');


    // --- 1. URL에서 job_id를 가져옵니다. ---
    const urlParams = new URLSearchParams(window.location.search);
    const jobId = urlParams.get('job_id');

    // --- 오류 메시지를 표시하는 함수 ---
    const showError = (message) => {
        console.error(message);
        // 페이지에 오류를 표시할 특정 영역이 있다면 여기에 추가합니다.
        // 예: previewContainer.innerHTML = `<p class="error">${message}</p>`;
        previewContainer.innerHTML = `<p style="text-align:center; color:red; font-weight:bold;">${message}</p>`;
        // 오류 발생 시 버튼과 폼을 숨깁니다.
        if (viewPdfBtn) viewPdfBtn.style.display = 'none';
        if (downloadBtn) downloadBtn.style.display = 'none';
        if (expertReviewSection) expertReviewSection.style.display = 'none';
    };

    // job_id가 없으면 즉시 에러 처리
    if (!jobId) {
        showError('오류: 유효한 작업 ID(job_id)가 URL에 없습니다.');
        return; // 코드 실행 중단
    }


    // --- 2. 백엔드 API를 호출하여 PDF 정보를 가져옵니다. ---
    const fetchPdfInfo = async () => {
        try {
            const response = await fetch(`/api/status/${jobId}`);
            if (!response.ok) {
                throw new Error(`서버 응답 오류 (상태 코드: ${response.status})`);
            }
            const data = await response.json();

            // PDF URL이 정상적으로 왔는지 확인
            if (data.status === 'completed' && data.result && data.result.download_url) {
                const downloadUrl = data.result.download_url;
                // PDF 뷰어에서는 다운로드 파라미터를 제거한 URL을 사용
                const viewUrl = downloadUrl.replace('?download=1', '');

                // --- 3. 버튼에 기능과 링크를 연결합니다. ---
                if (downloadBtn) {
                    downloadBtn.href = downloadUrl;
                }

                if (viewPdfBtn) {
                    viewPdfBtn.addEventListener('click', (e) => {
                        e.preventDefault(); // 기본 링크 이동 방지
                        // 미리보기 영역을 iframe PDF 뷰어로 교체
                        previewContainer.innerHTML = `<iframe src="${viewUrl}" style="width:100%; height:500px; border:none;"></iframe>`;
                        // CSS에 정의된 pdf-mode가 있다면 클래스를 추가할 수 있습니다.
                    });
                }
            } else {
                // 상태가 'completed'가 아니거나 URL 정보가 없는 경우
                throw new Error(data.message || '리포트가 아직 준비되지 않았거나, 정보를 불러올 수 없습니다.');
            }
        } catch (error) {
            showError(`리포트 정보를 가져오는 중 문제가 발생했습니다: ${error.message}`);
        }
    };

    fetchPdfInfo(); // 페이지 로딩 시 PDF 정보 가져오는 함수 실행


    // ================================================================
    // 기능 2: '전문가 검토 요청' 폼 제출 처리
    // ================================================================
    const reviewForm = document.querySelector('.review-form');
    if (reviewForm) {
        reviewForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // 기본 폼 제출(새로고침) 방지

            const submitBtn = reviewForm.querySelector('.submit-btn');
            const originalBtnText = submitBtn.textContent;
            
            // 버튼 비활성화 및 로딩 상태 표시
            submitBtn.disabled = true;
            submitBtn.textContent = '요청을 전송하는 중...';

            try {
                const formData = new FormData(reviewForm);
                // 폼 데이터에 job_id 추가 (서버에서 어떤 리포트에 대한 요청인지 알아야 하므로)
                formData.append('job_id', jobId);

                // 서버의 검토 요청 API로 폼 데이터 전송
                const response = await fetch('/api/request_review', {
                    method: 'POST',
                    body: formData
                });

                if (!response.ok) {
                    throw new Error('서버에 요청을 보내는 데 실패했습니다.');
                }
                
                const result = await response.json();

                if (result.success) {
                    alert('전문가 검토 요청이 성공적으로 접수되었습니다. 곧 연락드리겠습니다.');
                    reviewForm.reset(); // 폼 초기화
                } else {
                    throw new Error(result.message || '알 수 없는 오류가 발생했습니다.');
                }

            } catch (error) {
                alert(`오류가 발생했습니다: ${error.message}`);
            } finally {
                // 버튼 다시 활성화 및 텍스트 복원
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
            }
        });
    }


    // ================================================================
    // 기능 3: 공통 UI 스크립트 (헤더, 드롭다운, TOP 버튼)
    // ================================================================
    const header = document.querySelector('.landing-page-header');
    const dropdownBtn = document.querySelector('.dropdown-btn');
    const dropdownContent = document.querySelector('.dropdown-content');
    const scrollTopBtn = document.getElementById('scrollTopBtn');
    let lastScrollTop = 0;

    // --- 헤더 스크롤 효과 ---
    window.addEventListener('scroll', () => {
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
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

        // TOP 버튼 보이기/숨기기
        if (window.scrollY > 300) {
            scrollTopBtn.classList.add('show');
        } else {
            scrollTopBtn.classList.remove('show');
        }
    }, false);

    // --- 드롭다운 메뉴 기능 ---
    if (dropdownBtn) {
        dropdownBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            dropdownContent.classList.toggle('show');
            dropdownBtn.classList.toggle('active');
        });
    }
    window.addEventListener('click', () => {
        if (dropdownContent && dropdownContent.classList.contains('show')) {
            dropdownContent.classList.remove('show');
            dropdownBtn.classList.remove('active');
        }
    });

    // --- TOP 버튼 클릭 시 최상단으로 이동 ---
    scrollTopBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
});