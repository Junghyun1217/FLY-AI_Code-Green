// ================================================================
// 기능 1: 서버의 파일 목록을 가져와 테이블에 표시하는 함수
// ================================================================
async function loadAndDisplayServerFiles() {
    const tableBody = document.querySelector('#server-files-table tbody');
    // 이 기능이 필요 없는 페이지일 경우를 대비해, 테이블이 없으면 함수를 조용히 종료
    if (!tableBody) return;

    tableBody.innerHTML = '<tr><td colspan="4">목록을 불러오는 중...</td></tr>';

    try {
        const response = await fetch('/api/files'); // ◀️ 수정 1: '/api' 추가
        if (!response.ok) throw new Error('서버에서 파일 목록을 가져오는 데 실패했습니다.');
        
        const data = await response.json();
        tableBody.innerHTML = ''; // 테이블 내용 초기화

        if (data.files.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="4">서버에 저장된 파일이 없습니다.</td></tr>';
            return;
        }

        data.files.forEach(file => {
            const row = `
                <tr>
                    <td>${file.filename}</td>
                    <td>${file.size_bytes.toLocaleString()}</td>
                    <td>${new Date(file.modified).toLocaleString()}</td>
                    <td><a href="${file.url_download}" download>다운로드</a></td>
                </tr>
            `;
            tableBody.innerHTML += row;
        });
    } catch (error) {
        console.error(error);
        tableBody.innerHTML = '<tr><td colspan="4">목록을 불러오는 중 오류가 발생했습니다.</td></tr>';
    }
}


// ================================================================
// 기능 2: 페이지의 UI 조작 및 이벤트 처리
// ================================================================
document.addEventListener('DOMContentLoaded', () => {
    // --- 페이지의 모든 HTML 요소가 준비되면 아래 코드를 실행 ---

    // ▼▼▼ 페이지가 열리자마자 서버 파일 목록을 불러옵니다 ▼▼▼
    loadAndDisplayServerFiles();

    // --- 파일 업로드 UI에 필요한 HTML 요소들을 가져옵니다 ---
    const dropArea = document.getElementById('drop-area');
    const fileInput = document.getElementById('file-input');
    const browseBtn = document.getElementById('browse-btn');
    const fileList = document.getElementById('file-list');
    const filePlaceholder = document.getElementById('file-placeholder');
    const generateBtn = document.getElementById('generate-report-btn');

    // --- 업로드할 파일들을 담아둘 배열 ---
    let uploadedFiles = [];

    // --- 파일 찾아보기 버튼 및 드래그 영역 클릭 이벤트 ---
    browseBtn.addEventListener('click', () => fileInput.click());
    dropArea.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', () => handleFiles(fileInput.files));

    // --- 드래그 앤 드롭 이벤트 처리 ---
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
    });
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, () => dropArea.classList.add('is-dragging'), false);
    });
    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, () => dropArea.classList.remove('is-dragging'), false);
    });
    dropArea.addEventListener('drop', (e) => handleFiles(e.dataTransfer.files));

    // --- 파일이 선택되었을 때 처리하는 함수 ---
    function handleFiles(files) {
        [...files].forEach(file => {
            if (!uploadedFiles.some(f => f.name === file.name && f.size === file.size)) {
                uploadedFiles.push(file);
            }
        });
        updateFileList();
    }

    // --- 화면에 선택된 파일 목록을 업데이트하는 함수 ---
    function updateFileList() {
        fileList.innerHTML = '';
        filePlaceholder.style.display = uploadedFiles.length > 0 ? 'none' : 'flex';
        generateBtn.disabled = uploadedFiles.length === 0;

        uploadedFiles.forEach((file, index) => {
            const li = document.createElement('li');
            li.classList.add('file-item');
            li.innerHTML = `
                <div class="file-info">
                    <svg class="file-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>
                    <span class="file-name">${file.name}</span>
                </div>
                <button class="remove-btn" data-index="${index}">&times;</button>
            `;
            fileList.appendChild(li);
        });
    }

    // --- 선택한 파일 목록에서 X 버튼을 눌러 삭제하는 기능 ---
    fileList.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-btn')) {
            const index = parseInt(e.target.dataset.index);
            uploadedFiles.splice(index, 1);
            updateFileList();
        }
    });

    // --- '리포트 생성하기' 버튼을 눌렀을 때의 동작 ---
    generateBtn.addEventListener('click', async () => {
        if (generateBtn.disabled || uploadedFiles.length === 0) return;
    
        const formData = new FormData();
        uploadedFiles.forEach(file => formData.append('files', file));
    
        try {
            generateBtn.disabled = true;
            generateBtn.innerHTML = 'AI 분석 요청 중...';
        
            // /upload API 호출
           // 2. fetch를 사용해 백엔드 서버의 전체 주소로 파일들 전송
            const response = await fetch('/api/upload', { // ◀️ 수정 2: 주소를 '/api/upload'로 변경
                method: 'POST',
                body: formData,
            });
            if (!response.ok) throw new Error('파일 업로드 실패');
        
            const data = await response.json();
            if (data.job_id) {
                // 성공 시 job_id와 함께 로딩 페이지로 이동
                window.location.href = `hd_generating.html?job_id=${data.job_id}`;
            } else {
                throw new Error('서버로부터 job_id를 받지 못했습니다.');
            }
        } catch (error) {
            console.error('리포트 생성 실패:', error);
            alert('리포트 생성에 실패했습니다. 다시 시도해주세요.');
            generateBtn.disabled = false;
            generateBtn.innerHTML = '✨ Hidden 임팩트 발굴하기';
        }
    });
});