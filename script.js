// ==================== DONNÉES PAROISSIALES (modifiables facilement) ====================

// 1. Horaires des messes
const massSchedule = {
    semaine: "18h30",
    dimanche: "08h30, 10h00, 18h00",
    adoration: "Jeudi 19h00 (1er jeudi du mois)",
    confessions: "Samedi 17h00-18h00"
};

// 2. Saisons liturgiques (automatique selon date)
function getLiturgicalSeason() {
    const now = new Date();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    
    if ((month === 12 && day >= 25) || (month === 1 && day <= 10)) return "🎄 Temps de Noël";
    if ((month === 2 && day >= 14) || (month === 3 && day <= 30)) return "💜 Carême – Conversion et prière";
    if ((month === 3 && day >= 31) || (month === 4 && day <= 20)) return "🐣 Temps Pascal – Alléluia !";
    if (month === 5 && day >= 19) return "🕊️ Temps ordinaire – Marche avec le Christ";
    if (month === 6 || month === 7) return "☀️ Temps ordinaire – Croissance dans la foi";
    if (month === 8 || month === 9) return "🌾 Temps ordinaire – Moisson spirituelle";
    if (month === 10 || month === 11) return "🍂 Temps ordinaire – Veiller dans l'espérance";
    
    return "⛪ Temps ordinaire – Chemin de sainteté";
}

// ==================== GESTION DES MESSAGES (Témoignages + Intentions) ====================

const STORAGE_KEY = 'paroisse_messages';

// Récupérer tous les messages
function getAllMessages() {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
}

// Sauvegarder un message (utilisé par la page partager.html)
function saveMessage(message) {
    const messages = getAllMessages();
    messages.push(message);
    // Limiter à 100 messages
    if (messages.length > 100) messages = messages.slice(-100);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
}

// Exporter la fonction pour qu'elle soit accessible depuis partager.html
window.saveMessage = saveMessage;

// ==================== AFFICHAGE DANS L'INDEX (UNIQUEMENT LES APPROUVÉS) ====================

// Afficher les témoignages (uniquement ceux approuvés)
function displayTestimonies() {
    const container = document.getElementById('testimonies');
    if (!container) return;
    
    const allMessages = getAllMessages();
    const testimonies = allMessages.filter(msg => msg.type === 'temoignage' && msg.status === 'approved');
    
    // Trier du plus récent au plus ancien
    testimonies.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Garder les 10 plus récents
    const recentTestimonies = testimonies.slice(0, 10);
    
    if (recentTestimonies.length === 0) {
        container.innerHTML = `
            <div class="empty-message">
                <p>🌹 Aucun témoignage pour le moment.</p>
                <p>Soyez le premier à partager le vôtre !</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    recentTestimonies.forEach(msg => {
        const displayName = msg.anonymous ? 'Anonyme' : msg.author;
        const dateStr = new Date(msg.date).toLocaleDateString('fr-FR');
        
        html += `
            <div class="testimony-item">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; flex-wrap: wrap;">
                    <span style="font-size:0.7rem; color:#b8860b;">📅 ${dateStr}</span>
                    <span style="font-size:0.8rem;">— ${displayName}</span>
                </div>
                <div style="margin-top: 0.5rem;">« ${msg.content} »</div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Afficher les intentions de prière (uniquement celles approuvées)
function displayPrayerIntentions() {
    const container = document.getElementById('prayer-intentions');
    if (!container) return;
    
    const allMessages = getAllMessages();
    const intentions = allMessages.filter(msg => msg.type === 'intention' && msg.status === 'approved');
    
    // Trier du plus récent au plus ancien
    intentions.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Garder les 10 plus récentes
    const recentIntentions = intentions.slice(0, 10);
    
    if (recentIntentions.length === 0) {
        container.innerHTML = `
            <div class="empty-message">
                <p>🕯️ Aucune intention de prière pour le moment.</p>
                <p>Proposez la vôtre sur la page "Partager".</p>
            </div>
        `;
        return;
    }
    
    let html = '<div style="display: flex; flex-direction: column; gap: 0.75rem;">';
    recentIntentions.forEach(msg => {
        const displayName = msg.anonymous ? 'Anonyme' : msg.author;
        
        html += `
            <div style="background: #fdf5e6; padding: 0.75rem; border-radius: 16px; border-left: 3px solid #b8860b;">
                <div style="font-size:0.7rem; color:#b8860b; margin-bottom: 0.25rem;">🙏 ${displayName}</div>
                <div>${msg.content}</div>
            </div>
        `;
    });
    html += '</div>';
    
    container.innerHTML = html;
}

// Afficher une intention du jour (parmi les approuvées uniquement)
function displayDailyPrayerIntention() {
    const container = document.getElementById('prayer-intention');
    if (!container) return;
    
    const allMessages = getAllMessages();
    const intentions = allMessages.filter(msg => msg.type === 'intention' && msg.status === 'approved');
    
    if (intentions.length === 0) {
        container.innerHTML = `
            <p style="background: #fdf5e6; padding: 1rem; border-radius: 20px; text-align: center;">
                🙏 Prions pour notre communauté paroissiale.
            </p>
        `;
        return;
    }
    
    // Choisir une intention aléatoire chaque jour
    const todayIndex = new Date().getDate() % intentions.length;
    const dailyIntention = intentions[todayIndex];
    const displayName = dailyIntention.anonymous ? 'Un paroissien' : dailyIntention.author;
    
    container.innerHTML = `
        <p style="background: #fdf5e6; padding: 1rem; border-radius: 20px; text-align: center;">
            🙏 <strong>${displayName}</strong> nous invite à prier pour :<br>
            « ${dailyIntention.content} »
        </p>
    `;
}

// ==================== AUTRES FONCTIONS ====================

// Afficher les horaires
function displayMassTimes() {
    const container = document.getElementById('mass-times');
    if (!container) return;
    
    container.innerHTML = `
        <div class="mass-day"><strong>Semaine</strong><div class="mass-hour">${massSchedule.semaine}</div></div>
        <div class="mass-day"><strong>Dimanche</strong><div class="mass-hour">${massSchedule.dimanche}</div></div>
        <div class="mass-day"><strong>Adoration</strong><div class="mass-hour">${massSchedule.adoration}</div></div>
        <div class="mass-day"><strong>Confessions</strong><div class="mass-hour">${massSchedule.confessions}</div></div>
    `;
}

// Récupérer les lectures du jour (API AELF)
async function fetchReadings() {
    const container = document.getElementById('readings');
    if (!container) return;
    
    container.innerHTML = '<div class="skeleton">Chargement des lectures...</div>';
    
    try {
        const response = await fetch('https://api.aelf.org/v1/lectures/aujourdhui');
        if (!response.ok) throw new Error('API indisponible');
        
        const data = await response.json();
        const lectures = data.lectures;
        
        let html = '';
        for (let i = 0; i < lectures.length; i++) {
            html += `
                <p>
                    <span class="reading-ref">${lectures[i].ref}:</span><br>
                    <span class="reading-text">${lectures[i].texte.substring(0, 200)}${lectures[i].texte.length > 200 ? '...' : ''}</span>
                </p>
            `;
        }
        container.innerHTML = html;
    } catch (error) {
        console.error('Erreur lectures:', error);
        container.innerHTML = `
            <p>Impossible de charger les lectures en ce moment.</p>
            <p>📖 Référence du jour : <strong>Évangile selon saint Matthieu 5,1-12a</strong><br>
            « Heureux les pauvres de cœur, le Royaume des cieux est à eux. »</p>
        `;
    }
}

// Afficher annonces
function displayAnnouncements() {
    const container = document.getElementById('announcements');
    if (!container) return;
    
    const announcements = [
        { date: "Cette semaine", text: "Chapelet tous les soirs à 17h30 à la chapelle." },
        { date: "Samedi 06/06", text: "Mariage de Joël & Nadège – Toute la paroisse est invitée !" },
        { date: "Dimanche prochain", text: "Quête pour les œuvres caritatives. Merci pour votre générosité." },
        { date: "En juin", text: "Pèlerinage paroissial – Inscriptions au secrétariat." }
    ];
    
    let html = '';
    announcements.forEach(ann => {
        html += `
            <div class="announcement-item">
                <div class="announcement-date">📅 ${ann.date}</div>
                <div>${ann.text}</div>
            </div>
        `;
    });
    container.innerHTML = html;
}

// Afficher saison liturgique
function displayLiturgicalSeason() {
    const container = document.getElementById('liturgical-season');
    if (!container) return;
    
    const season = getLiturgicalSeason();
    container.innerHTML = `<p style="text-align: center; font-size: 1.1rem;">${season}</p>`;
}

// Configuration des liens externes (À MODIFIER AVEC VOS VRAIS LIENS)
function setupExternalLinks() {
    const whatsappLink = document.getElementById('whatsapp-link');
    const youtubeLink = document.getElementById('youtube-link');
    const facebookLink = document.getElementById('facebook-link');
    
    // ⚠️ REMPLACEZ CES LIENS PAR LES VÔTRES ⚠️
    if (whatsappLink) whatsappLink.href = "https://chat.whatsapp.com/votre-lien";
    if (youtubeLink) youtubeLink.href = "https://youtube.com/@votrechaine";
    if (facebookLink) facebookLink.href = "https://facebook.com/votrepage";
}

// ==================== INITIALISATION ====================

document.addEventListener('DOMContentLoaded', () => {
    displayMassTimes();
    fetchReadings();
    displayDailyPrayerIntention();
    displayAnnouncements();
    displayLiturgicalSeason();
    displayTestimonies();      // ← Affiche les témoignages approuvés uniquement
    displayPrayerIntentions(); // ← Affiche les intentions approuvées uniquement
    setupExternalLinks();
});
