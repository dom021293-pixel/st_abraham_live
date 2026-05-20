// ==================== DONNÉES CCB ====================

const massSchedule = {
    semaine: "18h30",
    dimanche: "08h30, 10h00, 18h00",
    adoration: "Jeudi 19h00 (1er jeudi du mois)",
    confessions: "Samedi 17h00-18h00"
};

// ==================== STOCKAGE ====================

const STORAGE_KEY       = 'ccb_messages';
const ANNOUNCEMENTS_KEY = 'ccb_announcements';

function getAllMessages() {
    const s = localStorage.getItem(STORAGE_KEY);
    return s ? JSON.parse(s) : [];
}
function saveMessage(msg) {
    const msgs = getAllMessages();
    msgs.push(msg);
    if (msgs.length > 100) msgs.splice(0, msgs.length - 100);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(msgs));
}
window.saveMessage = saveMessage;

function getAnnouncements() {
    const s = localStorage.getItem(ANNOUNCEMENTS_KEY);
    if (s) return JSON.parse(s);
    return [
        { id: 1, date: "Cette semaine",     text: "Chapelet tous les soirs à 17h30 à la chapelle.", active: true },
        { id: 2, date: "Samedi 06/06",      text: "Mariage de Joël & Nadège – Toute la CCB est invitée !", active: true },
        { id: 3, date: "Dimanche prochain", text: "Quête pour les œuvres caritatives. Merci pour votre générosité.", active: true },
        { id: 4, date: "En juin",           text: "Pèlerinage paroissial – Inscriptions au secrétariat.", active: true }
    ];
}

// ==================== AELF API ====================

/**
 * Formate la date d'aujourd'hui en YYYY-MM-DD
 */
function todayStr() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

/**
 * Appelle l'API AELF. Tente d'abord sans proxy (si CORS ok),
 * sinon passe par un proxy public allorigins.
 */
async function aelfFetch(path) {
    const base = 'https://api.aelf.org/v1';
    const url  = `${base}/${path}`;
    // Proxy CORS de secours
    const proxy = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;

    try {
        const res = await fetch(url, { mode: 'cors' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
    } catch {
        // Tentative via proxy
        try {
            const res = await fetch(proxy);
            if (!res.ok) throw new Error(`proxy HTTP ${res.status}`);
            const wrapper = await res.json();
            return JSON.parse(wrapper.contents);
        } catch (e) {
            throw new Error(`AELF inaccessible : ${e.message}`);
        }
    }
}

/**
 * Nettoie le HTML des textes AELF (balises, entités superflues)
 */
function stripHtml(html = '') {
    return html
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .trim();
}

// ==================== LECTURES DU JOUR ====================

async function fetchAndDisplayReadings() {
    const container = document.getElementById('readings');
    if (!container) return;
    container.innerHTML = '<div class="skeleton">Chargement des lectures…</div>';

    try {
        const date = todayStr();
        // endpoint : /v1/messes/{date}/{zone}
        const data = await aelfFetch(`messes/${date}/romain`);

        // Structure typique : data.messe.lectures[] ou data.lectures[]
        const messe   = data.messe || data;
        const lectures = messe.lectures || [];

        if (!lectures.length) throw new Error('Pas de lectures dans la réponse');

        // Intitulés lisibles par type
        const labelMap = {
            'lecture_1'       : '1re lecture',
            'psaume'          : 'Psaume',
            'lecture_2'       : '2e lecture',
            'epitre'          : 'Épître',
            'evangile'        : 'Évangile',
            'acclamation'     : 'Acclamation',
        };

        let html = '';
        lectures.forEach(lec => {
            const type  = lec.type || '';
            const ref   = lec.ref  || lec.titre || '';
            const titre = lec.titre_court || lec.intro_lue || '';
            // Texte : on prend les 300 premiers caractères max
            const texte = stripHtml(lec.contenu || lec.texte || '');
            const extrait = texte.length > 300 ? texte.substring(0, 300) + '…' : texte;
            const label = labelMap[type] || type.replace(/_/g, ' ');

            html += `
            <div class="reading-item" style="margin-bottom:1rem;padding-bottom:.75rem;border-bottom:1px solid #f0e4d4;">
                <div style="display:flex;align-items:baseline;gap:.5rem;margin-bottom:.25rem;flex-wrap:wrap;">
                    <span class="reading-ref" style="font-size:.75rem;font-weight:600;color:#b8860b;text-transform:uppercase;letter-spacing:.04em;">${label}</span>
                    <span style="font-size:.8rem;color:#6b5a4a;">${ref}</span>
                </div>
                ${titre ? `<div style="font-size:.85rem;font-style:italic;color:#3b2a1f;margin-bottom:.4rem;">« ${titre} »</div>` : ''}
                <div class="reading-text" style="font-size:.9rem;color:#2c241a;line-height:1.65;white-space:pre-line;">${extrait}</div>
            </div>`;
        });

        // Lien vers AELF complet
        html += `<a href="https://www.aelf.org/${date}/romain/messe" target="_blank" rel="noopener"
            style="font-size:.78rem;color:#b8860b;text-decoration:none;display:inline-flex;align-items:center;gap:4px;margin-top:.25rem;">
            📖 Lire la messe complète sur AELF →
        </a>`;

        container.innerHTML = html;

    } catch (err) {
        console.warn('[CCB] Lectures AELF :', err);
        container.innerHTML = `
            <p style="color:#8b7a6a;font-size:.9rem;">Impossible de charger les lectures en ce moment.</p>
            <p style="margin-top:.5rem;font-size:.9rem;">
                📖 <a href="https://www.aelf.org/${todayStr()}/romain/messe" target="_blank" rel="noopener"
                    style="color:#b8860b;">Consulter les lectures du jour sur AELF →</a>
            </p>`;
    }
}

// ==================== SAINTS DU JOUR ====================

async function fetchAndDisplaySaints() {
    const container = document.getElementById('saints-du-jour');
    if (!container) return;
    container.innerHTML = '<div class="skeleton">Chargement…</div>';

    try {
        const date = todayStr();
        // endpoint : /v1/informations/{date}/{zone}
        const data = await aelfFetch(`informations/${date}/romain`);

        /*
         * Structure attendue :
         * data.fete          → nom de la fête/saint principal
         * data.degre         → solennité / fête / mémoire …
         * data.couleur       → vert / blanc / rouge / violet
         * data.semaine       → "6e semaine du Temps pascal"
         * data.annee         → "Année C"
         * data.psalmodie     → semaine de psalmodie
         * data.saints[]      → tableau { nom, url }  (optionnel selon version API)
         */
        const fete    = data.fete    || data.celebration || '';
        const degre   = data.degre   || '';
        const couleur = (data.couleur || '').toLowerCase();
        const semaine = data.semaine || '';
        const annee   = data.annee   || '';

        // Couleur liturgique → emoji + label
        const couleurEmoji = { blanc: '⬜', vert: '🟩', rouge: '🟥', violet: '🟪', rose: '🌸' };
        const couleurLabel = { blanc: 'Blanc', vert: 'Vert', rouge: 'Rouge', violet: 'Violet', rose: 'Rose' };
        const emoji = couleurEmoji[couleur] || '⚪';
        const label = couleurLabel[couleur] || couleur;

        // Saints supplémentaires (si présents)
        const saints = Array.isArray(data.saints) ? data.saints : [];

        let html = `
        <div style="display:flex;flex-direction:column;gap:.6rem;">
            ${fete ? `
            <div style="background:#fdf5e6;border-left:3px solid #b8860b;padding:.7rem 1rem;border-radius:0 12px 12px 0;">
                <div style="font-size:.7rem;font-weight:600;color:#b8860b;text-transform:uppercase;letter-spacing:.05em;margin-bottom:.2rem;">Fête du jour</div>
                <div style="font-size:1rem;font-weight:600;color:#2c241a;">${fete}</div>
                ${degre ? `<div style="font-size:.78rem;color:#6b5a4a;margin-top:.15rem;">${degre}</div>` : ''}
            </div>` : ''}

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:.5rem;">
                ${semaine ? `
                <div style="background:#f8f4ef;padding:.6rem .8rem;border-radius:12px;">
                    <div style="font-size:.68rem;color:#8b7a6a;text-transform:uppercase;letter-spacing:.04em;margin-bottom:.15rem;">Semaine</div>
                    <div style="font-size:.82rem;color:#2c241a;line-height:1.4;">${semaine}</div>
                </div>` : ''}
                ${annee ? `
                <div style="background:#f8f4ef;padding:.6rem .8rem;border-radius:12px;">
                    <div style="font-size:.68rem;color:#8b7a6a;text-transform:uppercase;letter-spacing:.04em;margin-bottom:.15rem;">Année liturgique</div>
                    <div style="font-size:.82rem;color:#2c241a;">${annee}</div>
                </div>` : ''}
                ${couleur ? `
                <div style="background:#f8f4ef;padding:.6rem .8rem;border-radius:12px;">
                    <div style="font-size:.68rem;color:#8b7a6a;text-transform:uppercase;letter-spacing:.04em;margin-bottom:.15rem;">Couleur liturgique</div>
                    <div style="font-size:.82rem;color:#2c241a;">${emoji} ${label}</div>
                </div>` : ''}
            </div>

            ${saints.length > 0 ? `
            <div style="font-size:.82rem;color:#6b5a4a;padding-top:.25rem;">
                <span style="font-weight:600;color:#3b2a1f;">Autres saints : </span>
                ${saints.map(s => s.nom || s).join(', ')}
            </div>` : ''}
        </div>`;

        container.innerHTML = html;

    } catch (err) {
        console.warn('[CCB] Saints AELF :', err);
        container.innerHTML = `
            <p style="color:#8b7a6a;font-size:.9rem;">Impossible de charger les informations liturgiques.</p>
            <a href="https://www.aelf.org/${todayStr()}/romain/messe" target="_blank" rel="noopener"
                style="font-size:.78rem;color:#b8860b;text-decoration:none;">
                📅 Voir sur AELF →
            </a>`;
    }
}

// ==================== TEMPS LITURGIQUE (fallback local) ====================

function getLiturgicalSeasonLocal() {
    const now = new Date();
    const m = now.getMonth() + 1;
    const d = now.getDate();
    if ((m === 12 && d >= 25) || (m === 1 && d <= 10)) return { label: "Temps de Noël",           emoji: "🎄", couleur: "#1a5276" };
    if ((m === 2 && d >= 14)  || (m === 3 && d <= 30)) return { label: "Carême",                   emoji: "💜", couleur: "#6c3483" };
    if ((m === 3 && d >= 31)  || (m === 4 && d <= 20)) return { label: "Temps Pascal",              emoji: "🐣", couleur: "#b7950b" };
    if (m === 5 || (m === 6 && d <= 8))                 return { label: "Temps Pascal / Pentecôte", emoji: "🕊️", couleur: "#b7950b" };
    return { label: "Temps ordinaire", emoji: "☀️", couleur: "#1e8449" };
}

function displayLiturgicalSeason() {
    // Cette section est désormais intégrée dans fetchAndDisplaySaints()
    // On garde un fallback si le conteneur 'liturgical-season' existe séparément
    const container = document.getElementById('liturgical-season');
    if (!container) return;
    const s = getLiturgicalSeasonLocal();
    container.innerHTML = `<p style="text-align:center;font-size:1.1rem;">${s.emoji} ${s.label}</p>`;
}

// ==================== HORAIRES ====================

function displayMassTimes() {
    const container = document.getElementById('mass-times');
    if (!container) return;
    container.innerHTML = `
        <div class="mass-day"><strong>Semaine</strong><div class="mass-hour">${massSchedule.semaine}</div></div>
        <div class="mass-day"><strong>Dimanche</strong><div class="mass-hour">${massSchedule.dimanche}</div></div>
        <div class="mass-day"><strong>Adoration</strong><div class="mass-hour">${massSchedule.adoration}</div></div>
        <div class="mass-day"><strong>Confessions</strong><div class="mass-hour">${massSchedule.confessions}</div></div>`;
}

// ==================== ANNONCES ====================

function displayAnnouncements() {
    const container = document.getElementById('announcements');
    if (!container) return;
    const active = getAnnouncements().filter(a => a.active);
    if (!active.length) {
        container.innerHTML = '<p style="text-align:center;color:#8b7a6a;">Aucune annonce pour le moment.</p>';
        return;
    }
    container.innerHTML = active.map(ann => `
        <div class="announcement-item">
            <div class="announcement-date">📅 ${ann.date}</div>
            <div>${ann.text}</div>
        </div>`).join('');
}

// ==================== TÉMOIGNAGES & INTENTIONS ====================

function displayTestimonies() {
    const container = document.getElementById('testimonies');
    if (!container) return;
    const items = getAllMessages()
        .filter(m => m.type === 'temoignage' && m.status === 'approved')
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 10);

    if (!items.length) {
        container.innerHTML = '<div class="empty-message"><p>🌹 Aucun témoignage pour le moment.</p><p>Soyez le premier à partager le vôtre !</p></div>';
        return;
    }
    container.innerHTML = items.map(msg => {
        const name = msg.anonymous ? 'Anonyme' : msg.author;
        const date = new Date(msg.date).toLocaleDateString('fr-FR');
        return `
        <div class="testimony-item">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.5rem;flex-wrap:wrap;">
                <span style="font-size:.7rem;color:#b8860b;">📅 ${date}</span>
                <span style="font-size:.8rem;">— ${name}</span>
            </div>
            <div>« ${msg.content} »</div>
        </div>`;
    }).join('');
}

function displayPrayerIntentions() {
    const container = document.getElementById('prayer-intentions');
    if (!container) return;
    const items = getAllMessages()
        .filter(m => m.type === 'intention' && m.status === 'approved')
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 10);

    if (!items.length) {
        container.innerHTML = '<div class="empty-message"><p>🕯️ Aucune intention de prière pour le moment.</p><p>Proposez la vôtre sur la page dédiée.</p></div>';
        return;
    }
    container.innerHTML = '<div style="display:flex;flex-direction:column;gap:.75rem;">' +
        items.map(msg => {
            const name = msg.anonymous ? 'Anonyme' : msg.author;
            return `
            <div style="background:#fdf5e6;padding:.75rem;border-radius:16px;border-left:3px solid #b8860b;">
                <div style="font-size:.7rem;color:#b8860b;margin-bottom:.25rem;">🙏 ${name}</div>
                <div>${msg.content}</div>
            </div>`;
        }).join('') + '</div>';
}

function displayDailyPrayerIntention() {
    const container = document.getElementById('prayer-intention');
    if (!container) return;
    const intentions = getAllMessages().filter(m => m.type === 'intention' && m.status === 'approved');
    if (!intentions.length) {
        container.innerHTML = `<p style="background:#fdf5e6;padding:1rem;border-radius:20px;text-align:center;">🙏 Prions pour notre communauté CCB.</p>`;
        return;
    }
    const daily = intentions[new Date().getDate() % intentions.length];
    const name  = daily.anonymous ? 'Un membre de la CCB' : daily.author;
    container.innerHTML = `
        <p style="background:#fdf5e6;padding:1rem;border-radius:20px;text-align:center;">
            🙏 <strong>${name}</strong> nous invite à prier pour :<br>« ${daily.content} »
        </p>`;
}

// ==================== LIENS SOCIAUX ====================

function setupExternalLinks() {
    const w = document.getElementById('whatsapp-link');
    const y = document.getElementById('youtube-link');
    const f = document.getElementById('facebook-link');
    if (w) w.href = "https://chat.whatsapp.com/votre-lien";
    if (y) y.href = "https://youtube.com/@votrechaine";
    if (f) f.href = "https://facebook.com/votrepage";
}

// ==================== INIT ====================

document.addEventListener('DOMContentLoaded', () => {
    displayMassTimes();
    displayAnnouncements();
    displayLiturgicalSeason();      // fallback local (si section séparée)
    fetchAndDisplayReadings();       // ← AELF API : lectures
    fetchAndDisplaySaints();         // ← AELF API : saints + temps liturgique
    displayDailyPrayerIntention();
    displayTestimonies();
    displayPrayerIntentions();
    setupExternalLinks();
});
