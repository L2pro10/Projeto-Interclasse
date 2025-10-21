// resetDatabase.js - Ferramenta para limpar todos os dados
class DatabaseReset {
    constructor() {
        this.dataManager = new DataManager();
    }

    // Limpar TODOS os dados do sistema
    clearAllData() {
        console.log('🗑️ Iniciando limpeza completa do banco de dados...');
        
        // Limpar localStorage
        localStorage.removeItem('interclasse_users');
        localStorage.removeItem('interclasse_teams');
        localStorage.removeItem('interclasse_matches');
        localStorage.removeItem('interclasse_photos');
        localStorage.removeItem('currentUser');
        
        // Limpar sessionStorage
        sessionStorage.removeItem('currentUser');
        
        console.log('✅ Todos os dados foram removidos!');
        alert('Banco de dados zerado com sucesso!');
        
        // Recarregar a página
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    }

    // Limpar apenas usuários
    clearUsers() {
        console.log('🗑️ Limpando usuários...');
        localStorage.removeItem('interclasse_users');
        localStorage.removeItem('interclasse_photos');
        console.log('✅ Usuários removidos!');
        alert('Usuários removidos com sucesso!');
    }

    // Limpar apenas times
    clearTeams() {
        console.log('🗑️ Limpando times...');
        localStorage.removeItem('interclasse_teams');
        console.log('✅ Times removidos!');
        alert('Times removidos com sucesso!');
    }

    // Limpar apenas partidas
    clearMatches() {
        console.log('🗑️ Limpando partidas...');
        localStorage.removeItem('interclasse_matches');
        console.log('✅ Partidas removidas!');
        alert('Partidas removidas com sucesso!');
    }

    // Ver status do banco
    showDatabaseStatus() {
        const users = JSON.parse(localStorage.getItem('interclasse_users')) || [];
        const teams = JSON.parse(localStorage.getItem('interclasse_teams')) || [];
        const matches = JSON.parse(localStorage.getItem('interclasse_matches')) || [];
        const photos = JSON.parse(localStorage.getItem('interclasse_photos')) || {};
        
        console.log('📊 STATUS DO BANCO DE DADOS:');
        console.log(`👥 Usuários: ${users.length}`);
        console.log(`⚽ Times: ${teams.length}`);
        console.log(`🏆 Partidas: ${matches.length}`);
        console.log(`📷 Fotos: ${Object.keys(photos).length}`);
        
        return {
            users: users.length,
            teams: teams.length,
            matches: matches.length,
            photos: Object.keys(photos).length
        };
    }
}

// Função global para acesso fácil via console
window.resetDatabase = function() {
    const dbReset = new DatabaseReset();
    dbReset.clearAllData();
}

window.showDatabaseStatus = function() {
    const dbReset = new DatabaseReset();
    return dbReset.showDatabaseStatus();
}