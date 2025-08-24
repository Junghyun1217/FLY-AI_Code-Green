// ai_report.js (hotfix)
document.addEventListener('DOMContentLoaded', () => {
  // ---------- 공통 UI ----------
  const header = document.querySelector('.landing-page-header');
  const dropdownBtn = document.querySelector('.dropdown-btn');
  const dropdownContent = document.querySelector('.dropdown-content');
  const scrollTopBtn = document.getElementById('scrollTopBtn');
  let lastScrollTop = 0;
  window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    if (scrollTop > lastScrollTop && scrollTop > 50) header?.classList.add('header-hidden');
    else header?.classList.remove('header-hidden');
    if (scrollTop > 50) header?.classList.add('header-solid-bg');
    else header?.classList.remove('header-solid-bg');
    lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
    if (window.scrollY > 300) scrollTopBtn?.classList.add('show');
    else scrollTopBtn?.classList.remove('show');
  }, false);
  dropdownBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdownContent?.classList.toggle('show');
    dropdownBtn.classList.toggle('active');
  });
  window.addEventListener('click', () => {
    if (dropdownContent?.classList.contains('show')) {
      dropdownContent.classList.remove('show');
      dropdownBtn?.classList.remove('active');
    }
  });
  scrollTopBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  // ---------- 리포트 연동 ----------
  const previewContainer = document.querySelector('.report-preview-container');
  const viewPdfBtn = document.querySelector('.view-pdf');
  const downloadBtn = document.querySelector('.download-pdf');
  const expertReviewSection = document.querySelector('.expert-review-section');
  const urlParams = new URLSearchParams(window.location.search);
  const jobId = urlParams.get('job_id');
  const showError = (msg) => {
    console.error('[AI-REPORT]', msg);
    if (previewContainer) {
      previewContainer.innerHTML =
        `<p style="text-align:center;color:#d32f2f;font-weight:700;">${msg}</p>`;
    }
    viewPdfBtn && (viewPdfBtn.style.pointerEvents = 'none');
    downloadBtn && (downloadBtn.style.pointerEvents = 'none');
    expertReviewSection && (expertReviewSection.style.display = 'none');
  };
  if (!jobId) {
    showError('오류: 유효한 작업 ID(job_id)가 URL에 없습니다.');
    return;
  }
  const pickFile = (files, label, ext) => {
    if (!Array.isArray(files)) return null;
    let f = files.find((x) => x.label === label);
    if (f) return f;
    if (ext) f = files.find((x) => (x.filename || '').toLowerCase().endsWith(ext));
    return f || null;
  };
  const toViewUrl = (downloadUrl) => {
    if (!downloadUrl) return null;
    try {
      const u = new URL(downloadUrl, location.origin);
      u.searchParams.delete('download');
      return u.pathname + (u.search ? `?${u.searchParams}` : '');
    } catch {
      // 상대경로 문자열 처리
      return downloadUrl.replace(/\?download=1\b/, '').replace(/&download=1\b/, '');
    }
  };
  const bindButtons = (pdfDownloadUrl) => {
    const pdfViewUrl = toViewUrl(pdfDownloadUrl);
    // 다운로드 버튼: 새탭 시도 → 실패 시 현재탭 강제 이동
    if (downloadBtn) {
      downloadBtn.href = pdfDownloadUrl;
      downloadBtn.target = '_blank';
      downloadBtn.rel = 'noopener';
      downloadBtn.setAttribute('download', '');
      downloadBtn.style.pointerEvents = 'auto';
      downloadBtn.style.cursor = 'pointer';
      downloadBtn.addEventListener('click', (e) => {
        e.preventDefault(); // a태그 기본 동작은 제어, 직접 처리
        try {
          const win = window.open(pdfDownloadUrl, '_blank', 'noopener');
          if (!win || win.closed) window.location.assign(pdfDownloadUrl);
        } catch (err) {
          console.warn('download open failed, fallback to assign', err);
          window.location.assign(pdfDownloadUrl);
        }
      }, { capture: true, passive: false });
    }
    // 보기 버튼: iframe 렌더
    if (viewPdfBtn && previewContainer) {
      viewPdfBtn.style.pointerEvents = 'auto';
      viewPdfBtn.style.cursor = 'pointer';
      viewPdfBtn.addEventListener('click', (e) => {
        e.preventDefault();
        previewContainer.innerHTML =
          `<iframe src="${pdfViewUrl}" style="width:100%;height:520px;border:none;"></iframe>`;
      }, { capture: true, passive: false });
    }
    // 혹시 오버레이가 덮는 경우 대비(안전핀)
    previewContainer?.setAttribute('data-zfix', '1');
    expertReviewSection && (expertReviewSection.style.display = '');
  };
  const fetchStatus = async () => {
    const res = await fetch(`/api/status/${jobId}`, { credentials: 'same-origin' });
    if (!res.ok) {
      throw new Error(`상태 코드 ${res.status}`);
    }
    return res.json();
  };
  (async () => {
    try {
      // 바로 한 번만 조회(이미 완료 상태인 케이스 커버)
      const data = await fetchStatus();
      if (data.status === 'completed') {
        const files = data?.result?.files;
        const pdf = pickFile(files, 'report_pdf', '.pdf')
                || { download_url: data?.result?.download_url, filename: 'impact_report.pdf' };
        if (!pdf?.download_url) {
          showError('PDF 정보를 찾을 수 없습니다.');
          return;
        }
        bindButtons(pdf.download_url);
        return;
      }
      if (data.status === 'failed') {
        const logMsg = data?.log_url ? ` (로그: ${data.log_url})` : '';
        showError(`리포트 생성 실패${logMsg}`);
        return;
      }
      // processing → 폴링
      const started = Date.now();
      const TIMEOUT = 5 * 60 * 1000;
      while (Date.now() - started < TIMEOUT) {
        await new Promise(r => setTimeout(r, 2000));
        const d = await fetchStatus();
        if (d.status === 'completed') {
          const files = d?.result?.files;
          const pdf = pickFile(files, 'report_pdf', '.pdf')
                  || { download_url: d?.result?.download_url, filename: 'impact_report.pdf' };
          if (!pdf?.download_url) {
            showError('PDF 정보를 찾을 수 없습니다.');
            return;
          }
          bindButtons(pdf.download_url);
          return;
        }
        if (d.status === 'failed') {
          const logMsg = d?.log_url ? ` (로그: ${d.log_url})` : '';
          showError(`리포트 생성 실패${logMsg}`);
          return;
        }
      }
      showError('대기 시간이 초과되었습니다. 잠시 후 다시 확인해주세요.');
    } catch (err) {
      showError(`리포트 정보를 불러오지 못했습니다: ${err?.message || err}`);
    }
  })();
  // ---------- 전문가 검토 요청 ----------
  const reviewForm = document.querySelector('.review-form');
  reviewForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = reviewForm.querySelector('.submit-btn');
    const text = submitBtn?.textContent || '';
    submitBtn && (submitBtn.disabled = true, submitBtn.textContent = '요청을 전송하는 중...');
    try {
      const fd = new FormData(reviewForm);
      fd.append('job_id', jobId);
      const resp = await fetch('/api/request_review', { method: 'POST', body: fd });
      if (!resp.ok) throw new Error('서버 오류');
      const json = await resp.json();
      if (json.success) {
        alert('전문가 검토 요청이 성공적으로 접수되었습니다. 곧 연락드리겠습니다.');
        reviewForm.reset();
      } else {
        throw new Error(json.message || '알 수 없는 오류');
      }
    } catch (err) {
      alert(`오류가 발생했습니다: ${err?.message || err}`);
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = text;
      }
    }
  });
});