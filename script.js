document.addEventListener('DOMContentLoaded', () => {
    const generateReportButton = document.getElementById('generateReportButton');
    
    // 새로 추가된 요소 참조
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');

    const dropArea = document.getElementById('dropArea');
    const fileInput = document.getElementById('fileInput');
    const dropText = document.getElementById('dropText');
    const fileList = document.getElementById('fileList');

    let uploadedFiles = []; // 업로드된 파일들을 관리할 배열

    // "Generate report" 버튼 클릭 이벤트
    generateReportButton.addEventListener('click', () => {
        // 유효성 검사 시작
        const userName = nameInput.value.trim();
        const userEmail = emailInput.value.trim();
        const hasFiles = uploadedFiles.length > 0;

        if (userName === '') {
            alert('Please enter your name.');
            nameInput.focus(); // 이름 필드로 포커스 이동
            return; // 함수 실행 중단
        }

        if (userEmail === '') {
            alert('Please enter your email.');
            emailInput.focus(); // 이메일 필드로 포커스 이동
            return; // 함수 실행 중단
        }

        // 간단한 이메일 형식 유효성 검사 (더 복잡한 정규식 필요시 추가)
        if (!userEmail.includes('@') || !userEmail.includes('.')) {
            alert('Please enter a valid email address.');
            emailInput.focus();
            return;
        }

        if (!hasFiles) {
            alert('Please upload at least one file.');
            // 파일 업로드 영역으로 시각적 피드백 제공 가능
            dropArea.classList.add('highlight-error'); // 에러 시각화 위한 클래스 추가
            setTimeout(() => {
                dropArea.classList.remove('highlight-error');
            }, 1000); // 1초 후 에러 표시 제거
            return; // 함수 실행 중단
        }

        // 모든 유효성 검사를 통과하면 다음 페이지로 이동
        window.location.href = 'generating_report.html';
    });

    // --- 파일 업로드 및 삭제 관련 기존 로직 (동일하게 유지) ---

    // 드롭 영역 클릭 시 파일 입력 창 열기
    dropArea.addEventListener('click', () => {
        fileInput.click();
    });

    // 파일 입력(input) 변경 이벤트 처리
    fileInput.addEventListener('change', (event) => {
        handleFiles(event.target.files);
        // fileInput.value = '';
    });

    // 드래그앤드롭 이벤트 리스너 설정
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    // 드래그 오버 시 시각적 피드백
    dropArea.addEventListener('dragenter', highlight, false);
    dropArea.addEventListener('dragover', highlight, false);
    dropArea.addEventListener('dragleave', unhighlight, false);
    dropArea.addEventListener('drop', unhighlight, false);

    function highlight() {
        dropArea.classList.add('highlight');
        dropText.textContent = 'Drop files here!';
    }

    function unhighlight() {
        dropArea.classList.remove('highlight');
        updateDropAreaText();
    }

    // 파일 드롭 이벤트 처리
    dropArea.addEventListener('drop', (event) => {
        const dt = event.dataTransfer;
        const files = dt.files;
        handleFiles(files);
    }, false);

    // 파일 처리 함수
    function handleFiles(files) {
        if (files.length === 0) {
            updateDropAreaText();
            return;
        }

        for (const file of files) {
            const isDuplicate = uploadedFiles.some(
                existingFile => existingFile.name === file.name && existingFile.size === file.size
            );

            if (isDuplicate) {
                console.warn(`Duplicate file skipped: ${file.name}`);
                continue;
            }

            uploadedFiles.push(file);
        }
        updateFileListDisplay();
    }

    // 파일 목록을 화면에 표시하는 함수
    function updateFileListDisplay() {
        fileList.innerHTML = '';
        if (uploadedFiles.length === 0) {
            dropText.textContent = 'Drag and drop file here, or browse to upload';
            return;
        }

        dropText.textContent = `${uploadedFiles.length} file(s) added.`;

        uploadedFiles.forEach((file, index) => {
            const listItem = document.createElement('li');

            const fileNameSpan = document.createElement('span');
            fileNameSpan.classList.add('file-name');
            fileNameSpan.textContent = file.name;

            const fileSizeSpan = document.createElement('span');
            fileSizeSpan.classList.add('file-size');
            fileSizeSpan.textContent = formatBytes(file.size);

            const removeButton = document.createElement('span');
            removeButton.classList.add('remove-file');
            removeButton.textContent = 'X';
            removeButton.title = `Remove ${file.name}`;

            removeButton.addEventListener('click', (e) => {
                e.stopPropagation();
                removeFileByNameAndSize(file.name, file.size);
            });

            listItem.appendChild(fileNameSpan);
            listItem.appendChild(fileSizeSpan);
            listItem.appendChild(removeButton);
            fileList.appendChild(listItem);
        });
    }

    // 파일 제거 함수 (이름과 크기를 기반으로 제거)
    function removeFileByNameAndSize(name, size) {
        uploadedFiles = uploadedFiles.filter(file => !(file.name === name && file.size === size));
        updateFileListDisplay();
    }

    // 파일 크기 포맷 함수
    function formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    // 드롭 영역 텍스트 업데이트 함수
    function updateDropAreaText() {
        if (uploadedFiles.length === 0) {
            dropText.textContent = 'Drag and drop file here, or browse to upload';
        } else {
            dropText.textContent = `${uploadedFiles.length} file(s) added.`;
        }
    }
});