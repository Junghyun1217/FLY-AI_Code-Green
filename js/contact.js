 document.addEventListener('DOMContentLoaded', () => {
            let lastScrollTop = 0;
            const header = document.querySelector('.landing-page-header');
            let scrollTimeout;
            const dropdownBtn = document.querySelector('.dropdown-btn');
            const dropdownContent = document.querySelector('.dropdown-content');
            const scrollTopBtn = document.getElementById('scrollTopBtn');

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

                if (scrollTopBtn) {
                    if (window.scrollY > 300) {
                        scrollTopBtn.classList.add('show');
                    } else {
                        scrollTopBtn.classList.remove('show');
                    }
                }
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

            if (scrollTopBtn) {
                scrollTopBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    window.scrollTo({
                        top: 0,
                        behavior: 'smooth'
                    });
                });
            }
        });