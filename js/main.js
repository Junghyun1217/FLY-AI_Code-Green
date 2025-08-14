window.addEventListener('DOMContentLoaded', () => {
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