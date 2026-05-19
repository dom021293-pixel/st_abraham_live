// Données locales (modifiables facilement)
// Pour modifier, il suffit de changer les valeurs ci-dessous

// 1. Horaires des messes
const massSchedule = {
    semaine: "18h30",
    dimanche: "08h30, 10h00, 18h00",
    adoration: "Jeudi 19h00 (1er jeudi du mois)",
    confessions: "Samedi 17h00-18h00"
};

// 2. Intentions de prière (vous pouvez en mettre plusieurs, une sera choisie aléatoirement chaque jour)
const prayerIntentions = [
    "Pour les malades de l'hôpital de Ouaga 2000.",
    "Pour la paix au Burkina Faso et dans le monde.",
    "Pour les jeunes de la paroisse en discernement.",
    "Pour les familles éprouvées par le deuil.",
    "Pour notre curé et tous les prêtres de la paroisse."
];

// 3. Annonces
const announcements = [
    { date: "Cette semaine", text: "Chapelet tous les soirs à 17h30 à la chapelle." },
    { date: "Samedi 06/06", text: "Mariage de Joël & Nadège – Toute la paroisse est invitée !" },
    { date: "Dimanche prochain", text: "Quête pour les œuvres caritatives. Merci pour votre générosité." },
    { date: "En juin", text: "Pèlerinage paroissial – Inscriptions au secrétariat." }
];

// 4. Témoignages
const testimonies = [
    { author: "M. Joseph", text: "Grâce à la communauté Saint Abraham, j'ai retrouvé la foi." },
    { author: "Mme Irène", text: "Les veillées de prière ont guéri ma fille. Merci Seigneur !" },
    { author: "Jean (15 ans)", text: "Le catéchisme m'a aidé à mieux comprendre l'Évangile." }
];

// 5. Saisons liturgiques (automatique selon date)
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

// Fonction pour afficher les horaires
function displayMassTimes() {
    const container = document.getElementById('mass-times');
    container.innerHTML = `
        <div class="mass-day"><strong>Semaine</strong><div class="mass-hour">${massSchedule.semaine}</div></div>
        <div class="mass-day"><strong>Dimanche</strong><div class="mass-hour">${massSchedule.dimanche}</div></div>
        <div class="mass-day"><strong>Adoration</strong><div class="mass-hour">${massSchedule.adoration}</div></div>
        <div class="mass-day"><strong>Confessions</strong><div class="mass-hour">${massSchedule.confessions}</div></div>
    `;
}

// Fonction pour récupérer les lectures du jour (API AELF)
async function fetchReadings() {
    const container = document.getElementById('readings');
    container.innerHTML = '<div class="skeleton">Chargement des lectures...</div>';
    
    try {
        // API AELF pour les lectures du jour (gratuite, sans clé)
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

// Afficher intention du jour
function displayPrayerIntention() {
    const todayIndex = new Date().getDate() % prayerIntentions.length;
    const prayer = prayerIntentions[todayIndex];
    const container = document.getElementById('prayer-intention');
    container.innerHTML = `<p>🙏 ${prayer}</p>`;
}

// Afficher annonces
function displayAnnouncements() {
    const container = document.getElementById('announcements');
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
    const season = getLiturgicalSeason();
    container.innerHTML = `<p style="text-align: center; font-size: 1.1rem;">${season}</p>`;
}

// Afficher témoignages
function displayTestimonies() {
    const container = document.getElementById('testimonies');
    let html = '';
    testimonies.forEach(t => {
        html += `
            <div class="testimony-item">
                « ${t.text} »
                <div class="testimony-author">— ${t.author}</div>
            </div>
        `;
    });
    container.innerHTML = html;
}

// Configuration des liens externes (à personnaliser)
function setupExternalLinks() {
    // À remplacer par vos vrais liens
    const whatsappLink = document.getElementById('whatsapp-link');
    const youtubeLink = document.getElementById('youtube-link');
    const facebookLink = document.getElementById('facebook-link');
    
    if (whatsappLink) whatsappLink.href = "https://chat.whatsapp.com/votre-lien";
    if (youtubeLink) youtubeLink.href = "https://youtube.com/@votrechaine";
    if (facebookLink) facebookLink.href = "https://facebook.com/votrepage";
    
    // Petit message dans la console pour rappel
    console.log("🔧 Pensez à remplacer les liens vers WhatsApp, YouTube et Facebook dans le fichier script.js");
}

// Initialisation au chargement
document.addEventListener('DOMContentLoaded', () => {
    displayMassTimes();
    fetchReadings();
    displayPrayerIntention();
    displayAnnouncements();
    displayLiturgicalSeason();
    displayTestimonies();
    setupExternalLinks();
});
