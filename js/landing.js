window.addEventListener('DOMContentLoaded', () => {
        // ▼▼▼ 그래프 애니메이션 스크립트 ▼▼▼
            const hiddenImpactSection = document.querySelector('.hidden-impact-section');

            if (hiddenImpactSection) {
                const graphObserver = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            entry.target.classList.add('is-visible');
                        }
                    });
                }, {
                    threshold: 0.5 // 섹션이 50% 보일 때 애니메이션 시작
                });
        
                graphObserver.observe(hiddenImpactSection);
            }
        // ▲▲▲ 그래프 애니메이션 스크립트 끝 ▲▲▲
            // 헤더 스크롤 효과 스크립트
            let lastScrollTop = 0;
            const header = document.querySelector('.landing-page-header');
            // 헤더 스크롤 효과 및 드랍다운 닫기 스크립트
            let scrollTimeout; // 스크롤 타임아웃을 저장할 변수
            window.addEventListener('scroll', function() {
                let scrollTop = window.pageYOffset || document.documentElement.scrollTop;

                // ▼▼▼ 스크롤 시 드랍다운 닫기 (딜레이 추가) ▼▼▼
                // 일단 기존에 설정된 타임아웃이 있다면 취소
                clearTimeout(scrollTimeout);

                // 0.5초 후에 드랍다운을 닫는 새로운 타임아웃 설정
                scrollTimeout = setTimeout(() => {
                    if (dropdownContent && dropdownContent.classList.contains('show')) {
                        dropdownContent.classList.remove('show');
                        dropdownBtn.classList.remove('active');
                    }
                }, 40); // 500ms = 0.5초

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

            // 스크롤 애니메이션 스크립트
            const introObserver = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                    } else {
                        if (entry.boundingClientRect.top > 0) {
                            entry.target.classList.remove('is-visible');
                        }
                    }
                });
            }, {
                threshold: 0.1
            });

            const introSection = document.querySelector('.intro-section');
            if (introSection) {
                introObserver.observe(introSection);
            }

            // ▼▼▼ 드랍다운 메뉴 클릭 제어 스크립트 (새로 추가) ▼▼▼
            const dropdownBtn = document.querySelector('.dropdown-btn');
            const dropdownContent = document.querySelector('.dropdown-content');

            if (dropdownBtn) {
                dropdownBtn.addEventListener('click', (event) => {
                    event.stopPropagation(); // 이벤트 버블링 방지
                    const isShown = dropdownContent.classList.toggle('show');
                    dropdownBtn.classList.toggle('active', isShown); // 메뉴가 보일 때 버튼에 active 클래스 추가/제거
                });
            }

            // 다른 곳을 클릭하면 드랍다운 메뉴가 닫히도록 설정
            window.addEventListener('click', (event) => {
                if (dropdownContent && dropdownContent.classList.contains('show')) {
                    dropdownContent.classList.remove('show');
                    dropdownBtn.classList.remove('active');
                }
            });
            const scrollTopBtn = document.getElementById('scrollTopBtn');

            window.addEventListener('scroll', () => {
                if (window.scrollY > 300) { // 300px 이상 스크롤되면 버튼 보이기
                    scrollTopBtn.classList.add('show');
                } else {
                    scrollTopBtn.classList.remove('show');
                }
            });

            scrollTopBtn.addEventListener('click', (e) => {
                e.preventDefault();
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth' // 부드럽게 스크롤
                });
            });
             // ▼▼▼ [추가] 팝업 기능 스크립트 ▼▼▼
            const expertConsultBtn = document.getElementById('expert-consult-btn');
            const reportModal = document.getElementById('report-modal');
            const modalCancelBtn = document.getElementById('modal-cancel-btn');

            if (expertConsultBtn && reportModal) {
                // 버튼 클릭 시 팝업 열기
                expertConsultBtn.addEventListener('click', (e) => {
                    e.preventDefault(); // 링크의 기본 동작(페이지 이동) 막기
                    reportModal.classList.add('show');
                });

                // '취소' 버튼 클릭 시 팝업 닫기
                modalCancelBtn.addEventListener('click', () => {
                    reportModal.classList.remove('show');
                });

                // 팝업 바깥의 어두운 영역 클릭 시 팝업 닫기
                reportModal.addEventListener('click', (e) => {
                    if (e.target === reportModal) {
                        reportModal.classList.remove('show');
                    }
                });
            }
        });