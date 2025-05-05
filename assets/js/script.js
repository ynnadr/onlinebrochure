document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded and parsed."); // DEBUG

    // --- Get DOM Elements ---
    const langSwitcher = document.querySelector('.lang-switcher');
    const mainContent = document.getElementById('main-content');
    const registrationFormSection = document.getElementById('registration-form');
    const showRegisterTriggers = document.querySelectorAll('#trigger-register-view, #show-register-btn-header, #show-register-btn-footer');
    // const backToMainBtn = document.getElementById('back-to-main-btn'); // Removed original button
    const container = document.querySelector('.container');
    const heroOriginalContent = document.getElementById('hero-original-content'); // Wrapper for H1, P, Hero CTA
    const heroBackBtn = document.getElementById('hero-back-btn'); // New back button in Hero

    // DEBUG Checks
    if (!langSwitcher) console.error("ERROR: Language switcher element (.lang-switcher) not found!");
    if (!mainContent) console.error("ERROR: Main content element (#main-content) not found!");
    if (!registrationFormSection) console.error("ERROR: Registration form section (#registration-form) not found!");
    if (showRegisterTriggers.length === 0) console.warn("Warning: No registration trigger buttons found.");
    // if (!backToMainBtn) console.warn("Warning: Original Back button (#back-to-main-btn) not found."); // No longer expected
    if (!heroOriginalContent) console.error("ERROR: Hero original content wrapper (#hero-original-content) not found!");
    if (!heroBackBtn) console.error("ERROR: Hero back button (#hero-back-btn) not found!");

    let currentTranslations = {};

    // --- Translation Functions ---
    async function fetchTranslations(lang) {
        const url = `lang/${lang}.json`;
        console.log(`Attempting to fetch translations from: ${url}`); // DEBUG
        try {
            const response = await fetch(url);
            console.log(`Fetch response status for ${url}: ${response.status}`); // DEBUG
            if (!response.ok) { throw new Error(`HTTP error! status: ${response.status} for ${url}`); }
            const data = await response.json();
            console.log(`Successfully parsed JSON for ${lang}`); // DEBUG
            return data;
        } catch (error) {
            console.error(`Could not fetch or parse translations for ${lang}:`, error);
            return null;
        }
    }

    function applyTranslations(translations) {
        if (!translations || typeof translations !== 'object') { console.error("ApplyTranslations invalid data:", translations); return; }
        console.log('Applying translations...'); // DEBUG
        currentTranslations = translations;
        let appliedCount = 0;
        document.querySelectorAll('[data-translate]').forEach(element => {
            const key = element.getAttribute('data-translate');
            if (translations.hasOwnProperty(key)) {
                const translationValue = translations[key];
                appliedCount++;
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    if(element.hasAttribute('placeholder')) element.placeholder = translationValue;
                } else if (element.tagName === 'META' && element.getAttribute('name') === 'description') {
                    element.content = translationValue;
                } else if (element.tagName === 'TITLE') {
                     document.title = translationValue;
                } else {
                    element.innerHTML = translationValue;
                }
            } else { console.warn(`Translation key "${key}" not found.`); }
        });
        console.log(`Applied ${appliedCount} translations.`); // DEBUG
    }

    async function setLanguage(lang) {
        console.log(`---> Setting language to: ${lang}`); // DEBUG
        const translations = await fetchTranslations(lang);
        if (translations) {
            console.log(`Translations object received for ${lang}.`); // DEBUG
            applyTranslations(translations);
            localStorage.setItem('preferredLang', lang);
            if (langSwitcher) {
                langSwitcher.querySelectorAll('button').forEach(btn => {
                    btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
                });
            }
            document.documentElement.lang = lang;
            console.log(`---> Language successfully set to: ${lang}`); // DEBUG
        } else { console.error(`---> Failed to set language to ${lang}.`); }
    }

    // --- Event Listeners ---
    if (langSwitcher) {
        langSwitcher.addEventListener('click', (event) => {
            if (event.target.tagName === 'BUTTON' && event.target.hasAttribute('data-lang')) {
                const selectedLang = event.target.getAttribute('data-lang');
                console.log(`Language button "${selectedLang}" clicked.`); // DEBUG
                 let currentLang = localStorage.getItem('preferredLang') || ((navigator.language ? navigator.language.split('-')[0] : 'id') === 'en' ? 'en' : 'id');
                if (selectedLang !== currentLang) { setLanguage(selectedLang); }
                 else { console.log(`Language "${selectedLang}" is already active.`); } // DEBUG
            }
        });
    }

    // --- Content Toggle Logic ---
    function showRegistrationForm(event) {
        if(event) event.preventDefault();
        console.log("Showing registration form..."); // DEBUG
        if (mainContent) mainContent.style.display = 'none';
        if (registrationFormSection) registrationFormSection.style.display = 'block';
        // Toggle Hero Content
        if (heroOriginalContent) heroOriginalContent.classList.add('visually-hidden');
        if (heroBackBtn) heroBackBtn.classList.remove('visually-hidden');

        if (container) { window.scrollTo({ top: container.offsetTop - 20, behavior: 'smooth' }); }
        else { window.scrollTo({ top: 0, behavior: 'smooth'}); }
    }

    function showMainContent() {
        console.log("Showing main content..."); // DEBUG
        if (registrationFormSection) registrationFormSection.style.display = 'none';
        if (mainContent) mainContent.style.display = 'block';
        // Toggle Hero Content
        if (heroOriginalContent) heroOriginalContent.classList.remove('visually-hidden');
        if (heroBackBtn) heroBackBtn.classList.add('visually-hidden');

         if (container) { window.scrollTo({ top: container.offsetTop - 20, behavior: 'smooth' }); }
         else { window.scrollTo({ top: 0, behavior: 'smooth'}); }
    }

    // Add listeners to all triggers
    if (showRegisterTriggers.length > 0 && mainContent && registrationFormSection && heroOriginalContent && heroBackBtn) {
        showRegisterTriggers.forEach(trigger => {
            trigger.addEventListener('click', showRegistrationForm);
        });
    } else { console.error("Missing elements needed for registration view triggers."); }

    // Add listener for the NEW hero back button
    if (heroBackBtn && mainContent && registrationFormSection && heroOriginalContent) {
        heroBackBtn.addEventListener('click', showMainContent);
    } else { console.error("Missing elements needed for hero back button listener."); }

    // --- Initial Load ---
    console.log("Determining initial language...");
    let initialLang = localStorage.getItem('preferredLang') || ((navigator.language ? navigator.language.split('-')[0] : 'id') === 'en' ? 'en' : 'id');
    console.log(`Initial language set to: ${initialLang}`);
    setLanguage(initialLang).catch(error => { console.error("Error during initial language setting:", error); });

    // Ensure initial view is correct
    if (mainContent) mainContent.style.display = 'block';
    if (registrationFormSection) registrationFormSection.style.display = 'none';
    if (heroOriginalContent) heroOriginalContent.classList.remove('visually-hidden');
    if (heroBackBtn) heroBackBtn.classList.add('visually-hidden');

    console.log("Initial setup complete."); // DEBUG

}); // End DOMContentLoaded
