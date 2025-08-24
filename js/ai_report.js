// 페이지의 모든 HTML 요소가 로드된 후 스크립트를 실행합니다.
document.addEventListener('DOMContentLoaded', () => {
  // ================================================================
  // 공통 UI 스크립트 (헤더, 드롭다운, TOP 버튼)
  // ================================================================
  const header = document.querySelector('.landing-page-header');
  const dropdownBtn = document.querySelector('.dropdown-btn');
  const dropdownContent = document.querySelector('.dropdown-content');
  const scrollTopBtn = document.getElementById('scrollTopBtn');
  let lastScrollTop = 0;
  // --- 헤더 스크롤 효과 ---
  window.addEventListener('scroll', () => {
    let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    if (scrollTop > lastScrollTop && scrollTop > 50) header.classList.add('header-hidden');
    else header.classList.remove('header-hidden');
    if (scrollTop > 50) header.classList.add('header-solid-bg');
    else header.classList.remove('header-solid-bg');
    lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
    // TOP 버튼 보이기/숨기기
    if (window.scrollY > 300) scrollTopBtn.classList.add('show');
    else scrollTopBtn.classList.remove('show');
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
  if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
  // ================================================================
  // AI 리포트: 상태 조회 → 버튼 활성화(+미리보기)
  // ================================================================
  const previewContainer = document.querySelector('.report-preview-container');
  const viewPdfBtn = document.querySelector('.view-pdf');
  const downloadBtn = document.querySelector('.download-pdf');
  const expertReviewSection = document.querySelector('.expert-review-section');
  const urlParams = new URLSearchParams(window.location.search);
  const jobId = urlParams.get('job_id');
  const showError = (message) => {
    console.error(message);
    if (previewContainer) {
      previewContainer.innerHTML = `<p style="text-align:center; color:#d32f2f; font-weight:700;">${message}</p>`;
    }
    if (viewPdfBtn) viewPdfBtn.style.display = 'none';
    if (downloadBtn) downloadBtn.style.display = 'none';
    if (expertReviewSection) expertReviewSection.style.display = 'none';
  };
  if (!jobId) {
    showError('오류: 유효한 작업 ID(job_id)가 URL에 없습니다.');
    return;
  }
  // 새 백엔드 구조 호환: result.files[] (label, filename, download_url)
  const pickFile = (files, wantLabel, wantExt) => {
    if (!Array.isArray(files)) return null;
    // 1) 라벨 우선
    let f = files.find((x) => x.label === wantLabel);
    if (f) return f;
    // 2) 확장자로 폴백
    if (wantExt) f = files.find((x) => (x.filename || '').toLowerCase().endsWith(wantExt));
    return f || null;
  };
  const toViewUrl = (downloadUrl) => {
    if (!downloadUrl) return null;
    try {
      const u = new URL(downloadUrl, location.origin);
      u.searchParams.delete('download'); // ?download=1 제거 → inline 보기
      return u.pathname + (u.search ? `?${u.searchParams}` : '');
    } catch {
      return downloadUrl.replace(/\?download=1\b/, '').replace(/&download=1\b/, '');
    }
  };
  const wireButtons = (data) => {
    // 새 구조 우선
    const files = data?.result?.files;
    let pdfFile = pickFile(files, 'report_pdf', '.pdf');
    // 구 구조(단일 download_url)도 폴백
    let downloadUrl = data?.result?.download_url;
    if (!pdfFile && downloadUrl) {
      pdfFile = { download_url: downloadUrl, filename: 'impact_report.pdf' };
    }
    if (!pdfFile || !pdfFile.download_url) {
      showError('리포트가 아직 준비되지 않았거나, PDF 정보를 찾을 수 없습니다.');
      return;
    }
    const pdfDownloadUrl = pdfFile.download_url;
    const pdfViewUrl = toViewUrl(pdfDownloadUrl);
    if (downloadBtn) {
      downloadBtn.href = pdfDownloadUrl;
      downloadBtn.classList.remove('disabled');
      downloadBtn.removeAttribute('aria-disabled');
      downloadBtn.onclick = null;
    }
    if (viewPdfBtn) {
      viewPdfBtn.classList.remove('disabled');
      viewPdfBtn.removeAttribute('aria-disabled');
      viewPdfBtn.onclick = (e) => {
        e.preventDefault();
        if (!previewContainer) return;
        previewContainer.innerHTML = `<iframe src="${pdfViewUrl}" style="width:100%; height:520px; border:none;"></iframe>`;
      };
    }
    // 전문가 섹션 보이기(혹시 숨겨놨다면)
    if (expertReviewSection) expertReviewSection.style.display = '';
  };
  const fetchStatusOnce = async () => {
    const res = await fetch(`/api/status/${jobId}`, { credentials: 'same-origin' });
    if (!res.ok) throw new Error(`서버 응답 오류 (상태 코드: ${res.status})`);
    return res.json();
  };
  const pollUntilReady = async () => {
    const started = Date.now();
    const timeoutMs = 5 * 60 * 1000; // 최대 5분
    const intervalMs = 2000;
    while (true) {
      try {
        const data = await fetchStatusOnce();
        if (data.status === 'completed') {
          wireButtons(data);
          break;
        }
        if (data.status === 'failed') {
          // 서버가 log_url 내려줌
          const logMsg = data?.log_url ? ` (로그: ${data.log_url})` : '';
          showError(`리포트 생성 실패${logMsg}`);
          break;
        }
        // processing → 계속 대기
      } catch (err) {
        // 일시 오류면 재시도
        console.warn('상태 조회 오류:', err);
      }
      if (Date.now() - started > timeoutMs) {
        showError('대기 시간이 초과되었습니다. 잠시 후 다시 확인해주세요.');
        break;
      }
      await new Promise((r) => setTimeout(r, intervalMs));
    }
  };
  // 시작
  pollUntilReady();
  // ================================================================
  // '전문가 검토 요청' 폼 제출 처리
  // ================================================================
  const reviewForm = document.querySelector('.review-form');
  if (reviewForm) {
    reviewForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = reviewForm.querySelector('.submit-btn');
      const originalBtnText = submitBtn ? submitBtn.textContent : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = '요청을 전송하는 중...';
      }
      try {
        const formData = new FormData(reviewForm);
        formData.append('job_id', jobId);
        const response = await fetch('/api/request_review', {
          method: 'POST',
          body: formData,
        });
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
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalBtnText;
        }
      }
    });
  }
});