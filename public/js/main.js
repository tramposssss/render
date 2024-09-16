document.addEventListener('DOMContentLoaded', function () {
    // Script para o botão flutuante do WhatsApp
    const floatingButton = document.getElementById('floatingButton');
    if (floatingButton) {
        floatingButton.addEventListener('click', function () {
            window.open('https://wa.me/556198467079', '_blank');
        });
    }

    // Script para o botão de telefone no rodapé
    const telButton = document.getElementById('telButton');
    const footerPhone = document.getElementById('footerPhone');
    
    if (telButton && footerPhone) {
        telButton.addEventListener('click', function () {
            const phoneNumber = footerPhone.value.trim();
            if (phoneNumber) {
                window.location.href = `/contato.html?phone=${encodeURIComponent(phoneNumber)}`;
            } else {
                alert('Por favor, insira um número de telefone.');
            }
        });
    }

    // Script para preencher o campo de telefone com o número da URL
    const urlParams = new URLSearchParams(window.location.search);
    const phone = urlParams.get('phone');
    if (phone) {
        const phoneField = document.getElementById('phone');
        if (phoneField) {
            phoneField.value = phone;
        }
    }

    // Script para enviar o formulário de contato via AJAX
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async function (event) {
            event.preventDefault(); // Evita o envio padrão do formulário

            const formData = new FormData(contactForm);
            const data = {};
            formData.forEach((value, key) => {
                data[key] = value;
            });

            try {
                const response = await fetch('/api/submit_contact_form', { // Verifique se o caminho está correto
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });

                if (response.ok) {
                    const result = await response.text();
                    alert(result); // Mostra a mensagem de sucesso
                    contactForm.reset(); // Limpa o formulário após o envio
                } else {
                    const errorText = await response.text();
                    alert(`Erro: ${errorText}`); // Mostra a mensagem de erro
                }
            } catch (error) {
                console.error('Erro ao enviar o formulário:', error);
                alert('Erro ao enviar sua mensagem. Tente novamente mais tarde.');
            }
        });
    }

    // Script para enviar o formulário de registro via AJAX
    const registrationForm = document.getElementById('registration-form');
    if (registrationForm) {
        registrationForm.addEventListener('submit', async function (event) {
            event.preventDefault(); // Evita o envio padrão do formulário

            const formData = new FormData(registrationForm);
            const data = {};
            formData.forEach((value, key) => {
                data[key] = value;
            });

            try {
                const response = await fetch('/api/submit_form', { // Verifique se o caminho está correto
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });

                if (response.ok) {
                    const result = await response.text(); // Obtém o texto da resposta
                    alert(result); // Mostra a mensagem de sucesso
                    registrationForm.reset(); // Limpa o formulário após o envio
                } else {
                    const errorText = await response.text();
                    alert(`Erro: ${errorText}`); // Mostra a mensagem de erro
                }
            } catch (error) {
                console.error('Erro ao enviar o formulário:', error);
                alert('Erro ao enviar o formulário. Tente novamente mais tarde.');
            }
        });
    } else {
        console.warn('Formulário de registro não encontrado.');
    }

    // Script para adicionar uma classe ao navbar ao rolar a página
    const navbar = document.getElementById('main-navbar');
    if (navbar) {
        window.addEventListener('scroll', function () {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    // Script para fechar o menu de navegação no mobile após clicar em um item
    const navLinks = document.querySelectorAll('#navbarNav .nav-link');
    const navbarCollapse = document.getElementById('navbarNav');
    if (navLinks.length > 0 && navbarCollapse) {
        navLinks.forEach(link => {
            link.addEventListener('click', function () {
                if (window.innerWidth < 992) { // Condição para dispositivos móveis
                    const bootstrapCollapse = bootstrap.Collapse.getInstance(navbarCollapse); // Usar getInstance para evitar criar nova instância
                    if (bootstrapCollapse) {
                        bootstrapCollapse.hide();
                    }
                }
            });
        });
    }
});
