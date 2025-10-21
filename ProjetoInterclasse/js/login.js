class LoginController {
    constructor() {
        this.dataManager = new DataManager();
        this.initializeElements();
        this.attachEvents();
        this.checkExistingSession();
    }

    initializeElements() {
        this.username = document.getElementById('username');
        this.password = document.getElementById('password');
        this.confirmBtn = document.querySelector('.btn-confirm');
        this.togglePassBtn = document.querySelector('.btn-toggle-pass');
    }

    attachEvents() {
        this.confirmBtn.addEventListener('click', () => this.handleLogin());
        
        // Permitir login com Enter
        [this.username, this.password].forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleLogin();
                }
            });
        });

        // Toggle password visibility
        if (this.togglePassBtn) {
            this.togglePassBtn.addEventListener('click', () => this.togglePasswordVisibility());
        }
    }

    togglePasswordVisibility() {
        if (this.password.type === 'password') {
            this.password.type = 'text';
            this.togglePassBtn.setAttribute('aria-label', 'Ocultar senha');
            this.togglePassBtn.textContent = '🙈';
        } else {
            this.password.type = 'password';
            this.togglePassBtn.setAttribute('aria-label', 'Mostrar senha');
            this.togglePassBtn.textContent = '👁';
        }
    }

    async handleLogin() {
        const email = this.username.value.trim();
        const password = this.password.value;

        // Validações básicas
        if (!email) {
            this.showError('Por favor, digite seu email');
            return;
        }

        if (!password) {
            this.showError('Por favor, digite sua senha');
            return;
        }

        if (!this.validateEmail(email)) {
            this.showError('Por favor, digite um email válido');
            return;
        }

        // Mostrar loading
        this.showLoading(true);

        try {
            // Simular delay de rede
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const user = this.dataManager.validateLogin(email, password);
            
            if (user) {
                console.log('✅ Login bem-sucedido para:', user.name);
                
                // Salvar sessão do usuário
                this.saveUserSession(user);
                this.showSuccess(`Bem-vindo, ${user.name}!`);
                
                // Redirecionar após breve delay
                setTimeout(() => {
                    this.redirectToHome();
                }, 1500);
                
            } else {
                this.showError('Email ou senha incorretos');
            }
            
        } catch (error) {
            this.showError('Erro ao fazer login: ' + error.message);
        } finally {
            this.showLoading(false);
        }
    }

    saveUserSession(user) {
        try {
            // Obter foto se existir
            const photoData = this.dataManager.getUserPhoto(user.id);
            
            // Garantir que todos os dados essenciais estão presentes
            const userSessionData = {
                id: user.id || '',
                email: user.email || '',
                name: user.name || '',
                role: user.role || '',
                dob: user.dob || '',
                createdAt: user.createdAt || new Date().toISOString(),
                isActive: user.isActive !== undefined ? user.isActive : true,
                hasPhoto: user.hasPhoto || false,
                photoData: photoData || null
            };
            
            console.log('💾 Salvando sessão:', userSessionData);
            
            // Salvar em ambos storages para garantir
            sessionStorage.setItem('currentUser', JSON.stringify(userSessionData));
            localStorage.setItem('currentUser', JSON.stringify(userSessionData));
            
            console.log('✅ Sessão salva com sucesso');
            
        } catch (error) {
            console.error('❌ Erro ao salvar sessão:', error);
            throw new Error('Erro ao salvar sessão do usuário');
        }
    }

    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    showLoading(show) {
        if (show) {
            this.confirmBtn.disabled = true;
            this.confirmBtn.textContent = 'Entrando...';
            this.confirmBtn.style.opacity = '0.7';
        } else {
            this.confirmBtn.disabled = false;
            this.confirmBtn.textContent = 'Confirmar';
            this.confirmBtn.style.opacity = '1';
        }
    }

    showError(message) {
        // Remover mensagens anteriores
        this.removeExistingMessages();
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'login-error';
        errorDiv.innerHTML = `
            <span>⚠️ ${message}</span>
        `;
        
        this.confirmBtn.parentNode.insertBefore(errorDiv, this.confirmBtn);
        
        // Auto-remover após 5 segundos
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.remove();
            }
        }, 5000);
    }

    showSuccess(message) {
        this.removeExistingMessages();
        
        const successDiv = document.createElement('div');
        successDiv.className = 'login-success';
        successDiv.innerHTML = `
            <span>✅ ${message}</span>
        `;
        
        this.confirmBtn.parentNode.insertBefore(successDiv, this.confirmBtn);
    }

    removeExistingMessages() {
        const existingError = document.querySelector('.login-error');
        const existingSuccess = document.querySelector('.login-success');
        
        if (existingError) existingError.remove();
        if (existingSuccess) existingSuccess.remove();
    }

    redirectToHome() {
        console.log('🔄 Redirecionando para página inicial...');
        window.location.href = '../index.html';
    }

    checkExistingSession() {
        try {
            // Verificar sessionStorage primeiro, depois localStorage
            let userData = sessionStorage.getItem('currentUser');
            if (!userData) {
                userData = localStorage.getItem('currentUser');
                if (userData) {
                    // Se encontrou no localStorage, copiar para sessionStorage
                    sessionStorage.setItem('currentUser', userData);
                }
            }
            
            if (userData) {
                const user = JSON.parse(userData);
                console.log('🔍 Usuário já logado, redirecionando...', user);
                // Se já está logado, redirecionar
                this.redirectToHome();
            }
        } catch (error) {
            console.error('❌ Erro ao verificar sessão:', error);
        }
    }
}

// Inicializar login quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Iniciando sistema de login...');
    new LoginController();
});