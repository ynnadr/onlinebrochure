document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded and parsed."); // DEBUG: Pastikan script jalan setelah DOM ready

    // --- Get DOM Elements (Check if they exist!) ---
    const langSwitcher = document.querySelector('.lang-switcher');
    const mainContent = document.getElementById('main-content');
    const registrationFormSection = document.getElementById('registration-form');
    const showRegisterTriggers = document.querySelectorAll('#trigger-register-view, #show-register-btn-header, #show-register-btn-footer');
    const backToMainBtn = document.getElementById('back-to-main-btn');
    const container = document.querySelector('.container');

    // DEBUG: Check if essential elements were found
    if (!langSwitcher) console.error("ERROR: Language switcher element (.lang-switcher) not found!");
    if (!mainContent) console.error("ERROR: Main content element (#main-content) not found!");
    if (!registrationFormSection) console.error("ERROR: Registration form section (#registration-form) not found!");
    if (showRegisterTriggers.length === 0) console.warn("Warning: No registration trigger buttons found.");
    if (!backToMainBtn) console.warn("Warning: Back button (#back-to-main-btn) not found.");

    let currentTranslations = {};

    // --- Translation Functions ---
    async function fetchTranslations(lang) {
        const url = `lang/${lang}.json`;
        console.log(`Attempting to fetch translations from: ${url}`); // DEBUG
        try {
            const response = await fetch(url);
            console.log(`Fetch response status for ${url}: ${response.status}`); // DEBUG
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}, statusText: ${response.statusText} while fetching ${url}`);
            }
             const contentType = response.headers.get("content-type");
             if (!contentType || !contentType.includes("application/json")) {
                console.warn(`Warning: Received content-type "${contentType}" instead of JSON for ${url}. Attempting to parse anyway.`);
             }
            const data = await response.json();
            console.log(`Successfully parsed JSON for ${lang}`); // DEBUG
            return data;

        } catch (error) {
            console.error(`Could not fetch or parse translations for ${lang}:`, error);
            return null; // Return null specifically on error
        }
    }

    function applyTranslations(translations) {
        if (!translations || typeof translations !== 'object') {
            console.error("ApplyTranslations called with invalid translations data:", translations);
            return;
        }
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
            } else {
                 console.warn(`Translation key "${key}" not found in language file.`);
            }
        });
        console.log(`Applied ${appliedCount} translations.`); // DEBUG
    }

    async function setLanguage(lang) {
        console.log(`---> Setting language to: ${lang}`); // DEBUG
        const translations = await fetchTranslations(lang);

        if (translations) {
            console.log(`Translations object received for ${lang}, attempting to apply.`); // DEBUG
            applyTranslations(translations);
            localStorage.setItem('preferredLang', lang);

            if (langSwitcher) {
                langSwitcher.querySelectorAll('button').forEach(btn => {
                    btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
                });
            }
            document.documentElement.lang = lang;
            console.log(`---> Language successfully set to: ${lang}`); // DEBUG
        } else {
             console.error(`---> Failed to set language to ${lang} because translations could not be loaded or parsed. Check previous errors.`);
        }
    }

    // --- Event Listeners ---
    if (langSwitcher) {
        langSwitcher.addEventListener('click', (event) => {
            if (event.target.tagName === 'BUTTON' && event.target.hasAttribute('data-lang')) {
                const selectedLang = event.target.getAttribute('data-lang');
                console.log(`Language button "${selectedLang}" clicked.`); // DEBUG
                 let currentLang = localStorage.getItem('preferredLang');
                 if (!currentLang) {
                    const browserLang = navigator.language ? navigator.language.split('-')[0] : 'id';
                    currentLang = (browserLang === 'en') ? 'en' : 'id';
                 }
                if (selectedLang !== currentLang) {
                    setLanguage(selectedLang);
                } else {
                    console.log(`Language "${selectedLang}" is already active.`); // DEBUG
                }
            }
        });
    }

    // --- Content Toggle Logic ---
    function showRegistrationForm(event) {
        if(event) event.preventDefault();
        console.log("Showing registration form...");
        if (mainContent) mainContent.style.display = 'none';
        if (registrationFormSection) registrationFormSection.style.display = 'block';
        if (container) {
             window.scrollTo({ top: container.offsetTop - 20, behavior: 'smooth' });
        } else { window.scrollTo({ top: 0, behavior: 'smooth'}); }
    }

    function showMainContent() {
        console.log("Showing main content...");
        if (registrationFormSection) registrationFormSection.style.display = 'none';
        if (mainContent) mainContent.style.display = 'block';
         if (container) {
            window.scrollTo({ top: container.offsetTop - 20, behavior: 'smooth' });
         } else { window.scrollTo({ top: 0, behavior: 'smooth'}); }
    }

    // Add listeners to all triggers (only if elements exist)
    if (showRegisterTriggers.length > 0 && mainContent && registrationFormSection) {
        showRegisterTriggers.forEach(trigger => {
            trigger.addEventListener('click', showRegistrationForm);
        });
    }

    // Add listener for the back button (only if elements exist)
    if (backToMainBtn && mainContent && registrationFormSection) {
        backToMainBtn.addEventListener('click', showMainContent);
    }

    // --- Initial Load ---
    console.log("Determining initial language..."); // DEBUG
    let initialLang = localStorage.getItem('preferredLang');
    if (!initialLang) {
        const browserLang = navigator.language ? navigator.language.split('-')[0] : 'id';
        initialLang = (browserLang === 'en') ? 'en' : 'id';
        console.log(`No preferred language in localStorage, using browser/default: ${initialLang}`); // DEBUG
    } else {
        console.log(`Found preferred language in localStorage: ${initialLang}`); // DEBUG
    }

    setLanguage(initialLang).catch(error => {
         console.error("Error during initial language setting:", error);
    });

    // Ensure initial view is correct
    if (mainContent) mainContent.style.display = 'block';
    if (registrationFormSection) registrationFormSection.style.display = 'none';

    console.log("Initial setup complete."); // DEBUG

}); // End DOMContentLoaded
