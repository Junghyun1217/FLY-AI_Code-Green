
// 페이지의 모든 HTML 요소가 로드된 후 스크립트를 실행합니다.
document.addEventListener('DOMContentLoaded', () => {
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  // ================================================================
  // 기능 1: AI 리포트 정보 로딩 및 버튼 기능 활성화 (status → download_url 사용)
  // ================================================================
  // --- 필요한 HTML 요소들을 가져옵니다. ---
  const previewContainer   = document.querySelector('.report-preview-container');
  const viewPdfBtn         = document.querySelector('.view-pdf');
  const downloadBtn        = document.querySelector('.download-pdf');
  const expertReviewSection= document.querySelector('.expert-review-section');
  // --- 1. URL에서 job_id를 가져옵니다. ---
  const urlParams = new URLSearchParams(window.location.search);
  const jobId = urlParams.get('job_id');
  // --- 오류 메시지를 표시하는 함수 ---
  const showError = (message) => {
    console.error(message);
    previewContainer.innerHTML = `<p style="text-align:center; color:red; font-weight:bold;">${message}</p>`;
    if (viewPdfBtn) viewPdfBtn.style.display = 'none';
    if (downloadBtn) downloadBtn.style.display = 'none';
    if (expertReviewSection) expertReviewSection.style.display = 'none';
  };
  // job_id가 없으면 즉시 에러 처리
  if (!jobId) {
    showError('오류: 유효한 작업 ID(job_id)가 URL에 없습니다.');
    return;
  }
  // --- 상태 조회/폴링 유틸 ---
  async function fetchStatusOnce(jid) {
    const r = await fetch(`/api/status/${encodeURIComponent(jid)}`);
    if (!r.ok) throw new Error(`서버 응답 오류 (상태 코드: ${r.status})`);
    return r.json();
  }
  async function waitForReportReady(jid, timeoutMs = 3 * 60 * 1000, intervalMs = 2000) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const data = await fetchStatusOnce(jid);
      if (data.status === 'completed') {
        const files = data.result?.files || [];
        const hit = files.find(f => f.label === 'result_json') || files[0];
        if (!hit?.download_url) throw new Error('download_url이 없습니다.');
        return hit.download_url; // 예: /api/files/xxx.json?download=1
      }
      if (data.status === 'failed') {
        const extra = data.log_url ? ` (로그: ${data.log_url})` : '';
        throw new Error(`${data.error || '작업 실패'}${extra}`);
      }
      await new Promise(res => setTimeout(res, intervalMs));
    }
    throw new Error('타임아웃: 리포트가 제때 준비되지 않았습니다.');
  }
  // --- 2. 초기화: 완료되면 버튼/미리보기 연결 ---
  async function initReportUI() {
    try {
      // 서버가 제공하는 안전한 링크 사용
      const downloadUrl = await waitForReportReady(jobId);
      const viewUrl = downloadUrl.replace('?download=1', '');
      if (downloadBtn) {
        downloadBtn.href = downloadUrl; // 백엔드가 만든 URL 그대로 사용
        downloadBtn.style.display = ''; // 혹시 숨겨졌다면 보이기
      }
      if (viewPdfBtn) {
        viewPdfBtn.style.display = '';
        viewPdfBtn.addEventListener('click', (e) => {
          e.preventDefault();
          // 인라인 미리보기 (JSON이면 브라우저가 텍스트로 보임)
          previewContainer.innerHTML =
            `<iframe src="${viewUrl}" style="width:100%; height:500px; border:none;"></iframe>`;
        });
      }
      // 필요하면 자동 미리보기
      // previewContainer.innerHTML =
      //   `<iframe src="${viewUrl}" style="width:100%; height:500px; border:none;"></iframe>`;
      if (expertReviewSection) expertReviewSection.style.display = '';
    } catch (error) {
      showError(`리포트 정보를 가져오는 중 문제가 발생했습니다: ${error.message}`);
    }
  }
  initReportUI();
  // ================================================================
  // 기능 2: '전문가 검토 요청' 폼 제출 처리
  // ================================================================
  const reviewForm = document.querySelector('.review-form');
  if (reviewForm) {
    reviewForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = reviewForm.querySelector('.submit-btn');
      const originalBtnText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = '요청을 전송하는 중...';
      try {
        const formData = new FormData(reviewForm);
        formData.append('job_id', jobId);
        const response = await fetch('/api/request_review', { method: 'POST', body: formData });
        if (!response.ok) throw new Error('서버에 요청을 보내는 데 실패했습니다.');
        const result = await response.json();
        if (result.success) {
          alert('전문가 검토 요청이 성공적으로 접수되었습니다. 곧 연락드리겠습니다.');
          reviewForm.reset();
        } else {
          throw new Error(result.message || '알 수 없는 오류가 발생했습니다.');
        }
      } catch (error) {
        alert(`오류가 발생했습니다: ${error.message}`);
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
      }
    });
  }
});
