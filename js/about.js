window.addEventListener('DOMContentLoaded', () => {
            // 헤더 스크롤 효과 스크립트
            let lastScrollTop = 0;
            const header = document.querySelector('.landing-page-header');
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

            // 드랍다운 메뉴 클릭 제어 스크립트
            const dropdownBtn = document.querySelector('.dropdown-btn');
            const dropdownContent = document.querySelector('.dropdown-content');

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
            
            // --- Philosophy 슬라이더 스크립트 (간격 계산 수정) ---
            const trackNew = document.querySelector('.slider-track-new');
            if (trackNew) {
                const slidesNew = Array.from(trackNew.children);
                const dotsNavNew = document.querySelector('.slider-dots-new');
                let currentSlideIndex = 0;
            
                if (slidesNew.length > 0) {
                    // 점(dot) 생성
                    slidesNew.forEach((_, index) => {
                        const dot = document.createElement('button');
                        dot.classList.add('dot-new');
                        if (index === 0) dot.classList.add('active');
                        dotsNavNew.appendChild(dot);
                    });
                    const dotsNew = Array.from(dotsNavNew.children);
                
                    // 슬라이드 이동 함수 (수정)
                    const moveToSlideNew = (targetIndex) => {
                        const slideWidth = slidesNew[0].offsetWidth;
                        const gap = parseInt(getComputedStyle(trackNew).gap) || 0;
                        const amountToMove = targetIndex * (slideWidth + gap);

                        trackNew.style.transform = `translateX(-${amountToMove}px)`;
                        currentSlideIndex = targetIndex;
                    
                        dotsNew.forEach(dot => dot.classList.remove('active'));
                        dotsNew[targetIndex].classList.add('active');
                    }
                
                    // 점(dot) 클릭 이벤트
                    dotsNavNew.addEventListener('click', e => {
                        const targetDot = e.target.closest('button.dot-new');
                        if (!targetDot) return;
                        const targetIndex = dotsNew.findIndex(dot => dot === targetDot);
                        moveToSlideNew(targetIndex);
                    });
                
                    // 창 크기 변경 시 위치 재조정
                    window.addEventListener('resize', () => {
                        moveToSlideNew(currentSlideIndex);
                    });
                
                    // 자동 슬라이드
                    setInterval(() => {
                        const nextSlideIndex = (currentSlideIndex + 1) % slidesNew.length;
                        moveToSlideNew(nextSlideIndex);
                    }, 5000);
                }
            }


            // ▼▼▼ [수정된 부분] 스크롤 애니메이션 스크립트 ▼▼▼
            const milestonesSection = document.querySelector('.milestones-section');

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        // is-visible 클래스를 추가하여 CSS 애니메이션을 실행
                        entry.target.classList.add('is-visible');
                        // is-dark 클래스를 추가하여 배경/텍스트 색상 변경
                        entry.target.classList.add('is-dark');
                    } else {
                        // ✨ 수정: 위로 스크롤해서 화면 밖으로 나갈 때만 원래대로 돌아가도록 변경
                        if (entry.boundingClientRect.top < 0) {
                            entry.target.classList.remove('is-visible');
                            entry.target.classList.remove('is-dark');
                        }
                    }
                });
            }, {
                threshold: 0.5 // 섹션이 50% 보일 때 효과 적용
            });

            if (milestonesSection) {
                observer.observe(milestonesSection);
            }
            // ▲▲▲ [수정된 부분] 끝 ▲▲▲
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
        });