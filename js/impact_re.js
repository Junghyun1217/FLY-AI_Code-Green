// ================================================================
// 기능 1: 파일 처리 및 목록 업데이트 관련 함수
// ================================================================

// 여러 파일들(일반, SROI)을 관리하기 위한 변수
let generalFiles = [];
let sroiFile = null;

/**
 * 파일이 선택되거나 드롭됐을 때 파일 배열에 추가하는 함수
 * @param {FileList} files - 새로 추가된 파일 목록
 * @param {string} fileType - 'general' 또는 'sroi'
 */
function handleFiles(files, fileType) {
    if (fileType === 'sroi') {
        sroiFile = files[0]; // SROI는 단일 파일만 취급
    } else {
        [...files].forEach(file => {
            // 중복 파일은 추가하지 않음 (이름과 크기 기준)
            if (!generalFiles.some(f => f.name === file.name && f.size === file.size)) {
                generalFiles.push(file);
            }
        });
    }
    updateFileListUI(); // 파일 목록 UI 업데이트 호출
}

/**
 * 화면에 선택된 파일 목록과 체크리스트 상태를 업데이트하는 함수
 */
function updateFileListUI() {
    const fileList = document.getElementById('file-list');
    const filePlaceholder = document.getElementById('file-placeholder');
    const generateBtn = document.getElementById('generate-report-btn');
    const checkGeneral = document.getElementById('check-general');
    const checkSroi = document.getElementById('check-sroi');

    fileList.innerHTML = ''; // 기존 목록 초기화
    
    const allFiles = [...generalFiles];
    if (sroiFile) {
        allFiles.push(sroiFile);
    }

    // 파일 유무에 따라 플레이스홀더와 생성 버튼 상태 변경
    if (allFiles.length > 0) {
        filePlaceholder.style.display = 'none';
        generateBtn.disabled = false;
    } else {
        filePlaceholder.style.display = 'flex';
        generateBtn.disabled = true;
    }

    // 화면에 파일 목록 아이템(li) 생성
    allFiles.forEach((file) => {
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

    // 왼쪽 체크리스트 상태 업데이트
    checkGeneral.classList.toggle('checked', generalFiles.length > 0);
    checkSroi.classList.toggle('checked', sroiFile !== null);
}


// ================================================================
// 기능 2: 페이지의 UI 조작 및 이벤트 처리
// ================================================================
document.addEventListener('DOMContentLoaded', () => {
    
    // --- 헤더 드롭다운 메뉴 기능 ---
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
            dropdownBtn.classList.remove('active');
        }
    });

    // --- 파일 업로드 UI 요소 가져오기 ---
    const dropAreaGeneral = document.getElementById('drop-area-general');
    const fileInputGeneral = document.getElementById('file-input-general');
    const dropAreaSroi = document.getElementById('drop-area-sroi');
    const fileInputSroi = document.getElementById('file-input-sroi');
    const fileListEl = document.getElementById('file-list');
    const generateBtn = document.getElementById('generate-report-btn');

    // --- 클릭 및 파일 선택 이벤트 연결 ---
    dropAreaGeneral.addEventListener('click', () => fileInputGeneral.click());
    dropAreaSroi.addEventListener('click', () => fileInputSroi.click());
    fileInputGeneral.addEventListener('change', () => handleFiles(fileInputGeneral.files, 'general'));
    fileInputSroi.addEventListener('change', () => handleFiles(fileInputSroi.files, 'sroi'));

    // --- 드래그 앤 드롭 이벤트 설정 ---
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

    // --- 파일 목록에서 'X' 버튼으로 파일 삭제 ---
    fileListEl.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-btn')) {
            const fileName = e.target.dataset.name;
            generalFiles = generalFiles.filter(f => f.name !== fileName);
            if (sroiFile && sroiFile.name === fileName) {
                sroiFile = null;
            }
            updateFileListUI();
        }
    });

    // --- '리포트 생성하기' 버튼 클릭 시 API 호출 (hidden.js와 동일하게 수정) ---
    generateBtn.addEventListener('click', async () => {
        if (generateBtn.disabled) return;
    
        const formData = new FormData();
        
        // ▼▼▼ [수정] 모든 파일을 'files'라는 키 하나로 통합 ▼▼▼
        const allFiles = [...generalFiles];
        if (sroiFile) {
            allFiles.push(sroiFile);
        }
        allFiles.forEach(file => {
            formData.append('files', file); 
        });
        // ▲▲▲ [수정] ▲▲▲
    
        try {
            generateBtn.disabled = true;
            generateBtn.innerHTML = 'AI 분석 요청 중...';
        
            // ▼▼▼ [수정] API 엔드포인트를 '/api/upload'로 변경 ▼▼▼
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });
            // ▲▲▲ [수정] ▲▲▲

            if (!response.ok) {
                throw new Error(`서버 응답 오류: ${response.status}`);
            }
        
            const data = await response.json();
            if (data.job_id) {
                // 성공 시 job_id와 함께 로딩 페이지로 이동 (기존과 동일)
                window.location.href = `hd_generating.html?job_id=${data.job_id}`;
            } else {
                throw new Error('서버로부터 job_id를 받지 못했습니다.');
            }
        } catch (error) {
            console.error('리포트 생성 실패:', error);
            alert('리포트 생성에 실패했습니다. 파일을 확인하고 다시 시도해주세요.');
            // 실패 시 버튼 상태 원상 복구 (버튼 텍스트는 이 페이지에 맞게 수정)
            generateBtn.disabled = false;
            generateBtn.innerHTML = '✨ AI 리포트 생성하기';
        }
    });
});