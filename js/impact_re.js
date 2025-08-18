document.addEventListener('DOMContentLoaded', () => {
    // 헤더 관련 스크립트 (랜딩페이지와 동일)
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
    // --- 파일 업로드 기능 스크립트 (수정) ---
    const dropAreaGeneral = document.getElementById('drop-area-general');
    const fileInputGeneral = document.getElementById('file-input-general');
    const dropAreaSroi = document.getElementById('drop-area-sroi');
    const fileInputSroi = document.getElementById('file-input-sroi');
    const fileList = document.getElementById('file-list');
    const filePlaceholder = document.getElementById('file-placeholder');
    const generateBtn = document.getElementById('generate-report-btn');
    const checkGeneral = document.getElementById('check-general');
    const checkSroi = document.getElementById('check-sroi');
    let generalFiles = [];
    let sroiFile = null;
    // 각 드롭 영역 클릭 시 해당 파일 입력 창 열기
    dropAreaGeneral.addEventListener('click', () => fileInputGeneral.click());
    dropAreaSroi.addEventListener('click', () => fileInputSroi.click());
    // 파일 선택 이벤트
    fileInputGeneral.addEventListener('change', () => handleFiles(fileInputGeneral.files, 'general'));
    fileInputSroi.addEventListener('change', () => handleFiles(fileInputSroi.files, 'sroi'));
    // 드래그 이벤트 공통 처리 함수
    function setupDragEvents(dropArea, fileType) {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, e => {
                e.preventDefault();
                e.stopPropagation();
            }, false);
        });
        ['dragenter', 'dragover'].forEach(eventName => {
            dropArea.addEventListener(eventName, () => dropArea.classList.add('is-dragging'), false);
        });
        ['dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, () => dropArea.classList.remove('is-dragging'), false);
        });
        dropArea.addEventListener('drop', (e) => handleFiles(e.dataTransfer.files, fileType));
    }
    setupDragEvents(dropAreaGeneral, 'general');
    setupDragEvents(dropAreaSroi, 'sroi');
    function handleFiles(files, fileType) {
        if (fileType === 'sroi') {
            sroiFile = files[0]; // SROI는 단일 파일
        } else {
            [...files].forEach(file => {
                if (!generalFiles.some(f => f.name === file.name && f.size === file.size)) {
                    generalFiles.push(file);
                }
            });
        }
        updateFileList();
    }
    function updateFileList() {
        fileList.innerHTML = ''; // 목록 초기화
        const allFiles = [...generalFiles];
        if (sroiFile) {
            allFiles.push(sroiFile);
        }
        if (allFiles.length > 0) {
            filePlaceholder.style.display = 'none';
            generateBtn.disabled = false;
        } else {
            filePlaceholder.style.display = 'flex';
            generateBtn.disabled = true;
        }
        // 파일 목록 UI 업데이트
        allFiles.forEach((file, index) => {
            const li = document.createElement('li');
            li.classList.add('file-item');
            li.innerHTML = `
                <div class="file-info">
                    <svg class="file-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>
                    <span class="file-name">${file.name}</span>
                </div>
                <button class="remove-btn" data-name="${file.name}">&times;</button>
            `;
            fileList.appendChild(li);
        });
        // 체크리스트 상태 업데이트
        checkGeneral.classList.toggle('checked', generalFiles.length > 0);
        checkSroi.classList.toggle('checked', sroiFile !== null);
    }
    // 파일 삭제 버튼 클릭 (수정)
    fileList.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-btn')) {
            const fileName = e.target.dataset.name;
            // generalFiles에서 삭제
            generalFiles = generalFiles.filter(f => f.name !== fileName);
            // sroiFile에서 삭제
            if (sroiFile && sroiFile.name === fileName) {
                sroiFile = null;
            }
            updateFileList();
        }
    });
    // ▼▼▼ 리포트 생성 버튼 클릭 시 파일 업로드 및 페이지 이동 로직 추가 ▼▼▼
    generateBtn.addEventListener('click', async () => {
        if (generateBtn.disabled) return;
        const formData = new FormData();
        // 일반 파일을 'files' 이름으로 추가 (리스트)
        generalFiles.forEach(file => formData.append('files', file));
        // SROI 파일이 있으면 'files' 이름으로 추가 (단일)
        if (sroiFile) {
            formData.append('files', sroiFile);
        }
        try {
            generateBtn.disabled = true;
            generateBtn.textContent = 'AI 분석 요청 중...';
            // 백엔드 API 호출
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`파일 업로드 실패: ${response.status} ${errorText}`);
            }
            const data = await response.json();
            if (data.job_id) {
                // 성공 시 job_id와 함께 생성 페이지로 이동
                window.location.href = `generating.html?job_id=${data.job_id}`;
            } else {
                throw new Error('서버로부터 job_id를 받지 못했습니다.');
            }
        } catch (error) {
            console.error('리포트 생성 실패:', error);
            alert(`리포트 생성에 실패했습니다. 다시 시도해주세요.\n오류: ${error.message}`);
            generateBtn.disabled = false;
            generateBtn.textContent = ':반짝임: AI 리포트 생성하기';
        }
    });
    // ▼▼▼ 끝 ▼▼▼
});