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

            // --- 파일 업로드 기능 스크립트 ---
            const dropArea = document.getElementById('drop-area');
            const fileInput = document.getElementById('file-input');
            const browseBtn = document.getElementById('browse-btn');
            const fileList = document.getElementById('file-list');
            const filePlaceholder = document.getElementById('file-placeholder');
            const generateBtn = document.getElementById('generate-report-btn');

            let uploadedFiles = [];

            // 파일 찾아보기 버튼 클릭
            browseBtn.addEventListener('click', () => fileInput.click());
            dropArea.addEventListener('click', () => fileInput.click());

            // 파일 선택 시
            fileInput.addEventListener('change', () => {
                handleFiles(fileInput.files);
            });

            // 드래그 이벤트 처리
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

            // 파일 드롭 시
            dropArea.addEventListener('drop', (e) => {
                handleFiles(e.dataTransfer.files);
            });

            function handleFiles(files) {
                [...files].forEach(file => {
                    // 중복 파일 체크
                    if (!uploadedFiles.some(f => f.name === file.name && f.size === file.size)) {
                        uploadedFiles.push(file);
                    }
                });
                updateFileList();
            }

            function updateFileList() {
                fileList.innerHTML = ''; // 목록 초기화
                if (uploadedFiles.length > 0) {
                    filePlaceholder.style.display = 'none';
                    generateBtn.disabled = false;
                } else {
                    filePlaceholder.style.display = 'flex';
                    generateBtn.disabled = true;
                }

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

            // 파일 삭제 버튼 클릭
            fileList.addEventListener('click', (e) => {
                if (e.target.classList.contains('remove-btn')) {
                    const index = parseInt(e.target.dataset.index);
                    uploadedFiles.splice(index, 1);
                    updateFileList();
                }
            });
            
            // ▼▼▼ [수정됨] 'Hidden 임팩트 발굴하기' 버튼 클릭 이벤트 ▼▼▼
            generateBtn.addEventListener('click', async () => {
                if (generateBtn.disabled || uploadedFiles.length === 0) {
                    return;
                }
            
                // 1. 서버로 보낼 FormData 객체 생성
                const formData = new FormData();
                uploadedFiles.forEach(file => {
                    // 백엔드에서 'files'라는 이름으로 여러 파일을 받을 수 있도록 준비
                    formData.append('files', file); 
                });
            
                try {
                    // 버튼을 비활성화하고 로딩 상태로 변경
                    generateBtn.disabled = true;
                    generateBtn.innerHTML = 'AI 분석 요청 중...';
                
                    // 2. fetch를 사용해 '/upload' API로 파일들 전송
                    const response = await fetch('/upload', {
                        method: 'POST',
                        body: formData,
                    });
                
                    if (!response.ok) {
                        throw new Error('파일 업로드에 실패했습니다.');
                    }
                
                    // 3. 서버로부터 { "job_id": "..." } 형태의 응답을 받음
                    const data = await response.json();
                
                    // 4. job_id를 가지고 로딩 페이지로 이동 (폴링 시작점)
                    if (data.job_id) {
                        window.location.href = `hd_generating.html?job_id=${data.job_id}`;
                    } else {
                        throw new Error('서버로부터 job_id를 받지 못했습니다.');
                    }
                
                } catch (error) {
                    console.error('리포트 생성 실패:', error);
                    alert('리포트 생성에 실패했습니다. 다시 시도해주세요.');
                    // 에러 발생 시 버튼을 다시 활성화
                    generateBtn.disabled = false;
                    generateBtn.innerHTML = '✨ Hidden 임팩트 발굴하기';
                }
            });
            // ▲▲▲ [수정됨] 여기까지 ▲▲▲
        });