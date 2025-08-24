// 페이지 로딩이 완료되면 즉시 실행
document.addEventListener('DOMContentLoaded', () => {
  // ===== 헤더/드롭다운/스크롤 등 기존 UI =====
  let lastScrollTop = 0;
  const header = document.querySelector('.landing-page-header');
  let scrollTimeout;
  window.addEventListener('scroll', function () {
    let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      const dropdownContent = document.querySelector('.dropdown-content');
      const dropdownBtn = document.querySelector('.dropdown-btn');
      if (dropdownContent && dropdownContent.classList.contains('show')) {
        dropdownContent.classList.remove('show');
        if (dropdownBtn) dropdownBtn.classList.remove('active');
      }
    }, 40);
    if (scrollTop > lastScrollTop && scrollTop > 50) {
      header && header.classList.add('header-hidden');
    } else {
      header && header.classList.remove('header-hidden');
    }
    if (scrollTop > 50) {
      header && header.classList.add('header-solid-bg');
    } else {
      header && header.classList.remove('header-solid-bg');
    }
    lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
  }, false);
  const introObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add('is-visible');
      else if (entry.boundingClientRect.top > 0) entry.target.classList.remove('is-visible');
    });
  }, { threshold: 0.1 });
  const introSection = document.querySelector('.intro-section');
  if (introSection) introObserver.observe(introSection);
  const dropdownBtn = document.querySelector('.dropdown-btn');
  const dropdownContent = document.querySelector('.dropdown-content');
  if (dropdownBtn) {
    dropdownBtn.addEventListener('click', (event) => {
      event.stopPropagation();
      const isShown = dropdownContent.classList.toggle('show');
      dropdownBtn.classList.toggle('active', isShown);
    });
  }
  window.addEventListener('click', () => {
    if (dropdownContent && dropdownContent.classList.contains('show')) {
      dropdownContent.classList.remove('show');
      dropdownBtn && dropdownBtn.classList.remove('active');
    }
  });
  const scrollTopBtn = document.getElementById('scrollTopBtn');
  window.addEventListener('scroll', () => {
    if (!scrollTopBtn) return;
    if (window.scrollY > 300) scrollTopBtn.classList.add('show');
    else scrollTopBtn.classList.remove('show');
  });
  if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
  // ===== 결과/버튼 요소 =====
  const previewContainer = document.querySelector('.preview-container');
  const viewPdfBtn = document.getElementById('view-pdf-btn');
  const downloadBtn = document.getElementById('download-pdf-btn');
  const errorMessageDiv = document.getElementById('error-message');
  function showError(message) {
    console.error(message);
    if (errorMessageDiv) errorMessageDiv.textContent = message;
    if (viewPdfBtn) viewPdfBtn.style.display = 'none';
    if (downloadBtn) downloadBtn.style.display = 'none';
  }
  // ===== job_id 파싱 =====
  const urlParams = new URLSearchParams(window.location.search);
  const jobId = urlParams.get('job_id');
  if (!jobId) {
    showError('오류: URL에서 작업 ID(job_id)를 찾을 수 없습니다.');
    return;
  }
  console.log(`Job ID: ${jobId} 로 PDF 정보 요청을 시작합니다.`);
  // ===== 상태 조회 후 링크 세팅 =====
  const fetchPdfInfo = async () => {
    try {
      const response = await fetch(`/api/status/${jobId}`, { cache: 'no-store' });
      console.log('백엔드 응답 수신:', response);
      if (!response.ok) throw new Error(`서버 응답 오류: ${response.status}`);
      const data = await response.json();
      console.log('응답 데이터 (JSON):', data);
      // 1) files 배열에서 report_pdf(우선) → .pdf 확장자(차선) 찾기
      const files = data?.result?.files;
      let pdfItem = null;
      if (Array.isArray(files)) {
        pdfItem = files.find(f => String(f.label || '').toLowerCase() === 'report_pdf')
               || files.find(f => String(f.filename || '').toLowerCase().endsWith('.pdf'));
      }
      // 2) download_url 결정 (과거 단일 필드도 호환)
      let downloadUrl = pdfItem?.download_url || data?.result?.download_url || null;
      if (!(data?.status === 'completed' && downloadUrl)) {
        throw new Error('보고서가 아직 준비되지 않았거나, PDF URL 정보가 없습니다.');
      }
      // 3) /api 접두사 보정(상대경로면 붙임)
      if (downloadUrl.startsWith('/') && !downloadUrl.startsWith('/api/')) {
        downloadUrl = '/api' + downloadUrl;
      }
      // 4) 보기 URL = download=1 제거
      const viewUrl = downloadUrl.replace(/([?&])download=1\b/, '').replace(/\?$/, '');
      // 5) 다운로드 버튼 세팅 (a 또는 button 모두 대응)
      if (downloadBtn) {
        if (downloadBtn.tagName === 'A') {
          downloadBtn.href = downloadUrl;
          downloadBtn.setAttribute('download', '');
        } else {
          downloadBtn.onclick = (e) => { e.preventDefault(); location.href = downloadUrl; };
        }
        downloadBtn.style.display = '';
        downloadBtn.textContent = 'PDF 다운로드';
      }
      // 6) 보기 버튼: 클릭 시 iframe 표시
      if (viewPdfBtn && previewContainer) {
        viewPdfBtn.addEventListener('click', (e) => {
          e.preventDefault();
          console.log('PDF 보기 버튼 클릭됨.');
          const coverContent = previewContainer.querySelector('.report-cover-new');
          if (coverContent) coverContent.style.display = 'none';
          const oldIframe = previewContainer.querySelector('iframe');
          if (oldIframe) oldIframe.remove();
          const iframe = document.createElement('iframe');
          iframe.src = viewUrl;
          iframe.style.width = '100%';
          iframe.style.height = '80vh';
          iframe.style.border = 'none';
          previewContainer.appendChild(iframe);
          previewContainer.classList.add('pdf-mode');
          console.log('미리보기 영역을 PDF 뷰어로 교체 완료.');
        });
        viewPdfBtn.style.display = '';
      }
      if (errorMessageDiv) errorMessageDiv.textContent = '';
    } catch (error) {
      showError(`PDF 정보를 가져오는 중 문제가 발생했습니다: ${error.message}`);
    }
  };
  fetchPdfInfo();
  // ===== 모달 =====
  const expertConsultBtn = document.getElementById('expert-consult-btn');
  const reportModal = document.getElementById('report-modal');
  const modalCancelBtn = document.getElementById('modal-cancel-btn');
  if (expertConsultBtn && reportModal) {
    expertConsultBtn.addEventListener('click', (e) => {
      e.preventDefault();
      reportModal.classList.add('show');
    });
    if (modalCancelBtn) {
      modalCancelBtn.addEventListener('click', () => {
        reportModal.classList.remove('show');
      });
    }
    reportModal.addEventListener('click', (e) => {
      if (e.target === reportModal) reportModal.classList.remove('show');
    });
  }
});