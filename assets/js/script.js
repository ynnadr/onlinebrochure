document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded and parsed."); // DEBUG

    // --- Get DOM Elements ---
    const langSwitcher = document.querySelector('.lang-switcher');
    const mainContent = document.getElementById('main-content');
    const registrationFormSection = document.getElementById('registration-form');
    const showRegisterTriggers = document.querySelectorAll('#trigger-register-view, #show-register-btn-header, #show-register-btn-footer');
    const container = document.querySelector('.container');
    const heroRegisterBtn = document.getElementById('show-register-btn-header'); // Original Hero CTA
    const heroBackBtnBottom = document.getElementById('hero-back-btn-bottom'); // New Back Button at bottom of Hero

    // DEBUG Checks
    if (!langSwitcher) console.error("ERROR: Language switcher element (.lang-switcher) not found!");
    if (!mainContent) console.error("ERROR: Main content element (#main-content) not found!");
    if (!registrationFormSection) console.error("ERROR: Registration form section (#registration-form) not found!");
    if (showRegisterTriggers.length === 0) console.warn("Warning: No registration trigger buttons found.");
    if (!heroRegisterBtn) console.warn("Warning: Hero register button (#show-register-btn-header) not found.");
    if (!heroBackBtnBottom) console.error("ERROR: Hero bottom back button (#hero-back-btn-bottom) not found!");


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
        // Hide Original Hero CTA, Show Bottom Back Button
        if (heroRegisterBtn) heroRegisterBtn.classList.add('visually-hidden');
        if (heroBackBtnBottom) heroBackBtnBottom.classList.remove('visually-hidden');

        if (container) { window.scrollTo({ top: container.offsetTop - 20, behavior: 'smooth' }); }
        else { window.scrollTo({ top: 0, behavior: 'smooth'}); }
    }

    function showMainContent() {
        console.log("Showing main content..."); // DEBUG
        if (registrationFormSection) registrationFormSection.style.display = 'none';
        if (mainContent) mainContent.style.display = 'block';
        // Show Original Hero CTA, Hide Bottom Back Button
        if (heroRegisterBtn) heroRegisterBtn.classList.remove('visually-hidden');
        if (heroBackBtnBottom) heroBackBtnBottom.classList.add('visually-hidden');

         if (container) { window.scrollTo({ top: container.offsetTop - 20, behavior: 'smooth' }); }
         else { window.scrollTo({ top: 0, behavior: 'smooth'}); }
    }

    // Add listeners to all triggers for showing the form
    if (showRegisterTriggers.length > 0 && mainContent && registrationFormSection && heroRegisterBtn && heroBackBtnBottom) {
        showRegisterTriggers.forEach(trigger => {
            trigger.addEventListener('click', showRegistrationForm);
        });
    } else { console.error("Missing elements needed for registration view triggers."); }

    // Add listener for the NEW bottom hero back button
    if (heroBackBtnBottom && mainContent && registrationFormSection && heroRegisterBtn) {
        heroBackBtnBottom.addEventListener('click', showMainContent);
    } else { console.error("Missing elements needed for hero bottom back button listener."); }

    // --- Initial Load ---
    console.log("Determining initial language...");
    let initialLang = localStorage.getItem('preferredLang') || ((navigator.language ? navigator.language.split('-')[0] : 'id') === 'en' ? 'en' : 'id');
    console.log(`Initial language set to: ${initialLang}`);
    setLanguage(initialLang).catch(error => { console.error("Error during initial language setting:", error); });

    // Ensure initial view is correct
    if (mainContent) mainContent.style.display = 'block';
    if (registrationFormSection) registrationFormSection.style.display = 'none';
    if (heroRegisterBtn) heroRegisterBtn.classList.remove('visually-hidden'); // Show Hero CTA
    if (heroBackBtnBottom) heroBackBtnBottom.classList.add('visually-hidden'); // Hide Back button

    console.log("Initial setup complete."); // DEBUG

}); // End DOMContentLoaded
