class CadastroController {
    constructor() {
        this.dataManager = new DataManager();
        this.currentStep = 1;
        this.userData = {
            email: '',
            password: '',
            name: '',
            dob: '',
            role: '',
            photoData: null
        };
        
        this.initializeElements();
        this.attachEvents();
        this.showStep(1);
    }

    initializeElements() {
        // Steps
        this.steps = document.querySelectorAll('.step');
        
        // Inputs
        this.email = document.getElementById('c-email');
        this.password = document.getElementById('c-password');
        this.passwordConfirm = document.getElementById('c-password-confirm');
        this.name = document.getElementById('c-name');
        this.dob = document.getElementById('c-dob');
        
        // Buttons
        this.next1 = document.getElementById('c-next-1');
        this.next2 = document.getElementById('c-next-2');
        this.finish = document.getElementById('c-finish');
        this.back1 = document.getElementById('c-back-1');
        this.back2 = document.getElementById('c-back-2');
        this.goLogin = document.getElementById('c-go-login');

        // Elementos da foto
        this.photoPreview = document.getElementById('photo-preview');
        this.photoPreviewImg = document.getElementById('photo-preview-img');
        this.photoInput = document.getElementById('photo-input');
        this.btnUpload = document.getElementById('btn-upload');
        this.photoLoading = document.getElementById('photo-loading');
        this.photoError = document.getElementById('photo-error');
        
        // Error messages
        this.emailError = document.getElementById('email-error');
        this.passwordError = document.getElementById('password-error');
        this.confirmError = document.getElementById('confirm-error');
        this.nameError = document.getElementById('name-error');
        this.dobError = document.getElementById('dob-error');
        this.roleError = document.getElementById('role-error');
    }

    attachEvents() {
        // Step 1 events
        this.email.addEventListener('input', () => this.validateStep1());
        this.password.addEventListener('input', () => this.validateStep1());

        // Step 2 events
        this.passwordConfirm.addEventListener('input', () => this.validateStep2());

        // Step 3 events
        this.name.addEventListener('input', () => this.validateStep3());
        this.dob.addEventListener('input', () => this.validateStep3());
        document.querySelectorAll('input[name="role"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.userData.role = e.target.value;
                console.log('🎯 Função selecionada:', this.userData.role);
                this.validateStep3();
            });
        });

        // Navigation buttons
        this.next1.addEventListener('click', () => this.goToStep(2));
        this.next2.addEventListener('click', () => this.goToStep(3));
        this.finish.addEventListener('click', () => this.finalizeRegistration());
        this.back1.addEventListener('click', () => this.goToStep(1));
        this.back2.addEventListener('click', () => this.goToStep(2));
        this.goLogin.addEventListener('click', () => window.location.href = 'login.html');

        // Eventos da foto
        this.btnUpload.addEventListener('click', () => this.photoInput.click());
        this.photoPreview.addEventListener('click', () => this.photoInput.click());
        this.photoInput.addEventListener('change', (e) => this.handlePhotoSelect(e));
    }

    async handlePhotoSelect(event) {
        const file = event.target.files[0];
        if (!file) return;

        this.showPhotoLoading(true);
        this.hidePhotoError();

        try {
            const processedImage = await this.dataManager.validateAndProcessImage(file);
            
            // Mostrar preview
            this.photoPreviewImg.src = processedImage.dataUrl;
            this.photoPreviewImg.style.display = 'block';
            document.querySelector('.photo-preview .placeholder').style.display = 'none';
            
            // Salvar dados da imagem
            this.userData.photoData = processedImage.dataUrl;
            
            // Validar step 3 (a foto é opcional, então não bloqueia)
            this.validateStep3();
            
        } catch (error) {
            this.showPhotoError(error.message);
            this.clearPhoto();
        } finally {
            this.showPhotoLoading(false);
        }
    }

    clearPhoto() {
        this.photoPreviewImg.src = '';
        this.photoPreviewImg.style.display = 'none';
        document.querySelector('.photo-preview .placeholder').style.display = 'block';
        this.userData.photoData = null;
        this.photoInput.value = '';
    }

    showPhotoLoading(show) {
        this.photoLoading.style.display = show ? 'flex' : 'none';
    }

    showPhotoError(message) {
        this.photoError.textContent = message;
        this.photoError.style.display = 'block';
    }

    hidePhotoError() {
        this.photoError.style.display = 'none';
    }

    validateStep1() {
        const emailValid = this.validateEmail(this.email.value);
        const passwordValid = this.password.value.length >= 6;

        this.emailError.textContent = emailValid ? '' : 'Email inválido';
        this.passwordError.textContent = passwordValid ? '' : 'Senha deve ter pelo menos 6 caracteres';

        this.next1.disabled = !(emailValid && passwordValid);
        
        // Salvar dados imediatamente
        if (emailValid) this.userData.email = this.email.value;
        if (passwordValid) this.userData.password = this.password.value;
        
        console.log('📝 Step 1 - Dados:', { 
            email: this.userData.email, 
            password: '***' 
        });
        
        return emailValid && passwordValid;
    }

    validateStep2() {
        const passwordsMatch = this.password.value === this.passwordConfirm.value;
        const passwordNotEmpty = this.passwordConfirm.value.length > 0;

        this.confirmError.textContent = passwordsMatch ? '' : 'As senhas não coincidem';

        this.next2.disabled = !(passwordsMatch && passwordNotEmpty);
        return passwordsMatch;
    }

    validateStep3() {
        const nameValid = this.name.value.trim().length >= 2;
        const dobValid = this.validateDate(this.dob.value);
        const roleSelected = document.querySelector('input[name="role"]:checked') !== null;

        this.nameError.textContent = nameValid ? '' : 'Nome deve ter pelo menos 2 caracteres';
        this.dobError.textContent = dobValid ? '' : 'Data de nascimento inválida';
        this.roleError.textContent = roleSelected ? '' : 'Selecione uma função';

        // Salvar dados imediatamente
        if (nameValid) this.userData.name = this.name.value.trim();
        if (dobValid) this.userData.dob = this.dob.value;
        
        // Foto é opcional, então não afeta a validação
        this.finish.disabled = !(nameValid && dobValid && roleSelected);
        
        console.log('📝 Step 3 - Dados:', { 
            name: this.userData.name, 
            dob: this.userData.dob, 
            role: this.userData.role,
            photo: this.userData.photoData ? 'Sim' : 'Não'
        });
        
        return nameValid && dobValid && roleSelected;
    }

    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    validateDate(dateString) {
        if (!dateString) return false;
        
        const date = new Date(dateString);
        const today = new Date();
        const minDate = new Date();
        minDate.setFullYear(today.getFullYear() - 70); // 70 anos máximo
        const maxDate = new Date();
        maxDate.setFullYear(today.getFullYear() - 10); // 10 anos mínimo

        return date >= minDate && date <= maxDate;
    }

    goToStep(step) {
        if (step < this.currentStep) {
            // Voltar é sempre permitido
            this.showStep(step);
            return;
        }

        // Validar passo atual antes de avançar
        let currentStepValid = false;
        switch (this.currentStep) {
            case 1:
                currentStepValid = this.validateStep1();
                break;
            case 2:
                currentStepValid = this.validateStep2();
                break;
            case 3:
                currentStepValid = this.validateStep3();
                break;
        }

        if (currentStepValid) {
            this.showStep(step);
        }
    }

    showStep(step) {
        this.steps.forEach(s => {
            s.style.display = s.getAttribute('data-step') == step ? 'block' : 'none';
        });
        this.currentStep = step;
        console.log('🔄 Indo para step:', step);
    }

    async finalizeRegistration() {
        if (!this.validateStep3()) {
            alert('Por favor, preencha todos os campos obrigatórios corretamente.');
            return;
        }

        try {
            // Garantir que todos os dados estão preenchidos
            if (!this.userData.name || !this.userData.dob || !this.userData.role) {
                alert('Dados incompletos. Por favor, verifique todas as informações.');
                return;
            }

            console.log('🎯 Finalizando cadastro com dados:', this.userData);
            
            // Salvar usuário no sistema
            const user = this.dataManager.saveUser(this.userData);
            
            console.log('✅ Usuário salvo com sucesso:', user);
            
            // Mostrar mensagem de sucesso
            this.showSuccessMessage(user);
            this.showStep(4);
            
        } catch (error) {
            console.error('❌ Erro no cadastro:', error);
            alert('Erro no cadastro: ' + error.message);
        }
    }

    showSuccessMessage(user) {
        const roleNames = {
            'capitao': 'Capitão de Equipe',
            'juiz': 'Juiz',
            'jogador': 'Jogador'
        };

        const successDetails = document.getElementById('success-details');
        
        let photoInfo = '';
        if (user.hasPhoto) {
            photoInfo = '<br>✅ Foto cadastrada com sucesso';
        }

        // Garantir que os dados estão disponíveis
        const userName = user.name || this.userData.name;
        const userRole = user.role || this.userData.role;
        const userEmail = user.email || this.userData.email;

        console.log('🎉 Mostrando sucesso:', { userName, userRole, userEmail });

        successDetails.innerHTML = `
            <strong>${userName}</strong><br>
            Função: ${roleNames[userRole] || userRole}<br>
            Email: ${userEmail}${photoInfo}
        `;
    }
}

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Iniciando sistema de cadastro...');
    new CadastroController();
});