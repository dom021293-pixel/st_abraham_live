// ==================== DONNÉES CCB (modifiables facilement) ====================

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

// ==================== GESTION DES MESSAGES ====================

const STORAGE_KEY = 'ccb_messages';
const ANNOUNCEMENTS_KEY = 'ccb_announcements';

function getAllMessages() {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
}

function saveMessage(message) {
    const messages = getAllMessages();
    messages.push(message);
    if (messages.length > 100) messages.splice(0, messages.length - 100);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
}
window.saveMessage = saveMessage;

// ==================== ANNONCES ====================

function getAnnouncements() {
    const stored = localStorage.getItem(ANNOUNCEMENTS_KEY);
    if (stored) return JSON.parse(stored);
    // Annonces par défaut
    return [
        { id: 1, date: "Cette semaine", text: "Chapelet tous les soirs à 17h30 à la chapelle.", active: true },
        { id: 2, date: "Samedi 06/06", text: "Mariage de Joël & Nadège – Toute la CCB est invitée !", active: true },
        { id: 3, date: "Dimanche prochain", text: "Quête pour les œuvres caritatives. Merci pour votre générosité.", active: true },
        { id: 4, date: "En juin", text: "Pèlerinage paroissial – Inscriptions au secrétariat.", active: true }
    ];
}

function saveAnnouncements(announcements) {
    localStorage.setItem(ANNOUNCEMENTS_KEY, JSON.stringify(announcements));
}

// ==================== AFFICHAGE INDEX ====================

function displayTestimonies() {
    const container = document.getElementById('testimonies');
    if (!container) return;

    const allMessages = getAllMessages();
    const testimonies = allMessages.filter(msg => msg.type === 'temoignage' && msg.status === 'approved');
    testimonies.sort((a, b) => new Date(b.date) - new Date(a.date));
    const recentTestimonies = testimonies.slice(0, 10);

    if (recentTestimonies.length === 0) {
        container.innerHTML = `
            <div class="empty-message">
                <p>🌹 Aucun témoignage pour le moment.</p>
                <p>Soyez le premier à partager le vôtre !</p>
            </div>`;
        return;
    }

    let html = '';
    recentTestimonies.forEach(msg => {
        const displayName = msg.anonymous ? 'Anonyme' : msg.author;
        const dateStr = new Date(msg.date).toLocaleDateString('fr-FR');
        html += `
            <div class="testimony-item">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.5rem;flex-wrap:wrap;">
                    <span style="font-size:.7rem;color:#b8860b;">📅 ${dateStr}</span>
                    <span style="font-size:.8rem;">— ${displayName}</span>
                </div>
                <div style="margin-top:.5rem;">« ${msg.content} »</div>
            </div>`;
    });
    container.innerHTML = html;
}

function displayPrayerIntentions() {
    const container = document.getElementById('prayer-intentions');
    if (!container) return;

    const allMessages = getAllMessages();
    const intentions = allMessages.filter(msg => msg.type === 'intention' && msg.status === 'approved');
    intentions.sort((a, b) => new Date(b.date) - new Date(a.date));
    const recentIntentions = intentions.slice(0, 10);

    if (recentIntentions.length === 0) {
        container.innerHTML = `
            <div class="empty-message">
                <p>🕯️ Aucune intention de prière pour le moment.</p>
                <p>Proposez la vôtre sur la page dédiée.</p>
            </div>`;
        return;
    }

    let html = '<div style="display:flex;flex-direction:column;gap:.75rem;">';
    recentIntentions.forEach(msg => {
        const displayName = msg.anonymous ? 'Anonyme' : msg.author;
        html += `
            <div style="background:#fdf5e6;padding:.75rem;border-radius:16px;border-left:3px solid #b8860b;">
                <div style="font-size:.7rem;color:#b8860b;margin-bottom:.25rem;">🙏 ${displayName}</div>
                <div>${msg.content}</div>
            </div>`;
    });
    html += '</div>';
    container.innerHTML = html;
}

function displayDailyPrayerIntention() {
    const container = document.getElementById('prayer-intention');
    if (!container) return;

    const allMessages = getAllMessages();
    const intentions = allMessages.filter(msg => msg.type === 'intention' && msg.status === 'approved');

    if (intentions.length === 0) {
        container.innerHTML = `
            <p style="background:#fdf5e6;padding:1rem;border-radius:20px;text-align:center;">
                🙏 Prions pour notre communauté CCB.
            </p>`;
        return;
    }

    const todayIndex = new Date().getDate() % intentions.length;
    const dailyIntention = intentions[todayIndex];
    const displayName = dailyIntention.anonymous ? 'Un membre de la CCB' : dailyIntention.author;

    container.innerHTML = `
        <p style="background:#fdf5e6;padding:1rem;border-radius:20px;text-align:center;">
            🙏 <strong>${displayName}</strong> nous invite à prier pour :<br>
            « ${dailyIntention.content} »
        </p>`;
}

function displayMassTimes() {
    const container = document.getElementById('mass-times');
    if (!container) return;
    container.innerHTML = `
        <div class="mass-day"><strong>Semaine</strong><div class="mass-hour">${massSchedule.semaine}</div></div>
        <div class="mass-day"><strong>Dimanche</strong><div class="mass-hour">${massSchedule.dimanche}</div></div>
        <div class="mass-day"><strong>Adoration</strong><div class="mass-hour">${massSchedule.adoration}</div></div>
        <div class="mass-day"><strong>Confessions</strong><div class="mass-hour">${massSchedule.confessions}</div></div>`;
}

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
                </p>`;
        }
        container.innerHTML = html;
    } catch (error) {
        container.innerHTML = `
            <p>Impossible de charger les lectures en ce moment.</p>
            <p>📖 Référence du jour : <strong>Évangile selon saint Matthieu 5,1-12a</strong><br>
            « Heureux les pauvres de cœur, le Royaume des cieux est à eux. »</p>`;
    }
}

function displayAnnouncements() {
    const container = document.getElementById('announcements');
    if (!container) return;

    const announcements = getAnnouncements().filter(a => a.active);

    if (announcements.length === 0) {
        container.innerHTML = '<p style="text-align:center;color:#8b7a6a;">Aucune annonce pour le moment.</p>';
        return;
    }

    let html = '';
    announcements.forEach(ann => {
        html += `
            <div class="announcement-item">
                <div class="announcement-date">📅 ${ann.date}</div>
                <div>${ann.text}</div>
            </div>`;
    });
    container.innerHTML = html;
}

function displayLiturgicalSeason() {
    const container = document.getElementById('liturgical-season');
    if (!container) return;
    const season = getLiturgicalSeason();
    container.innerHTML = `<p style="text-align:center;font-size:1.1rem;">${season}</p>`;
}

function setupExternalLinks() {
    const whatsappLink = document.getElementById('whatsapp-link');
    const youtubeLink = document.getElementById('youtube-link');
    const facebookLink = document.getElementById('facebook-link');
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
    displayTestimonies();
    displayPrayerIntentions();
    setupExternalLinks();
});
