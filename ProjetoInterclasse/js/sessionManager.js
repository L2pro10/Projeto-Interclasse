// Gerenciador de sessão do usuário - para páginas que precisam verificar sessão
class SessionManager {
    constructor() {
        this.currentUser = null;
        this.loadSession();
    }

    loadSession() {
        try {
            const userData = sessionStorage.getItem('currentUser');
            if (userData) {
                this.currentUser = JSON.parse(userData);
                console.log('Sessão carregada:', this.currentUser);
            } else {
                console.log('Nenhuma sessão encontrada');
            }
        } catch (error) {
            console.error('Erro ao carregar sessão:', error);
            this.currentUser = null;
        }
    }

    isLoggedIn() {
        return this.currentUser !== null;
    }

    getUser() {
        return this.currentUser;
    }

    getUserRole() {
        return this.currentUser ? this.currentUser.role : null;
    }

    getUserName() {
        return this.currentUser ? this.currentUser.name : 'Visitante';
    }

    logout() {
        this.currentUser = null;
        sessionStorage.removeItem('currentUser');
        window.location.href = '../telas/login.html';
    }

    hasPermission(requiredRole) {
        if (!this.isLoggedIn()) return false;
        
        const userRole = this.getUserRole();
        const roleHierarchy = {
            'juiz': 3,
            'capitao': 2, 
            'jogador': 1
        };
        
        return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
    }

    // Verificar se precisa fazer login para acessar a página
    requireLogin(redirectUrl = '../telas/login.html') {
        if (!this.isLoggedIn()) {
            window.location.href = redirectUrl;
            return false;
        }
        return true;
    }

    // Verificar permissão específica
    requireRole(requiredRole, redirectUrl = '../telas/login.html') {
        if (!this.requireLogin(redirectUrl)) {
            return false;
        }
        
        if (!this.hasPermission(requiredRole)) {
            alert('Você não tem permissão para acessar esta página.');
            window.location.href = '../index.html';
            return false;
        }
        
        return true;
    }
}

// Criar instância global (apenas se necessário)
// const sessionManager = new SessionManager();