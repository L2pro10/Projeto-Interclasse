// Gerenciador de dados local (simulando um backend)
class DataManager {
    constructor() {
        this.loadData();
    }

    loadData() {
        try {
            this.users = JSON.parse(localStorage.getItem('interclasse_users')) || [];
            this.teams = JSON.parse(localStorage.getItem('interclasse_teams')) || [];
            this.matches = JSON.parse(localStorage.getItem('interclasse_matches')) || [];
            this.photos = JSON.parse(localStorage.getItem('interclasse_photos')) || {};
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            // Inicializar dados vazios se houver erro
            this.users = [];
            this.teams = [];
            this.matches = [];
            this.photos = {};
        }
    }

    // Método atualizado para salvar usuário com foto
    saveUser(userData) {
        console.log('📝 Salvando usuário com dados:', userData);
        
        // Verificar se email já existe
        if (this.users.find(u => u.email === userData.email)) {
            throw new Error('Email já cadastrado');
        }

        const user = {
            id: this.generateId(),
            email: userData.email || '',
            password: userData.password || '',
            name: userData.name || '',
            dob: userData.dob || '',
            role: userData.role || '',
            createdAt: new Date().toISOString(),
            isActive: true,
            hasPhoto: !!userData.photoData
        };

        console.log('✅ Usuário criado:', user);
        
        this.users.push(user);
        
        // Salvar foto separadamente se existir
        if (userData.photoData) {
            this.photos[user.id] = userData.photoData;
            this.saveToStorage('interclasse_photos', this.photos);
        }

        this.saveToStorage('interclasse_users', this.users);
        
        // Debug: listar todos os usuários
        this.debugUsers();
        
        return user;
    }

    // Método para obter foto do usuário
    getUserPhoto(userId) {
        return this.photos[userId] || null;
    }

    // Método para validar e processar imagem
    validateAndProcessImage(file) {
        return new Promise((resolve, reject) => {
            // Verificar tamanho do arquivo (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                reject(new Error('A imagem deve ter no máximo 2MB'));
                return;
            }

            // Verificar tipo do arquivo
            const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
            if (!validTypes.includes(file.type)) {
                reject(new Error('Formato inválido. Use JPG, PNG ou GIF'));
                return;
            }

            const reader = new FileReader();
            
            reader.onload = function(e) {
                const img = new Image();
                
                img.onload = function() {
                    // Verificar dimensões (opcional)
                    const width = img.width;
                    const height = img.height;
                    const aspectRatio = width / height;
                    
                    // Proporção 3x4 é 0.75, aceitamos uma pequena margem
                    if (Math.abs(aspectRatio - 0.75) > 0.2) {
                        console.warn('Foto não está na proporção 3x4 recomendada');
                        // Não rejeitamos, apenas avisamos
                    }

                    // Comprimir imagem se for muito grande
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    
                    // Tamanho máximo para armazenamento
                    const maxWidth = 300;
                    const maxHeight = 400;
                    
                    let newWidth = width;
                    let newHeight = height;
                    
                    if (width > maxWidth || height > maxHeight) {
                        if (width > height) {
                            newWidth = maxWidth;
                            newHeight = (height * maxWidth) / width;
                        } else {
                            newHeight = maxHeight;
                            newWidth = (width * maxHeight) / height;
                        }
                    }
                    
                    canvas.width = newWidth;
                    canvas.height = newHeight;
                    
                    ctx.drawImage(img, 0, 0, newWidth, newHeight);
                    
                    // Converter para base64 com qualidade reduzida para economizar espaço
                    const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
                    
                    resolve({
                        dataUrl: compressedDataUrl,
                        width: newWidth,
                        height: newHeight,
                        originalSize: file.size,
                        compressedSize: compressedDataUrl.length
                    });
                };
                
                img.onerror = function() {
                    reject(new Error('Erro ao carregar imagem'));
                };
                
                img.src = e.target.result;
            };
            
            reader.onerror = function() {
                reject(new Error('Erro ao ler arquivo'));
            };
            
            reader.readAsDataURL(file);
        });
    }

    getUserByEmail(email) {
        return this.users.find(u => u.email === email && u.isActive);
    }

    validateLogin(email, password) {
        console.log('🔐 Validando login para:', email);
        const user = this.getUserByEmail(email);
        
        if (!user) {
            console.log('❌ Usuário não encontrado');
            return null;
        }
        
        // Verificar senha
        if (user.password === password) {
            console.log('✅ Login válido para:', user.name);
            return user;
        }
        
        console.log('❌ Senha incorreta');
        return null;
    }

    // Times
    createTeam(teamData) {
        const team = {
            id: this.generateId(),
            ...teamData,
            players: [],
            points: 0,
            goalsFor: 0,
            goalsAgainst: 0
        };

        this.teams.push(team);
        this.saveToStorage('interclasse_teams', this.teams);
        return team;
    }

    // Partidas
    createMatch(matchData) {
        const match = {
            id: this.generateId(),
            ...matchData,
            status: 'scheduled', // scheduled, ongoing, finished
            createdAt: new Date().toISOString()
        };

        this.matches.push(match);
        this.saveToStorage('interclasse_matches', this.matches);
        return match;
    }

    // Utilitários
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    saveToStorage(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            console.log('💾 Dados salvos em', key);
            return true;
        } catch (error) {
            console.error('Erro ao salvar no localStorage:', error);
            return false;
        }
    }

    // Debug: listar todos os usuários
    debugUsers() {
        console.log('=== 🔍 DEBUG USUÁRIOS ===');
        console.log('Total de usuários:', this.users.length);
        this.users.forEach((user, index) => {
            console.log(`Usuário ${index + 1}:`, user);
        });
        console.log('=== FIM DEBUG ===');
        return this.users;
    }

    // Estatísticas
    getLeaderboard() {
        return this.teams
            .sort((a, b) => b.points - a.points || (b.goalsFor - b.goalsAgainst) - (a.goalsFor - a.goalsAgainst));
    }

    getTopScorers() {
        const allPlayers = this.teams.flatMap(team => 
            team.players.map(player => ({
                ...player,
                teamName: team.name
            }))
        );
        
        return allPlayers
            .filter(player => player.goals > 0)
            .sort((a, b) => b.goals - a.goals);
    }
}