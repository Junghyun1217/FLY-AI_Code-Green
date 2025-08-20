// hidden.js 파일의 전체 내용으로 사용하세요.

document.addEventListener('DOMContentLoaded', () => {
    // --- 헤더 및 공통 UI 요소 ---
    const header = document.querySelector('.landing-page-header');
    const dropdownBtn = document.querySelector('.dropdown-btn');
    const dropdownContent = document.querySelector('.dropdown-content');
    const scrollTopBtn = document.getElementById('scrollTopBtn');

    // --- 파일 업로드 UI 요소 ---
    const dropArea = document.getElementById('drop-area');
    const fileInput = document.getElementById('file-input');
    const browseBtn = document.getElementById('browse-btn');
    const fileList = document.getElementById('file-list');
    const filePlaceholder = document.getElementById('file-placeholder');
    const generateBtn = document.getElementById('generate-report-btn');

    let uploadedFiles = []; // 업로드할 파일 목록 배열

    // 1. 헤더 스크롤 효과
    let lastScrollTop = 0;
    window.addEventListener('scroll', function() {
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
    }, false);

    // 2. 드랍다운 메뉴 기능
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

    
    // 4. 파일 업로드 기능 (드래그 앤 드롭 포함)
    if (dropArea) {
        browseBtn.addEventListener('click', () => fileInput.click());
        dropArea.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', () => handleFiles(fileInput.files));

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
        dropArea.addEventListener('drop', (e) => handleFiles(e.dataTransfer.files));
    }

    function handleFiles(files) {
        [...files].forEach(file => {
            if (!uploadedFiles.some(f => f.name === file.name && f.size === file.size)) {
                uploadedFiles.push(file);
            }
        });
        updateFileList();
    }

    function updateFileList() {
        fileList.innerHTML = '';
        filePlaceholder.style.display = uploadedFiles.length > 0 ? 'none' : 'flex';
        generateBtn.disabled = uploadedFiles.length === 0;

        uploadedFiles.forEach((file, index) => {
            const li = document.createElement('li');
            li.className = 'file-item';
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

    fileList.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-btn')) {
            const index = parseInt(e.target.dataset.index);
            uploadedFiles.splice(index, 1);
            updateFileList();
        }
    });

    // 5. '리포트 생성하기' 버튼 클릭 시 서버로 파일 전송
    if (generateBtn) {
        generateBtn.addEventListener('click', async () => {
            if (generateBtn.disabled || uploadedFiles.length === 0) return;

            const formData = new FormData();
            uploadedFiles.forEach(file => formData.append('files', file));

            try {
                generateBtn.disabled = true;
                generateBtn.innerHTML = 'AI 분석 요청 중...';

                const response = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) {
                    // 서버가 502 에러 등을 반환하면 여기서 에러 발생
                    throw new Error(`파일 업로드 실패 (서버 상태: ${response.status})`);
                }

                const data = await response.json();
                if (data.job_id) {
                    window.location.href = `hd_generating.html?job_id=${data.job_id}`;
                } else {
                    throw new Error('서버로부터 job_id를 받지 못했습니다.');
                }
            } catch (error) {
                console.error('리포트 생성 실패:', error);
                alert('리포트 생성에 실패했습니다. 서버 상태를 확인하거나 다시 시도해주세요.');
                generateBtn.disabled = false;
                generateBtn.innerHTML = '✨ Hidden 임팩트 발굴하기';
            }
        });
    }
});